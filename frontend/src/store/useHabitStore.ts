import { create } from 'zustand';
import { api } from '../api/client';
import { subDays, format } from 'date-fns';
import type { Habit, HabitCreate, HabitLog } from '../types';

// ==========================================
// INTERFACES E TIPAGENS
// ==========================================

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  isLoading: boolean;
  fetchHabitsAndLogs: (date: string) => Promise<void>;
  addHabit: (habitData: HabitCreate) => Promise<void>;
  toggleHabit: (habitId: number, date: string) => Promise<void>;
}

// ==========================================
// CONFIGURAÇÃO DO STORE (ZUSTAND)
// ==========================================

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  isLoading: false,

  fetchHabitsAndLogs: async (date: string) => {
    set({ isLoading: true });
    try {

      const endDateObj = new Date(`${date}T12:00:00`);
      const startDateObj = subDays(endDateObj, 6);
      const startDateStr = format(startDateObj, 'yyyy-MM-dd');
      
      const [habitsResponse, logsResponse] = await Promise.all([
        api.get<Habit[]>('/habits'),
        api.get<HabitLog[]>(`/habits/logs?start_date=${startDateStr}&end_date=${date}`)
      ]);

      set({
        habits: habitsResponse.data,
        logs: logsResponse.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
      set({ isLoading: false });
    }
  },

  // ==========================================
  // CRIAÇÃO DE DADOS (CREATE)
  // ==========================================

  addHabit: async (habitData) => {
    try {
      const response = await api.post<Habit>('/habits', habitData);
      set((state) => ({ habits: [...state.habits, response.data] }));
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
    }
  },

  // ==========================================
  // ATUALIZAÇÃO (UPDATE)
  // ==========================================

  toggleHabit: async (habitId, date) => {
    const previousLogs = get().logs;

    const existingLogIndex = previousLogs.findIndex(
      (log) => log.habit_id === habitId && log.target_date === date
    );

    let newLogs = [...previousLogs];

    if (existingLogIndex >= 0) {
      newLogs[existingLogIndex] = {
        ...newLogs[existingLogIndex],
        is_completed: !newLogs[existingLogIndex].is_completed
      };
    } else {
      newLogs.push({
        id: Date.now(),
        habit_id: habitId,
        target_date: date,
        is_completed: true
      });
    }

    set({ logs: newLogs });

    try {
      const response = await api.post<HabitLog>(`/habits/${habitId}/toggle?target_date=${date}`);
      set((state) => ({
        logs: state.logs.map((log) =>
          log.habit_id === habitId && log.target_date === date ? response.data : log
        )
      }));
    } catch (error) {
      console.error('Erro ao alternar hábito:', error);
      set({ logs: previousLogs });
    }
  }
}));