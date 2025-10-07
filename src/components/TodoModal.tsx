import React, { useState, useEffect } from "react";
import { getPlanTasks, addTaskToPlan, PlanTask } from "@/lib/todoService";

interface Props {
  open: boolean;
  suggestion: string;
  onClose: () => void;
  onAdded?: (taskText: string) => void;
  relatedCrops?: string[]; // Array of crop names that match the suggestion
  showAllCrops?: boolean; // If true, show all crops instead of filtering
}

// Static hardcoded crop plans (same as in CropPlannerScreen)
const staticCropPlans = [
  {
    id: 1001,
    crop: "Tomato",
    area: "0.5 acres",
    variety: "Cherry Tomato",
    expectedYieldPerAcre: 8000,
    currentMarketPrice: 28,
    sowingDate: "2025-03-15",
    lastWatered: "2025-10-05",
    fertilizedDate: "2025-09-20",
    expenses: 12000,
  },
  {
    id: 1002,
    crop: "Chilli",
    area: "0.25 acres",
    variety: "Green Chilli",
    expectedYieldPerAcre: 3500,
    currentMarketPrice: 80,
    sowingDate: "2025-04-01",
    lastWatered: "2025-10-06",
    fertilizedDate: "2025-09-25",
    expenses: 8000,
  },
  {
    id: 1003,
    crop: "Onion",
    area: "0.4 acres",
    variety: "Red Onion",
    expectedYieldPerAcre: 6500,
    currentMarketPrice: 20,
    sowingDate: "2025-02-10",
    lastWatered: "2025-10-04",
    fertilizedDate: "2025-08-30",
    expenses: 15000,
  },
  {
    id: 1004,
    crop: "Carrot",
    area: "0.3 acres",
    variety: "Orange Carrot",
    expectedYieldPerAcre: 8500,
    currentMarketPrice: 35,
    sowingDate: "2025-01-20",
    lastWatered: "2025-10-07",
    fertilizedDate: "2025-09-10",
    expenses: 10000,
  },
  {
    id: 1005,
    crop: "Cauliflower",
    area: "0.2 acres",
    variety: "White Cauliflower",
    expectedYieldPerAcre: 12000,
    currentMarketPrice: 25,
    sowingDate: "2025-02-28",
    lastWatered: "2025-10-06",
    fertilizedDate: "2025-09-15",
    expenses: 9000,
  },
];

const TodoModal: React.FC<Props> = ({ open, suggestion, onClose, onAdded, relatedCrops = [], showAllCrops = false }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem("cropPlans");
        const userPlans = raw ? JSON.parse(raw) : [];
        
        // Filter out user plans with IDs that conflict with static plans (ID >= 1000)
        const validUserPlans = userPlans.filter((plan: any) => plan.id < 1000);
        
        // Combine static plans with user plans
        const allPlans = [...staticCropPlans, ...validUserPlans];
        setPlans(allPlans || []);
        
        // Show all crops if showAllCrops is true, otherwise filter by related crops
        if (showAllCrops || relatedCrops.length === 0) {
          setFilteredPlans(allPlans || []);
        } else {
          const filtered = allPlans.filter((plan: any) => 
            relatedCrops.some(crop => 
              plan.crop?.toLowerCase().includes(crop.toLowerCase()) ||
              crop.toLowerCase().includes(plan.crop?.toLowerCase())
            )
          );
          setFilteredPlans(filtered);
        }
      } catch (e) {
        // On error, fallback to static plans only
        setPlans(staticCropPlans);
        setFilteredPlans(staticCropPlans);
      }
    }
  }, [open, relatedCrops, showAllCrops]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 z-50 shadow-xl max-h-[85vh] overflow-y-auto relative">
        <h3 className="text-lg font-semibold mb-2">Add to Crop Plan</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{suggestion}</p>

        {relatedCrops.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Affected Crops:</h4>
            <div className="flex flex-wrap gap-2">
              {relatedCrops.map((crop, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs capitalize">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filteredPlans.length === 0 && plans.length > 0 && !showAllCrops && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              No matching crop plans found for this suggestion.
            </div>
          )}
          {filteredPlans.length === 0 && plans.length === 0 && (
            <div className="text-sm text-gray-500">No crop plans yet — create one quickly</div>
          )}
          {showAllCrops && filteredPlans.length > 0 && (
            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mb-3">
              Select a crop plan to add this task:
            </div>
          )}
          {filteredPlans.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">
                  {p.crop}
                  {p.variety && <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({p.variety})</span>}
                  {p.id >= 1000 && <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">Default</span>}
                </div>
                <div className="text-xs text-gray-500">{p.area || "Area not specified"}</div>
              </div>
              <button 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" 
                onClick={() => handleAddToPlan(p.id)}
              >
                Add Task
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Create New Plan</label>
          <div className="mt-2">
            <button 
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" 
              onClick={handleCreateQuickPlanAndAdd}
            >
              Create Plan & Add Task
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button 
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoModal;
