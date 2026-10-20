# Warrior — docs site

Docs site for **Warrior**, a dark-first, utility-first component library.
`lib/` is framework-agnostic TypeScript and CSS; `src/` is the Next.js site that
documents it.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on <http://localhost:3000> |
| `npm run build` | Production build, standalone output, assets staged |
| `npm start` | Serve the standalone build |
| `npm test` | Vitest, jsdom environment, one pass |
| `npm run test:watch` | Vitest in watch mode |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run example:html` | Bundle the framework-free demo into `examples/dist/` |

## Docker

From the repository root:

```bash
docker compose -f docker/docker-compose.yml up dev    # live-reload dev server
docker compose -f docker/docker-compose.yml up app    # production image on :3000
```

Or build directly:

```bash
docker build -f docker/Dockerfile -t warrior .
docker run --rm -p 3000:3000 warrior
```

The runtime image is multi-stage, runs as the non-root `warrior` user and serves
the Next standalone output on port 3000.

## Using the accordion without a framework

`lib/` has no dependencies. Link the CSS, write the markup, call one function.

```bash
npm run example:html
open examples/dist/plain-html.html
```

That command is the proof: it bundles `examples/plain-html.ts` with esbuild, copies
`lib/core/index.css`, `lib/accordion/accordion.css` and the three woff2 files next
to the page, and writes a folder you can open straight from disk. No dev server, no
framework, no build step in the browser.

The markup it renders is exactly this:

```html
<link rel="stylesheet" href="lib/core/index.css" />
<link rel="stylesheet" href="lib/accordion/accordion.css" />

<div class="wr-acc" data-variant="bordered" data-size="md">
  <div class="wr-acc__item" data-state="open">
    <h3 class="wr-acc__heading">
      <button
        class="wr-acc__trigger"
        type="button"
        id="t1"
        aria-expanded="true"
        aria-controls="p1"
      >
        <span class="wr-acc__title">What ships in the package</span>
        <svg class="wr-acc__icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 3.5L10.5 8L6 12.5" fill="none" stroke="currentColor"
                stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" />
        </svg>
      </button>
    </h3>
    <div class="wr-acc__panel" id="p1" role="region" aria-labelledby="t1" data-state="open">
      <div class="wr-acc__content">
        <p>Tokens, reset, and one component.</p>
      </div>
    </div>
  </div>
</div>

<script type="module">
  import { createAccordion } from './lib/accordion/index.js';
  createAccordion(document.querySelector('.wr-acc'), {
    type: 'single',
    variant: 'bordered',
    onChange: (openIds) => console.log(openIds),
  });
</script>
```

`createAccordion` returns `{ open, close, toggle, getOpen, destroy }`. It
attaches one click listener and one keydown listener to the root, whatever the
item count. `destroy()` removes both.

## Using it from React

The library stays framework-free, so a React app writes the wrapper once. The
React tab in the site's Code panel is this component, kept in step with whatever
the Customize panel is set to:

```tsx
import { useEffect, useMemo, useRef } from 'react';
import { createAccordion, renderAccordion } from 'warrior/lib/accordion';
import type { AccordionItem, AccordionOptions } from 'warrior/lib/accordion';
import 'warrior/lib/accordion/accordion.css';

export function Accordion({
  items,
  type = 'single',
  collapsible = true,
  variant = 'default',
  size = 'md',
  iconPosition = 'end',
  defaultOpen = [],
}: AccordionOptions & { items: AccordionItem[] }) {
  const host = useRef<HTMLDivElement>(null);

  const markup = useMemo(
    () => renderAccordion(items, { type, collapsible, variant, size, iconPosition, defaultOpen }),
    [items, type, collapsible, variant, size, iconPosition, defaultOpen],
  );

  useEffect(() => {
    const root = host.current?.firstElementChild as HTMLElement | null;
    if (!root) return;
    const accordion = createAccordion(root, { type, collapsible, variant, size, iconPosition, defaultOpen });
    return () => accordion.destroy();
  }, [type, collapsible, variant, size, iconPosition, defaultOpen]);

  return <div ref={host} dangerouslySetInnerHTML={{ __html: markup }} />;
}

// Then use it anywhere:
<Accordion items={items} defaultOpen={['package']} />;
```

Because the markup comes from the same `renderAccordion` the HTML tab shows, the
wrapper cannot drift from the library.

## Layout of this folder

```
lib/       framework-agnostic source. Ships as-is.
examples/  the no-framework demo, and the script that bundles it.
src/app/   routes, fonts and the document shell.
src/registry/  one entry per component. Adding a component means adding a file here.
src/features/  docs-shell, component-page, code-viewer. Features never import each other.
src/shared/    provider, icons, highlighter, helpers.
tests/     Vitest + jsdom.
```

See `docs/architecture/accordion.md` for the full contract.

## Notes

- Fonts are self-hosted in `src/app/fonts/` and loaded with `next/font/local`,
  so the build never depends on a font CDN.
- The CSS shown in the Code tab is read from disk at request time, which is why
  `lib/` is copied into the runtime image.