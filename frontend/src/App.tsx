import { useEffect, useState } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { Plus, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from './utils/cn';

export default function App() {
  const { tasks, isLoading, fetchTasks, addTask, toggleTask } = useTaskStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await addTask({ title: newTaskTitle });
    setNewTaskTitle('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Cabeçalho */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Memento</h1>
          <p className="text-zinc-400 mt-1">O seu espaço de foco local.</p>
        </header>

        {/* Formulário de Criação de Tarefa */}
        <form onSubmit={handleAddTask} className="relative">
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            disabled={isLoading}
          />
        </form>

        {/* Lista de Tarefas */}
        <div className="space-y-2">
          {isLoading && tasks.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">Carregando tarefas...</p>
          ) : tasks.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">Nenhuma tarefa por aqui. Aproveite o seu dia!</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors group"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className="text-zinc-500 hover:text-emerald-400 transition-colors"
                >
                  {task.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <span className={cn(
                  "flex-1 text-zinc-200 transition-all",
                  task.is_completed && "text-zinc-500 line-through"
                )}>
                  {task.title}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}