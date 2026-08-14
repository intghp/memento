from contextlib import asynccontextmanager

from sqlmodel import select
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session, init_db
from models import Task, TaskCreate

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

#-- Tasks CRUD ---

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