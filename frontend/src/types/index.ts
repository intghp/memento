export interface Task {
  id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface TaskCreate {
    title: string;
    description?: string | null;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    updated_at: string;
}