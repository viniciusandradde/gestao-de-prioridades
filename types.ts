
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export enum QuadrantType {
  DO = 'DO',
  SCHEDULE = 'SCHEDULE',
  DELEGATE = 'DELEGATE',
  ELIMINATE = 'ELIMINATE',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  text: string;
  quadrant: QuadrantType;
  status: TaskStatus;
  createdAt: number;
  dueDate?: string;
  subtasks?: Subtask[];
}

export interface Subject {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: number;
}