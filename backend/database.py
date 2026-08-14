from sqlmodel import SQLModel
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine

# Define the SQLite database URL and create the async engine
sqlite_file_name = "memento.db"
sqlite_url = f"sqlite+aiosqlite:///{sqlite_file_name}"

# Create the async engine for the SQLite database
engine = create_async_engine(sqlite_url, echo=True)

# Initialize the database and create tables
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

# Create a sessionmaker for the async engine
async def get_session():
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session