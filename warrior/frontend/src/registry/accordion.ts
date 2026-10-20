import { createAccordion } from '@lib/accordion/accordion';
import {
  ACCORDION_ITEMS,
  renderAccordion,
  type RenderOptions,
} from '@lib/accordion/render';
import type {
  AccordionIconPosition,
  AccordionOptions,
  AccordionSize,
  AccordionType,
  AccordionVariant,
} from '@lib/accordion/types';
import type {
  CodeSnippets,
  ComponentAssets,
  ComponentMeta,
  PropValues,
} from './types';

const LIB_PATH = 'lib/accordion';

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/** Registry values -> lib options. The only translation layer in the app. */
function toRenderOptions(props: PropValues): RenderOptions {
  return {
    type: props.type as AccordionType,
    collapsible: props.collapsible as boolean,
    variant: props.variant as AccordionVariant,
    size: props.size as AccordionSize,
    iconPosition: props.iconPosition as AccordionIconPosition,
    defaultOpen: splitList(String(props.defaultOpen ?? '')),
    disabled: props.disabled === true,
  };
}

function toLibOptions(props: PropValues): AccordionOptions {
  return toRenderOptions(props);
}

/** Only the options that differ from the lib default, so the snippet stays short. */
function optionLines(props: PropValues): string[] {
  const lines: string[] = [];
  if (props.type !== 'single') lines.push(`  type: '${props.type}',`);
  if (props.collapsible === false) lines.push(`  collapsible: false,`);
  if (props.variant !== 'default') lines.push(`  variant: '${props.variant}',`);
  if (props.size !== 'md') lines.push(`  size: '${props.size}',`);
  if (props.iconPosition !== 'end')
    lines.push(`  iconPosition: '${props.iconPosition}',`);
  if (props.disabled === true) lines.push(`  disabled: true,`);

  const open = splitList(String(props.defaultOpen ?? ''));
  if (open.length > 0) {
    lines.push(`  defaultOpen: [${open.map((id) => `'${id}'`).join(', ')}],`);
  }

  return lines;
}

/**
 * The one React call site. The library stays framework-free; this wrapper is
 * what a React app writes once, and everything below it is plain CSS classes.
 */
