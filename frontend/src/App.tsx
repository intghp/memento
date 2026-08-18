import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { useDateStore } from './store/useDateStore';
import { useTaskStore } from './store/useTaskStore';
import { useNoteStore } from './store/useNoteStore';
import { useHabitStore } from './store/useHabitStore';
import { MiniCalendar } from './components/calendar/MiniCalendar';
import { DailyNoteEditor } from './components/notes/DailyNoteEditor';
import { TaskList } from './components/tasks/TaskList';
import { HabitList } from './components/habits/HabitList';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function App() {

  // ==========================================
  // ESTADO GLOBAL (ZUSTAND STORES)
  // ==========================================

  const { selectedDate } = useDateStore();
  const { fetchTasks } = useTaskStore();
  const { fetchDailyNote } = useNoteStore();
  const { fetchHabitsAndLogs } = useHabitStore();

  // Atualiza TUDO quando você troca de dia no calendário!
  useEffect(() => {
    fetchTasks(selectedDate); // <-- Busca as Tasks do dia!
    fetchDailyNote(selectedDate); // <-- Busca as Daily Notes do dia!
    fetchHabitsAndLogs(selectedDate); // <-- Busca os hábitos e check-ins do dia!
  }, [selectedDate, fetchTasks, fetchDailyNote, fetchHabitsAndLogs]);

  // ==========================================
  // RENDERIZAÇÃO (LAYOUT & UI)
  // ==========================================

  return (
    <MainLayout

      // ==========================================
      // BARRA LATERAL ESQUERDA: MINI-CALENDAR + LISTA DE TAREFAS
      // ==========================================

      sidebar={
        <div className="space-y-6 flex flex-col h-full">
          <MiniCalendar />
          
          <div className="border-t border-zinc-800/50 pt-6 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 shrink-0">
              Tarefas Pontuais
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <TaskList />
            </div>
          </div>
        </div>
      }
      
      // ==========================================
      // PAINEL CENTRAL: LISTA DE HÁBITOS E GRADE DE 7 DIAS
      // ==========================================

      main={
        <div className="space-y-6 flex flex-col h-full">
          <header className="shrink-0">
            <h1 className="text-3xl font-bold tracking-tight">Memento</h1>
            <p className="text-emerald-400 mt-1 font-medium">{selectedDate}</p>
          </header>
          
          <div className="flex-1 overflow-hidden">
            <HabitList />
          </div>
        </div>
      }

      // ==========================================
      // BARRA LATERAL DIREITA: EDITOR DE NOTAS DO DIA
      // ==========================================
      
      rightPanel={
        <div className="h-full py-2">
          <DailyNoteEditor />
        </div>
      }
    />
  );
}