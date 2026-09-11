
import asyncio
import sys
import os
from collections import defaultdict
from decimal import Decimal
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.models.referrals import ReferralEarning

def get_fiscal_quarter(month):
    return (month - 1) // 3 + 1

def get_fiscal_half(month):
    return 1 if month <= 6 else 2

async def generate_report():
    print("Commission Distribution Report")
    print("=" * 85)
    
    async with AsyncSessionLocal() as session:
        # Fetch all earnings with their related orders eagerly loaded
        result = await session.execute(
            select(ReferralEarning).options(joinedload(ReferralEarning.order))
        )
        earnings = result.scalars().all()
        
        # Structure: { 'Period Type': { 'Period Key': { level: total_amount } } }
        report_data = {
            'Monthly': defaultdict(lambda: defaultdict(Decimal)),
            'Quarterly': defaultdict(lambda: defaultdict(Decimal)),
            'Half-Yearly': defaultdict(lambda: defaultdict(Decimal)),
            'Yearly': defaultdict(lambda: defaultdict(Decimal)),
        }
        
        # Structure for billing cycle breakdown
        billing_cycle_data = defaultdict(lambda: defaultdict(Decimal))
        
        for earning in earnings:
            dt = earning.earned_at
            if not dt:
                continue
                
            amount = earning.commission_amount
            level = earning.level
            
            # Formats for time periods
            month_key = dt.strftime("%Y-%m")
            quarter_key = f"{dt.year}-Q{get_fiscal_quarter(dt.month)}"
            half_key = f"{dt.year}-H{get_fiscal_half(dt.month)}"
            year_key = f"{dt.year}"
            
            # Aggregate by time periods
            report_data['Monthly'][month_key][level] += amount
            report_data['Quarterly'][quarter_key][level] += amount
            report_data['Half-Yearly'][half_key][level] += amount
            report_data['Yearly'][year_key][level] += amount
            
            # Aggregate by billing cycle
            if earning.order and earning.order.billing_cycle:
                billing_cycle = earning.order.billing_cycle
                billing_cycle_data[billing_cycle][level] += amount

        # Print Time Period Reports
        for period_type, data in report_data.items():
            print(f"\n--- {period_type} Report ---")
            print(f"{'Period':<15} | {'L1 Commission':<15} | {'L2 Commission':<15} | {'L3 Commission':<15} | {'Total':<15}")
            print("-" * 85)
            
            sorted_keys = sorted(data.keys())
            for key in sorted_keys:
                l1 = data[key].get(1, Decimal('0.00'))
                l2 = data[key].get(2, Decimal('0.00'))
                l3 = data[key].get(3, Decimal('0.00'))
                total = l1 + l2 + l3
                print(f"{key:<15} | ₹{l1:<14.2f} | ₹{l2:<14.2f} | ₹{l3:<14.2f} | ₹{total:<14.2f}")
        
        # Print Billing Cycle Report
        if billing_cycle_data:
            print(f"\n--- Billing Cycle Report ---")
            print(f"{'Billing Cycle':<20} | {'L1 Commission':<15} | {'L2 Commission':<15} | {'L3 Commission':<15} | {'Total':<15}")
            print("-" * 95)
            
            # Human-readable billing cycle names
            cycle_names = {
                'monthly': 'Monthly',
                'quarterly': 'Quarterly',
                'semi_annual': 'Half-Yearly',
                'annual': 'Yearly',
                'biennial': '2-Year',
                'triennial': '3-Year'
            }
            
            # Separate short-term and long-term
            short_term = ['monthly', 'quarterly', 'semi_annual']
            long_term = ['annual', 'biennial', 'triennial']
            
            # Print short-term totals
            short_term_total = Decimal('0.00')
            print("\nSHORT-TERM PLANS:")
            print("-" * 95)
            for cycle in short_term:
                if cycle in billing_cycle_data:
                    l1 = billing_cycle_data[cycle].get(1, Decimal('0.00'))
                    l2 = billing_cycle_data[cycle].get(2, Decimal('0.00'))
                    l3 = billing_cycle_data[cycle].get(3, Decimal('0.00'))
                    total = l1 + l2 + l3
                    short_term_total += total
                    display_name = cycle_names.get(cycle, cycle.title())
                    print(f"{display_name:<20} | ₹{l1:<14.2f} | ₹{l2:<14.2f} | ₹{l3:<14.2f} | ₹{total:<14.2f}")
            
            # Print long-term totals
            long_term_total = Decimal('0.00')
            print("\nLONG-TERM PLANS:")
            print("-" * 95)
            for cycle in long_term:
                if cycle in billing_cycle_data:
                    l1 = billing_cycle_data[cycle].get(1, Decimal('0.00'))
                    l2 = billing_cycle_data[cycle].get(2, Decimal('0.00'))
                    l3 = billing_cycle_data[cycle].get(3, Decimal('0.00'))
                    total = l1 + l2 + l3
                    long_term_total += total
                    display_name = cycle_names.get(cycle, cycle.title())
                    print(f"{display_name:<20} | ₹{l1:<14.2f} | ₹{l2:<14.2f} | ₹{l3:<14.2f} | ₹{total:<14.2f}")
            
            # Print totals
            print("\n" + "=" * 95)
            print(f"{'SUMMARY':<20} | {'L1 Total':<15} | {'L2 Total':<15} | {'L3 Total':<15} | {'Grand Total':<15}")
            print("-" * 95)
            print(f"{'Short-Term Plans':<20} | {' ':<15} | {' ':<15} | {' ':<15} | ₹{short_term_total:<14.2f}")
            print(f"{'Long-Term Plans':<20} | {' ':<15} | {' ':<15} | {' ':<15} | ₹{long_term_total:<14.2f}")
            print(f"{'Total Commissions':<20} | {' ':<15} | {' ':<15} | {' ':<15} | ₹{short_term_total + long_term_total:<14.2f}")

if __name__ == "__main__":
    asyncio.run(generate_report())
