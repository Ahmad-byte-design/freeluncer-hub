/**
 * Warrior accordion — behaviour.
 *
 * Event delegation on the root: one click listener and one keydown listener per
 * instance, whatever the item count. Open state is read back from the DOM, which
 * keeps the markup the single source of truth.
 */

import type { AccordionHandle, AccordionOptions } from './types';

const TRIGGER_SELECTOR = '.wr-acc__trigger';
const ITEM_SELECTOR = '.wr-acc__item';

const NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End']);

function createId(root: HTMLElement, key: string): string {
  root.dataset[key] = root.dataset[key] ?? '';
  let counter = Number(root.dataset[key] || '0');
  counter += 1;
  root.dataset[key] = String(counter);
  return root.dataset[key] ?? '1';
}

export function createAccordion(
  root: HTMLElement,
  options: AccordionOptions = {},
): AccordionHandle {
  const type = options.type ?? 'single';
  const collapsible = options.collapsible ?? true;
  const animated = options.animated ?? true;
  const defaultOpen = options.defaultOpen ?? [];

  root.dataset.type = type;
  root.dataset.variant = options.variant ?? root.dataset.variant ?? 'default';
  root.dataset.size = options.size ?? root.dataset.size ?? 'md';
  root.dataset.iconPosition =
    options.iconPosition ?? root.dataset.iconPosition ?? 'end';
  root.dataset.animated = String(animated);

  // Unique-ish ids so several instances can live on one page.
  const uid = createId(root, 'wrAccId');
  root.id = root.id || `wr-acc-${uid}`;

  const triggers = (): HTMLButtonElement[] =>
    Array.from(root.querySelectorAll<HTMLButtonElement>(TRIGGER_SELECTOR));

  const items = (): HTMLElement[] =>
    Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR));

  const itemOf = (trigger: Element): HTMLElement | null => {
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    if (!panel) return null;
    return panel.closest<HTMLElement>(ITEM_SELECTOR);
  };

  const idOf = (trigger: Element): string => {
    const explicit = itemOf(trigger)?.dataset.id;
    if (explicit) return explicit;
    const triggerId = trigger.id ?? '';
    const marker = triggerId.lastIndexOf('-trigger-');
    return marker === -1 ? triggerId : triggerId.slice(marker + 9);
  };

  const triggerFor = (id: string): HTMLButtonElement | undefined =>
    triggers().find((trigger) => idOf(trigger) === id);

  const isDisabled = (trigger: HTMLButtonElement): boolean =>
    trigger.disabled || trigger.getAttribute('aria-disabled') === 'true';

  /** Writes the state to the item and the trigger. The only place it happens. */
  const setItem = (item: HTMLElement, open: boolean): boolean => {
    if (open === (item.dataset.state === 'open')) return false;
    item.dataset.state = open ? 'open' : 'closed';
    item
      .querySelector<HTMLButtonElement>(TRIGGER_SELECTOR)
      ?.setAttribute('aria-expanded', String(open));
    return true;
  };

  const setOpen = (trigger: HTMLButtonElement, open: boolean): boolean => {
    const item = itemOf(trigger);
    return item ? setItem(item, open) : false;
  };

  const readOpen = (): string[] =>
    items()
      .filter((item) => item.dataset.state === 'open')
      .map((item) => item.dataset.id ?? '')
      .filter((id) => id.length > 0);

  const commit = (before: string[]): void => {
    const after = readOpen();
    const changed =
      after.length !== before.length || after.some((id, i) => id !== before[i]);
    if (changed) options.onChange?.(after);
  };

  /** Opening in "single" mode closes every other item first. */
  const openMany = (targets: HTMLButtonElement[]): void => {
    for (const trigger of targets) {
      if (isDisabled(trigger)) continue;
      if (type === 'single') {
        for (const other of triggers()) {
          if (other !== trigger) setOpen(other, false);
        }
      }
      setOpen(trigger, true);
    }
  };

  const open = (id: string): void => {
    const trigger = triggerFor(id);
    if (!trigger || isDisabled(trigger)) return;
    const before = readOpen();
    openMany([trigger]);
    commit(before);
  };

  const close = (id: string): void => {
    // In a non-collapsible single accordion the open item stays open.
    if (type === 'single' && !collapsible) return;
    const trigger = triggerFor(id);
    if (!trigger) return;
    const before = readOpen();
    setOpen(trigger, false);
    commit(before);
  };

  const toggle = (id: string): void => {
    const trigger = triggerFor(id);
    if (!trigger || isDisabled(trigger)) return;
    const isOpen = itemOf(trigger)?.dataset.state === 'open';
    if (isOpen) close(id);
    else open(id);
  };

  const onClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest<HTMLButtonElement>(TRIGGER_SELECTOR);
    if (!trigger || !root.contains(trigger) || isDisabled(trigger)) return;
    event.preventDefault();
    toggle(idOf(trigger));
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!NAVIGATION_KEYS.has(event.key)) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest<HTMLButtonElement>(TRIGGER_SELECTOR);
    if (!trigger || !root.contains(trigger)) return;

    const list = triggers();
    const enabled = list.filter((item) => !isDisabled(item));
    if (enabled.length === 0) return;

    const current = enabled.indexOf(trigger);
    if (current === -1) return;

    const step = (offset: number): HTMLButtonElement => {
      const next = (current + offset + enabled.length) % enabled.length;
      return enabled[next] ?? enabled[0]!;
    };

    let next: HTMLButtonElement;
    switch (event.key) {
      case 'ArrowDown':
        next = step(1);
        break;
      case 'ArrowUp':
        next = step(-1);
        break;
      case 'Home':
        next = enabled[0]!;
        break;
      default:
        next = enabled[enabled.length - 1]!;
        break;
    }

    event.preventDefault();
    next.focus();
  };

  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeyDown);

  // Initial state. defaultOpen is authoritative when it is set, so hand-written
  // markup that disagrees with it (or marks a disabled item open) settles here.
  const beforeInitial = readOpen();
  const initial = defaultOpen.filter((id) => {
    const trigger = triggerFor(id);
    return trigger !== undefined && !isDisabled(trigger);
  });

  if (initial.length > 0) {
    openMany(initial.map((id) => triggerFor(id)!).filter(Boolean));
    for (const trigger of triggers()) {
      if (!initial.includes(idOf(trigger))) setOpen(trigger, false);
    }
  }

  if (type === 'single') {
    const openItems = items().filter((item) => item.dataset.state === 'open');
    for (const item of openItems.slice(1)) setItem(item, false);
  }

  commit(beforeInitial);

  return {
    open,
    close,
    toggle,
    getOpen: readOpen,
    destroy(): void {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKeyDown);
    },
  };
}