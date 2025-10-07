import React, { useState, useEffect } from "react";
import { getPlanTasks, addTaskToPlan, PlanTask } from "@/lib/todoService";

interface Props {
  open: boolean;
  suggestion: string;
  onClose: () => void;
  onAdded?: (taskText: string) => void;
}

const TodoModal: React.FC<Props> = ({ open, suggestion, onClose, onAdded }) => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem("cropPlans");
        const p = raw ? JSON.parse(raw) : [];
        setPlans(p || []);
      } catch (e) {
        setPlans([]);
      }
    }
  }, [open]);

  if (!open) return null;

  const handleAddToPlan = (planId: number | string) => {
    const task = addTaskToPlan(planId, suggestion);
    onAdded?.(task.text);
    onClose();
  };

  const handleCreateQuickPlanAndAdd = () => {
    // create a minimal plan entry and save to cropPlans
    const newPlan = {
      id: Date.now(),
      crop: suggestion.split(" ")[1] || "My Plan",
      area: "0.1 acres",
    };
    const raw = localStorage.getItem("cropPlans");
    const p = raw ? JSON.parse(raw) : [];
    p.unshift(newPlan);
    localStorage.setItem("cropPlans", JSON.stringify(p));
    setPlans(p);

    const task = addTaskToPlan(newPlan.id, suggestion);
    onAdded?.(task.text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-t-xl w-full max-w-md p-4 z-50 shadow-xl">
        <h3 className="text-lg font-semibold">Add suggestion to a Crop Plan</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{suggestion}</p>

        <div className="mt-3 space-y-2">
          {plans.length === 0 && (
            <div className="text-sm text-gray-500">No crop plans yet — create one quickly</div>
          )}
          {plans.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div>
                <div className="font-medium">{p.crop}</div>
                <div className="text-xs text-gray-500">{p.area || "-"}</div>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleAddToPlan(p.id)}>
                Add
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-3">
          <label className="text-sm font-medium">Create quick plan</label>
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={handleCreateQuickPlanAndAdd}>Create Plan & Add</button>
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
