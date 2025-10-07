import React, { useState, useEffect } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TodoDay {
  day: number;
  tasks: string[];
}

interface CropTodoData {
  crop: string;
  area: string;
  todoList: TodoDay[];
  createdAt: string;
  currentDay?: number;
}

interface CropTodoListProps {
  language?: string;
}

const CropTodoList: React.FC<CropTodoListProps> = ({ language = "en" }) => {
  const [todoData, setTodoData] = useState<CropTodoData | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [currentDay, setCurrentDay] = useState(1);

  const getTranslatedText = (englishText: string) => {
    if (language !== "ml") return englishText;
    const translations: { [key: string]: string } = {
      "Daily Crop Todo": "ദൈനംദിന കൃഷി കടമകൾ",
      "No crop plan found": "കൃഷി പദ്ധതി കാണുന്നില്ല",
      "Complete a crop plan to see your todo list":
        "നിങ്ങളുടെ കടമ പട്ടിക കാണാൻ ഒരു കൃഷി പദ്ധതി പൂർത്തിയാക്കുക",
    };
    return translations[englishText] || englishText;
  };

  // Calculate which day to show based on creation date
  const calculateCurrentDay = (createdAt: string): number => {
    const now = new Date();
    const created = new Date(createdAt);

    // Reset time to start of day for accurate day calculation
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const createdDate = new Date(
      created.getFullYear(),
      created.getMonth(),
      created.getDate()
    );

    const diffTime = nowDate.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Return day 1, 2, or 3 (cycle back to 1 after day 3)
    return Math.max(1, Math.min(3, diffDays + 1));
  };

  useEffect(() => {
    const loadTodoData = () => {
      const savedData = localStorage.getItem("cropTodoList");
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setTodoData(data);

          // Calculate and set the current day based on creation date
          const calculatedDay = calculateCurrentDay(data.createdAt);
          setCurrentDay(calculatedDay);

          // Load completed tasks
          const savedCompleted = localStorage.getItem("completedTasks");
          if (savedCompleted) {
            setCompletedTasks(new Set(JSON.parse(savedCompleted)));
          }
        } catch (error) {
          console.error("Error loading todo data:", error);
        }
      }
    };

    loadTodoData();
  }, []);

  const toggleTask = (taskKey: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskKey)) {
      newCompleted.delete(taskKey);
    } else {
      newCompleted.add(taskKey);
    }
    setCompletedTasks(newCompleted);
    localStorage.setItem(
      "completedTasks",
      JSON.stringify(Array.from(newCompleted))
    );
  };

  if (!todoData) {
    return null;
  }

  const currentDayTasks = todoData.todoList.find(
    (day) => day.day === currentDay
  );

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">
          {getTranslatedText("Daily Crop Todo")}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {todoData.crop} • {todoData.area} acres
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Tasks for Current Day */}
        {currentDayTasks && (
          <div className="space-y-2">
            {currentDayTasks.tasks.map((task, taskIndex) => {
              const taskKey = `${currentDay}-${taskIndex}`;
              const isCompleted = completedTasks.has(taskKey);

              return (
                <div
                  key={taskIndex}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isCompleted
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : "bg-muted/50 border-border hover:bg-muted"
                  }`}
                  onClick={() => toggleTask(taskKey)}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      isCompleted
                        ? "text-green-800 line-through dark:text-green-200"
                        : "text-foreground"
                    }`}
                  >
                    {task}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropTodoList;
