"""
Script to create the password_reset_otps table for OTP-based password reset.
Run this script once to create the table.
"""
import asyncio
import sys
sys.path.insert(0, '/home/abhishek-rajput/Documents/RamaeraProjects/Hosting/hostingbackend')

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


async def create_password_reset_otps_table():
    print("=" * 60)
    print("Creating password_reset_otps table for OTP-based password reset")
    print("=" * 60)
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    async with AsyncSessionLocal() as session:
        # Check if table already exists
        result = await session.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'password_reset_otps'
            )
        """))
        exists = result.scalar()
        
        if exists:
            print("✅ Table 'password_reset_otps' already exists. Skipping creation.")
            return
        
        # Create the table
        await session.execute(text("""
            CREATE TABLE password_reset_otps (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                attempts INTEGER DEFAULT 0,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        
        # Create index on email
        await session.execute(text("""
            CREATE INDEX idx_password_reset_otp_email ON password_reset_otps(email)
        """))
        
        await session.commit()
        print("✅ Created table 'password_reset_otps' successfully!")
        print("✅ Created index 'idx_password_reset_otp_email'")


if __name__ == "__main__":
    asyncio.run(create_password_reset_otps_table())
