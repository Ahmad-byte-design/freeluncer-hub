'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Preview } from './preview';

const TABS = [
  { id: 'preview', label: 'Preview' },
  { id: 'code', label: 'Code' },
] as const;

/* Shiki and its wasm engine are only needed once the Code tab is opened, so
   they are kept out of the initial bundle. */
const CodeViewer = dynamic(() => import('@/features/code-viewer/code-viewer').then((mod) => mod.CodeViewer), {
  ssr: false,
  loading: () => <div className="wr-code__loading">Loading source…</div>,
});

export function ExampleTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('preview');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta === 0) return;
    event.preventDefault();
    const current = TABS.findIndex((tab) => tab.id === active);
    const next = (current + delta + TABS.length) % TABS.length;
    const target = TABS[next];
    if (!target) return;
    setActive(target.id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="wr-example">
      <div className="wr-example__bar" role="tablist" aria-label="Example view" onKeyDown={onKeyDown}>
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`wr-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`wr-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className="wr-example__tab"
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="wr-panel-preview"
        aria-labelledby="wr-tab-preview"
        hidden={active !== 'preview'}
        tabIndex={0}
        className="wr-example__panel"
      >
        {active === 'preview' ? <Preview /> : null}
      </div>

      <div
        role="tabpanel"
        id="wr-panel-code"
        aria-labelledby="wr-tab-code"
        hidden={active !== 'code'}
        tabIndex={0}
        className="wr-example__panel"
      >
        {active === 'code' ? <CodeViewer /> : null}
      </div>
    </div>
  );
}