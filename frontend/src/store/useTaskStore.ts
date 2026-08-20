import { create } from 'zustand';
import { api } from '../api/client';
import type { Task, TaskCreate } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (date: string) => Promise<void>;
  addTask: (taskData: TaskCreate) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>;
  clearCompletedTasks: (date: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (date: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<Task[]>(`/tasks?target_date=${date}`);
      const sortedTasks = response.data.sort((a, b) => a.position - b.position);
      set({ tasks: sortedTasks, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      set({ isLoading: false });
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
      tasks: previousTasks.map((t) =>
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      ),
    });
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch (error) {
      set({ tasks: previousTasks });
      console.error('Erro ao alternar tarefa:', error);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  },

  reorderTasks: async (newOrder) => {
    set({ tasks: newOrder });
    try {
      const reorders = newOrder.map((task, index) => ({
        task_id: task.id,
        position: index,
      }));
      await api.put('/tasks/reorder', reorders);
    } catch (error) {
      console.error('Erro ao reordenar tarefas:', error);
    }
  },

  clearCompletedTasks: async (date: string) => {
    try {
      await api.delete(`/tasks/completed?target_date=${date}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => !t.is_completed),
      }));
    } catch (error) {
      console.error('Erro ao limpar tarefas concluídas:', error);
    }
  }
}));