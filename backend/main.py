from contextlib import asynccontextmanager

from sqlmodel import select
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session, init_db
from models import (
    Task, 
    TaskCreate,
    Note,
    NoteCreate,
    NoteUpdate)

# Define the lifespan context manager for the FastAPI application
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Memento API", lifespan=lifespan)

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

# --- Tasks CRUD ---

# List Tasks
@app.get("/api/tasks", response_model=list[Task])
async def get_tasks(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Task))
    tasks = result.all()

    return tasks

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

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int, session: AsyncSession = Depends(get_session)):
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()

    return {"message": "Task deleted successfully"}

# --- Notes CRUD ---

@app.get("/api/notes", response_model=list[Note])
async def get_notes(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Note))
    notes = result.all()

    return notes

@app.post("/api/notes", response_model=Note)
async def create_note(note: NoteCreate, session: AsyncSession = Depends(get_session)):
    db_note = Note.model_validate(note)
    session.add(db_note)
    await session.commit()
    await session.refresh(db_note)

    return db_note

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