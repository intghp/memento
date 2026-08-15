from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

# --- TAKS MODELS ---

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
        )

class TaskCreate(TaskBase):
    pass

# --- NOTES MODELS ---
class NoteBase(SQLModel):
    title: str
    content: str = ""

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