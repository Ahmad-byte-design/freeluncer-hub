'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDocs } from '@/shared/component-provider';
import { highlight } from '@/shared/highlight';
import { CheckIcon, CopyIcon } from '@/shared/icons';
import { cx } from '@/shared/utils';
import './code-viewer.css';

export function CodeViewer() {
  const { meta, values, assets } = useDocs();
  const snippets = useMemo(() => meta.code(values, assets), [meta, values, assets]);

  const tabs = useMemo(
    () => [
      { id: 'html', label: 'HTML', lang: 'html' },
      { id: 'react', label: 'React', lang: 'tsx' },
      { id: 'ts', label: 'TypeScript', lang: 'typescript' },
      ...meta.assets.map((asset) => ({
        id: asset.id,
        label: asset.label,
        lang: asset.lang,
      })),
    ],
    [meta],
  );

  const [active, setActive] = useState(tabs[0]!.id);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tab = tabs.find((entry) => entry.id === active) ?? tabs[0]!;
  const code = snippets[tab.id as keyof typeof snippets] ?? '';
  const tabId = (id: string) => `wr-tab-${id}`;
  const panelId = (id: string) => `wr-panel-${id}`;

  /* Roving tabindex: one tab is reachable by Tab, the arrow keys move between
     them, which is what the tablist pattern expects. */
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    const target = tabs[next]!;
    setActive(target.id);
    document.getElementById(tabId(target.id))?.focus();
  };

  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    highlight(code, tab.lang).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, tab.lang]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="wr-code">
      <div className="wr-code__bar">
        <div className="wr-code__tabs" role="tablist" aria-label="Source language">
          {tabs.map((entry, index) => {
            const selected = entry.id === tab.id;
            return (
              <button
                key={entry.id}
                type="button"
                id={tabId(entry.id)}
                role="tab"
                aria-selected={selected}
                aria-controls={panelId(entry.id)}
                tabIndex={selected ? 0 : -1}
                className={cx('wr-code__tab', selected && 'is-active')}
                onClick={() => setActive(entry.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="wr-code__copy"
          data-copied={copied}
          onClick={copy}
          aria-label={copied ? 'Source copied' : `Copy the ${tab.label} source`}
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          <span>{copied ? 'Copied' : `Copy ${tab.label}`}</span>
        </button>
      </div>

      <div
        className="wr-code__scroll"
        id={panelId(tab.id)}
        role="tabpanel"
        aria-labelledby={tabId(tab.id)}
        tabIndex={0}
      >
        {html ? (
          // shiki output: token colours are CSS variables, swapped by data-theme
          <div className="wr-code__body" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="wr-code__body wr-code__body--plain">
            <code>{code}</code>
          </pre>
        )}
      </div>

      <p className="wr-visually-hidden" aria-live="polite">
        {copied ? `${tab.label} source copied to the clipboard` : ''}
      </p>
    </div>
  );
}