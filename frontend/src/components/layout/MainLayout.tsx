import type { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel: ReactNode;
}

export function MainLayout({ sidebar, main, rightPanel }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 h-screen">
        
        {/* Coluna 1: Sidebar (Navegação e Hábitos) - Ocupa 3 de 12 colunas */}
        <aside className="hidden lg:flex flex-col lg:col-span-3 border-r border-zinc-800/50 bg-zinc-950/50 p-6 overflow-y-auto custom-scrollbar">
          {sidebar}
        </aside>

        {/* Coluna 2: Conteúdo Central (Tarefas e Agenda) - Ocupa 6 de 12 colunas */}
        <main className="col-span-1 lg:col-span-6 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-zinc-950">
          {main}
        </main>

        {/* Coluna 3: Painel Direito (Daily Notes) - Ocupa 3 de 12 colunas */}
        <aside className="hidden xl:flex flex-col lg:col-span-3 border-l border-zinc-800/50 bg-zinc-900/20 p-6 overflow-y-auto custom-scrollbar">
          {rightPanel}
        </aside>
        
      </div>
    </div>
  );
}