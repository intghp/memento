import { useState, useRef } from 'react';
import { X, DatabaseBackup, UploadCloud, DownloadCloud, Check, AlertCircle, Palette, Settings2 } from 'lucide-react';
import { api } from '../api/client';
import { cn } from '../utils/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'data' | 'appearance' | 'preferences'>('data');
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const response = await api.get('/system/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `memento_backup_${dateStr}.db`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setStatusMessage({ type: 'success', text: 'Backup exportado com sucesso!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      setStatusMessage({ type: 'error', text: 'Erro ao gerar backup. Verifique o nome do arquivo no backend.' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
      setStatusMessage({ type: 'error', text: 'Selecione um arquivo .db válido.' });
      return;
    }

    if (!window.confirm('ATENÇÃO: Importar um backup irá apagar e substituir TODOS os seus dados atuais. Deseja continuar?')) {
      event.target.value = '';
      return;
    }

    setIsImporting(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/system/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatusMessage({ type: 'success', text: 'Dados restaurados! Reiniciando...' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Erro ao importar:", error);
      setStatusMessage({ type: 'error', text: 'Erro ao restaurar o backup.' });
      setIsImporting(false);
    }
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl h-[500px] shadow-2xl flex overflow-hidden relative">
        
        {/* Sidebar de Abas */}
        <div className="w-48 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Configurações</h2>
          
          <button onClick={() => setActiveTab('data')} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'data' ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50")}>
            <DatabaseBackup className="w-4 h-4" /> Dados
          </button>
          
          <button onClick={() => setActiveTab('appearance')} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'appearance' ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50")}>
            <Palette className="w-4 h-4" /> Aparência
          </button>
          
          <button onClick={() => setActiveTab('preferences')} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === 'preferences' ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50")}>
            <Settings2 className="w-4 h-4" /> Preferências
          </button>
        </div>

        {/* Área de Conteúdo */}
        <div className="flex-1 p-8 relative overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>

          {activeTab === 'data' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Backup e Restauração</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-md">
                O Memento é Local-First. Todo o seu histórico é armazenado no seu próprio dispositivo. Exporte seu banco de dados regularmente para garantir a segurança dos seus registros.
              </p>

              <div className="space-y-4">
                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">Exportar Dados</h4>
                    <p className="text-xs text-zinc-500 mt-1">Baixe um arquivo .db com todo seu histórico.</p>
                  </div>
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-lg text-sm font-bold hover:bg-zinc-800 dark:hover:bg-white transition-colors">
                    <DownloadCloud className="w-4 h-4" /> Exportar
                  </button>
                </div>

                <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm">Importar Backup</h4>
                    <p className="text-xs text-zinc-500 mt-1">Substitua os dados atuais por um arquivo .db.</p>
                  </div>
                  <input type="file" accept=".db" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={handleImportClick} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
                    <UploadCloud className="w-4 h-4" /> {isImporting ? 'Restaurando...' : 'Importar'}
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div className={cn("mt-6 p-4 rounded-lg text-sm font-medium flex items-center gap-2", statusMessage.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20")}>
                  {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {statusMessage.text}
                </div>
              )}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-full text-zinc-400">
              <Palette className="w-12 h-12 mb-4 opacity-20" />
              <p>Opções de tema e tipografia em breve.</p>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-full text-zinc-400">
              <Settings2 className="w-12 h-12 mb-4 opacity-20" />
              <p>Inversão de grade e horários em breve.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}