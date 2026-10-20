'use client';

import { useRef } from 'react';
import { useDocs } from '@/shared/component-provider';
import type { PropSchema } from '@/registry';
import { Chevron, SlidersIcon } from '@/shared/icons';
import { useShell } from './shell-state';
import { useModalDrawer } from './use-modal-drawer';

function Control({ schema }: { schema: PropSchema }) {
  const { values, setValue } = useDocs();
  const value = values[schema.name];
  const id = `wr-prop-${schema.name}`;

  if (schema.control === 'none') {
    return (
      <div className="wr-control">
        <span className="wr-field-label" id={`${id}-label`}>
          {schema.name}
        </span>
        <p className="wr-hint">{schema.description}</p>
        <p className="wr-control__readonly">{schema.type}</p>
      </div>
    );
  }

  if (schema.control === 'select') {
    return (
      <div className="wr-control">
        <label className="wr-field-label" htmlFor={id}>
          {schema.name}
        </label>
        <span className="wr-select-wrap">
          <select
            id={id}
            className="wr-select"
            value={String(value)}
            onChange={(event) => setValue(schema.name, event.target.value)}
          >
            {schema.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Chevron size={14} className="wr-select-caret" />
        </span>
        {schema.options?.find((option) => option.value === String(value))?.hint ? (
          <p className="wr-hint">
            {schema.options.find((option) => option.value === String(value))?.hint}
          </p>
        ) : null}
      </div>
    );
  }

  if (schema.control === 'toggle') {
    return (
      <div className="wr-control">
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={value === true}
          className="wr-switch"
          onClick={() => setValue(schema.name, !value)}
        >
          <span className="wr-switch__label">{schema.name}</span>
          <span className="wr-switch__track" aria-hidden="true">
            <span className="wr-switch__knob" />
          </span>
        </button>
        <p className="wr-hint">{schema.description}</p>
      </div>
    );
  }

  if (schema.control === 'number') {
    return (
      <div className="wr-control">
        <label className="wr-field-label" htmlFor={id}>
          {schema.name}
        </label>
        <input
          id={id}
          className="wr-input"
          type="number"
          value={Number(value ?? 0)}
          min={schema.min}
          max={schema.max}
          onChange={(event) => setValue(schema.name, Number(event.target.value))}
        />
        <p className="wr-hint">{schema.description}</p>
      </div>
    );
  }

  return (
    <div className="wr-control">
      <label className="wr-field-label" htmlFor={id}>
        {schema.name}
      </label>
      <input
        id={id}
        className="wr-input"
        type="text"
        placeholder={schema.placeholder}
        value={String(value ?? '')}
        onChange={(event) => setValue(schema.name, event.target.value)}
      />
      <p className="wr-hint">{schema.description}</p>
    </div>
  );
}

export function Customizer() {
  const { meta, values, reset, isDirty } = useDocs();
  const { sheetOpen, setSheetOpen, closeSheet, sheetTriggerRef } = useShell();
  const asideRef = useRef<HTMLElement>(null);

  useModalDrawer({
    open: sheetOpen,
    containerRef: asideRef,
    triggerRef: sheetTriggerRef,
    onClose: closeSheet,
  });

  const emitted = [
    `data-type="${values.type}"`,
    `data-variant="${values.variant}"`,
    `data-size="${values.size}"`,
    `data-icon-position="${values.iconPosition}"`,
  ];

  return (
    <>
      {sheetOpen ? (
        <button
          type="button"
          className="wr-scrim"
          aria-label="Close the customize panel"
          onClick={() => setSheetOpen(false)}
        />
      ) : null}

      <aside
        ref={asideRef}
        className="wr-rail-right"
        id="wr-customize-sheet"
        data-open={sheetOpen}
        aria-label="Customize"
        tabIndex={-1}
      >
        <div className="wr-rail__pad">
          <div className="wr-rail__headline">
            <h2 className="wr-rail__title">Customize</h2>
            <button
              type="button"
              className="wr-btn wr-btn--ghost wr-btn--icon wr-rail__close"
              onClick={() => setSheetOpen(false)}
              aria-label="Close the customize panel"
            >
              ×
            </button>
          </div>

          {meta.props.map((schema) => (
            <Control key={schema.name} schema={schema} />
          ))}

          <div className="wr-emit">
            <p className="wr-field-label">Written to the root</p>
            <ul className="wr-emit__list">
              {emitted.map((attribute) => (
                <li key={attribute}>
                  <code>{attribute}</code>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="wr-btn wr-reset"
            onClick={reset}
            disabled={!isDirty}
          >
            Reset
          </button>
        </div>
      </aside>

      <button
        type="button"
        ref={sheetTriggerRef}
        id="wr-sheet-toggle"
        className="wr-sheet-trigger"
        onClick={() => setSheetOpen(!sheetOpen)}
        aria-expanded={sheetOpen}
        aria-controls="wr-customize-sheet"
      >
        <SlidersIcon size={15} />
        {sheetOpen ? 'Close' : 'Customize'}
      </button>
    </>
  );
}