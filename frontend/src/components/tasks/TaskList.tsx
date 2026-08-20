import { useState } from 'react';
import { Plus, CheckSquare, Square, GripVertical, Trash2 } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useDateStore } from '../../store/useDateStore';
import { cn } from '../../utils/cn';

import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

import {
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  type DragEndEvent
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';

// ==========================================
// SUB-COMPONENTE: Item Arrastável
// ==========================================
function SortableTaskItem({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group flex items-center gap-3 p-2 rounded-lg transition-colors duration-300 border",
        isDragging 
          ? "bg-white border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 opacity-90 shadow-xl" 
          : "bg-zinc-100/50 dark:bg-zinc-900/30 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
      )}
    >
      <button 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 p-1 shrink-0 transition-colors"
        title="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <button onClick={() => onToggle(task.id)} className="text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors shrink-0">
        <Square className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-1 break-words whitespace-normal transition-colors duration-300">
        {task.title}
      </span>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL: Lista de Tarefas
// ==========================================
export function TaskList() {
  const { tasks, isLoading, addTask, toggleTask, reorderTasks, clearCompletedTasks } = useTaskStore();
  const { selectedDate } = useDateStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  // Configuração dos Sensores de Arrastar (Mouse e Teclado)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = pendingTasks.findIndex(t => t.id === active.id);
      const newIndex = pendingTasks.findIndex(t => t.id === over.id);
      
      const newOrder = arrayMove(pendingTasks, oldIndex, newIndex);
      reorderTasks([...newOrder, ...completedTasks]);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await addTask({
      title: newTaskTitle,
      target_date: selectedDate,
      position: pendingTasks.length
    });
    setNewTaskTitle('');
  };

  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300",
      isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
    )}>
      
      {/* ========================================== */}
      {/* TAREFAS PENDENTES (Com Drag and Drop) */}
      {/* ========================================== */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col mb-4">
        
        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
           <p className="text-zinc-500 dark:text-zinc-600 text-xs text-center py-4 transition-colors duration-300">Sua lista está limpa.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
            <div className="flex flex-col gap-1 relative">
              <SortableContext items={pendingTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {pendingTasks.map((task) => (
                  <SortableTaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}

        {/* INPUT DE NOVA TAREFA */}
        <form onSubmit={handleAddTask} className="mt-2 flex items-center gap-3 p-2 border-t border-zinc-200 dark:border-zinc-800/50 shrink-0 transition-colors duration-300">
          <Plus className="w-5 h-5 text-zinc-400 dark:text-zinc-500 transition-colors" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Adicionar tarefa..."
            className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors duration-300"
            disabled={isLoading}
          />
        </form>
      </div>

      {/* ========================================== */}
      {/* TAREFAS CONCLUÍDAS (Separadas e com opção de limpar) */}
      {/* ========================================== */}
      {completedTasks.length > 0 && (
        <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800/50 pt-4 pb-2 transition-colors duration-300">
          
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider transition-colors duration-300">
              Concluídas ({completedTasks.length})
            </span>
            {/* Botão de limpar concluídas */}
            <button 
              onClick={() => {
                if (window.confirm('Excluir permanentemente as tarefas concluídas?')) {
                  clearCompletedTasks(selectedDate);
                }
              }}
              className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>

          <div className="space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar opacity-60">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/10 transition-colors duration-300">
                <button onClick={() => toggleTask(task.id)} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors">
                  <CheckSquare className="w-5 h-5" />
                </button>
                <span className="text-sm text-zinc-500 line-through flex-1 break-words whitespace-normal transition-colors duration-300">
                  {task.title}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}