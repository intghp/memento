import { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay,
  isAfter, startOfDay, parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDateStore } from '../../store/useDateStore';
import { cn } from '../../utils/cn';

export function MiniCalendar() {
  const { selectedDate, setSelectedDate } = useDateStore();
  
  // O calendário precisa saber qual mês está sendo exibido, independente do dia selecionado
  const [currentMonth, setCurrentMonth] = useState(parseISO(selectedDate));
  
  // Transforma a nossa string "YYYY-MM-DD" em um Date real para comparação
  const selectedDateObj = parseISO(selectedDate);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Lógica para gerar os dias do mês no formato de grade (Matriz)
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateString = format(cloneDay, 'yyyy-MM-dd'); // O formato que o nosso Backend espera

        // VERIFICA SE É UM DIA NO FUTURO (A partir de amanhã)
        const isFutureDay = isAfter(cloneDay, startOfDay(new Date()));

        days.push(
          <button
            key={day.toString()}
            onClick={() => !isFutureDay && setSelectedDate(dateString)}
            disabled={isFutureDay}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300",
              !isSameMonth(day, monthStart) && "text-zinc-300 dark:text-zinc-700", // Dias do mês anterior/próximo
              isSameMonth(day, monthStart) && !isSameDay(day, selectedDateObj) && "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800", // Dias normais
              isSameDay(day, selectedDateObj) && "bg-zinc-900 text-white shadow-md dark:bg-zinc-200 dark:text-zinc-900 dark:shadow-[0_0_10px_rgba(228,228,231,0.15)]", // Dia selecionado
              isFutureDay && "opacity-30 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent" // Bloqueio visual para o futuro
            )}
          >
            {formattedDate}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1 mt-1" key={day.toString()}>{days}</div>);
      days = [];
    }
    return rows;
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 shadow-sm dark:shadow-none transition-colors duration-300">
      {/* Cabeçalho do Calendário (Mês e Setas) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-zinc-800 dark:text-zinc-200 font-bold capitalize transition-colors duration-300">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dias da Semana (Dom, Seg, Ter...) */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
          <div key={index} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
            {dia}
          </div>
        ))}
      </div>

      {/* Grade de Dias */}
      <div>{renderDays()}</div>
    </div>
  );
}