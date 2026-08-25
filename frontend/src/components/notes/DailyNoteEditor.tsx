import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, Eye, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { useNoteStore } from '../../store/useNoteStore';
import { useDateStore } from '../../store/useDateStore';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils/cn';

export function DailyNoteEditor() {
  const { activeNote, updateNote, createNote, isLoading } = useNoteStore();
  const { selectedDate } = useDateStore();
  
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  return (
    <>
      <div className={cn(
        "flex flex-col h-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-all duration-300",
        isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/80 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <ArrowLeftToLine className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 transition-colors duration-300">
              {activeNote?.title || `Nota de ${selectedDate.split('-').reverse().join('/')}`}
            </h2>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors duration-300 text-xs font-medium"
          >
            {isEditing ? <><Eye className="w-4 h-4" /> Visualizar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {isEditing ? (
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Registre as ideias de hoje em Markdown..."
                className="w-full h-full bg-transparent resize-none text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none leading-relaxed transition-colors duration-300 break-words"
              />
            ) : (
              <div className="prose prose-zinc dark:prose-invert max-w-none transition-colors duration-300 break-words">
                <ReactMarkdown>{noteContent || '*Nenhuma anotação neste dia.*'}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn(
        "fixed inset-0 z-50",
        isExpanded ? "pointer-events-auto" : "pointer-events-none"
      )}>
        <div 
          onClick={() => setIsExpanded(false)} 
          className={cn(
            "absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out",
            isExpanded ? "opacity-100" : "opacity-0"
          )}
        />
        
        <div className={cn(
          "absolute top-0 right-0 h-full w-full md:w-[85vw] lg:w-[75vw] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          isExpanded ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-zinc-400 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowRightToLine className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
                {activeNote?.title || `Nota de ${selectedDate.split('-').reverse().join('/')}`}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 hidden sm:inline-block mr-4">ESC para sair</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors duration-300 text-sm font-bold"
              >
                {isEditing ? <><Eye className="w-4 h-4" /> Visualizar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-8 sm:px-16 md:px-24 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {isEditing ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  autoFocus
                  placeholder="Registre as ideias de hoje em Markdown..."
                  className="w-full h-full bg-transparent resize-none text-lg text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none leading-relaxed transition-colors duration-300 break-words"
                />
              ) : (
                <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none transition-colors duration-300 break-words pb-10">
                  <ReactMarkdown>{noteContent || '*Nenhuma anotação neste dia.*'}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/30 flex justify-between items-center text-xs text-zinc-400">
            <span>Markdown suportado nativamente</span>
            <span>{noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0} palavras</span>
          </div>
        </div>
      </div>
    </>
  );
}