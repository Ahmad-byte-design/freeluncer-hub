/**
 * Warrior accordion — markup renderer.
 *
 * The single source of markup for both the live preview and the HTML code tab,
 * so the two can never drift. Pure: same items + same options => same string.
 * No inline styles. State lives in data-* attributes only.
 */

import type {
  AccordionItem,
  AccordionIconPosition,
  AccordionOptions,
  AccordionSize,
  AccordionType,
  AccordionVariant,
} from './types';

export interface RenderOptions extends AccordionOptions {
  /** Prefix for generated ids. Change it when several accordions share a page. */
  idPrefix?: string;
  /** Locks every trigger in the group. */
  disabled?: boolean;
  /** Currently open ids. Falls back to defaultOpen. */
  open?: string[];
  /** Indent the output, for the code tab. */
  indent?: string;
}

const DEFAULTS = {
  type: 'single' as AccordionType,
  collapsible: true,
  variant: 'default' as AccordionVariant,
  size: 'md' as AccordionSize,
  iconPosition: 'end' as AccordionIconPosition,
  headingLevel: 3 as 2 | 3 | 4 | 5 | 6,
  animated: true,
  idPrefix: 'wr-acc',
  indent: '',
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** Break a paragraph's source into lines so rendered markup reads like source. */
function escapeBlock(value: string): string {
  return value
    .trim()
    .split('\n')
    .map((line) => escapeHtml(line.trim()))
    .join('\n');
}

function indentBlock(value: string, pad: string): string {
  if (!pad) return value;
  return value
    .split('\n')
    .map((line) => (line.length > 0 ? pad + line : line))
    .join('\n');
}

/** The chevron. Drawn pointing right; CSS rotates it 90deg when the panel opens. */
const CHEVRON =
  '<svg class="wr-acc__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">' +
  '<path d="M6 3.5L10.5 8L6 12.5" fill="none" stroke="currentColor" stroke-width="1.75" ' +
  'stroke-linecap="square" stroke-linejoin="miter"/></svg>';

export function renderAccordion(items: AccordionItem[], options: RenderOptions = {}): string {
  const type = options.type ?? DEFAULTS.type;
  const variant = options.variant ?? DEFAULTS.variant;
  const size = options.size ?? DEFAULTS.size;
  const iconPosition = options.iconPosition ?? DEFAULTS.iconPosition;
  const level = options.headingLevel ?? DEFAULTS.headingLevel;
  const idPrefix = options.idPrefix ?? DEFAULTS.idPrefix;
  const pad = options.indent ?? DEFAULTS.indent;
  const openSet = new Set(options.open ?? options.defaultOpen ?? []);

  const rootAttributes = [
    'class="wr-acc"',
    `data-type="${type}"`,
    `data-variant="${variant}"`,
    `data-size="${size}"`,
    `data-icon-position="${iconPosition}"`,
    options.animated === false ? 'data-animated="false"' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const body = items
    .map((item) => {
      const triggerId = `${idPrefix}-trigger-${item.id}`;
      const panelId = `${idPrefix}-panel-${item.id}`;
      const isOpen = openSet.has(item.id);
      const heading = `h${level}`;
      const chevron = iconPosition === 'start' ? CHEVRON : '';

      const triggerLines = [
        `<button`,
        `  class="wr-acc__trigger"`,
        `  type="button"`,
        `  id="${escapeHtml(triggerId)}"`,
        `  aria-expanded="${isOpen}"`,
        `  aria-controls="${escapeHtml(panelId)}"`,
        item.disabled || options.disabled === true ? `  disabled` : '',
        chevron ? `  ${chevron}` : '',
        `>`,
        `  <span class="wr-acc__title">${escapeHtml(item.title)}</span>`,
        chevron ? '' : `  ${CHEVRON}`,
        `</button>`,
      ].filter((line) => line.length > 0);

      const lines = [
        `<div class="wr-acc__item" data-id="${escapeHtml(item.id)}" data-state="${isOpen ? 'open' : 'closed'}">`,
        `  <${heading} class="wr-acc__heading">`,
        indentBlock(triggerLines.join('\n'), '  '),
        `  </${heading}>`,
        `  <div`,
        `    class="wr-acc__panel"`,
        `    id="${escapeHtml(panelId)}"`,
        `    role="region"`,
        `    aria-labelledby="${escapeHtml(triggerId)}"`,
        `    data-state="${isOpen ? 'open' : 'closed'}"`,
        `  >`,
        `    <div class="wr-acc__content">`,
        ...escapeBlock(item.content).split('\n').map((line) => `      <p>${line}</p>`),
        `    </div>`,
        `  </div>`,
        `</div>`,
      ];

      return indentBlock(lines.join('\n'), pad);
    })
    .join('\n');

  return [`<div ${rootAttributes}>`, indentBlock(body, pad), `</div>`].join('\n');
}

/** Items shared by the docs site, the previews, and the code samples. */
export const ACCORDION_ITEMS: AccordionItem[] = [
  {
    id: 'package',
    title: 'What ships in the package',
    content:
      'lib/core holds the tokens and the reset. lib/accordion holds the one component for now.\nNothing in either folder imports a framework, so a plain HTML file can link the CSS and run the behaviour without a build step.',
  },
  {
    id: 'wiring',
    title: 'How the accordion is wired',
    content:
      'createAccordion attaches one delegated listener to the root, not one listener per trigger.\nOpening a panel writes data-state on the item and the panel; no class is added and no style is written inline.',
  },
  {
    id: 'theming',
    title: 'Recolouring it',
    content:
      'Every surface, edge and state colour resolves through a --wr-* custom property.\nOverride those properties and the whole component follows, including the focus ring and the chevron.',
  },
  {
    id: 'keys',
    title: 'Keyboard and screen reader support',
    content:
      'Triggers sit inside headings, carry aria-expanded and aria-controls, and own their panel through aria-labelledby.\nArrow keys move between triggers and wrap at both ends; Home and End jump to the first and last enabled trigger. Disabled triggers are skipped entirely.',
  },
  {
    id: 'extend',
    title: 'Adding a component to the registry',
    content:
      'Create lib/<name>/ with the same five files, then add one entry to src/registry.\nThe nav, the search index, the customizer, the props table and the code tabs all read from that entry, so nothing else needs editing.',
  },
];