import { describe, expect, it } from 'vitest';
import { ACCORDION_ITEMS, escapeHtml, renderAccordion } from '@lib/accordion/render';

describe('escapeHtml', () => {
  it('escapes every character that could break out of text', () => {
    expect(escapeHtml(`<b>&"'`)).toBe('&lt;b&gt;&amp;&quot;&#39;');
  });
});

describe('renderAccordion', () => {
  const items = ACCORDION_ITEMS.slice(0, 2);

  it('renders every item with a trigger, a heading and a region', () => {
    const html = renderAccordion(items);
    expect(html).toContain('class="wr-acc"');
    expect(html.match(/class="wr-acc__item"/g)).toHaveLength(2);
    expect(html.match(/class="wr-acc__trigger"/g)).toHaveLength(2);
    expect(html.match(/role="region"/g)).toHaveLength(2);
    expect(html.match(/<h3/g)).toHaveLength(2);
  });

  it('writes state into data attributes, never into a class or a style', () => {
    const html = renderAccordion(items, { defaultOpen: [items[0]!.id] });
    expect(html).toContain('data-state="open"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('style=');
    expect(html).not.toMatch(/class="[^"]*\b(is-|wr-acc--)/);
  });

  it('links each trigger to its panel in both directions', () => {
    const html = renderAccordion(items, { idPrefix: 'x' });
    const trigger = html.match(/id="x-trigger-([^"]+)"/)![1];
    expect(html).toContain(`aria-controls="x-panel-${trigger}"`);
    expect(html).toContain(`aria-labelledby="x-trigger-${trigger}"`);
  });

  it('honours the heading level', () => {
    expect(renderAccordion(items, { headingLevel: 5 })).toContain('<h5');
  });

  it('places the chevron before or after the title', () => {
    const start = renderAccordion(items, { iconPosition: 'start' });
    const end = renderAccordion(items, { iconPosition: 'end' });
    const firstTrigger = (html: string) =>
      html.slice(html.indexOf('<button'), html.indexOf('</button>'));
    expect(firstTrigger(start).indexOf('<svg')).toBeLessThan(
      firstTrigger(start).indexOf('wr-acc__title'),
    );
    expect(firstTrigger(end).indexOf('<svg')).toBeGreaterThan(
      firstTrigger(end).indexOf('wr-acc__title'),
    );
  });

  it('marks a disabled trigger with the native attribute', () => {
    const html = renderAccordion([{ ...items[0]!, disabled: true }]);
    expect(html).toContain('disabled');
    expect(html).toContain('aria-expanded="false"');
  });

  it('escapes item content', () => {
    const html = renderAccordion([
      { id: 'x', title: '<script>', content: 'a & b < c' },
    ]);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('a &amp; b &lt; c');
  });

  it('is deterministic', () => {
    expect(renderAccordion(items, { open: ['package'] })).toBe(
      renderAccordion(items, { open: ['package'] }),
    );
  });

  it('indents nested markup when asked', () => {
    const html = renderAccordion(items, { indent: '  ' });
    expect(html.split('\n').filter((line) => line.startsWith('    ')).length).toBeGreaterThan(0);
    expect(html.startsWith('<div class="wr-acc"')).toBe(true);
  });

  it('emits data attributes for every presentation option', () => {
    const html = renderAccordion(items, {
      type: 'multiple',
      variant: 'filled',
      size: 'lg',
      iconPosition: 'start',
      animated: false,
    });
    expect(html).toContain('data-type="multiple"');
    expect(html).toContain('data-variant="filled"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('data-icon-position="start"');
    expect(html).toContain('data-animated="false"');
  });
});

describe('ACCORDION_ITEMS', () => {
  it('has unique ids and no empty fields', () => {
    const ids = ACCORDION_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of ACCORDION_ITEMS) {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.content.trim().length).toBeGreaterThan(0);
    }
  });
});