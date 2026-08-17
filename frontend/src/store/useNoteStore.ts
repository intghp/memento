import { create } from 'zustand';
import { api } from '../api/client';
import type { Note } from '../types';

interface NoteState {
  activeNote: Note | null;
  fetchOrCreateNote: () => Promise<void>;
  updateNote: (id: number, content: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  activeNote: null,

  fetchOrCreateNote: async () => {
    try {
      const response = await api.get<Note[]>('/notes');
    
      if (response.data.length > 0) {
        set({ activeNote: response.data[0] });
      } else {
    
        const newNoteResponse = await api.post<Note>('/notes', {
          title: 'Anotações Rápidas',
          content: '# Bem-vindo ao Memento\n\nUse este espaço para suas ideias...'
        });
        set({ activeNote: newNoteResponse.data });
      }
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
    }
  },

  updateNote: async (id, content) => {
    try {

      set((state) => ({
        activeNote: state.activeNote ? { ...state.activeNote, content } : null
      }));

      await api.put(`/notes/${id}`, { content });
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  }
}));