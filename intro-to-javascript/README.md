# JavaScript from Zero: a levelled task set

13 small tasks in 5 levels, from the first `console.log` to a working todo app.
Every task has a **starter** file for students to fill in, a fully commented
**solution**, and **checks** that turn green on the page as each step is done.

No build step and nothing to install: plain HTML, CSS and JavaScript.

```
intro-to-javascript/
├── index.html                  ← START HERE: home page with every task (saves progress per browser)
├── shared/
│   ├── runner.js               loads the code, shows the console + errors on the page, runs checks
│   └── task.css                shared styles (light + dark)
├── level-1-basics/
│   ├── 01-hello-console/       each task folder has the same four files:
│   ├── 02-variables/             index.html   brief + (for DOM tasks) the live page
│   └── 03-operators-and-types/   starter.js   what students edit (TODO 1, TODO 2, …)
├── level-2-logic/                solution.js  the answer, commented to read aloud
│   ├── 04-functions/             checks.js    the tests (students don't edit this)
│   ├── 05-conditions/
│   └── 06-loops/
├── level-3-data/
│   ├── 07-arrays/
│   ├── 08-objects/
│   └── 09-array-methods/
├── level-4-dom/
│   ├── 10-dom-select-and-change/
│   ├── 11-events-counter/
│   └── 12-forms-tip-calculator/
└── level-5-project/
    └── 13-todo-app/
```

## Running it

```bash
cd intro-to-javascript
python3 -m http.server 8000
# open http://localhost:8000
```

**Use the server.** You *can* open the files straight from disk, but then the browser
hides error details and students only see "An error happened". Through the server
they get the full message, like `ReferenceError: tota is not defined (starter.js line 3)`.
Reading that line is half the lesson.

## How a task page works

- **Starter / Solution switch** at the top. The solution is `?v=solution` on the URL,
  so you can open it on the projector while students stay on the starter.
- **Checks panel.** One line per TODO. Failing checks say why, e.g.
  `expected 6, got undefined` or `square is not defined`. Checks marked
  **Bonus** are optional and don't count toward the score.
- **Console panel.** A copy of everything `console.log` prints, plus errors in red.
  It all goes to the real DevTools console too. Get students into DevTools from
  task 1.1 on. The panel is training wheels, not a replacement.
- **DOM tasks (4.2, 4.3, 5.1)** have a **Run checks** button, because those checks
  click and type on the student's page. The todo checks save the student's list
  and put it back afterwards.
- Refreshing always loads the latest `starter.js` (no stale cache).
- When a starter passes every check, the home page shows **✓ Done** on that card.
  This lives in each student's own browser (localStorage). "Reset progress" clears it.

Checks test **behaviour, not code**. They call the functions and read the page, so
any correct approach passes. For example, `canVote` passes with an `if` or with
`return age >= 18`.

---

## The 13 tasks

| # | Task | Concepts | The mistake to expect |
|---|---|---|---|
| 1.1 | Hello, Console | `console.log`, strings vs numbers, `typeof` | Quoting numbers (`"7"`), unclosed `(` |
| 1.2 | Variables | `const`, `let`, template literals, `++` | Regular quotes instead of backticks, so `${}` shows as literal text |
| 1.3 | Operators & Types | `* / %`, booleans, `Number()`, `==` vs `===` | Expecting `"5" + 3` to be 8 |
| 2.1 | Functions | parameters, `return`, defaults, arrow functions | `console.log` instead of `return` (checks get `undefined`) |
| 2.2 | Conditions | `if / else if / else`, `&&`, `\|\|` | Checking `>= 60` before `>= 90`, and `>` vs `>=` at 90 |
| 2.3 | Loops | `for`, `for...of`, `while`, accumulator | Off-by-one (`< n` vs `<= n`), FizzBuzz check order |
| 3.1 | Arrays | index, `.length`, `.push`, looping | `let biggest = 0` fails for all-negative arrays (a check catches it) |
| 3.2 | Objects | dot vs bracket, adding properties, `Object.keys` | `student.key` instead of `student[key]`, or `student` inside `describe` instead of `person` |
| 3.3 | Array Methods | `forEach` `map` `filter` `find` `reduce`, chaining | Forgetting reduce's starting `0`, or `find` vs `filter` |
| 4.1 | Select & Change | `querySelector(All)`, `textContent`, `classList`, `createElement` | Selector typo → `null` → "Cannot set properties of null" |
| 4.2 | Click Counter | `addEventListener`, state → `render()`, `.disabled` | `addEventListener("click", render())`, calling instead of passing |
| 4.3 | Tip Calculator | `.value` is a string, `submit` + `preventDefault`, guard clauses, `toFixed` | Page reloads (no `preventDefault`), `"100" + 15` |
| 5.1 | Todo App | array of objects as state, event delegation, `filter`/`find`, `trim` | Listeners on `<li>`s that get destroyed on every render |

