import { useState } from 'react';
import { Plus, Check, X, Sunrise, Sun, Moon, Maximize, Settings, Trash2, Pencil } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { useDateStore } from '../../store/useDateStore';
import { cn } from '../../utils/cn';
import { subDays, format } from 'date-fns';
import type { Habit } from '../../types';

// ==========================================
// CONSTANTES & CONFIGURAÇÕES (ESTÁTICOS)
// ==========================================

const WEEK_DAYS = [
  { id: '0', label: 'D' },
  { id: '1', label: 'S' },
  { id: '2', label: 'T' },
  { id: '3', label: 'Q' },
  { id: '4', label: 'Q' },
  { id: '5', label: 'S' },
  { id: '6', label: 'S' },
];

const SHORT_DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ==========================================
// CONFIGURAÇÃO DOS TURNOS
// ==========================================
const SHIFTS = [
  { id: 'morning', label: 'Manhã', icon: Sunrise, color: 'text-amber-400', bgHover: 'hover:bg-amber-400/10' },
  { id: 'afternoon', label: 'Tarde', icon: Sun, color: 'text-orange-400', bgHover: 'hover:bg-orange-400/10' },
  { id: 'night', label: 'Noite', icon: Moon, color: 'text-indigo-400', bgHover: 'hover:bg-indigo-400/10' },
  { id: 'any', label: 'Qualquer Hora', icon: Maximize, color: 'text-zinc-400', bgHover: 'hover:bg-zinc-400/10' },
] as const;

