import { create } from 'zustand';
import { api } from '../api/client';
import { subDays, format } from 'date-fns';
import type { Habit, HabitCreate, HabitUpdate, HabitLog } from '../types';

// ==========================================
// INTERFACES E TIPAGENS
// ==========================================

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  isLoading: boolean;
  fetchHabitsAndLogs: (date: string) => Promise<void>;
  addHabit: (habitData: HabitCreate) => Promise<void>;
  toggleHabit: (habitId: number, date: string, amount?: number, skip?: boolean) => Promise<void>;
  updateHabit: (habitID: number, habitData: HabitUpdate) => Promise<void>;
  deleteHabit: (habitID: number) => Promise<void>;
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

  updateHabit: async (habitId, habitData) => {
    try {
      const response = await api.patch<Habit>(`/habits/${habitId}`, habitData);
      set((state) => ({
        habits: state.habits.map((habit) => 
          habit.id === habitId ? response.data : habit
        )
      }));
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
    }
  },

  // ==========================================
  // DELETAR (DELETE)
  // ==========================================

  deleteHabit: async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      // Remove o hábito apagado da tela instantaneamente
      set((state) => ({
        habits: state.habits.filter((habit) => habit.id !== habitId)
      }));
    } catch (error) {
      console.error('Erro ao deletar hábito:', error);
    }
  },

  // ==========================================
  // Marcar (TOGGLE)
  // ==========================================

  toggleHabit: async (habitId, date, amount, skip = false) => {
    const previousLogs = get().logs;
    const habit = get().habits.find(h => h.id === habitId);

    const existingLogIndex = previousLogs.findIndex(
      (log) => log.habit_id === habitId && log.target_date === date
    );

    let newLogs = [...previousLogs];
    let isCompletedOptimistic = false;
    let isSkippedOptimistic = false;
    let amountOptimistic = amount;

    if (existingLogIndex >= 0) {
      const currentLog = newLogs[existingLogIndex];
      
      if (skip) {
        isSkippedOptimistic = !currentLog.is_skipped;
        isCompletedOptimistic = false;
        amountOptimistic = undefined;
      } else {
        isSkippedOptimistic = false;
        if (amount === undefined) {
          isCompletedOptimistic = !currentLog.is_completed;
        } else if (habit?.is_quantitative) {
          isCompletedOptimistic = amount >= (habit.goal_amount || 0);
        }
      }
       
      newLogs[existingLogIndex] = {
        ...currentLog,
        is_completed: isCompletedOptimistic,
        is_skipped: isSkippedOptimistic,
        amount_completed: amountOptimistic !== undefined ? amountOptimistic : (isCompletedOptimistic ? currentLog.amount_completed : undefined)
      };
    } else {
      if (skip) {
        isSkippedOptimistic = true;
      } else {
        isCompletedOptimistic = true;
        if (habit?.is_quantitative && amount !== undefined) {
            isCompletedOptimistic = amount >= (habit.goal_amount || 0);
        }
      }
      
      newLogs.push({
        id: Date.now(),
        habit_id: habitId,
        target_date: date,
        is_completed: isCompletedOptimistic,
        is_skipped: isSkippedOptimistic,
        amount_completed: amountOptimistic
      });
    } 

    set({ logs: newLogs });

    try {
      // Monta a URL com ou sem o amount
      const queryParams = new URLSearchParams({ target_date: date });
      if (amount !== undefined) queryParams.append('amount', amount.toString());
      if (skip) queryParams.append('skip', 'true');
      
      const response = await api.post<HabitLog>(`/habits/${habitId}/toggle?${queryParams.toString()}`);
      
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