/**
 * The framework-free proof: two CSS files, one import, one function.
 * Build it with `npm run example:html`, then open
 * examples/dist/plain-html.html in a browser.
 */
import { createAccordion } from '../lib/accordion/accordion';
import { renderAccordion } from '../lib/accordion/render';
import type { AccordionItem } from '../lib/accordion/types';

const items: AccordionItem[] = [
  {
    id: 'css',
    title: 'Link the CSS',
    content:
      'core/index.css brings the tokens and the reset. accordion/accordion.css brings the component.\nNothing else is needed.',
  },
  {
    id: 'markup',
    title: 'Write the markup',
    content:
      'renderAccordion writes it, but any markup with the wr-acc class names works just as well.\nState lives in data-state, never in a class the script adds.',
  },
  {
    id: 'behaviour',
    title: 'Attach the behaviour',
    content:
      'createAccordion puts one click listener and one keydown listener on the root, whatever the item count.\nCall destroy() to remove both.',
  },
  {
    id: 'locking',
    title: 'A trigger you cannot open',
    content:
      'This one is disabled in the markup, so the arrow keys skip it and pressing it does nothing.',
    disabled: true,
  },
];

const host = document.getElementById('host');
if (host) {
  host.innerHTML = renderAccordion(items, {
    variant: 'bordered',
    defaultOpen: ['css'],
  });

  const root = host.querySelector<HTMLElement>('.wr-acc');
  if (root) {
    createAccordion(root, {
      type: 'single',
      variant: 'bordered',
      defaultOpen: ['css'],
      onChange: (openIds) => console.log('open:', openIds),
    });
  }
}