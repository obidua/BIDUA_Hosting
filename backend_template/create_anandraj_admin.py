#!/usr/bin/env python3
"""
Create admin account for anandraj60094@gmail.com
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

async def create_anandraj_admin():
    """Create admin account for anandraj60094@gmail.com"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            admin_email = "anandraj60094@gmail.com"
            admin_password = "123456"  # Change this to a secure password
            
            print(f"\n🔐 Creating admin account for {admin_email}")
            
            # Hash password
            hashed_password = await get_password_hash(admin_password)
            
            # Check if user exists
            result = await session.execute(
                select(UserProfile).where(UserProfile.email == admin_email)
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
                    email=admin_email,
                    hashed_password=hashed_password,
                    full_name="Anand Raj",
                    role="admin",
                    account_status="active",
                    is_email_verified=True,
                    phone=None,
                    company=None,
                    referral_code="ANAND_ADMIN",
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
            is_valid = await verify_password(admin_password, user.hashed_password)
            
            print(f"\n✅ Admin account created successfully!")
            print(f"\n📋 Login Details:")
            print(f"  Email: {admin_email}")
            print(f"  Password: {admin_password}")
            print(f"  Role: {user.role}")
            print(f"  Status: {user.account_status}")
            print(f"  Email Verified: {user.is_email_verified}")
            print(f"  Password Test: {'✅ PASS' if is_valid else '❌ FAIL'}")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_anandraj_admin())