type ShiftType = 'morning' | 'afternoon' | 'night' | 'any';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function HabitList() {

  // ==========================================
  // ESTADO GLOBAL (ZUSTAND)
  // ==========================================
  const { habits, logs, isLoading, addHabit, toggleHabit, updateHabit, deleteHabit } = useHabitStore();
  const { selectedDate } = useDateStore();
  
  // ==========================================
  // ESTADO LOCAL (UI E FORMULÁRIO)
  // ==========================================
  const [isCreating, setIsCreating] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);

  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['0', '1', '2', '3', '4', '5', '6']);
  const [selectedShift, setSelectedShift] = useState<ShiftType>('any');

  // ==========================================
  // HANDLERS (AÇÕES DO USUÁRIO)
  // ==========================================

  const handleSaveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const isDaily = selectedDays.length === 7 || selectedDays.length === 0;
    const habitPayload = {
      name: newHabitName,
      frequency: isDaily ? ('daily' as const) : ('specific_days' as const),
      specific_days: isDaily ? undefined : selectedDays.join(','),
      shift: selectedShift
    };
    
    if (editingHabitId) {
      await updateHabit(editingHabitId, habitPayload);
    } else {
      await addHabit(habitPayload);
    }

    closeForm();
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setNewHabitName(habit.name);
    setSelectedShift(habit.shift || 'any');
    if (habit.frequency === 'specific_days' && habit.specific_days) {
      setSelectedDays(habit.specific_days.split(','));
    } else {
      setSelectedDays(['0', '1', '2', '3', '4', '5', '6']);
    }
    setIsCreating(true);
    setIsConfigMode(false); // Fecha o modo configuração para mostrar o formulário
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingHabitId(null);
    setNewHabitName('');
    setSelectedDays(['0', '1', '2', '3', '4', '5', '6']);
    setSelectedShift('any');
  };

  const toggleDay = (id: string) => {
    setSelectedDays(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // GERAÇÃO DA GRADE (Histórico de 7 Dias)
  const endDateObj = new Date(`${selectedDate}T12:00:00`);
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    // Conta 6 dias para trás até chegar em 0 (o dia atual)
    const dateObj = subDays(endDateObj, 6 - i);
    return {
      dateStr: format(dateObj, 'yyyy-MM-dd'),
      dayOfWeek: dateObj.getDay(),
      dayOfMonth: format(dateObj, 'dd')
    };
  });

  // ==========================================
  // AGRUPAMENTO DE HÁBITOS POR TURNO
  // ==========================================
  const groupedHabits = habits.reduce((acc, habit) => {
    const shift = habit.shift || 'any'; // Proteção contra dados antigos no banco
    if (!acc[shift]) acc[shift] = [];
    acc[shift].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  // ==========================================
  // RENDERIZAÇÃO (UI)
  // ==========================================

  return (
    <div className="flex flex-col h-full bg-zinc-900/20 rounded-2xl border border-zinc-800/50 p-6">
      
      {/* ========================================== */}
      {/* Header */}
      {/* ========================================== */}
      {!isCreating && (
          <div className="flex gap-2 mb-8">
            <button 
              onClick={() => setIsConfigMode(!isConfigMode)}
              className={cn(
                "p-2 rounded-lg transition-colors border",
                isConfigMode 
                  ? "bg-zinc-800 text-zinc-200 border-zinc-700" 
                  : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-800/50 hover:text-zinc-300"
              )}
              title="Configurar Hábitos"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => { closeForm(); setIsCreating(true); }}
              className="flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar hábito</span>
            </button>
          </div>
        )}

      {/* ========================================== */}
      {/* Formulário de Criação (MODO EXPANDIDO*/}
      {/* ========================================== */}
      {isCreating && (
        <form onSubmit={handleSaveHabit} className="mb-8 bg-zinc-900 rounded-xl border border-zinc-800 p-5 relative shadow-xl">
          <button 
            type="button" 
            onClick={closeForm}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nome do Hábito</label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Novo hábito..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ========================================== */}
              {/* SELETOR DE TURNOS NO FORMULÁRIO */}
              {/* ========================================== */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Turno (Período)</label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIFTS.map(shift => {
                    const Icon = shift.icon;
                    const isSelected = selectedShift === shift.id;
                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => setSelectedShift(shift.id as ShiftType)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                          isSelected 
                            ? "bg-zinc-800 border-zinc-700 text-zinc-200" 
                            : "bg-zinc-950 border-zinc-800/50 text-zinc-500 hover:bg-zinc-900"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isSelected ? shift.color : "text-zinc-600")} />
                        {shift.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Repete na:</label>
                <div className="flex gap-2">
                  {WEEK_DAYS.map(day => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all",
                          isSelected ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300"
                        )}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-6 flex justify-end pt-4 border-t border-zinc-800/50">
            <button 
              type="submit" 
              disabled={!newHabitName.trim()} 
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 px-6 py-2.5 rounded-lg font-bold transition-colors"
            >
              {editingHabitId ? 'Salvar Alterações' : 'Salvar Hábito'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Hábitos e a Grade de 7 Dias */}
      <div className={cn(
        "flex-1 overflow-auto custom-scrollbar transition-all duration-300",
        isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
      )}>
        {habits.length === 0 && !isLoading ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800/50 rounded-2xl">
            <p className="text-zinc-600 text-sm">Nenhum hábito cadastrado.</p>
          </div>
        ) : (
          <div className="min-w-[600px] space-y-8">
            
            {/* ========================================== */}
            {/* RENDERIZAÇÃO SEPARADA POR TURNOS */}
            {/* ========================================== */}
            {SHIFTS.map(shiftConfig => {
              const shiftHabits = groupedHabits[shiftConfig.id] || [];
              
              // Se não houver hábitos cadastrados para este turno, esconde a seção
              if (shiftHabits.length === 0) return null;

              const Icon = shiftConfig.icon;

              return (
                <div key={shiftConfig.id} className="space-y-3">
                  
                  {/* CABEÇALHO DA TABELA (Agora mostra o nome do Turno em vez de "Hábito") */}
                  <div className="grid grid-cols-[minmax(200px,1fr)_repeat(7,minmax(48px,1fr))] gap-4 px-4 items-end">
                    <div className="flex items-center gap-2 pb-2">
                      <Icon className={cn("w-5 h-5", shiftConfig.color)} />
                      <h3 className="font-semibold text-zinc-300">{shiftConfig.label}</h3>
                    </div>
                    
                    {/* MODO DE CONFIGURAÇÃO */}
                    {isConfigMode ? (
                       <div className="col-span-7 flex justify-end pb-8 opacity-60 pr-2">
                         <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Ações</span>
                       </div>
                    ) : (
                      last7Days.map((day) => (
                        <div key={day.dateStr} className="flex flex-col items-center justify-end pb-2 opacity-60">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">{SHORT_DAY_NAMES[day.dayOfWeek]}</span>
                          <span className={cn(
                            "text-sm font-bold mt-1",
                            day.dateStr === selectedDate ? "text-emerald-400" : "text-zinc-400"
                          )}>
                            {day.dayOfMonth}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    {shiftHabits.map((habit) => (
                      <div key={habit.id} className={cn(
                        "grid gap-4 px-4 py-3 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-xl border border-zinc-800/30 transition-colors items-center group",
                        isConfigMode ? "grid-cols-[1fr_auto]" : "grid-cols-[minmax(200px,1fr)_repeat(7,minmax(48px,1fr))]"
                      )}>
                        
                        <div className="font-medium text-zinc-200 truncate pr-4 pl-7">
                          {habit.name}
                        </div>

                        {/* MODO DE CONFIGURAÇÃO (Botões Editar / Excluir) */}
                        {isConfigMode ? (
                          <div className="flex items-center gap-2 pr-2">
                            <button
                              onClick={() => openEditForm(habit)}
                              className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if(window.confirm('Tem certeza que deseja excluir este hábito e todo o seu histórico?')) {
                                  deleteHabit(habit.id);
                                }
                              }}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // MODO NORMAL: O Mini-Heatmap dos últimos 7 dias 
                          last7Days.map((day) => {
                            // Lógica de Filtro dos Hábitos do Dia
                            const isActiveThisDay = habit.frequency === 'daily' || habit.specific_days?.includes(day.dayOfWeek.toString());
                            
                            if (!isActiveThisDay) {
                              return (
                                <div key={day.dateStr} className="flex justify-center">
                                  <span className="text-zinc-800 text-lg leading-none">-</span>
                                </div>
                              );
                            }

                            // O check-in do dia SELECIONADO para mostrar no quadrado principal
                            const log = logs.find(l => l.habit_id === habit.id && l.target_date === day.dateStr);
                            const isCompleted = log ? log.is_completed : false;
                            
                            // Destaca visualmente qual dia é "hoje" na grade
                            const isSelectedDay = day.dateStr === selectedDate;

                            return (
                              <div key={day.dateStr} className="flex justify-center">
                                <button
                                  title={day.dateStr} // Mostra a data se o mouse passar por cima
                                  onClick={() => toggleHabit(habit.id, day.dateStr)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border",
                                    isCompleted 
                                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" 
                                      : isSelectedDay 
                                        ? "bg-zinc-800/50 border-zinc-700 text-zinc-600 hover:border-emerald-500/50 hover:text-emerald-500/50" 
                                        : "bg-transparent border-zinc-800/50 text-zinc-700 hover:border-zinc-600 hover:text-zinc-500"
                                  )}
                                >
                                  {isCompleted && <Check className="w-5 h-5" />}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}