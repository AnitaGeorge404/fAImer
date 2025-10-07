export interface TodoItem {
  id: string;
  text: string;
  createdAt: string;
  completed?: boolean;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoItem[];
  createdAt: string;
}

const LIST_KEY = "todoLists";
const RECENT_KEY = "recentTasks";

const uid = () => Math.random().toString(36).slice(2, 9);

export const getLists = (): TodoList[] => {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLists = (lists: TodoList[]) => {
  localStorage.setItem(LIST_KEY, JSON.stringify(lists));
};

export const createList = (title: string): TodoList => {
  const lists = getLists();
  const newList: TodoList = {
    id: uid(),
    title: title || "Untitled",
    items: [],
    createdAt: new Date().toISOString(),
  };
  lists.unshift(newList);
  saveLists(lists);
  return newList;
};

export const addTask = (listId: string, text: string) => {
  const lists = getLists();
  const list = lists.find((l) => l.id === listId);
  const task: TodoItem = {
    id: uid(),
    text,
    createdAt: new Date().toISOString(),
    completed: false,
  };
  if (list) {
    list.items.unshift(task);
    saveLists(lists);
  }

  // Save recent
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const recent = raw ? JSON.parse(raw) : [];
    recent.unshift({ text, listId, createdAt: task.createdAt });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
  } catch (e) {
    // ignore
  }

  return task;
};

export const getRecent = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// --- Plan-scoped todo helpers ---
// We keep an additional storage key mapping user-added tasks to crop plan ids.
const PLAN_TODO_KEY = "planUserTodos";

export interface PlanTask {
  id: string;
  planId: number | string;
  text: string;
  createdAt: string;
  completed?: boolean;
}

export const getPlanTasks = (planId: number | string): PlanTask[] => {
  try {
    const raw = localStorage.getItem(PLAN_TODO_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[planId] || [];
  } catch (e) {
    return [];
  }
};

export const addTaskToPlan = (planId: number | string, text: string) => {
  const task: PlanTask = {
    id: uid(),
    planId,
    text,
    createdAt: new Date().toISOString(),
    completed: false,
  };

  try {
    const raw = localStorage.getItem(PLAN_TODO_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[planId] = map[planId] || [];
    map[planId].unshift(task);
    localStorage.setItem(PLAN_TODO_KEY, JSON.stringify(map));

    // Also save a recent reference for Notifications (plan-scoped)
    const recentRaw = localStorage.getItem(RECENT_KEY);
    const recent = recentRaw ? JSON.parse(recentRaw) : [];
    recent.unshift({ text, planId, createdAt: task.createdAt });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 6)));
  } catch (e) {
    // ignore
  }

  return task;
};
