import { useState } from 'react';
import { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useDateStore } from './store/useDateStore';
import { useTaskStore } from './store/useTaskStore';
import { useNoteStore } from './store/useNoteStore';
import { useHabitStore } from './store/useHabitStore';
import { TaskList } from './components/tasks/TaskList';
import { HabitList } from './components/habits/HabitList';
import { SettingsModal } from './components/SettingsModal';
import { MainLayout } from './components/layout/MainLayout';
import { MiniCalendar } from './components/calendar/MiniCalendar';
import { DailyNoteEditor } from './components/notes/DailyNoteEditor';

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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    <>
      <MainLayout

        // ==========================================
        // BARRA LATERAL ESQUERDA: MINI-CALENDAR + LISTA DE TAREFAS + CONFIGURAÇÕES
        // ==========================================

        sidebar={
          <div className="flex flex-col h-full">
            {/* Área Superior (Calendário e Tarefas) que rola se precisar */}
            <div className="space-y-6 flex flex-col flex-1 overflow-hidden">
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

            {/* Rodapé Fixo da Barra Lateral (Configurações) */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50 shrink-0">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:bg-zinc-900/30 dark:hover:bg-zinc-800/80 rounded-xl transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </button>
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
              <p className="text-zinc-400 mt-1 font-medium">{selectedDate}</p>
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}