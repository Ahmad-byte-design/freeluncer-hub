/**
 * The registry is the only thing the docs site knows about a component.
 * Add a component: create lib/<name>/, then add one file here and one line
 * in ./index.ts. Nothing else in src/ changes.
 */

export type PropValue = string | number | boolean;
export type PropValues = Record<string, PropValue>;

export type ControlKind = 'select' | 'toggle' | 'text' | 'number' | 'none';

/** Files read from disk at build time and shown verbatim in the code tab. */
export interface ComponentAsset {
  id: string;
  label: string;
  file: string;
  lang: string;
}

export type ComponentAssets = Record<string, string>;

/** Extra knobs the docs shell needs when rendering a specimen. */
export interface RenderOptions2 {
  /** Only render the first N items. Keeps the variant grid readable. */
  limit?: number;
  /** Prefix for generated ids, so several specimens can share a page. */
  idPrefix?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  /** Shown under the control so the choice explains itself. */
  hint?: string;
}

export interface PropSchema {
  /** Matches the lib option name. */
  name: string;
  /** Shown in the props table, e.g. `"single" | "multiple"`. */
  type: string;
  defaultValue: string;
  description: string;
  /** Drives the generated control in the Customize panel. */
  control: ControlKind;
  options?: SelectOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  /** Accepts a comma-separated list, e.g. the ids open on first render. */
  listOf?: boolean;
}

export interface VariantSpec {
  /** The `variant` option value this specimen demonstrates. */
  name: string;
  label: string;
  description: string;
  /** Props applied on top of the component defaults. */
  props: PropValues;
}

export interface KeyboardRef {
  /** Key labels, in order, e.g. ['ArrowDown'] or ['Ctrl', 'K']. */
  combo: string[];
  does: string;
}

export interface CodeSnippets {
  html: string;
  /** One React call site: the wrapper, then how to use it. */
  react: string;
  ts: string;
  css: string;
}

export interface ComponentMeta {
  slug: string;
  name: string;
  /** One line, plain, no marketing. */
  description: string;
  /** Search terms: behaviour words, not just the component name. */
  keywords: string[];
  version: string;
  status: 'stable' | 'beta' | 'new';
  /** Where the framework-agnostic source lives. */
  libPath: string;
  files: string[];
  /** Source files surfaced in the CSS tab, resolved relative to libPath. */
  assets: ComponentAsset[];

  props: PropSchema[];
  defaultProps: PropValues;
  variants: VariantSpec[];
  /** Key bindings worth documenting for this component. */
  keyboard?: KeyboardRef[];

  /** Client only. Tells the generated markup what the current props are. */
  toOptions(props: PropValues): unknown;
  /** Client only. Markup for the preview and the HTML tab. */
  render(props: PropValues, options?: RenderOptions2): string;
  /** Client only. Hands behaviour to the rendered root. */
  mount(root: HTMLElement, props: PropValues): { destroy(): void };
  /** Code tab source. Runs on the client so it can follow the customizer. */
  code(props: PropValues, assets: ComponentAssets): CodeSnippets;
}

export interface RegistryEntry {
  slug: string;
  name: string;
}