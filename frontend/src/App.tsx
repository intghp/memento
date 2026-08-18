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

export default function App() {
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

  return (
    <MainLayout
      sidebar={
        // Sidebar com MiniCalendar e lista de hábitos do dia
        <div className="space-y-6 flex flex-col h-full">
          <MiniCalendar />
          
          <div className="border-t border-zinc-800/50 pt-6 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 shrink-0">
              Hábitos de Hoje
            </h3>
            
            <HabitList />
          </div>
        </div>
      }
      
      // Main content com lista de tarefas do dia e editor de notas diárias
      main={
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Memento</h1>
            <p className="text-emerald-400 mt-1 font-medium">{selectedDate}</p>
          </header>
          
          <TaskList />
        </div>
      }
      
      rightPanel={
        <div className="h-full py-2">
          <DailyNoteEditor />
        </div>
      }
    />
  );
}