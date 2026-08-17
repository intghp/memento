import { create } from 'zustand';

// Função utilitária para pegar o dia de hoje no formato YYYY-MM-DD (considerando o fuso local)
export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DateState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: getTodayString(), // Inicia sempre no dia de hoje
  setSelectedDate: (date) => set({ selectedDate: date }),
}));