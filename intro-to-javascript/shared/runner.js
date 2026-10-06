/* ==========================================================================
   runner.js — the tiny harness behind every task page
   --------------------------------------------------------------------------
   Students never need to open this file. It does four jobs:

   1. Loads the task's code: starter.js by default, or solution.js when the
      URL ends in ?v=solution.
   2. Copies everything the code prints with console.log() onto the page, so
      beginners see output without opening DevTools. (It still goes to the
      real DevTools console too.)
   3. Shows errors on the page in red, with the file name and line number.
   4. Loads checks.js and shows a green ✓ or red ✗ for each check.

   checks.js files use two globals defined here:
     checks(fn)                      register the task's checks
     check(label, getActual, expected)
       - getActual is a function, so a missing variable becomes a friendly
         "✗ x is not defined" instead of crashing every other check.
       - Leave out `expected` to just test that the value is truthy.
       - Labels starting with "Bonus" are optional and don't count in the score.

   Pages with <body data-checks="manual"> (the DOM tasks) get a "Run checks"
   button instead of running automatically, because those checks click
   buttons and type into inputs on the student's page.
   ========================================================================== */
(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const version = params.get("v") === "solution" ? "solution" : "starter";
  const manual = document.body.dataset.checks === "manual";
  const taskId = document.body.dataset.task || location.pathname;

  // ---------- 1. Starter / Solution switch in the header ----------
  const head = document.querySelector(".task-head");
  const here = location.pathname;
  const switcher = document.createElement("div");
  switcher.className = "switch-row";
  switcher.innerHTML = `
    <div class="switch" role="group" aria-label="Which code to run">
      <a href="${here}" ${version === "starter" ? 'aria-current="page"' : ""}>Starter</a>
      <a href="${here}?v=solution" ${version === "solution" ? 'aria-current="page"' : ""}>Solution</a>
    </div>
    <p class="file-hint">Running <code>${version}.js</code>${
      version === "starter"
        ? " · edit it, save, then refresh this page"
        : " · <strong>this is the answer</strong>, so try the starter first"
    }</p>`;
  head.appendChild(switcher);
  if (version === "solution") document.body.classList.add("is-solution");

  // ---------- 2. Output column: checks + console ----------
  const main = document.querySelector("main");
  const aside = document.createElement("aside");
  aside.className = "output";
  aside.innerHTML = `
    <section class="panel" aria-labelledby="checks-h">
      <div class="panel-head">
        <h2 id="checks-h">Checks</h2>
        <span class="score" id="score">…</span>
      </div>
      <div class="meter" aria-hidden="true"><span id="meter-fill"></span></div>
      ${manual ? '<button type="button" class="run" id="run">▶ Run checks</button>' : ""}
      <ol class="checks" id="checks"></ol>
    </section>
    <section class="panel" aria-labelledby="console-h">
      <div class="panel-head">
        <h2 id="console-h">Console</h2>
        <button type="button" class="ghost" id="clear">Clear</button>
      </div>
      <div class="console" id="console" role="log" aria-live="polite"></div>
    </section>`;
  main.appendChild(aside);

  const consoleEl = aside.querySelector("#console");
  const checksEl = aside.querySelector("#checks");
  const scoreEl = aside.querySelector("#score");
  const meterEl = aside.querySelector("#meter-fill");
  aside.querySelector("#clear").addEventListener("click", () => (consoleEl.innerHTML = ""));

  // ---------- 3. Mirror console.* onto the page ----------
  // consoleHistory holds the arguments of every console.log call, so checks
  // can ask "did the student log 168?".
  const history = [];
  window.consoleHistory = history;
  let muted = false; // true while checks run, so their calls don't clutter the console

  ["log", "info", "warn", "error", "table"].forEach((kind) => {
    const original = console[kind].bind(console);
    console[kind] = (...args) => {
      original(...args);
      if (muted) return;
      if (kind === "log" || kind === "info" || kind === "table") history.push(args);
      printLine(kind === "table" || kind === "info" ? "log" : kind, args);
    };
  });

  function printLine(kind, args) {
    const line = document.createElement("div");
    line.className = `line ${kind}`;
    if (args.length === 0) line.innerHTML = "&nbsp;";
    args.forEach((arg) => {
      const span = document.createElement("span");
      span.className = `v ${typeClass(arg)}`;
      span.textContent = format(arg, false, 0);
      line.appendChild(span);
    });
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function typeClass(v) {
    if (typeof v === "string") return "str";
    if (typeof v === "number" || typeof v === "bigint") return "num";
    if (typeof v === "boolean") return "bool";
    if (v === null || v === undefined) return "nil";
    if (typeof v === "function") return "fn";
    return "obj";
  }

  // Show values roughly the way Chrome's console does.
  function format(v, nested, depth) {
    if (typeof v === "string") return nested ? JSON.stringify(v) : v;
    if (typeof v === "function") return `ƒ ${v.name || "anonymous"}()`;
    if (typeof v === "bigint") return `${v}n`;
    if (typeof v === "symbol") return v.toString();
    if (v === undefined) return "undefined";
    if (v === null || typeof v !== "object") return Object.is(v, -0) ? "-0" : String(v);
    if (v instanceof Element) {
      const id = v.id ? `#${v.id}` : "";
      const cls = v.classList.length ? `.${[...v.classList].join(".")}` : "";
      return `<${v.tagName.toLowerCase()}${id}${cls}>`;
    }
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (depth > 2) return Array.isArray(v) ? "[…]" : "{…}";
    if (Array.isArray(v) || v instanceof NodeList || v instanceof HTMLCollection) {
      const items = [...v].map((x) => format(x, true, depth + 1)).join(", ");
      const prefix = Array.isArray(v) ? `(${v.length}) ` : `${v.constructor.name}(${v.length}) `;
      return `${prefix}[${items}]`;
    }
    const entries = Object.entries(v).map(([k, x]) => `${k}: ${format(x, true, depth + 1)}`);
    return entries.length ? `{ ${entries.join(", ")} }` : "{}";
  }

  // ---------- 4. Errors on the page ----------
  window.addEventListener("error", (e) => {
    if (e.message === "Script error.") {
      printLine("error", ["An error happened, but the browser hid the details. Open DevTools (F12) or run the page through a local server (see README)."]);
      return;
    }
    const file = e.filename ? e.filename.split("/").pop().split("?")[0] : "";
    printLine("error", [`✖ ${e.message}${file ? `   (${file} line ${e.lineno})` : ""}`]);
  });

  // ---------- 5. Checks ----------
  let suite = null;
  let results = [];
  window.checks = (fn) => (suite = fn);

  window.check = function (label, getActual, ...rest) {
    const hasExpected = rest.length > 0;
    const expected = rest[0];
    const bonus = /^bonus\b/i.test(label);
    let ok = false;
    let note = "";
    try {
      const actual = typeof getActual === "function" ? getActual() : getActual;
      ok = hasExpected ? same(actual, expected) : Boolean(actual);
      if (!ok) note = hasExpected ? `expected ${show(expected)}, got ${show(actual)}` : "not yet";
    } catch (err) {
      note = err instanceof ReferenceError ? `${err.message}` : `${err.name}: ${err.message}`;
    }
    results.push({ ok, bonus });

    const li = document.createElement("li");
    li.className = ok ? "pass" : bonus ? "skip" : "fail";
    li.innerHTML = `<span class="mark" aria-hidden="true">${ok ? "✓" : bonus ? "○" : "✗"}</span>
      <span class="text"><span class="check-label"></span><span class="check-note"></span></span>`;
    li.querySelector(".check-label").textContent = label;
    li.querySelector(".check-note").textContent = note;
    checksEl.appendChild(li);
  };

  function show(v) {
    return typeof v === "string" ? JSON.stringify(v) : format(v, true, 0);
  }

  function same(a, b) {
    if (typeof a === "number" && typeof b === "number") return Object.is(a, b) || Math.abs(a - b) < 1e-9;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return Object.is(a, b);
    try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
  }

  function runChecks() {
    checksEl.innerHTML = "";
    results = [];
    if (!suite) {
      scoreEl.textContent = "no checks";
      return;
    }
    muted = true;
    try {
      suite();
    } catch (err) {
      window.check("The checks themselves crashed: " + err.message, () => false);
    } finally {
      muted = false;
    }

    const required = results.filter((r) => !r.bonus);
    const passed = required.filter((r) => r.ok).length;
    const allPass = passed === required.length;
    scoreEl.textContent = `${passed} / ${required.length}`;
    meterEl.style.width = `${required.length ? (passed / required.length) * 100 : 0}%`;
    aside.classList.toggle("all-pass", allPass);

    // Remember finished tasks so the home page can show a ✓ (starter only:
    // the solution passing says nothing about the student's work).
    if (allPass && version === "starter") {
      try { localStorage.setItem(`js-from-zero:${taskId}`, "done"); } catch { /* storage blocked */ }
    }
  }

  const runBtn = aside.querySelector("#run");
  if (runBtn) runBtn.addEventListener("click", runChecks);

  // ---------- 6. Load the task code, then the checks ----------
  function load(src) {
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = `${src}?t=${Date.now()}`; // skip the cache so a refresh always picks up edits
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  (async () => {
    if (!(await load(`${version}.js`))) printLine("error", [`Couldn't load ${version}.js`]);
    await load("checks.js");
    if (manual) {
      scoreEl.textContent = "–";
      const li = document.createElement("li");
      li.className = "hint";
      li.textContent = "Try your page first, then press Run checks. The checks will click and type on the page for you.";
      checksEl.appendChild(li);
    } else {
      runChecks();
    }
  })();
})();
