#!/usr/bin/env python3
"""
Create admin accounts for anandraj60094@gmail.com and biduahosting@gmail.com
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.utils.security_utils import get_password_hash, verify_password
from app.models.users import UserProfile
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def create_admin_user(session, email, full_name, referral_code, password="123456"):
    """Create or update an admin user"""
    print(f"\n🔐 Creating admin account for {email}")
    
    # Hash password
    hashed_password = await get_password_hash(password)
    
    # Check if user exists
    result = await session.execute(
        select(UserProfile).where(UserProfile.email == email)
    )
    user = result.scalar_one_or_none()
    
    if user:
        print(f"✅ User exists, updating to admin role...")
        user.hashed_password = hashed_password
        user.role = "admin"
        user.account_status = "active"
        user.is_email_verified = True
    else:
        print(f"➕ Creating new admin user...")
        user = UserProfile(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role="admin",
            account_status="active",
            is_email_verified=True,
            phone=None,
            company=None,
            referral_code=referral_code,
            referred_by=None,
            subscription_status="active",
            total_referrals=0,
            l1_referrals=0,
            l2_referrals=0,
            l3_referrals=0,
            total_earnings=0.0,
            available_balance=0.0,
            total_withdrawn=0.0,
        )
        session.add(user)
    
    await session.commit()
    
    # Verify password
    is_valid = await verify_password(password, user.hashed_password)
    
    print(f"\n✅ Admin account created successfully!")
    print(f"\n📋 Login Details:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print(f"  Role: {user.role}")
    print(f"  Status: {user.account_status}")
    print(f"  Email Verified: {user.is_email_verified}")
    print(f"  Password Test: {'✅ PASS' if is_valid else '❌ FAIL'}")
    
    return user

async def create_anandraj_admin():
    """Create admin accounts"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Admin users to create
    admins = [
        {
            "email": "anandraj60094@gmail.com",
            "full_name": "Anand Raj",
            "referral_code": "ANAND_ADMIN",
            "password": "123456"
        },
        {
            "email": "biduahosting@gmail.com",
            "full_name": "Bidua Hosting Admin",
            "referral_code": "BIDUA_ADMIN",
            "password": "123456"
        }
    ]
    
    async with async_session() as session:
        try:
            print("=" * 60)
            print("Creating Admin Accounts")
            print("=" * 60)
            
            for admin in admins:
                await create_admin_user(
                    session,
                    email=admin["email"],
                    full_name=admin["full_name"],
                    referral_code=admin["referral_code"],
                    password=admin["password"]
                )
                print("-" * 60)
            
            print("\n🎉 All admin accounts created successfully!")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_anandraj_admin())
