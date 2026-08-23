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

## 📦 Como Rodar Localmente

**1. Clone o repositório**
```bash
git clone https://github.com/intghp/memento.git
cd memento
```

**2. Iniciando o Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
fastapi dev main.py
```

**3. Iniciando o Frontend**
```bash
cd frontend
npm install
npm run dev
```

---
*Feito com foco e minimalismo.*