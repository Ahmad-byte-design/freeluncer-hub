'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' &&
      // offsetParent is null for display:none subtrees, which a drawer can
      // easily contain (hidden panels, responsive-only controls).
      element.offsetParent !== null,
  );
}

interface Options {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  triggerRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
}

/**
 * Shared behaviour for the two slide-in drawers.
 *
 * Both used to be styled off-screen with `transform` only, so their controls
 * stayed in the tab order and the accessibility tree while shut. The visible
 * half of the fix is CSS (`visibility: hidden` when closed); this hook adds
 * the interaction half: move focus in on open, keep Tab inside, close on
 * Escape, and hand focus back to whatever opened the drawer.
 */
export function useModalDrawer({ open, containerRef, triggerRef, onClose }: Options) {
  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (!container) return;

    // Remember who had focus so it can be restored on close. Falling back to
    // the trigger covers the case where the drawer was opened by pointer.
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const initial = focusable(container)[0] ?? container;
    initial.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable(container);
      if (items.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const target = triggerRef?.current ?? previous;
      target?.focus();
    };
  }, [open, containerRef, triggerRef, onClose]);
}
