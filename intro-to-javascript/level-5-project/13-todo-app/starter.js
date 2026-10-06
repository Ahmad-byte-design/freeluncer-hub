// =============================================================
// Level 5 — Mini project: a todo app
// =============================================================
// The pattern (the same as the counter in 4.2):
//   1. STATE:  all the data lives in the `todos` array
//   2. RENDER: render() makes the page match the array
//   3. EVENTS: every action changes the array, then calls render()

let todos = [
  { id: 1, text: "Finish the JS tasks", done: false },
  { id: 2, text: "Open DevTools", done: true },
];
let nextId = 3; // add 1 each time, so every todo gets its own id

const form = document.querySelector("#add-form");
const input = document.querySelector("#new-todo");
const list = document.querySelector("#list");
const remainingEl = document.querySelector("#remaining");
const clearBtn = document.querySelector("#clear-done");

// ---------------------------------------------------------------
// RENDER
// ---------------------------------------------------------------
function render() {
  list.innerHTML = ""; // start from an empty list every time

  for (const todo of todos) {
    const li = document.createElement("li");
    li.dataset.id = todo.id; // stored as data-id="1", so events can tell which todo it is

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;

    const span = document.createElement("span");
    span.textContent = todo.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", `Delete "${todo.text}"`);

    // TODO 2: if the todo is done:
    if (todo.done) {
      checkbox.checked = true;
      li.classList.add("done");
    }

    li.append(checkbox, span, del);
    list.append(li);
  }

  // TODO 3: count the todos that are NOT done and show "2 left"
  const remaining = todos.filter((todo) => !todo.done).length;
  remainingEl.textContent = `${remaining} left`;
}

// ---------------------------------------------------------------
// EVENTS
// ---------------------------------------------------------------

// TODO 4: add a todo
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  todos.push({ id: nextId, text, done: false });
  nextId++;

  input.value = "";
  render();
});

// TODO 5: toggle or delete. ONE listener on the whole list.
list.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (event.target.type === "checkbox") {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.done = !todo.done;
    }
  }

  if (event.target.classList.contains("delete")) {
    todos = todos.filter((t) => t.id !== id);
  }

  render();
});

// TODO 6: "Clear completed" keeps only the todos that are NOT done
clearBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  render();
});

render(); // draw the starting list