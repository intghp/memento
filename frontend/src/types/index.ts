// ==========================================
// TASKS
// ==========================================
export interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  target_date: string; // Formato YYYY-MM-DD
  start_time?: string; // Formato HH:MM:SS
  end_time?: string;   // Formato HH:MM:SS
  created_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  target_date: string;
  start_time?: string;
  end_time?: string;
}

// ==========================================
// DAILY NOTES
// ==========================================
export interface Note {
  id: number;
  title: string;
  content: string;
  target_date: string;
  updated_at: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
}

// ==========================================
// HABITS
// ==========================================
export interface Habit {
  id: number;
  name: string;
  scheduled_time?: string;
  frequency: string;
  specific_days?: string;
  created_at: string;
}

export interface HabitCreate {
  name: string;
  scheduled_time?: string;
  frequency?: string;
  specific_days?: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  target_date: string;
  is_completed: boolean;
}