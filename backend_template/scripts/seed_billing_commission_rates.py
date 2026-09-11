#!/usr/bin/env python3
"""
Seed commission rates based on billing cycles
This script populates the referral_commission_rates table with the new billing cycle structure
"""

import asyncio
import sys
import os

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.services.commission_service import CommissionService


async def seed_billing_commission_rates():
    """Seed commission rates based on billing cycles"""
    print("=" * 60)
    print("Seeding Commission Rates Based on Billing Cycles")
    print("=" * 60)
    
    async with AsyncSessionLocal() as session:
        service = CommissionService()
        
        try:
            await service.seed_default_commission_rates(session)
            print("\n✅ Commission rates seeded successfully!")
            print("\nCommission Structure:")
            print("-" * 60)
            print("SHORT-TERM PLANS (7% total):")
            print("  - Monthly:     L1=5%, L2=1%, L3=1%")
            print("  - Quarterly:   L1=5%, L2=1%, L3=1%")
            print("  - Half-Yearly: L1=5%, L2=1%, L3=1%")
            print("\nLONG-TERM PLANS (20% total):")
            print("  - Yearly:  L1=15%, L2=3%, L3=2%")
            print("  - 2-Year:  L1=15%, L2=3%, L3=2%")
            print("  - 3-Year:  L1=15%, L2=3%, L3=2%")
            print("-" * 60)
            
        except Exception as e:
            print(f"❌ Error seeding commission rates: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_billing_commission_rates())
