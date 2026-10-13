import React from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useStore } from "../hooks/useStore";

function List() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const list = useStore((state) => state.list);

  const create = useStore((state) => state.create);

  const deleteItem = useStore((state) => state.delete);

  return (
    <section className="w-full max-w-md mx-auto mt-8 bg-white p-4 rounded shadow ">
      <div className="flex mb-4">
        <Input ref={inputRef} />
        <Button onClick={() => create(inputRef)}>Add Item</Button>
      </div>{" "}
      <ul>
        {list.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center p-2 border-b border-gray-200  "
          >
            <span>{item}</span>
            <Button onClick={() => deleteItem(index)}>Delete</Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default List;
