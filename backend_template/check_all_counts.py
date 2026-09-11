
from sqlalchemy import text
from app.core.database import engine
import asyncio

async def check():
    tables = ['hosting_plans', 'users', 'servers', 'orders', 'support_tickets']
    async with engine.connect() as conn:
        print("--- Table Row Counts ---")
        for table in tables:
            try:
                res = await conn.execute(text(f'SELECT count(*) FROM {table}'))
                print(f'{table}: {res.scalar()}')
            except Exception as e:
                print(f'{table}: Error ({str(e).splitlines()[0]})')
        print("------------------------")

if __name__ == "__main__":
    asyncio.run(check())
