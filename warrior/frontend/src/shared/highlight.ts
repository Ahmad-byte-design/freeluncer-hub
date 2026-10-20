'use client';

import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import * as shikiWasm from 'shiki/wasm';
import html from '@shikijs/langs/html';
import typescript from '@shikijs/langs/typescript';
import css from '@shikijs/langs/css';

/**
 * Warrior's own shiki themes. Built from the brand palette rather than pulled
 * from the theme list, so a code sample reads as part of the same product.
 * Both themes are emitted on every token and swapped by data-theme in CSS.
 */

/** Accent hues per theme. Dark keeps the raw brand palette; light uses
    darkened variants of the same hues, because the bright ones sit at
    1.3–1.8:1 on the light code background (WCAG AA needs 4.5:1). */
interface Accents {
  string: string;
  keyword: string;
  attribute: string;
  constant: string;
}

function warriorTheme(
  name: 'warrior-dark' | 'warrior-light',
  background: string,
  foreground: string,
  muted: string,
  accents: Accents,
) {
  return {
    name,
    type: name === 'warrior-dark' ? ('dark' as const) : ('light' as const),
    colors: {
      'editor.background': background,
      'editor.foreground': foreground,
    },
    settings: [
      {
        scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: muted, fontStyle: 'italic' },
      },
      { scope: ['string', 'constant.other.symbol'], settings: { foreground: accents.string } },
      { scope: ['keyword', 'storage', 'keyword.control'], settings: { foreground: accents.keyword } },
      { scope: ['entity.name.tag', 'support.class'], settings: { foreground } },
      { scope: ['entity.other.attribute-name'], settings: { foreground: accents.attribute } },
      {
        scope: ['support.type.property-name', 'variable', 'meta.var.expr'],
        settings: { foreground: muted },
      },
      {
        scope: ['entity.name.function', 'support.function', 'meta.function-call'],
        settings: { foreground },
      },
      { scope: ['punctuation', 'meta.brace'], settings: { foreground: muted } },
      {
        scope: ['constant.numeric', 'constant.language', 'constant.character'],
        settings: { foreground: accents.constant },
      },
    ],
  };
}

const THEMES = {
  dark: warriorTheme('warrior-dark', '#10141b', '#f2efe8', '#9aa3b2', {
    string: '#3ddc97',
    keyword: '#ff4d2e',
    attribute: '#ff9a83',
    constant: '#f5c77d',
  }),
  light: warriorTheme('warrior-light', '#eceae3', '#0b0d12', '#5c6470', {
    string: '#0d6e45',
    keyword: '#b32d15',
    attribute: '#a8442c',
    constant: '#7d5a12',
  }),
};

let highlighterPromise: Promise<HighlighterCore> | null = null;
const cache = new Map<string, string>();

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createOnigurumaEngine(shikiWasm.default).then((engine) =>
      createHighlighterCore({
        themes: [THEMES.dark, THEMES.light],
        langs: [html, typescript, css],
        engine,
      }),
    );
  }
  return highlighterPromise;
}

const LANG_ALIASES: Record<string, string> = {
  tsx: 'typescript',
  js: 'typescript',
  jsx: 'typescript',
  mjs: 'typescript',
};

/**
 * Highlight once per distinct snippet. Results are cached so dragging a
 * control re-highlights only what actually changed.
 */
export async function highlight(code: string, lang: string): Promise<string> {
  const key = `${lang}::${code}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const highlighter = await getHighlighter();
  const loaded = highlighter.getLoadedLanguages();
  const resolved = LANG_ALIASES[lang] ?? lang;
  const grammar = loaded.includes(resolved)
    ? resolved
    : loaded.includes(lang)
      ? lang
      : 'html';

  const html = highlighter.codeToHtml(code, {
    lang: grammar,
    themes: { dark: 'warrior-dark', light: 'warrior-light' },
    defaultColor: false,
  });

  cache.set(key, html);
  if (cache.size > 80) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return html;
}