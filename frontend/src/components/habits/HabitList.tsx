import { useState } from 'react';
import { Plus, Check, X, Sunrise, Sun, Moon, Maximize, Settings, Trash2, Pencil, Minus } from 'lucide-react';
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
  { id: 'morning', label: 'Manhã', icon: Sunrise },
  { id: 'afternoon', label: 'Tarde', icon: Sun },
  { id: 'night', label: 'Noite', icon: Moon },
  { id: 'any', label: 'Qualquer Hora', icon: Maximize },
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
  // ESTADOS QUANTITATIVOS
  // ==========================================
  const [isQuantitative, setIsQuantitative] = useState(false);
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  
  const [activeInput, setActiveInput] = useState<{ habitId: number, date: string, value: string } | null>(null);

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
      shift: selectedShift,
      is_quantitative: isQuantitative,
      goal_amount: isQuantitative && goalAmount ? parseFloat(goalAmount.replace(',', '.')) : undefined,
      unit: isQuantitative ? unit : undefined
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
    
    setIsQuantitative(habit.is_quantitative || false);
    setGoalAmount(habit.goal_amount ? habit.goal_amount.toString() : '');
    setUnit(habit.unit || '');

    setIsCreating(true);
    setIsConfigMode(false);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingHabitId(null);
    setNewHabitName('');
    setSelectedDays(['0', '1', '2', '3', '4', '5', '6']);
    setSelectedShift('any');
    setIsQuantitative(false);
    setGoalAmount('');
    setUnit('');
  };

  const toggleDay = (id: string) => {
    setSelectedDays(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleToggleHabitClick = (habit: Habit, dateStr: string, isAlreadyCompleted: boolean, currentAmount?: number) => {
    if (habit.is_quantitative && !isAlreadyCompleted) {
      setActiveInput({ habitId: habit.id, date: dateStr, value: currentAmount ? currentAmount.toString() : '' });
    } else {
      toggleHabit(habit.id, dateStr);
    }
  };

  // GERAÇÃO DA GRADE (Histórico de 7 Dias)
  const endDateObj = new Date(`${selectedDate}T12:00:00`);
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
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
    const shift = habit.shift || 'any';
    if (!acc[shift]) acc[shift] = [];
    acc[shift].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  // ==========================================
  // RENDERIZAÇÃO (UI)
  // ==========================================

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900/20 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 p-6 transition-colors duration-300 shadow-sm dark:shadow-none">
      
      {/* ========================================== */}
      {/* Header */}
      {/* ========================================== */}
      {!isCreating && (
          <div className="flex gap-2 mb-8">
            <button 
              onClick={() => setIsConfigMode(!isConfigMode)}
              className={cn(
                "p-2 rounded-lg transition-colors duration-300 border",
                isConfigMode 
                  ? "bg-zinc-200 border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700" 
                  : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
              )}
              title="Configurar Hábitos"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button 
              onClick={() => { closeForm(); setIsCreating(true); }}
              className="flex items-center gap-2 text-sm bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar hábito</span>
            </button>
          </div>
        )}

      {/* ========================================== */}
      {/* Formulário de Criação (MODO EXPANDIDO) */}
      {/* ========================================== */}
      {isCreating && (
        <form onSubmit={handleSaveHabit} className="mb-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 relative shadow-lg dark:shadow-xl transition-colors duration-300">
          <button 
            type="button" 
            onClick={closeForm}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
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
                placeholder="Ex: Beber Água..."
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 transition-colors duration-300"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setIsQuantitative(!isQuantitative)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                    isQuantitative ? "bg-zinc-900 dark:bg-zinc-200" : "bg-zinc-300 dark:bg-zinc-700"
                  )}
                >
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 absolute top-[3px] transition-all duration-300",
                    isQuantitative ? "left-[22px]" : "left-1"
                  )} />
                </button>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer" onClick={() => setIsQuantitative(!isQuantitative)}>
                  Definir Meta Quantitativa
                </label>
              </div>

              {isQuantitative && (
                <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-white/50 dark:bg-zinc-950/50 rounded-lg border border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">Meta Diária (Apenas números)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={goalAmount} 
                      onChange={e => setGoalAmount(e.target.value)} 
                      placeholder="Ex: 2.5" 
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 transition-colors duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-2">Unidade (Opcional)</label>
                    <input 
                      type="text" 
                      value={unit} 
                      onChange={e => setUnit(e.target.value)} 
                      placeholder="Ex: L, km, pág..." 
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 transition-colors duration-300"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300">
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
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors duration-300",
                          isSelected 
                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" 
                            : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-950 dark:border-zinc-800/50 dark:text-zinc-500 dark:hover:bg-zinc-900"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isSelected ? "text-current" : "text-zinc-400 dark:text-zinc-600")} />
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
                          "w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-300",
                          isSelected 
                            ? "bg-zinc-900 text-white shadow-md dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-zinc-100/10" 
                            : "bg-white dark:bg-zinc-950 text-zinc-500 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300"
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
          
          <div className="mt-6 flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300">
            <button 
              type="submit" 
              disabled={!newHabitName.trim()} 
              className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 px-6 py-2.5 rounded-lg font-bold transition-colors duration-300"
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
        {habits.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-300 dark:border-zinc-800/50 rounded-2xl transition-colors duration-300">
            <p className="text-zinc-500 text-sm">Nenhum hábito cadastrado.</p>
          </div>
        ) : (
          <div className="min-w-[600px] space-y-8">
            
            {/* ========================================== */}
            {/* RENDERIZAÇÃO SEPARADA POR TURNOS */}
            {/* ========================================== */}
            {SHIFTS.map(shiftConfig => {
              const shiftHabits = groupedHabits[shiftConfig.id] || [];
              
              if (shiftHabits.length === 0) return null;

              const Icon = shiftConfig.icon;

              return (
                <div key={shiftConfig.id} className="space-y-3">
                  
                  {/* CABEÇALHO DA TABELA */}
                  <div className="grid grid-cols-[minmax(200px,1fr)_repeat(7,minmax(48px,1fr))] gap-4 px-4 items-end">
                    <div className="flex items-center gap-2 pb-2">
                      <Icon className="w-5 h-5 text-zinc-800 dark:text-zinc-400 transition-colors duration-300" />
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-300 transition-colors duration-300">{shiftConfig.label}</h3>
                    </div>
                    
                    {/* MODO DE CONFIGURAÇÃO */}
                    {isConfigMode ? (
                        <div className="col-span-7 flex justify-end pb-2 opacity-60 pr-2">
                          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Ações</span>
                        </div>
                    ) : (
                      last7Days.map((day, i) => (
                        <div key={i} className="flex flex-col items-center justify-end pb-2 opacity-60 transition-colors duration-300">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">{SHORT_DAY_NAMES[day.dayOfWeek]}</span>
                          <span className={cn(
                            "text-sm font-bold mt-1 transition-colors duration-300",
                            day.dateStr === selectedDate ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"
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
                        "grid gap-4 px-4 py-3 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800/30 transition-colors duration-300 items-center group",
                        isConfigMode ? "grid-cols-[1fr_auto]" : "grid-cols-[minmax(200px,1fr)_repeat(7,minmax(48px,1fr))]"
                      )}>
                        
                        <div className="flex flex-col pr-4 pl-7 transition-colors duration-300">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{habit.name}</span>
                          {habit.is_quantitative && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold mt-1">
                              Meta: {habit.goal_amount} {habit.unit}
                            </span>
                          )}
                        </div>

                        {/* MODO DE CONFIGURAÇÃO (Botões Editar / Excluir) */}
                        {isConfigMode ? (
                          <div className="flex items-center justify-end gap-2 pr-2">
                            <button onClick={() => openEditForm(habit)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-300" title="Editar">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if(window.confirm('Tem certeza que deseja excluir este hábito e todo o seu histórico?')) deleteHabit(habit.id); }} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-100 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-300" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // MODO NORMAL: O Mini-Heatmap dos últimos 7 dias 
                          last7Days.map((day, i) => {
                            const isActiveThisDay = habit.frequency === 'daily' || habit.specific_days?.includes(day.dayOfWeek.toString());
                            
                            if (!isActiveThisDay) {
                              return (
                                <div key={i} className="flex justify-center">
                                  <span className="text-zinc-300 dark:text-zinc-800 text-lg leading-none transition-colors duration-300">-</span>
                                </div>
                              );
                            }

                            // O check-in do dia SELECIONADO para mostrar no quadrado principal
                            const log = logs.find(l => l.habit_id === habit.id && l.target_date === day.dateStr);
                            const isCompleted = log ? log.is_completed : false;
                            const isSkipped = log ? log.is_skipped : false;
                            
                            // Destaca visualmente qual dia é "hoje" na grade
                            const isSelectedDay = day.dateStr === selectedDate;
                            const isEditingQuantitative = activeInput?.habitId === habit.id && activeInput?.date === day.dateStr;

                            const formatAmount = (val: number) => {
                              if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
                              return Number.isInteger(val) ? val : Number(val).toFixed(1);
                            };

                            return (
                              <div key={i} className="flex justify-center relative group/btn">
                                
                                {isEditingQuantitative ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    inputMode="decimal"
                                    value={activeInput.value}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^0-9.,]/g, '');
                                      setActiveInput({ ...activeInput, value: val });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') e.currentTarget.blur();
                                      if (e.key === 'Escape') {
                                        e.currentTarget.value = '';
                                        e.currentTarget.blur();
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (val !== '') {
                                        const amount = parseFloat(val.replace(',', '.'));
                                        if (!isNaN(amount)) toggleHabit(habit.id, day.dateStr, amount);
                                      }
                                      setActiveInput(null);
                                    }}
                                    className="w-12 h-8 rounded-lg bg-transparent border-2 border-zinc-400 dark:border-zinc-500 text-zinc-900 dark:text-zinc-100 text-xs font-bold text-center focus:outline-none z-10"
                                  />
                                ) : (
                                  <button
                                    onClick={() => handleToggleHabitClick(habit, day.dateStr, isCompleted, log?.amount_completed)}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      toggleHabit(habit.id, day.dateStr, undefined, true);
                                    }}
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border overflow-hidden",
                                      isSkipped 
                                        ? "bg-zinc-100 border-zinc-300 border-dashed text-zinc-400 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-500"
                                        : isCompleted 
                                          ? "bg-zinc-900 border-zinc-900 text-white shadow-sm dark:bg-zinc-200 dark:border-zinc-200 dark:text-zinc-900 dark:shadow-[0_0_10px_rgba(228,228,231,0.1)]" 
                                          : isSelectedDay 
                                            ? "bg-zinc-100 border-zinc-300 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-600 dark:hover:border-zinc-400 dark:hover:text-zinc-400" 
                                            : "bg-transparent border-zinc-200 text-zinc-300 hover:border-zinc-400 hover:text-zinc-500 dark:border-zinc-800/50 dark:text-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-500"
                                    )}
                                  >
                                    {isSkipped ? <Minus className="w-4 h-4 shrink-0" /> : (
                                      isCompleted ? <Check className="w-5 h-5 shrink-0" /> : (
                                        habit.is_quantitative && log?.amount_completed !== undefined ? (
                                          <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-full px-1">
                                            {formatAmount(log.amount_completed)}
                                          </span>
                                        ) : (
                                          habit.is_quantitative && isSelectedDay && !isCompleted && (
                                            <span className="text-[10px] font-bold opacity-30 shrink-0">+</span>
                                          )
                                        )
                                      )
                                    )}
                                  </button>
                                )}
                                
                                {habit.is_quantitative && log?.amount_completed !== undefined && !isEditingQuantitative && (
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none truncate max-w-[100px] z-50 shadow-xl">
                                    {formatAmount(log.amount_completed)} / {habit.goal_amount} {habit.unit}
                                  </div>
                                )}
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