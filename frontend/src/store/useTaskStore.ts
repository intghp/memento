import { create } from 'zustand';
import { api } from '../api/client';
import type { Task, TaskCreate } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (date: string) => Promise<void>;
  addTask: (taskData: TaskCreate) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Task[]>(`/tasks?target_date=${date}`);
      set({ tasks: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Erro ao carregar as tarefas', isLoading: false });
      console.error(error);
    }
  },

  addTask: async (taskData) => {
    try {
      const response = await api.post<Task>('/tasks', taskData);
      set((state) => ({ tasks: [...state.tasks, response.data] }));
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  },

  toggleTask: async (taskId) => {
    const previousTasks = get().tasks;
    
    set({
      tasks: previousTasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
      ),
    });
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch (error) {
      console.error('Erro ao alternar tarefa:', error);
      set({ tasks: previousTasks });
    }
  },

  deleteTask: async (taskId) => {
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.filter((task) => task.id !== taskId),
    });

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      // Se falhar, reverte a interface para o estado original
      set({ tasks: previousTasks });
    }
  }
}));