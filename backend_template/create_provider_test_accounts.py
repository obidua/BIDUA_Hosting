#!/usr/bin/env python3
"""
Create provider test accounts for testing the provider dashboard
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.utils.security_utils import get_password_hash
from app.models.users import UserProfile
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def create_provider_test_accounts():
    """Create provider test accounts for testing the provider dashboard"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Define provider test accounts
            provider_accounts = [
                {
                    "email": "provider-admin@ramaerahosting.com",
                    "password": "password123",
                    "full_name": "Provider Admin",
                    "role": "provider_admin"
                },
                {
                    "email": "operations-lead@ramaerahosting.com",
                    "password": "password123",
                    "full_name": "Operations Lead",
                    "role": "operations_lead"
                },
                {
                    "email": "support-staff@ramaerahosting.com",
                    "password": "password123",
                    "full_name": "Support Staff",
                    "role": "support_staff"
                },
                {
                    "email": "customer@ramaerahosting.com",
                    "password": "password123",
                    "full_name": "Regular Customer",
                    "role": "customer"
                }
            ]
            
            print("\n" + "="*60)
            print("🔐 Creating Provider Test Accounts")
            print("="*60 + "\n")
            
            # Create each account
            for account_data in provider_accounts:
                email = account_data["email"]
                password = account_data["password"]
                full_name = account_data["full_name"]
                role = account_data["role"]
                
                # Check if account already exists
                existing = await session.execute(
                    select(UserProfile).where(UserProfile.email == email)
                )
                user = existing.scalar_one_or_none()
                
                if user:
                    print(f"✓ Account exists: {email} ({role})")
                    continue
                
                # Create new account
                hashed_password = await get_password_hash(password)
                user = UserProfile(
                    email=email,
                    full_name=full_name,
                    role=role,
                    hashed_password=hashed_password,
                    account_status="active"
                )
                session.add(user)
                print(f"✓ Created account: {email} ({role})")
            
            # Commit all changes
            await session.commit()
            print("\n✅ Provider test accounts created successfully!")
            print("\nTest Account Credentials:")
            print("=" * 60)
            for account in provider_accounts:
                print(f"Email:    {account['email']}")
                print(f"Password: {account['password']}")
                print(f"Role:     {account['role']}")
                print("-" * 60)
                
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating test accounts: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_provider_test_accounts())
