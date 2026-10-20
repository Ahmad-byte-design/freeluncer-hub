'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ComponentAssets, ComponentMeta, PropValues } from '@/registry';

interface DocsContextValue {
  meta: ComponentMeta;
  assets: ComponentAssets;
  values: PropValues;
  setValue: (name: string, value: string | number | boolean) => void;
  reset: () => void;
  isDirty: boolean;
  /** Bumped on every change, so the preview can flash what just changed. */
  revision: number;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({
  meta,
  assets,
  children,
}: {
  meta: ComponentMeta;
  assets: ComponentAssets;
  children: ReactNode;
}) {
  const [values, setValues] = useState<PropValues>(meta.defaultProps);
  const [revision, setRevision] = useState(0);

  const setValue = useCallback(
    (name: string, value: string | number | boolean) => {
      setValues((current) =>
        current[name] === value ? current : { ...current, [name]: value },
      );
      setRevision((r) => r + 1);
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(meta.defaultProps);
    setRevision((r) => r + 1);
  }, [meta]);

  const isDirty = useMemo(
    () =>
      Object.keys(meta.defaultProps).some(
        (key) => meta.defaultProps[key] !== values[key],
      ),
    [meta, values],
  );

  const value = useMemo<DocsContextValue>(
    () => ({ meta, assets, values, setValue, reset, isDirty, revision }),
    [meta, assets, values, setValue, reset, isDirty, revision],
  );

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}

export function useDocs(): DocsContextValue {
  const context = useContext(DocsContext);
  if (!context) throw new Error('useDocs must be used inside <DocsProvider>');
  return context;
}