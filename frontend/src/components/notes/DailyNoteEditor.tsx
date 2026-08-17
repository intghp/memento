import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, Eye } from 'lucide-react';
import { useNoteStore } from '../../store/useNoteStore';
import { useDebounce } from '../../hooks/useDebounce';

export function DailyNoteEditor() {
  const { activeNote, updateNote, isLoading } = useNoteStore();
  
  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const debouncedContent = useDebounce(noteContent, 1000);

  // Sincroniza o texto da tela com a nota que veio do banco
  useEffect(() => {
    if (activeNote) {
      setNoteContent(activeNote.content);
    } else {
      setNoteContent('');
    }
  }, [activeNote?.id]); // Só atualiza quando mudar de dia/nota

  // Autosave
  useEffect(() => {
    if (activeNote && debouncedContent !== activeNote.content) {
      updateNote(activeNote.id, { content: debouncedContent });
    }
  }, [debouncedContent]);

  if (isLoading) {
    return <div className="text-zinc-500 animate-pulse flex-1 flex items-center justify-center">Carregando nota do dia...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/80">
        <h2 className="text-sm font-semibold text-zinc-300">
          {activeNote?.title || 'Nota Diária'}
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-xs font-medium"
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
            className="w-full h-full bg-transparent resize-none text-zinc-300 focus:outline-none leading-relaxed"
          />
        ) : (
          <div className="prose prose-invert prose-emerald max-w-none">
            <ReactMarkdown>{noteContent || '*Nenhuma anotação neste dia.*'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}