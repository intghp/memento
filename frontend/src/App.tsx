import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTaskStore } from './store/useTaskStore';
import { useNoteStore } from './store/useNoteStore';
import { useDebounce } from './hooks/useDebounce';
import { Plus, Circle, CheckCircle2, Trash2, Edit3, Eye } from 'lucide-react';
import { cn } from './utils/cn';

export default function App() {
  // --- STORE DAS TAREFAS ---
  const { tasks, isLoading, fetchTasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // --- STORE DAS NOTAS & AUTOSAVE ---
  const { activeNote, fetchOrCreateNote, updateNote } = useNoteStore();
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  
  // O debounce espera 1 segundo (1000ms) após o usuário parar de digitar
  const debouncedNoteContent = useDebounce(noteContent, 1000);

  // Inicialização (Busca tarefas e notas no load)
  useEffect(() => {
    fetchTasks();
    fetchOrCreateNote();
  }, [fetchTasks, fetchOrCreateNote]);

  // Sincroniza o conteúdo local da nota quando ela é carregada do backend
  useEffect(() => {
    if (activeNote) {
      setNoteContent(activeNote.content);
    }
  }, [activeNote?.id]); // Executa apenas quando o ID da nota muda

  // Efeito de Autosave
  useEffect(() => {
    if (activeNote && debouncedNoteContent !== activeNote.content) {
      updateNote(activeNote.id, debouncedNoteContent);
    }
  }, [debouncedNoteContent]); // Dispara sempre que o valor "debounced" mudar

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle });
    setNewTaskTitle('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex py-8 px-8">
      {/* Container principal usando Grid para dividir a tela */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* ========================================================= */}
        {/* LADO ESQUERDO: TAREFAS */}
        {/* ========================================================= */}
        <div className="space-y-8 flex flex-col h-full">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Memento</h1>
            <p className="text-zinc-400 mt-1">O seu espaço de foco local.</p>
          </header>

          <form onSubmit={handleAddTask} className="relative">
            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              disabled={isLoading}
            />
          </form>

          <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {isLoading && tasks.length === 0 ? (
              <p className="text-zinc-500 py-4">Carregando tarefas...</p>
            ) : tasks.length === 0 ? (
              <p className="text-zinc-500 py-4">Nenhuma tarefa por aqui.</p>
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

        {/* ========================================================= */}
        {/* LADO DIREITO: NOTAS MARKDOWN */}
        {/* ========================================================= */}
        <div className="flex flex-col h-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden">
          {/* Header da Nota */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/50">
            <h2 className="text-lg font-semibold text-zinc-200">
              {activeNote?.title || 'Carregando Nota...'}
            </h2>
            <button
              onClick={() => setIsEditingNote(!isEditingNote)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-sm font-medium"
            >
              {isEditingNote ? (
                <><Eye className="w-4 h-4" /> Visualizar</>
              ) : (
                <><Edit3 className="w-4 h-4" /> Editar</>
              )}
            </button>
          </div>

          {/* Área de Conteúdo da Nota */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isEditingNote ? (
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Comece a escrever em Markdown..."
                className="w-full h-full bg-transparent resize-none text-zinc-300 focus:outline-none leading-relaxed"
              />
            ) : (
              <div className="prose prose-invert prose-emerald max-w-none">
                <ReactMarkdown>{noteContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}