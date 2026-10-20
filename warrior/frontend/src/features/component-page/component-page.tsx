import { getBySlug } from '@/registry';
import { ExampleTabs } from './example-tabs';
import { Variants } from './variants';
import { FileList, KeyboardTable, PropsTable } from './props-table';
import './component-page.css';

export function ComponentPage({ slug }: { slug: string }) {
  const meta = getBySlug(slug);
  if (!meta) return null;

  return (
    <div className="wr-page">
      <header className="wr-page-head">
        <div className="wr-page__titleline">
          <h1 className="wr-page__name">{meta.name}</h1>
          <code className="wr-page__version">v{meta.version}</code>
          <span className="wr-page__status" data-status={meta.status}>
            {meta.status}
          </span>
        </div>
        <p className="wr-page__desc">{meta.description}</p>
      </header>

      <section className="wr-section" id="specimen" aria-labelledby="specimen-heading">
        <h2 className="wr-rule-label" id="specimen-heading">
          <span className="wr-rule-label__text">Specimen</span>
        </h2>
        <ExampleTabs />
      </section>

      <section className="wr-section" id="variants" aria-labelledby="variants-heading">
        <h2 className="wr-rule-label" id="variants-heading">
          <span className="wr-rule-label__text">Variants</span>
          <span className="wr-count">{meta.variants.length}</span>
        </h2>
        <Variants />
      </section>

      <section className="wr-section" id="props" aria-labelledby="props-heading">
        <h2 className="wr-rule-label" id="props-heading">
          <span className="wr-rule-label__text">Props</span>
          <span className="wr-count">{meta.props.length}</span>
        </h2>
        <PropsTable props={meta.props} />
      </section>

      {meta.keyboard?.length ? (
        <section className="wr-section" id="keyboard" aria-labelledby="keyboard-heading">
          <h2 className="wr-rule-label" id="keyboard-heading">
            <span className="wr-rule-label__text">Keyboard</span>
          </h2>
          <KeyboardTable rows={meta.keyboard} />
        </section>
      ) : null}

      <section className="wr-section" id="files" aria-labelledby="files-heading">
        <h2 className="wr-rule-label" id="files-heading">
          <span className="wr-rule-label__text">Files</span>
          <span className="wr-count">{meta.files.length}</span>
        </h2>
        <FileList files={meta.files} libPath={meta.libPath} />
      </section>
    </div>
  );
}