"""
Simple script to create all database tables from SQLAlchemy models.
"""
import asyncio
from app.core.database import Base, engine

# Import all models so they register with Base.metadata
import app.models  # This should import all models

async def create_tables():
    print("Creating all database tables...")
    print(f"Found {len(Base.metadata.tables)} tables to create")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
