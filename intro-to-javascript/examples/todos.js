sessionStorage

/*
- define new array
- Read function => list & format items + validate empty state
- Add function => validate item, then add to array + validation error
- Update function => select existing item, validate, then update item in array + validation error
- Delete function => select existing item, delete item from array + validation error
*/

/**
 * @type {{
 *  id: number;
 *  title: string;
 *  desc: string;
 *  isCompleted: boolean;
 * }[]}
 */
const todos = [];

function isItemValid(item) {
    if (!item.title) return false;
    if (!item.desc) return false;

    return true;
}

function readItems(items) {
    if (items.length === 0) {
        return console.log("Empty state")
    }
    const normalizeTodos = items.map(
        i => JSON.stringify(i)
    )
    console.log(normalizeTodos.join(","))
}

function addItem(newItem) {
    if (!isItemValid(newItem)) return

    const newItemId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
    todos.push({ ...newItem, isCompleted: false, id: newItemId })
    readItems(todos);
}

function updateItem(id, newItem) {
    const existingItemIndex = todos.findIndex(i => i.id === id);

    if (existingItemIndex === -1) return;
    if (!isItemValid(newItem)) return;

    todos[existingItemIndex] = newItem;
    readItems(todos);
}

function deleteItem(id) {
    const clearTodos = todos.filter(i => i.id !== id)
    readItems(clearTodos);
}

//// empty state
readItems([]);
addItem({
    title: "new item",
    desc: "new desc",
})
updateItem(1, {
    title: "new item update",
    desc: "new desc update",
})
deleteItem(1)