// ==========================================
// TIPOS COMPARTILHADOS
// ==========================================
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'any';
export type FrequencyType = 'daily' | 'specific_days';

// ==========================================
// 1. TASKS (TAREFAS PONTUAIS)
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
// 2. DAILY NOTES (NOTAS DIÁRIAS - MARKDOWN)
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
// 3. HABIT TRACKING (SISTEMA DE HÁBITOS)
// ==========================================
export interface Habit {
  id: number;
  name: string;
  scheduled_time?: string;
  frequency: FrequencyType;
  specific_days?: string;
  shift: ShiftType
  created_at: string;
}

export interface HabitCreate {
  name: string;
  scheduled_time?: string;
  frequency: FrequencyType;
  specific_days?: string;
  shift: ShiftType;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  target_date: string;
  is_completed: boolean;
}