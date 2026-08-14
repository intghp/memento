import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Carregando...');

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Erro ao conectar com a API'));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Memento</h1>
        <p className="text-zinc-400">
          Status do Backend: <span className="text-emerald-400 font-mono">{apiStatus}</span>
        </p>
      </div>
    </div>
  );
}

export default App;