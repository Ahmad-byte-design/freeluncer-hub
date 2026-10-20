'use client';

import { useEffect, useRef, useState } from 'react';
import { useDocs } from '@/shared/component-provider';
import { cx } from '@/shared/utils';

const STRUCTURAL = ['type', 'collapsible', 'defaultOpen', 'disabled'];
const PRESENTATION = ['variant', 'size', 'iconPosition'];

export function Preview() {
  const { meta, values, revision } = useDocs();
  const hostRef = useRef<HTMLDivElement>(null);
  const instance = useRef<{ destroy(): void } | null>(null);
  const mountedKey = useRef<string>('');
  const [flash, setFlash] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const key = JSON.stringify(STRUCTURAL.map((name) => values[name]));

    if (key !== mountedKey.current) {
      // A behaviour option changed: rebuild the markup and re-attach.
      instance.current?.destroy();
      host.innerHTML = meta.render(values, { idPrefix: 'wr-preview' });
      const root = host.querySelector<HTMLElement>('.wr-acc');
      if (root) instance.current = meta.mount(root, values);
      mountedKey.current = key;
      return;
    }

    // Only presentation changed: patch the data attributes in place so the
    // visitor's open panels stay open.
    const root = host.querySelector<HTMLElement>('.wr-acc');
    if (root) {
      for (const name of PRESENTATION) {
        root.dataset[name] = String(values[name]);
      }
    }
  }, [meta, values]);

  useEffect(() => () => instance.current?.destroy(), []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 640);
    return () => clearTimeout(timer);
  }, [revision]);

  return (
    <div className={cx('wr-plate', 'wr-specimen', flash && 'wr-plate--changed')}>
      <span className="wr-plate__registration" aria-hidden="true" />
      <div className="wr-specimen__inner" ref={hostRef} />
    </div>
  );
}