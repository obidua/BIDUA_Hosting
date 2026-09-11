"""
Seed dedicated server plans to database
This adds dedicated server hosting plans with various configurations
"""
import asyncio
import asyncpg
import json
from app.core.config import settings

async def seed_dedicated_servers():
    database_url = settings.DATABASE_URL
    conn = await asyncpg.connect(database_url.replace("postgresql+asyncpg", "postgresql"))
    
    print("🔄 Seeding dedicated server plans...")
    
    # Dedicated Server Plans
    dedicated_plans = [
        {
            'name': 'DS-E3-16GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 4,
            'ram_gb': 16,
            'storage_gb': 1000,
            'bandwidth_gb': 10000,
            'base_price': 8999,
            'monthly_price': 8999,
            'quarterly_price': 26997,
            'annual_price': 107988,
            'biennial_price': 215976,
            'triennial_price': 323964,
            'is_featured': False,
            'processor': 'Intel Xeon E3-1230v6',
            'disk_type': '2x 1TB HDD SATA',
        },
        {
            'name': 'DS-E3-32GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 4,
            'ram_gb': 32,
            'storage_gb': 2000,
            'bandwidth_gb': 20000,
            'base_price': 11999,
            'monthly_price': 11999,
            'quarterly_price': 35997,
            'annual_price': 143988,
            'biennial_price': 287976,
            'triennial_price': 431964,
            'is_featured': True,
            'processor': 'Intel Xeon E3-1270v6',
            'disk_type': '2x 2TB HDD SATA',
        },
        {
            'name': 'DS-E5-64GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 8,
            'ram_gb': 64,
            'storage_gb': 2000,
            'bandwidth_gb': 30000,
            'base_price': 17999,
            'monthly_price': 17999,
            'quarterly_price': 53997,
            'annual_price': 215988,
            'biennial_price': 431976,
            'triennial_price': 647964,
            'is_featured': True,
            'processor': 'Intel Xeon E5-2630v4',
            'disk_type': '2x 2TB SSD SATA',
        },
        {
            'name': 'DS-E5-128GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 12,
            'ram_gb': 128,
            'storage_gb': 4000,
            'bandwidth_gb': 50000,
            'base_price': 25999,
            'monthly_price': 25999,
            'quarterly_price': 77997,
            'annual_price': 311988,
            'biennial_price': 623976,
            'triennial_price': 935964,
            'is_featured': False,
            'processor': 'Intel Xeon E5-2650v4',
            'disk_type': '4x 2TB SSD SATA',
        },
        {
            'name': 'DS-GOLD-128GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 16,
            'ram_gb': 128,
            'storage_gb': 4000,
            'bandwidth_gb': 50000,
            'base_price': 32999,
            'monthly_price': 32999,
            'quarterly_price': 98997,
            'annual_price': 395988,
            'biennial_price': 791976,
            'triennial_price': 1187964,
            'is_featured': True,
            'processor': 'Intel Xeon Gold 5218',
            'disk_type': '4x 2TB NVMe SSD',
        },
        {
            'name': 'DS-GOLD-256GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 20,
            'ram_gb': 256,
            'storage_gb': 8000,
            'bandwidth_gb': 100000,
            'base_price': 48999,
            'monthly_price': 48999,
            'quarterly_price': 146997,
            'annual_price': 587988,
            'biennial_price': 1175976,
            'triennial_price': 1763964,
            'is_featured': False,
            'processor': 'Intel Xeon Gold 6230',
            'disk_type': '4x 4TB NVMe SSD',
        },
        {
            'name': 'DS-PLATINUM-512GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 32,
            'ram_gb': 512,
            'storage_gb': 16000,
            'bandwidth_gb': 200000,
            'base_price': 89999,
            'monthly_price': 89999,
            'quarterly_price': 269997,
            'annual_price': 1079988,
            'biennial_price': 2159976,
            'triennial_price': 3239964,
            'is_featured': True,
            'processor': 'Intel Xeon Platinum 8280',
            'disk_type': '8x 4TB NVMe SSD',
        },
        {
            'name': 'DS-AMD-EPYC-128GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 16,
            'ram_gb': 128,
            'storage_gb': 4000,
            'bandwidth_gb': 50000,
            'base_price': 29999,
            'monthly_price': 29999,
            'quarterly_price': 89997,
            'annual_price': 359988,
            'biennial_price': 719976,
            'triennial_price': 1079964,
            'is_featured': False,
            'processor': 'AMD EPYC 7402P',
            'disk_type': '4x 2TB NVMe SSD',
        },
        {
            'name': 'DS-AMD-EPYC-256GB',
            'plan_type': 'dedicated_server',
            'cpu_cores': 24,
            'ram_gb': 256,
            'storage_gb': 8000,
            'bandwidth_gb': 100000,
            'base_price': 44999,
            'monthly_price': 44999,
            'quarterly_price': 134997,
            'annual_price': 539988,
            'biennial_price': 1079976,
            'triennial_price': 1619964,
            'is_featured': False,
            'processor': 'AMD EPYC 7542',
            'disk_type': '4x 4TB NVMe SSD',
        },
    ]
    
    inserted_count = 0
    
    # Insert all dedicated server plans
    for plan in dedicated_plans:
        # Check if plan already exists
        exists = await conn.fetchval(
            "SELECT EXISTS(SELECT 1 FROM hosting_plans WHERE name = $1)",
            plan['name']
        )
        
        if exists:
            print(f"  ⚠️  Plan '{plan['name']}' already exists, skipping...")
            continue
        
        features = [
            f"{plan['cpu_cores']} Dedicated CPU Cores",
            f"{plan['ram_gb']}GB ECC RAM",
            f"{plan['storage_gb']}GB Storage",
            f"{plan['bandwidth_gb'] // 1000}TB Bandwidth",
            plan['disk_type'],
            plan['processor'],
            "Dedicated IPv4 Address",
            "IPMI/KVM Access",
            "Full Root Access",
            "Hardware RAID",
            "24/7 Support",
            "DDoS Protection"
        ]
        
        await conn.execute('''
            INSERT INTO hosting_plans (
                name, plan_type, cpu_cores, ram_gb, storage_gb, bandwidth_gb,
                base_price, monthly_price, quarterly_price, annual_price, 
                biennial_price, triennial_price, is_active, is_featured, features,
                description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16)
        ''', 
            plan['name'],
            plan['plan_type'],
            plan['cpu_cores'],
            plan['ram_gb'],
            plan['storage_gb'],
            plan['bandwidth_gb'],
            plan['base_price'],
            plan['monthly_price'],
            plan['quarterly_price'],
            plan['annual_price'],
            plan['biennial_price'],
            plan['triennial_price'],
            True,  # is_active
            plan['is_featured'],
            json.dumps(features),
            f"{plan['name']} - Dedicated Server ({plan['processor']})"
        )
        
        print(f"  ✅ Created: {plan['name']} - ₹{plan['monthly_price']}/month")
        inserted_count += 1
    
    print(f"\n✅ Inserted {inserted_count} dedicated server plans")
    
    # Verify data
    total_count = await conn.fetchval("SELECT COUNT(*) FROM hosting_plans")
    dedicated_count = await conn.fetchval("SELECT COUNT(*) FROM hosting_plans WHERE plan_type = 'dedicated_server'")
    
    print(f"\n📊 Database Summary:")
    print(f"   Total plans: {total_count}")
    print(f"   Dedicated servers: {dedicated_count}")
    
    # Show all dedicated server plans
    dedicated = await conn.fetch(
        "SELECT name, cpu_cores, ram_gb, monthly_price FROM hosting_plans WHERE plan_type = 'dedicated_server' ORDER BY monthly_price"
    )
    
    if dedicated:
        print("\n📋 Dedicated Server Plans:")
        for row in dedicated:
            print(f"  - {row['name']}: {row['cpu_cores']} cores, {row['ram_gb']}GB RAM - ₹{row['monthly_price']}/month")
    
    await conn.close()
    print("\n✅ Dedicated server seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_dedicated_servers())
