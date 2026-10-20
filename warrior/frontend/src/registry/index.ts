import { accordion } from './accordion';
import type { ComponentMeta } from './types';

/** The whole catalogue. Order here is the order in the sidebar. */
export const components: ComponentMeta[] = [accordion];

export function getBySlug(slug: string): ComponentMeta | undefined {
  return components.find((component) => component.slug === slug);
}

export function getSlugs(): string[] {
  return components.map((component) => component.slug);
}

export type {
  CodeSnippets,
  ComponentAsset,
  ComponentAssets,
  ComponentMeta,
  ControlKind,
  KeyboardRef,
  PropSchema,
  PropValue,
  PropValues,
  VariantSpec,
} from './types';