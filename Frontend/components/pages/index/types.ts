export type TaskFilter = 'all' | 'completed' | 'active';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TodoTask {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  createdBy: string;
  priority: TaskPriority;
}

export interface TaskTab {
  key: TaskFilter;
  label: string;
  count?: number;
}