function reactSnippet(props: PropValues): string {
  const open = splitList(String(props.defaultOpen ?? ''));
  const attributes = [
    '  items={items}',
    props.type !== 'single' ? `  type="${props.type}"` : '',
    props.collapsible === false ? `  collapsible={false}` : '',
    props.variant !== 'default' ? `  variant="${props.variant}"` : '',
    props.size !== 'md' ? `  size="${props.size}"` : '',
    props.iconPosition !== 'end' ? `  iconPosition="${props.iconPosition}"` : '',
    props.disabled === true ? `  disabled` : '',
    open.length > 0 ? `  defaultOpen={${JSON.stringify(open)}}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `import { useEffect, useMemo, useRef } from 'react';
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

  // One render pass per change: the same function that produced the HTML above.
  const markup = useMemo(
    () =>
      renderAccordion(items, {
        type,
        collapsible,
        variant,
        size,
        iconPosition,
        defaultOpen,
      }),
    [items, type, collapsible, variant, size, iconPosition, defaultOpen],
  );

  // Behaviour is attached after the markup lands, and torn down with the
  // component, so two instances on one page never share listeners.
  useEffect(() => {
    const root = host.current?.firstElementChild as HTMLElement | null;
    if (!root) return;

    const accordion = createAccordion(root, {
      type,
      collapsible,
      variant,
      size,
      iconPosition,
      defaultOpen,
    });

    return () => accordion.destroy();
  }, [type, collapsible, variant, size, iconPosition, defaultOpen]);

  return <div ref={host} dangerouslySetInnerHTML={{ __html: markup }} />;
}

// Then use it anywhere:
<Accordion
${attributes}
/>`;
}

export const accordion: ComponentMeta = {
  slug: 'accordion',
  name: 'Accordion',
  description:
    'Vertical stack of panels that open one at a time or several at once. Works from plain markup with no framework.',
  keywords: [
    'collapse',
    'disclosure',
    'expand',
    'details',
    'toggle',
    'panel',
    'keyboard',
    'aria',
  ],
  version: '0.1.0',
  status: 'stable',
  libPath: LIB_PATH,
  files: [
    `${LIB_PATH}/index.ts`,
    `${LIB_PATH}/types.ts`,
    `${LIB_PATH}/render.ts`,
    `${LIB_PATH}/accordion.ts`,
    `${LIB_PATH}/accordion.css`,
  ],

  props: [
    {
      name: 'type',
      type: '"single" | "multiple"',
      defaultValue: '"single"',
      description:
        'Single closes the open panel when another opens. Multiple lets any number sit open together.',
      control: 'select',
      options: [
        { value: 'single', label: 'single', hint: 'One panel at a time' },
        { value: 'multiple', label: 'multiple', hint: 'Any number open' },
      ],
    },
    {
      name: 'collapsible',
      type: 'boolean',
      defaultValue: 'true',
      description:
        'In single mode, false keeps the open panel open when its own trigger is pressed again.',
      control: 'toggle',
    },
    {
      name: 'variant',
      type: '"default" | "bordered" | "filled" | "separated"',
      defaultValue: '"default"',
      description: 'How the rows are grouped: by rule, by frame, by plate, or by space.',
      control: 'select',
      options: [
        { value: 'default', label: 'default', hint: 'Hairline-separated rows' },
        { value: 'bordered', label: 'bordered', hint: 'One frame around the group' },
        { value: 'filled', label: 'filled', hint: 'A plate per row' },
        { value: 'separated', label: 'separated', hint: 'Spacing only, no rules' },
      ],
    },
    {
      name: 'size',
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
      description: 'Trigger padding, type size and body size move together.',
      control: 'select',
      options: [
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    {
      name: 'iconPosition',
      type: '"start" | "end"',
      defaultValue: '"end"',
      description:
        'Where the chevron sits in the trigger. Starting it moves the panel body across to match.',
      control: 'select',
      options: [
        { value: 'start', label: 'start', hint: 'Chevron before the title' },
        { value: 'end', label: 'end', hint: 'Chevron after the title' },
      ],
    },
    {
      name: 'defaultOpen',
      type: 'string[]',
      defaultValue: "['package']",
      description:
        'Item ids open on first render. Comma-separated here; empty opens nothing.',
      control: 'text',
      placeholder: 'package, wiring',
      listOf: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: 'false',
      description:
        'Locks every trigger in the group. A single trigger is disabled by putting the native attribute in the markup.',
      control: 'toggle',
    },
    {
      name: 'onChange',
      type: '(openIds: string[]) => void',
      defaultValue: '—',
      description:
        'Called with the open ids whenever the set changes. Set it when the host app needs to react.',
      control: 'none',
    },
  ],

  defaultProps: {
    type: 'single',
    collapsible: true,
    variant: 'default',
    size: 'md',
    iconPosition: 'end',
    defaultOpen: 'package',
    disabled: false,
  },

  variants: [
    {
      name: 'default',
      label: 'default',
      description: 'Hairline rules between rows, nothing around the group.',
      props: { variant: 'default' },
    },
    {
      name: 'bordered',
      label: 'bordered',
      description: 'One frame holds the whole group together.',
      props: { variant: 'bordered' },
    },
    {
      name: 'filled',
      label: 'filled',
      description: 'Each row sits on its own plate.',
      props: { variant: 'filled' },
    },
    {
      name: 'separated',
      label: 'separated',
      description: 'No rules at all. Spacing does the grouping.',
      props: { variant: 'separated' },
    },
  ],

  assets: [{ id: 'css', label: 'CSS', file: 'accordion.css', lang: 'css' }],

  keyboard: [
    { combo: ['Enter', 'Space'], does: 'Open or close the focused panel' },
    { combo: ['ArrowDown'], does: 'Move to the next trigger, wrapping at the end' },
    { combo: ['ArrowUp'], does: 'Move to the previous trigger, wrapping at the start' },
    { combo: ['Home'], does: 'Jump to the first trigger' },
    { combo: ['End'], does: 'Jump to the last trigger' },
  ],

  toOptions: toLibOptions,

  render(props, options = {}) {
    const items = options.limit
      ? ACCORDION_ITEMS.slice(0, options.limit)
      : ACCORDION_ITEMS;
    return renderAccordion(items, {
      ...toRenderOptions(props),
      ...(options.idPrefix ? { idPrefix: options.idPrefix } : {}),
    });
  },

  mount(root, props) {
    return createAccordion(root, toLibOptions(props));
  },

  code(props, assets: ComponentAssets): CodeSnippets {
    const options = optionLines(props);

    return {
      html: renderAccordion(ACCORDION_ITEMS, {
        ...toRenderOptions(props),
        indent: '  ',
      }),
      ts: [
        `import { createAccordion } from 'warrior/lib/accordion';`,
        `import 'warrior/lib/accordion/accordion.css';`,
        ``,
        `const root = document.querySelector('.wr-acc');`,
        ``,
        `const accordion = createAccordion(root, {`,
        ...(options.length > 0
          ? options
          : [`  // every option is at its default value`]),
        `  onChange: (openIds) => console.log(openIds),`,
        `});`,
        ``,
        `accordion.toggle('package');`,
      ].join('\n'),
      react: reactSnippet(props),
      css: assets.css ?? '/* accordion.css */',
    };
  },
};