from datetime import date
from typing import Optional
from sqlmodel import select
from database import get_session, init_db
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import FastAPI, Depends, HTTPException, Query

from models import (
    Task, TaskCreate,
    Note, NoteCreate, NoteUpdate,
    Habit, HabitCreate, HabitUpdate, HabitLog)

# ==========================================
# CONFIGURAÇÃO DA APLICAÇÃO (LIFESPAN E CORS)
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Memento API", 
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "API está rodando perfeitamente!"}

# ==========================================
# 1. TAREFAS (TASKS CRUD)
# ==========================================

# List Tasks
@app.get("/api/tasks", response_model=list[Task])
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    target_date: date = Query(..., description="A data para buscar as tarefas")
    ):

    # Filtrar apenas tarefas do dia selecionado
    query = select(Task).where(Task.target_date == target_date)
    result = await session.exec(query)
    return result.all()

# Create Task
@app.post("/api/tasks", response_model=Task)
async def create_task(task: TaskCreate, session: AsyncSession = Depends(get_session)):
    db_task = Task.model_validate(task)
    session.add(db_task)
    await session.commit()
    await session.refresh(db_task)

    return db_task

# Para Altenar o status da tarefa (completa ou incompleta)
@app.patch("/api/tasks/{task_id}/toggle", response_model=Task)
async def toggle_task_completion(task_id: int, session: AsyncSession = Depends(get_session)):
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task

# Delete Task
@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int, session: AsyncSession = Depends(get_session)):
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()

    return {"message": "Task deleted successfully"}

# ==========================================
# 2. NOTAS DIÁRIAS (DAILY NOTES)
# ==========================================

@app.get("/api/notes/daily", response_model=Note)
async def get_notes(
    session: AsyncSession = Depends(get_session),
    target_date: date = Query(..., description="A data da nota diária")
    ):

    # Busca a nota do dia. Se não existir, cria uma em branco automaticamente
    query = select(Note).where(Note.target_date == target_date)
    result = await session.exec(query)
    note = result.first()

    if not note:
        # Para que o frontend sempre tenha um editor ativo
        note = Note(
            title=f"Nota de {target_date.strftime('%d/%m/%Y')}",
            target_date=target_date
        )

        session.add(note)
        await session.commit()
        await session.refresh(note)

    return note

# Cria uma nota manualmente
@app.post("/api/notes", response_model=Note)
async def create_note(note: NoteCreate, session: AsyncSession = Depends(get_session)):
    db_note = Note.model_validate(note)
    session.add(db_note)
    await session.commit()
    await session.refresh(db_note)

    return db_note

# Atualiza a nota diária existente com um autosave
@app.put("/api/notes/{note_id}", response_model=Note)
async def update_note(note_id: int, note_update: NoteUpdate, session: AsyncSession = Depends(get_session)):
    db_note = await session.get(Note, note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")

    note_data = note_update.model_dump(exclude_unset=True)
    for key, value in note_data.items():
        setattr(db_note, key, value)

    session.add(db_note)
    await session.commit()
    await session.refresh(db_note)
    return db_note

# ==========================================
# 3. HABITS AND DAILY CHECK-INS
# ==========================================

# Retorna os hábitos cadastrados pelo usuário
@app.get("/api/habits", response_model=list[Habit])
async def get_habits(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Habit))
    return result.all()

# Cria um novo hábito
@app.post("/api/habits", response_model=Habit)
async def create_habit(habit: HabitCreate, session: AsyncSession = Depends(get_session)):
    db_habit = Habit.model_validate(habit)
    session.add(db_habit)
    await session.commit()
    await session.refresh(db_habit)
    return db_habit

# Retorna o histórico de check-ins
@app.get("/api/habits/logs", response_model=list[HabitLog])
async def get_habit_logs(
    session: AsyncSession = Depends(get_session),
    target_date: Optional[date] = Query(None, description="Data específica"),
    start_date: Optional[date] = Query(None, description="Data inicial"),
    end_date: Optional[date] = Query(None, description="Data final")
):
    query = select(HabitLog)

    if target_date:
        query = query.where(HabitLog.target_date == target_date)
    elif start_date and end_date:
        query = query.where(
            HabitLog.target_date >= start_date,
            HabitLog.target_date <= end_date
            )

    result = await session.exec(query)
    return result.all()

# Marcar ou desmarcar o hábito
@app.post("/api/habits/{habit_id}/toggle", response_model=HabitLog)
async def toggle_habit(
    habit_id: int,
    target_date: date = Query(..., description="A data em que o hábito foi feito"),
    session: AsyncSession = Depends(get_session)
):
    # Marca ou desmarca a execução de um hábito num dia."
    query = select(HabitLog).where(
        HabitLog.habit_id == habit_id, 
        HabitLog.target_date == target_date
    )
    result = await session.exec(query)
    log = result.first()
    
    if log:
        # Se já existia um registro, inverte o valor (Toggle)
        log.is_completed = not log.is_completed
        session.add(log)
    else:
        # Se não existia, cria marcando como concluído
        log = HabitLog(habit_id=habit_id, target_date=target_date, is_completed=True)
        session.add(log)
        
    await session.commit()
    await session.refresh(log)
    return log

# Editar um Hábito
@app.patch("/api/habits/{habit_id}", response_model=Habit)
async def update_habit(habit_id: int, habit_update: HabitUpdate, session: AsyncSession = Depends(get_session)):
    db_habit = await session.get(Habit, habit_id)
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Atualiza apenas os campos que foram enviados
    habit_data = habit_update.model_dump(exclude_unset=True)
    for key, value in habit_data.items():
        setattr(db_habit, key, value)
        
    session.add(db_habit)
    await session.commit()
    await session.refresh(db_habit)
    return db_habit

# Deletar um Hábito
@app.delete("/api/habits/{habit_id}")
async def delete_habit(habit_id: int, session: AsyncSession = Depends(get_session)):
    habit = await session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    logs = await session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id))
    for log in logs:
        await session.delete(log)
        
    await session.delete(habit)
    await session.commit()
    return {"message": "Habit deleted successfully"}