### The ideas that repeat on purpose

Point these out when they come back. The repetition is by design:

- **Strings vs numbers:** 1.1 → 1.3 → 4.3. Students meet `"5" + 3` as a curiosity,
  then hit it for real with form inputs.
- **The accumulator pattern:** 2.3 (`sumTo`) → 3.3 (`reduce`) → 5.1 (the
  "left" count). `reduce` is just the loop they already wrote.
- **State → render:** 4.2 with a number → 5.1 with an array. Same shape, bigger
  state. This is the idea behind React, so it's worth naming out loud.
- **Guard clauses:** 3.1 (`contains`) → 4.3 (invalid bill) → 5.1 (empty todo).
- **`textContent` vs `innerHTML`:** 4.1 bonus → 5.1 comment. Text that users type
  never goes into `innerHTML`.

---

## Run of show

This is too much for one class. It splits into **three sessions of about 90 minutes**:

### Session A: Levels 1–2 (the language)

| Time | What |
|---|---|
| 0:00–0:10 | Open the home page. Show how a task works: edit `starter.js` → save → refresh → checks go green. Open DevTools together. |
| 0:10–0:25 | **1.1 together, live.** Make a typo on purpose and read the error out loud. Then **1.2 solo** (5 min), then review. |
| 0:25–0:40 | **1.3.** Stop at TODO 5 and have everyone predict `"5" + 3` before they run it. Hands up for 8, then for 53. |
| 0:40–0:55 | **2.1.** Spend time on TODO 6 (`logDouble`). "return vs log" is the most important idea of the session. |
| 0:55–1:15 | **2.2 + 2.3 solo / pairs.** Walk around. Most "stuck" moments are the 90 edge or FizzBuzz order. Let the failing check teach it. |
| 1:15–1:30 | Review: show the solutions, compare with student versions. There's more than one right answer. |

### Session B: Level 3 (data)

| Time | What |
|---|---|
| 0:00–0:25 | **3.1.** Draw an array with index boxes on the board. Let people get caught by the all-negative `largest` check, then ask why it failed. |
| 0:25–0:50 | **3.2.** Dot vs bracket: `student.key` vs `student[key]`. Ask students to predict the result first. |
| 0:50–1:25 | **3.3.** Put the "which method?" tip on screen and leave it there. Write `total` as a `for...of` loop first, then as `reduce`, side by side. |
| 1:25–1:30 | Preview: next time, JavaScript changes the page. |

### Session C: Levels 4–5 (the page)

| Time | What |
|---|---|
| 0:00–0:20 | **4.1.** Right-click → Inspect. Show that the DOM after JS isn't the HTML file. Try a `"#tittle"` typo together. |
| 0:20–0:40 | **4.2.** Draw *state → render* on the board before anyone writes code. |
| 0:40–1:00 | **4.3.** Let someone forget `preventDefault` and watch the page reload. It sticks better than being told. |
| 1:00–1:30 | **5.1** in pairs. Stronger pairs do the localStorage bonus. Finish at home if needed. |

### If you're short on time

The core path is **1.1 → 1.2 → 2.1 → 2.2 → 3.1 → 3.3 → 4.2 → 5.1**. The skipped
tasks make good homework.

---

## Adding or changing a task

1. Copy a task folder and keep the four file names.
2. In `index.html`, update the title, `data-level` (1–5, sets the colour),
   `data-task` (unique, used for progress), and `data-checks="manual"` if the
   checks need to click things.
3. Write checks as `check("label", () => actual, expected)`. Leave out
   `expected` to test that the value is truthy. Start the label with "Bonus" to
   make a check optional. Keep the arrow function: it turns
   "variable not defined yet" into one friendly ✗ instead of a crash.
4. Add a card to the home page `index.html`.
