
from sqlalchemy import text
from app.core.database import engine
import asyncio

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text('SELECT count(*) FROM hosting_plans'))
        print(f'Row count: {res.scalar()}')

if __name__ == "__main__":
    asyncio.run(check())
