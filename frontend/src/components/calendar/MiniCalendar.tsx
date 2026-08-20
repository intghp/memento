import { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO 
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

        days.push(
          <button
            key={day.toString()}
            onClick={() => setSelectedDate(dateString)}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              !isSameMonth(day, monthStart) && "text-zinc-700", // Dias do mês anterior/próximo
              isSameMonth(day, monthStart) && !isSameDay(day, selectedDateObj) && "text-zinc-300 hover:bg-zinc-800", // Dias normais
              isSameDay(day, selectedDateObj) && "bg-zinc-200 text-zinc-900 font-bold shadow-[0_0_10px_rgba(228,228,231,0.15)]" // Dia selecionado
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
    <div className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4">
      {/* Cabeçalho do Calendário (Mês e Setas) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-zinc-200 font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dias da Semana (Dom, Seg, Ter...) */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
          <div key={index} className="text-xs font-semibold text-zinc-500">
            {dia}
          </div>
        ))}
      </div>

      {/* Grade de Dias */}
      <div>{renderDays()}</div>
    </div>
  );
}