'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDocs } from '@/shared/component-provider';
import type { PropValues, VariantSpec } from '@/registry';

const SPECIMEN_LIMIT = 3;

function Specimen({
  spec,
  props,
  idPrefix,
}: {
  spec: VariantSpec;
  props: PropValues;
  idPrefix: string;
}) {
  const { meta } = useDocs();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = meta.render(props, { limit: SPECIMEN_LIMIT, idPrefix });
    const root = host.querySelector<HTMLElement>('.wr-acc');
    if (!root) return;
    const instance = meta.mount(root, props);
    return () => instance.destroy();
  }, [meta, props, idPrefix]);

  return (
    <article className="wr-specimen-row">
      <div className="wr-specimen-row__label">
        <div className="wr-specimen-row__head">
          <h3 className="wr-specimen-row__name">{spec.label}</h3>
          <code className="wr-specimen-row__attr">
            data-variant=&quot;{spec.name}&quot;
          </code>
        </div>
        <p className="wr-specimen-row__desc">{spec.description}</p>
      </div>
      <div className="wr-plate wr-specimen-row__plate">
        <span className="wr-plate__registration" aria-hidden="true" />
        <div className="wr-specimen-row__inner" ref={hostRef} />
      </div>
    </article>
  );
}

export function Variants() {
  const { meta } = useDocs();

  const specimens = useMemo(
    () =>
      meta.variants.map((spec) => ({
        spec,
        props: { ...meta.defaultProps, ...spec.props } as PropValues,
      })),
    [meta],
  );

  return (
    <div className="wr-specimens">
      {specimens.map(({ spec, props }) => (
        <Specimen
          key={spec.name}
          spec={spec}
          props={props}
          idPrefix={`wr-${meta.slug}-${spec.name}`}
        />
      ))}
    </div>
  );
}