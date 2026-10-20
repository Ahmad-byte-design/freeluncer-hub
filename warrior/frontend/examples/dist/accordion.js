"use strict";
(() => {
  // lib/accordion/accordion.ts
  var TRIGGER_SELECTOR = ".wr-acc__trigger";
  var ITEM_SELECTOR = ".wr-acc__item";
  var NAVIGATION_KEYS = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "Home", "End"]);
  function createId(root, key) {
    root.dataset[key] = root.dataset[key] ?? "";
    let counter = Number(root.dataset[key] || "0");
    counter += 1;
    root.dataset[key] = String(counter);
    return root.dataset[key] ?? "1";
  }
  function createAccordion(root, options = {}) {
    const type = options.type ?? "single";
    const collapsible = options.collapsible ?? true;
    const animated = options.animated ?? true;
    const defaultOpen = options.defaultOpen ?? [];
    root.dataset.type = type;
    root.dataset.variant = options.variant ?? root.dataset.variant ?? "default";
    root.dataset.size = options.size ?? root.dataset.size ?? "md";
    root.dataset.iconPosition = options.iconPosition ?? root.dataset.iconPosition ?? "end";
    root.dataset.animated = String(animated);
    const uid = createId(root, "wrAccId");
    root.id = root.id || `wr-acc-${uid}`;
    const triggers = () => Array.from(root.querySelectorAll(TRIGGER_SELECTOR));
    const items2 = () => Array.from(root.querySelectorAll(ITEM_SELECTOR));
    const itemOf = (trigger) => {
      const panel = document.getElementById(
        trigger.getAttribute("aria-controls") ?? ""
      );
      if (!panel) return null;
      return panel.closest(ITEM_SELECTOR);
    };
    const idOf = (trigger) => {
      const explicit = itemOf(trigger)?.dataset.id;
      if (explicit) return explicit;
      const triggerId = trigger.id ?? "";
      const marker = triggerId.lastIndexOf("-trigger-");
      return marker === -1 ? triggerId : triggerId.slice(marker + 9);
    };
    const triggerFor = (id) => triggers().find((trigger) => idOf(trigger) === id);
    const isDisabled = (trigger) => trigger.disabled || trigger.getAttribute("aria-disabled") === "true";
    const setItem = (item, open2) => {
      if (open2 === (item.dataset.state === "open")) return false;
      item.dataset.state = open2 ? "open" : "closed";
      item.querySelector(TRIGGER_SELECTOR)?.setAttribute("aria-expanded", String(open2));
      return true;
    };
    const setOpen = (trigger, open2) => {
      const item = itemOf(trigger);
      return item ? setItem(item, open2) : false;
    };
    const readOpen = () => items2().filter((item) => item.dataset.state === "open").map((item) => item.dataset.id ?? "").filter((id) => id.length > 0);
    const commit = (before) => {
      const after = readOpen();
      const changed = after.length !== before.length || after.some((id, i) => id !== before[i]);
      if (changed) options.onChange?.(after);
    };
    const openMany = (targets) => {
      for (const trigger of targets) {
        if (isDisabled(trigger)) continue;
        if (type === "single") {
          for (const other of triggers()) {
            if (other !== trigger) setOpen(other, false);
          }
        }
        setOpen(trigger, true);
      }
    };
    const open = (id) => {
      const trigger = triggerFor(id);
      if (!trigger || isDisabled(trigger)) return;
      const before = readOpen();
      openMany([trigger]);
      commit(before);
    };
    const close = (id) => {
      if (type === "single" && !collapsible) return;
      const trigger = triggerFor(id);
      if (!trigger) return;
      const before = readOpen();
      setOpen(trigger, false);
      commit(before);
    };
    const toggle = (id) => {
      const trigger = triggerFor(id);
      if (!trigger || isDisabled(trigger)) return;
      const isOpen = itemOf(trigger)?.dataset.state === "open";
      if (isOpen) close(id);
      else open(id);
    };
    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest(TRIGGER_SELECTOR);
      if (!trigger || !root.contains(trigger) || isDisabled(trigger)) return;
      event.preventDefault();
      toggle(idOf(trigger));
    };
    const onKeyDown = (event) => {
      if (!NAVIGATION_KEYS.has(event.key)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest(TRIGGER_SELECTOR);
      if (!trigger || !root.contains(trigger)) return;
      const list = triggers();
      const enabled = list.filter((item) => !isDisabled(item));
      if (enabled.length === 0) return;
      const current = enabled.indexOf(trigger);
      if (current === -1) return;
      const step = (offset) => {
        const next2 = (current + offset + enabled.length) % enabled.length;
        return enabled[next2] ?? enabled[0];
      };
      let next;
      switch (event.key) {
        case "ArrowDown":
          next = step(1);
          break;
        case "ArrowUp":
          next = step(-1);
          break;
        case "Home":
          next = enabled[0];
          break;
        default:
          next = enabled[enabled.length - 1];
          break;
      }
      event.preventDefault();
      next.focus();
    };
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKeyDown);
    const beforeInitial = readOpen();
    const initial = defaultOpen.filter((id) => {
      const trigger = triggerFor(id);
      return trigger !== void 0 && !isDisabled(trigger);
    });
    if (initial.length > 0) {
      openMany(initial.map((id) => triggerFor(id)).filter(Boolean));
      for (const trigger of triggers()) {
        if (!initial.includes(idOf(trigger))) setOpen(trigger, false);
      }
    }
    if (type === "single") {
      const openItems = items2().filter((item) => item.dataset.state === "open");
      for (const item of openItems.slice(1)) setItem(item, false);
    }
    commit(beforeInitial);
    return {
      open,
      close,
      toggle,
      getOpen: readOpen,
      destroy() {
        root.removeEventListener("click", onClick);
        root.removeEventListener("keydown", onKeyDown);
      }
    };
  }

  // lib/accordion/render.ts
  var DEFAULTS = {
    type: "single",
    collapsible: true,
    variant: "default",
    size: "md",
    iconPosition: "end",
    headingLevel: 3,
    animated: true,
    idPrefix: "wr-acc",
    indent: ""
  };
  var HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
  }
  function escapeBlock(value) {
    return value.trim().split("\n").map((line) => escapeHtml(line.trim())).join("\n");
  }
  function indentBlock(value, pad) {
    if (!pad) return value;
    return value.split("\n").map((line) => line.length > 0 ? pad + line : line).join("\n");
  }
  var CHEVRON = '<svg class="wr-acc__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 3.5L10.5 8L6 12.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter"/></svg>';
  function renderAccordion(items2, options = {}) {
    const type = options.type ?? DEFAULTS.type;
    const variant = options.variant ?? DEFAULTS.variant;
    const size = options.size ?? DEFAULTS.size;
    const iconPosition = options.iconPosition ?? DEFAULTS.iconPosition;
    const level = options.headingLevel ?? DEFAULTS.headingLevel;
    const idPrefix = options.idPrefix ?? DEFAULTS.idPrefix;
    const pad = options.indent ?? DEFAULTS.indent;
    const openSet = new Set(options.open ?? options.defaultOpen ?? []);
    const rootAttributes = [
      'class="wr-acc"',
      `data-type="${type}"`,
      `data-variant="${variant}"`,
      `data-size="${size}"`,
      `data-icon-position="${iconPosition}"`,
      options.animated === false ? 'data-animated="false"' : ""
    ].filter(Boolean).join(" ");
    const body = items2.map((item) => {
      const triggerId = `${idPrefix}-trigger-${item.id}`;
      const panelId = `${idPrefix}-panel-${item.id}`;
      const isOpen = openSet.has(item.id);
      const heading = `h${level}`;
      const chevron = iconPosition === "start" ? CHEVRON : "";
      const triggerLines = [
        `<button`,
        `  class="wr-acc__trigger"`,
        `  type="button"`,
        `  id="${escapeHtml(triggerId)}"`,
        `  aria-expanded="${isOpen}"`,
        `  aria-controls="${escapeHtml(panelId)}"`,
        item.disabled || options.disabled === true ? `  disabled` : "",
        chevron ? `  ${chevron}` : "",
        `>`,
        `  <span class="wr-acc__title">${escapeHtml(item.title)}</span>`,
        chevron ? "" : `  ${CHEVRON}`,
        `</button>`
      ].filter((line) => line.length > 0);
      const lines = [
        `<div class="wr-acc__item" data-id="${escapeHtml(item.id)}" data-state="${isOpen ? "open" : "closed"}">`,
        `  <${heading} class="wr-acc__heading">`,
        indentBlock(triggerLines.join("\n"), "  "),
        `  </${heading}>`,
        `  <div`,
        `    class="wr-acc__panel"`,
        `    id="${escapeHtml(panelId)}"`,
        `    role="region"`,
        `    aria-labelledby="${escapeHtml(triggerId)}"`,
        `    data-state="${isOpen ? "open" : "closed"}"`,
        `  >`,
        `    <div class="wr-acc__content">`,
        ...escapeBlock(item.content).split("\n").map((line) => `      <p>${line}</p>`),
        `    </div>`,
        `  </div>`,
        `</div>`
      ];
      return indentBlock(lines.join("\n"), pad);
    }).join("\n");
    return [`<div ${rootAttributes}>`, indentBlock(body, pad), `</div>`].join("\n");
  }

  // examples/plain-html.ts
  var items = [
    {
      id: "css",
      title: "Link the CSS",
      content: "core/index.css brings the tokens and the reset. accordion/accordion.css brings the component.\nNothing else is needed."
    },
    {
      id: "markup",
      title: "Write the markup",
      content: "renderAccordion writes it, but any markup with the wr-acc class names works just as well.\nState lives in data-state, never in a class the script adds."
    },
    {
      id: "behaviour",
      title: "Attach the behaviour",
      content: "createAccordion puts one click listener and one keydown listener on the root, whatever the item count.\nCall destroy() to remove both."
    },
    {
      id: "locking",
      title: "A trigger you cannot open",
      content: "This one is disabled in the markup, so the arrow keys skip it and pressing it does nothing.",
      disabled: true
    }
  ];
  var host = document.getElementById("host");
  if (host) {
    host.innerHTML = renderAccordion(items, {
      variant: "bordered",
      defaultOpen: ["css"]
    });
    const root = host.querySelector(".wr-acc");
    if (root) {
      createAccordion(root, {
        type: "single",
        variant: "bordered",
        defaultOpen: ["css"],
        onChange: (openIds) => console.log("open:", openIds)
      });
    }
  }
})();
