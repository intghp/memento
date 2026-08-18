import { useState } from 'react';
import { Plus, CheckSquare, Square } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { useDateStore } from '../../store/useDateStore';
import { cn } from '../../utils/cn';
import { parseISO } from 'date-fns';

export function HabitList() {
  const { habits, logs, isLoading, addHabit, toggleHabit } = useHabitStore();
  const { selectedDate } = useDateStore();
  const [newHabitName, setNewHabitName] = useState('');

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    // Cria um hábito diário padrão
    await addHabit({ 
      name: newHabitName,
      frequency: 'daily'
    });
    setNewHabitName('');
  };

  const currentDayOfWeek = parseISO(selectedDate).getDay().toString(); // 0 = Domingo, 6 = Sábado
  
  const activeHabits = habits.filter(habit => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'specific_days' && habit.specific_days?.includes(currentDayOfWeek)) return true;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Formulário de Criação de Hábito */}
      <form onSubmit={handleAddHabit} className="relative mb-4">
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="Novo hábito (ex: Ler 10 pág)"
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
          disabled={isLoading}
        />
      </form>

      {/* Lista de Hábitos do Dia */}
      <div className="space-y-1 overflow-y-auto custom-scrollbar pr-1">
        {isLoading && habits.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-2">Carregando...</p>
        ) : activeHabits.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-2">Nenhum hábito rastreado.</p>
        ) : (
          activeHabits.map((habit) => {
            const log = logs.find(l => l.habit_id === habit.id);
            const isCompleted = log ? log.is_completed : false;

            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id, selectedDate)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/50 transition-colors group text-left"
              >
                <div className={cn(
                  "text-zinc-500 transition-colors",
                  isCompleted ? "text-emerald-500" : "group-hover:text-zinc-400"
                )}>
                  {isCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </div>
                
                <span className={cn(
                  "text-sm transition-all",
                  isCompleted ? "text-zinc-500 line-through" : "text-zinc-300"
                )}>
                  {habit.name}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}