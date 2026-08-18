from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import date, datetime, time, timezone

# ==========================================
# 1. TASKS (TAREFAS PONTUAIS)
# ==========================================

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    target_date: date

    start_time: time | None = None
    end_time: time | None = None

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
        )

class TaskCreate(TaskBase):
    pass

# ==========================================
# 2. DAILY NOTES (NOTAS DIÁRIAS - MARKDOWN)
# ==========================================

class NoteBase(SQLModel):
    title: str
    content: str = ""
    target_date: date

class Note(NoteBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
        )

class NoteCreate(NoteBase):
    pass

class NoteUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None

# ==========================================
# 3. HABIT TRACKING (SISTEMA DE HÁBITOS)
# ==========================================

class HabitBase(SQLModel):
    name: str
    scheduled_time: time | None = None

    frequency: str = "daily"

    specific_days: str | None = None

    shift: str = "any"

class Habit(HabitBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HabitCreate(HabitBase):
    pass

class HabitLog(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id")
    target_date: date
    is_completed: bool = False