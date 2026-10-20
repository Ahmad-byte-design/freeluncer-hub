import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccordion } from '@lib/accordion/accordion';
import { renderAccordion, type RenderOptions } from '@lib/accordion/render';
import type { AccordionItem } from '@lib/accordion/types';

const ITEMS: AccordionItem[] = [
  { id: 'a', title: 'Anvil', content: 'Hammered from cold stock.' },
  { id: 'b', title: 'Blade', content: 'Ground to a single edge.' },
  { id: 'c', title: 'Guard', content: 'Brass, pitted, then polished.' },
];

function mount(options: RenderOptions = {}, items: AccordionItem[] = ITEMS) {
  document.body.innerHTML = renderAccordion(items, { idPrefix: 'test', ...options });
  const root = document.querySelector<HTMLElement>('.wr-acc')!;
  return { root, handle: createAccordion(root, options) };
}

const trigger = (id: string) =>
  document.querySelector<HTMLButtonElement>(`[data-id="${id}"] .wr-acc__trigger`)!;

const click = (id: string) => trigger(id).click();
const key = (id: string, k: string) =>
  trigger(id).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

let onChange: ReturnType<typeof vi.fn>;

beforeEach(() => {
  onChange = vi.fn();
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('type: single', () => {
  it('opens one panel at a time and closes the previous one', () => {
    const { handle } = mount({ type: 'single', onChange });
    click('a');
    expect(handle.getOpen()).toEqual(['a']);
    click('b');
    expect(handle.getOpen()).toEqual(['b']);
  });

  it('reports each change to onChange', () => {
    mount({ type: 'single', onChange });
    onChange.mockClear();
    click('a');
    click('b');
    expect(onChange).toHaveBeenNthCalledWith(1, ['a']);
    expect(onChange).toHaveBeenNthCalledWith(2, ['b']);
  });

  it('does not call onChange when the open panel is clicked again when collapsible', () => {
    const { handle } = mount({ type: 'single', collapsible: true, onChange });
    click('a');
    onChange.mockClear();
    click('a');
    expect(handle.getOpen()).toEqual([]);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe('type: multiple', () => {
  it('keeps every panel it opens', () => {
    const { handle } = mount({ type: 'multiple', onChange });
    click('a');
    click('b');
    click('c');
    expect(handle.getOpen()).toEqual(['a', 'b', 'c']);
  });

  it('closes only the panel that was toggled', () => {
    const { handle } = mount({ type: 'multiple' });
    click('a');
    click('b');
    click('a');
    expect(handle.getOpen()).toEqual(['b']);
  });
});

describe('collapsible: false', () => {
  it('refuses to close the open panel in single mode', () => {
    const { handle } = mount({ type: 'single', collapsible: false });
    click('a');
    click('a');
    expect(handle.getOpen()).toEqual(['a']);
  });

  it('still moves to another panel in single mode', () => {
    const { handle } = mount({ type: 'single', collapsible: false });
    click('a');
    click('b');
    expect(handle.getOpen()).toEqual(['b']);
  });
});

describe('imperative handle', () => {
  it('opens, closes and toggles by id', () => {
    const { handle } = mount({ type: 'multiple' });
    handle.open('a');
    expect(handle.getOpen()).toEqual(['a']);
    handle.toggle('a');
    expect(handle.getOpen()).toEqual([]);
    handle.open('b');
    handle.open('c');
    expect(handle.getOpen()).toEqual(['b', 'c']);
    handle.close('b');
    expect(handle.getOpen()).toEqual(['c']);
  });

  it('ignores unknown ids and disabled triggers', () => {
    const { handle } = mount(
      { type: 'multiple' },
      [{ ...ITEMS[0]!, disabled: true }, ITEMS[1]!],
    );
    handle.open('a');
    expect(handle.getOpen()).toEqual([]);
    handle.open('nope');
    expect(handle.getOpen()).toEqual([]);
    handle.open('b');
    expect(handle.getOpen()).toEqual(['b']);
  });

  it('honours defaultOpen on init without reporting a change', () => {
    const { handle } = mount({ type: 'multiple', defaultOpen: ['b'], onChange });
    expect(handle.getOpen()).toEqual(['b']);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('drops a disabled id from defaultOpen', () => {
    const { handle } = mount(
      { type: 'multiple', defaultOpen: ['a', 'b'] },
      [{ ...ITEMS[0]!, disabled: true }, ITEMS[1]!],
    );
    expect(handle.getOpen()).toEqual(['b']);
  });

  it('keeps at most one panel open in single mode on init', () => {
    document.body.innerHTML = renderAccordion(ITEMS, {
      idPrefix: 'test',
      open: ['a', 'b'],
    });
    const root = document.querySelector<HTMLElement>('.wr-acc')!;
    const handle = createAccordion(root, { type: 'single' });
    expect(handle.getOpen()).toEqual(['a']);
  });
});

describe('aria wiring', () => {
  it('keeps aria-expanded and the panel reference in step with state', () => {
    mount({ type: 'single' });
    const button = trigger('a');
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-labelledby')).toBe(button.id);

    click('a');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel.closest<HTMLElement>('.wr-acc__item')!.dataset.state).toBe('open');
  });

  it('wraps triggers in a heading element', () => {
    mount({ headingLevel: 4 });
    expect(trigger('a').closest('h4')).not.toBeNull();
  });
});

describe('keyboard navigation', () => {
  it('moves down and wraps at the end', () => {
    mount({ type: 'multiple' });
    trigger('a').focus();
    key('a', 'ArrowDown');
    expect(document.activeElement).toBe(trigger('b'));
    key('b', 'ArrowDown');
    expect(document.activeElement).toBe(trigger('c'));
    key('c', 'ArrowDown');
    expect(document.activeElement).toBe(trigger('a'));
  });

  it('moves up and wraps at the start', () => {
    mount({ type: 'multiple' });
    trigger('a').focus();
    key('a', 'ArrowUp');
    expect(document.activeElement).toBe(trigger('c'));
  });

  it('jumps to the first and last trigger with Home and End', () => {
    mount({ type: 'multiple' });
    trigger('b').focus();
    key('b', 'Home');
    expect(document.activeElement).toBe(trigger('a'));
    key('a', 'End');
    expect(document.activeElement).toBe(trigger('c'));
  });

  it('skips disabled triggers', () => {
    mount(
      { type: 'multiple' },
      [ITEMS[0]!, { ...ITEMS[1]!, disabled: true }, ITEMS[2]!],
    );
    trigger('a').focus();
    key('a', 'ArrowDown');
    expect(document.activeElement).toBe(trigger('c'));
    key('c', 'ArrowUp');
    expect(document.activeElement).toBe(trigger('a'));
    key('a', 'End');
    expect(document.activeElement).toBe(trigger('c'));
  });

  it('does not move focus for keys it does not handle', () => {
    mount({ type: 'multiple' });
    trigger('a').focus();
    key('a', 'ArrowRight');
    expect(document.activeElement).toBe(trigger('a'));
  });

  it('ignores arrows pressed outside a trigger', () => {
    mount({ type: 'multiple' });
    const panel = document.querySelector<HTMLElement>('.wr-acc__panel')!;
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    panel.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe('click handling', () => {
  it('ignores clicks on a disabled trigger', () => {
    const { handle } = mount(
      { type: 'multiple' },
      [{ ...ITEMS[0]!, disabled: true }, ITEMS[1]!],
    );
    click('a');
    expect(handle.getOpen()).toEqual([]);
  });

  it('toggles when the click lands on the title inside the trigger', () => {
    const { handle } = mount({ type: 'multiple' });
    trigger('a').querySelector<HTMLElement>('.wr-acc__title')!.click();
    expect(handle.getOpen()).toEqual(['a']);
  });
});

describe('destroy', () => {
  it('removes both listeners', () => {
    const { handle } = mount({ type: 'multiple' });
    handle.destroy();

    click('a');
    key('a', 'ArrowDown');

    expect(handle.getOpen()).toEqual([]);
    expect(document.activeElement).not.toBe(trigger('b'));
  });

  it('is safe to call twice', () => {
    const { handle } = mount({ type: 'multiple' });
    handle.destroy();
    expect(() => handle.destroy()).not.toThrow();
  });
});

describe('multiple instances', () => {
  it('does not react to another instance on the same page', () => {
    document.body.innerHTML =
      renderAccordion(ITEMS, { idPrefix: 'one' }) + renderAccordion(ITEMS, { idPrefix: 'two' });
    const roots = document.querySelectorAll<HTMLElement>('.wr-acc');
    const first = createAccordion(roots[0]!, { type: 'multiple' });
    const second = createAccordion(roots[1]!, { type: 'multiple' });

    roots[1]!.querySelector<HTMLButtonElement>('.wr-acc__trigger')!.click();
    expect(first.getOpen()).toEqual([]);
    expect(second.getOpen()).toEqual(['a']);

    first.destroy();
    second.destroy();
  });
});