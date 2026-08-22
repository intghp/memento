import { useEffect, useState, useRef } from 'react';
import { X, Target, CalendarDays, Clock, Minus } from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { format, subDays, startOfDay, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import type { Habit, HabitLog } from '../../types';

interface Props {
  habit: Habit;
  onClose: () => void;
}

export function HabitMacroVision({ habit, onClose }: Props) {
  const { getHabitMacroLogs } = useHabitStore();
  const [macroLogs, setMacroLogs] = useState<HabitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const DAYS_TO_SHOW = 365;

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const logs = await getHabitMacroLogs(habit.id, DAYS_TO_SHOW);
      setMacroLogs(logs);
      setIsLoading(false);
    };
    fetchLogs();
  }, [habit.id]);

  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [isLoading]);

  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');
  const startDate = startOfWeek(subDays(today, DAYS_TO_SHOW - 1), { weekStartsOn: 0 });
  
  const historyDays: Date[] = [];
  let currentDay = startDate;
  while (currentDay <= today) {
    historyDays.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  historyDays.forEach(date => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const totalCompleted = macroLogs.filter(l => l.is_completed).length;
  const totalSkipped = macroLogs.filter(l => l.is_skipped).length;

  const dbCreatedDateStr = habit.created_at ? habit.created_at.substring(0, 10) : '2000-01-01';

  let totalPending = 0;

  historyDays.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (dateStr >= dbCreatedDateStr && dateStr < todayStr) {
      const dayOfWeek = date.getDay().toString();
      const isRequired = habit.frequency === 'daily' || habit.specific_days?.includes(dayOfWeek);
      
      if (isRequired) {
        const log = macroLogs.find(l => l.target_date === dateStr);
        const isPartial = habit.is_quantitative && log?.amount_completed !== undefined && log.amount_completed > 0 && !log?.is_completed && !log?.is_skipped;
        if (!log?.is_completed && !log?.is_skipped && !isPartial) {
          totalPending++;
        }
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl flex flex-col gap-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{habit.name}</h2>
            <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mt-1">
              Visão Macro • {DAYS_TO_SHOW} dias
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500"><Target className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Concluídos</span></div>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{isLoading ? '-' : totalCompleted} <span className="text-sm text-zinc-400 font-medium">vezes</span></span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500"><Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Não Concluídos</span></div>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{isLoading ? '-' : totalPending} <span className="text-sm text-zinc-400 font-medium">dias</span></span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-500"><CalendarDays className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Isentos</span></div>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{isLoading ? '-' : totalSkipped} <span className="text-sm text-zinc-400 font-medium">dias</span></span>
          </div>
        </div>

        <div>
          <div ref={scrollRef} className={cn("flex gap-1.5 overflow-x-auto custom-scrollbar pb-6 pt-2 pr-4", isLoading && "opacity-50 blur-sm")}>
            <div className="flex flex-col gap-1.5 pl-3 pr-2 sticky left-0 bg-white dark:bg-zinc-950 z-20">
              <div className="h-4"></div>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={i} className="w-4 h-6 flex items-center justify-center text-[10px] text-zinc-400 font-bold">{d}</span>
              ))}
            </div>

            {weeks.map((week, i) => {
              const firstDayOfMonth = week.find(date => date.getDate() === 1);
              const showMonth = i === 0 || !!firstDayOfMonth;
              const monthLabelDate = firstDayOfMonth || week[0];

              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="h-4 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider pl-1">
                    {showMonth ? format(monthLabelDate, 'MMM', { locale: ptBR }) : ''}
                  </div>
                  
                  {week.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const log = macroLogs.find(l => l.target_date === dateStr);
                    const dayNumber = format(date, 'd');
                    
                    const dayOfWeek = date.getDay().toString();
                    const isRequired = habit.frequency === 'daily' || habit.specific_days?.includes(dayOfWeek);
                    
                    const isBeforeCreation = dateStr < dbCreatedDateStr;
                    
                    const isPartial = habit.is_quantitative && log?.amount_completed !== undefined && log.amount_completed > 0 && !log?.is_completed && !log?.is_skipped;
                    const isMissed = !isBeforeCreation && isRequired && !log?.is_completed && !log?.is_skipped && !isPartial && dateStr < todayStr;
                    const isNotRequired = !isBeforeCreation && !isRequired && !log?.is_completed && !log?.is_skipped && !isPartial;

                    let statusText = 'Sem registro';
                    if (log?.is_completed) statusText = 'Concluído';
                    else if (log?.is_skipped) statusText = 'Isento';
                    else if (isPartial) statusText = 'Progresso Parcial';
                    else if (isMissed) statusText = 'Não Concluído';
                    else if (isNotRequired) statusText = 'Não exigido';
                    
                    const formatAmount = (val: number) => {
                      if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
                      return Number.isInteger(val) ? val : Number(val).toFixed(1);
                    };

                    return (
                      <div key={dateStr} className="relative group/square flex items-center justify-center">
                        <button
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all duration-300 border cursor-default",
                            isBeforeCreation || !isRequired
                              ? "bg-transparent border-transparent text-zinc-300 dark:text-zinc-800/30"
                              : log?.is_skipped 
                                ? "bg-zinc-200 border-zinc-300 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                                : log?.is_completed 
                                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-500/20 dark:text-emerald-400" 
                                  : isPartial
                                    ? "bg-transparent border-emerald-500/60 text-emerald-600 dark:border-emerald-500/50 dark:text-emerald-400"
                                    : isMissed
                                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400/80"
                                      : dateStr === todayStr
                                        ? "bg-zinc-100 border-zinc-300 text-zinc-400 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-600"
                                        : "bg-transparent border-transparent text-zinc-300 dark:text-zinc-800/30"
                          )}
                        >
                          {log?.is_skipped ? <Minus className="w-3 h-3" /> : isMissed ? <X className="w-3 h-3" /> : dayNumber}
                        </button>
                        
                        {(log?.is_completed || log?.is_skipped || (!isBeforeCreation && dateStr <= todayStr)) && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] py-1 px-2 rounded opacity-0 group-hover/square:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl flex flex-col items-center">
                            <span className="font-bold flex items-center">
                              {statusText}
                              {habit.is_quantitative && log?.amount_completed !== undefined && !log?.is_skipped && (
                                <span className="ml-1 text-zinc-300 dark:text-zinc-600">
                                  ({formatAmount(log.amount_completed)} / {habit.goal_amount} {habit.unit})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}