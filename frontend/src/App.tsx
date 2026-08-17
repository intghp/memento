import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { useDateStore } from './store/useDateStore';
import { useTaskStore } from './store/useTaskStore';
import { useNoteStore } from './store/useNoteStore';
import { MiniCalendar } from './components/calendar/MiniCalendar';
import { DailyNoteEditor } from './components/notes/DailyNoteEditor';
import { TaskList } from './components/tasks/TaskList';

export default function App() {
  const { selectedDate } = useDateStore();
  const { fetchTasks } = useTaskStore();
  const { fetchDailyNote } = useNoteStore();

  useEffect(() => {
    fetchTasks(selectedDate);
    fetchDailyNote(selectedDate);
  }, [selectedDate, fetchTasks, fetchDailyNote]);

  return (
    <MainLayout
      sidebar={
        <div className="space-y-6">
          <MiniCalendar />
          
          <div className="border-t border-zinc-800/50 pt-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Hábitos de Hoje
            </h3>
            <p className="text-zinc-600 text-sm">O Tracker de hábitos entrará aqui.</p>
          </div>
        </div>
      }
      
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