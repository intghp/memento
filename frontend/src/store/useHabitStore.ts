import { create } from 'zustand';
import { api } from '../api/client';
import type { Habit, HabitCreate, HabitLog } from '../types';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  isLoading: boolean;
  fetchHabitsAndLogs: (date: string) => Promise<void>;
  addHabit: (habitData: HabitCreate) => Promise<void>;
  toggleHabit: (habitId: number, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  isLoading: false,

  fetchHabitsAndLogs: async (date: string) => {
    set({ isLoading: true });
    try {
      const [habitsResponse, logsResponse] = await Promise.all([
        api.get<Habit[]>('/habits'),
        api.get<HabitLog[]>(`/habits/logs?target_date=${date}`)
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

  addHabit: async (habitData) => {
    try {
      const response = await api.post<Habit>('/habits', habitData);
      set((state) => ({ habits: [...state.habits, response.data] }));
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
    }
  },

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
          log.habit_id === habitId ? response.data : log
        )
      }));
    } catch (error) {
      console.error('Erro ao alternar hábito:', error);
      set({ logs: previousLogs });
    }
  }
}));