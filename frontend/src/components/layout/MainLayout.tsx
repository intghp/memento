import type { ReactNode } from 'react';

interface MainLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  rightPanel: ReactNode;
}

export function MainLayout({ sidebar, main, rightPanel }: MainLayoutProps) {
  return (
    // Fundo geral do app: off-white no claro, preto no escuro
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 h-screen">
        
        {/* Coluna 1: Sidebar (Navegação e Hábitos) */}
        <aside className="hidden lg:flex flex-col lg:col-span-3 border-r border-zinc-200 dark:border-zinc-800/50 bg-transparent dark:bg-zinc-950/50 p-6 overflow-y-auto custom-scrollbar transition-colors duration-300">
          {sidebar}
        </aside>

        {/* Coluna 2: Conteúdo Central (Tarefas e Agenda) */}
        <main className="col-span-1 lg:col-span-6 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-transparent transition-colors duration-300">
          {main}
        </main>

        {/* Coluna 3: Painel Direito (Daily Notes) */}
        <aside className="hidden xl:flex flex-col lg:col-span-3 border-l border-zinc-200 dark:border-zinc-800/50 bg-transparent dark:bg-zinc-900/20 p-6 overflow-y-auto custom-scrollbar transition-colors duration-300">
          {rightPanel}
        </aside>
        
      </div>
    </div>
  );
}