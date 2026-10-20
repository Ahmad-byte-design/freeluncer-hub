/**
 * Warrior accordion — public types.
 * Framework-agnostic: no React, no DOM lib beyond what a browser provides.
 */

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'bordered' | 'filled' | 'separated';
export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionIconPosition = 'start' | 'end';

export interface AccordionItem {
  /** Stable id. Used for aria-controls, the panel id, and open-state keys. */
  id: string;
  /** Rendered inside a heading element, next to the trigger button. */
  title: string;
  /** Panel body. Plain text — markup is escaped. */
  content: string;
  /** A disabled trigger is skipped by the keyboard loop and cannot be opened. */
  disabled?: boolean;
}

export interface AccordionOptions {
  /** "single" closes the open panel when another opens; "multiple" allows many. */
  type?: AccordionType;
  /** In "single" mode, false makes the open panel permanent. */
  collapsible?: boolean;
  variant?: AccordionVariant;
  size?: AccordionSize;
  iconPosition?: AccordionIconPosition;
  /** Ids open on first render. */
  defaultOpen?: string[];
  /** Headings wrap the triggers, so screen readers announce the section name. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Opt out of the CSS transition, e.g. when the user asks for less motion. */
  animated?: boolean;
  onChange?: (openIds: string[]) => void;
}

export interface AccordionHandle {
  open(id: string): void;
  close(id: string): void;
  toggle(id: string): void;
  getOpen(): string[];
  destroy(): void;
}