#  Memento

> Um ecossistema minimalista e inteligente para rastreamento de hábitos, gestão de tarefas e anotações diárias. Projetado para quem busca consistência sem o ruído visual de aplicativos complexos.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20SQLite-black)
![Local First](https://img.shields.io/badge/Architecture-Local%20First-blue)

## ✨ A Filosofia

- **Hábitos Justos:** O sistema não te pune por imprevistos. Use o status de "Isento" quando a academia fechar no feriado e mantenha sua consistência intacta.
- **Micro e Macro:** Foque no que importa na grade semanal (Micro) e visualize sua consistência anual com o mapa de calor inspirado no GitHub (Macro).
- **Sem Poluição:** O banco de dados só salva o que você realmente interage, evitando dados fantasmas.

## 🚀 Principais Funcionalidades

### 🎯 Hábitos (Habit Tracker)
- **Modo Qualitativo e Quantitativo:** Marque apenas "Feito" ou registre "2.5 Litros".
- **Sistema de Isenção (Skip):** Pule dias sem quebrar suas estatísticas.
- **Visão Macro (Dashboard):** Um painel com mapa de calor interativo, exibindo taxa de conclusão, pendências e isenções ao longo de 365 dias.

### ✅ Tarefas Diárias (Task Manager)
- Interface limpa com Drag-and-Drop fluído para reordenação.
- Limpeza inteligente de tarefas concluídas com apenas um clique.

### 📝 Notas Diárias (Journal)
- Suporte completo a Markdown.
- Auto-save inteligente (Debounce) para evitar requisições desnecessárias.
- Criação preguiçosa: A nota só é gerada no banco de dados se você realmente digitar algo.

## 🛠️ Tecnologias

**Frontend:**
- React (Vite)
- Zustand (Gerenciamento de Estado Otimista)
- TailwindCSS (Estilização Dinâmica UI/UX)

**Backend:**
- Python + FastAPI
- SQLModel (ORM)
- SQLite (Banco de dados local e veloz)

## 📦 Como Rodar Localmente (Monorepo Setup)

O Memento utiliza um ambiente integrado. Graças ao `concurrently`, não é necessário múltiplos terminais para rodar a aplicação.

**1. Clone o repositório e instale a base**
```bash
git clone https://github.com/intghp/memento.git
cd memento
npm install
```

**2. Preparando o banco de dados (Backend)**
```bash
cd backend
python -m venv venv

# Ative o ambiente virtual:
# No Mac/Linux:
source venv/bin/activate

# No Windows:
venv/Scripts/activate

pip install -r requirements.txt
cd ..
```

**3. Preparando a Interface (Frontend)**
```bash
cd frontend
npm install
cd ..
```

**4. Inicie o Memento**
```bash
npm start
```

---
O `concurrently` irá iniciar automaticamente a API (Python) na porta 8000 e a Interface (Vite) na porta 5173. Acesse `http://localhost:5173` e aproveite!

*(Nota para usuários de Windows: Se o `npm start` não encontrar o uvicorn, altere o script `start:api` no package.json raiz de `venv/bin/uvicorn` para `venv\\Scripts\\uvicorn`).*