import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, Eye } from 'lucide-react';
import { useNoteStore } from '../../store/useNoteStore';
import { useDateStore } from '../../store/useDateStore';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';

export function DailyNoteEditor() {
  const { activeNote, updateNote, createNote, isLoading } = useNoteStore();
  const { selectedDate } = useDateStore();
  
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const debouncedContent = useDebounce(noteContent, 1000);

  // Sincroniza o texto da tela com a nota que veio do banco
  useEffect(() => {
    if (activeNote) {
      setNoteContent(activeNote.content || '');
    } else {
      setNoteContent('');
    }
  }, [activeNote?.id, selectedDate]);

  // Autosave
  useEffect(() => {
    // Só faz alguma coisa se o texto for diferente do que está no banco
    if (debouncedContent !== (activeNote?.content || '')) {
      
      if (activeNote) {
        // A nota já existe, então apenas atualiza
        updateNote(activeNote.id, { content: debouncedContent });
      } else if (debouncedContent.trim() !== '') {
        // Formatando a data de 'YYYY-MM-DD' para 'DD/MM/YYYY' para o título
        const [y, m, d] = selectedDate.split('-');
        createNote({
          title: `Nota de ${d}/${m}/${y}`,
          target_date: selectedDate,
          content: debouncedContent
        });
      }
    }
  }, [debouncedContent]);

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-all duration-300",
      isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
    )}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/80 transition-colors duration-300">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 transition-colors duration-300">
          {activeNote?.title || `Nota de ${selectedDate.split('-').reverse().join('/')}`}
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors duration-300 text-xs font-medium"
        >
          {isEditing ? <><Eye className="w-4 h-4" /> Visualizar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
        </button>
      </div>

      {/* Editor / Visualizador */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {isEditing ? (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Registre as ideias de hoje em Markdown..."
            className="w-full h-full bg-transparent resize-none text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none leading-relaxed transition-colors duration-300"
          />
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none transition-colors duration-300">
            <ReactMarkdown>{noteContent || '*Nenhuma anotação neste dia.*'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}