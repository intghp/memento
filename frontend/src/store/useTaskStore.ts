import { create } from 'zustand';
import { api } from '../api/client';
import type { Task, TaskCreate } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: TaskCreate) => Promise<void>;
  // Nova ação adicionada aqui:
  toggleTask: (taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Task[]>('/tasks');
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

  // Nova função de Toggle com "Optimistic Update" (Atualização Otimista)
  toggleTask: async (taskId) => {
    // 1. Guarda o estado anterior caso dê erro na API (para poder reverter)
    const previousTasks = get().tasks;
    
    // 2. Atualiza a UI imediatamente (sem esperar o backend) para a sensação de 60fps
    set({
      tasks: previousTasks.map((task) =>
        task.id === taskId ? { ...task, is_completed: !task.is_completed } : task
      ),
    });

    // 3. Tenta atualizar no backend
    try {
      await api.patch(`/tasks/${taskId}/toggle`);
    } catch (error) {
      console.error('Erro ao alternar tarefa:', error);
      // Se falhar, reverte a interface para o estado original
      set({ tasks: previousTasks });
    }
  },
}));