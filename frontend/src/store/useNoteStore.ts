import { create } from 'zustand';
import { api } from '../api/client';
import type { Note } from '../types';

interface NoteState {
  activeNote: Note | null;
  isLoading: boolean;
  fetchDailyNote: (date: string) => Promise<void>;
  createNote: (noteData: { title: string; target_date: string; content: string }) => Promise<void>;
  updateNote: (id: number, data: { content: string }) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  activeNote: null,
  isLoading: false,

  fetchDailyNote: async (date) => {
    set({ isLoading: true });
    try {
      const response = await api.get<Note | null>(`/notes/daily?target_date=${date}`);
      set({ activeNote: response.data });
    } catch (error) {
      console.error('Erro ao buscar nota:', error);
      set({ activeNote: null });
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (noteData) => {
    try {
      const response = await api.post<Note>('/notes', noteData);
      set({ activeNote: response.data });
    } catch (error) {
      console.error('Erro ao criar nota:', error);
    }
  },

  updateNote: async (id, data) => {
    try {
      const response = await api.put<Note>(`/notes/${id}`, data);
      set({ activeNote: response.data });
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  }
}));