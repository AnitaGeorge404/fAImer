import React, { useState, useEffect } from "react";
import { getLists, createList, addTask, TodoList } from "@/lib/todoService";

interface Props {
  open: boolean;
  suggestion: string;
  onClose: () => void;
  onAdded?: (taskText: string) => void;
}

const TodoModal: React.FC<Props> = ({ open, suggestion, onClose, onAdded }) => {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (open) {
      setLists(getLists());
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const l = createList(newTitle.trim());
    setLists(getLists());
    setNewTitle("");
    // auto-add suggestion into new list
    const task = addTask(l.id, suggestion);
    onAdded?.(task.text);
    onClose();
  };

  const handleAddToList = (listId: string) => {
    const task = addTask(listId, suggestion);
    onAdded?.(task.text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-t-xl w-full max-w-md p-4 z-50 shadow-xl">
        <h3 className="text-lg font-semibold">Add suggestion to a To‑Do list</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{suggestion}</p>

        <div className="mt-3 space-y-2">
          {lists.length === 0 && (
            <div className="text-sm text-gray-500">No lists yet — create one below</div>
          )}
          {lists.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div>
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-gray-500">{l.items.length} tasks</div>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleAddToList(l.id)}>
                Add
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-3">
          <label className="text-sm font-medium">Create new list</label>
          <div className="flex gap-2 mt-2">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="flex-1 rounded border p-2 bg-white dark:bg-gray-900" placeholder="New list title" />
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={handleCreate}>Create & Add</button>
          </div>
        </div>

        <div className="mt-3 text-right">
          <button className="text-sm text-gray-500" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TodoModal;
