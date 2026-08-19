import { useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useDateStore } from '../../store/useDateStore';
import { Plus, Circle, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function TaskList() {
  const { tasks, isLoading, addTask, toggleTask, deleteTask } = useTaskStore();
  const { selectedDate } = useDateStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Passa a data selecionada para que a tarefa nasça no dia correto
    await addTask({ title: newTaskTitle, target_date: selectedDate });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTask} className="relative">
        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="O que precisa ser feito neste dia?"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-500 outline-none focus:outline-none focus:border-emerald-500 focus:ring-0 transition-colors duration-200"
          disabled={isLoading}
        />
      </form>

      <div className={cn(
        "space-y-2 transition-all duration-300",
        isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
      )}>
        {tasks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-zinc-800/50 rounded-xl mt-4">
            <p className="text-zinc-600 text-sm">Nenhuma tarefa para este dia.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
              <button onClick={() => toggleTask(task.id)} className="text-zinc-500 hover:text-emerald-400 transition-colors">
                {task.is_completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
              </button>
              <span className={cn("flex-1 text-zinc-200 transition-all", task.is_completed && "text-zinc-500 line-through")}>
                {task.title}
              </span>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}