
import asyncio
import sys
import os
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.models.payment import ReferralCommissionRate, PaymentType

async def show_commission_rates():
    print("Active Commission Rates (By Billing Cycle)")
    print("=" * 75)
    
    async with AsyncSessionLocal() as session:
        # Fetch rates by billing cycle
        result = await session.execute(
            select(ReferralCommissionRate).where(
                and_(
                    ReferralCommissionRate.is_active == True,
                    ReferralCommissionRate.billing_cycle.isnot(None)
                )
            ).order_by(
                ReferralCommissionRate.billing_cycle,
                ReferralCommissionRate.level
            )
        )
        rates = result.scalars().all()
        
        if not rates:
            print("No active commission rates found in the database.")
            print("Using defaults from code:")
            print("\n" + "=" * 75)
            print("SHORT-TERM PLANS (7% total):")
            print("-" * 75)
            print(f"{'Billing Cycle':<20} | {'Level':<10} | {'Commission %':<15}")
            print("-" * 75)
            for cycle in [('monthly', 'Monthly'), ('quarterly', 'Quarterly'), ('semi_annual', 'Half-Yearly')]:
                print(f"{cycle[1]:<20} | {'L1':<10} | {'5.00%':<15}")
                print(f"{cycle[1]:<20} | {'L2':<10} | {'1.00%':<15}")
                print(f"{cycle[1]:<20} | {'L3':<10} | {'1.00%':<15}")
            
            print("\n" + "=" * 75)
            print("LONG-TERM PLANS (20% total):")
            print("-" * 75)
            print(f"{'Billing Cycle':<20} | {'Level':<10} | {'Commission %':<15}")
            print("-" * 75)
            for cycle in [('annual', 'Yearly'), ('biennial', '2-Year'), ('triennial', '3-Year')]:
                print(f"{cycle[1]:<20} | {'L1':<10} | {'15.00%':<15}")
                print(f"{cycle[1]:<20} | {'L2':<10} | {'3.00%':<15}")
                print(f"{cycle[1]:<20} | {'L3':<10} | {'2.00%':<15}")
            return

        # Display header
        print(f"{'Billing Cycle':<20} | {'Level':<10} | {'Commission %':<15} | {'Description'}")
        print("-" * 100)
        
        # Group by billing cycle
        current_cycle = None
        cycle_names = {
            'monthly': 'Monthly (Short-Term)',
            'quarterly': 'Quarterly (Short-Term)',
            'semi_annual': 'Half-Yearly (Short-Term)',
            'annual': 'Yearly (Long-Term)',
            'biennial': '2-Year (Long-Term)',
            'triennial': '3-Year (Long-Term)'
        }
        
        for rate in rates:
            cycle = rate.billing_cycle or 'N/A'
            display_cycle = cycle_names.get(cycle, cycle.title())
            
            # Add separator for new billing cycle
            if current_cycle != cycle and current_cycle is not None:
                print("-" * 100)
            
            current_cycle = cycle
            desc = rate.description or "-"
            print(f"{display_cycle:<20} | {f'L{rate.level}':<10} | {rate.commission_percent:<14.2f}% | {desc}")

if __name__ == "__main__":
    asyncio.run(show_commission_rates())
