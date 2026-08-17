import { create } from 'zustand';
import { api } from '../api/client';
import type { Note, NoteUpdate } from '../types';

interface NoteState {
  activeNote: Note | null;
  isLoading: boolean;
  fetchDailyNote: (date: string) => Promise<void>; // <-- Busca a nota do dia específico
  updateNote: (id: number, updateData: NoteUpdate) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  activeNote: null,
  isLoading: false,

  fetchDailyNote: async (date: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<Note>(`/notes/daily?target_date=${date}`);
      set({ activeNote: response.data, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar a nota diária:', error);
      set({ isLoading: false });
    }
  },

  updateNote: async (id, updateData) => {
    try {
      set((state) => ({
        activeNote: state.activeNote 
          ? { ...state.activeNote, ...updateData } 
          : null
      }));
      await api.put(`/notes/${id}`, updateData);
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  }
}));