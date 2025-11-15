"""
Seed addon pricing data
Run this to populate the addons table with current pricing
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.addon import Addon, AddonCategory, BillingType


async def seed_addons():
    """Seed all addon pricing"""
    async with AsyncSessionLocal() as db:
        try:
            addons_data = [
                # Storage & Bandwidth
                {
                    'name': 'Extra Storage',
                    'slug': 'extra-storage',
                    'category': AddonCategory.STORAGE,
                    'description': 'Additional NVMe SSD storage for your server',
                    'price': 2.00,  # ₹2/GB/month
                    'billing_type': BillingType.PER_UNIT,
                    'currency': 'INR',
                    'min_quantity': 0,
                    'max_quantity': 1000,
                    'default_quantity': 0,
                    'unit_label': 'GB',
                    'icon': 'HardDrive',
                    'sort_order': 1
                },
                {
                    'name': 'Extra Bandwidth',
                    'slug': 'extra-bandwidth',
                    'category': AddonCategory.BANDWIDTH,
                    'description': 'Additional monthly bandwidth allocation',
                    'price': 100.00,  # ₹100/TB/month
                    'billing_type': BillingType.PER_UNIT,
                    'currency': 'INR',
                    'min_quantity': 0,
                    'max_quantity': 100,
                    'default_quantity': 0,
                    'unit_label': 'TB',
                    'icon': 'Network',
                    'sort_order': 2
                },
                
                # IP Addresses
                {
                    'name': 'Additional IPv4 Address',
                    'slug': 'additional-ipv4',
                    'category': AddonCategory.IP_ADDRESS,
                    'description': 'Additional dedicated IPv4 address',
                    'price': 200.00,  # ₹200/month per IP
                    'billing_type': BillingType.PER_UNIT,
                    'currency': 'INR',
                    'min_quantity': 0,
                    'max_quantity': 10,
                    'default_quantity': 0,
                    'unit_label': 'IP',
                    'icon': 'Globe',
                    'sort_order': 3
                },
                
                # Plesk Control Panel
                {
                    'name': 'Plesk Web Admin',
                    'slug': 'plesk-admin',
                    'category': AddonCategory.CONTROL_PANEL,
                    'description': 'Plesk Web Admin Edition - 10 Domains',
                    'price': 950.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Server',
                    'sort_order': 10
                },
                {
                    'name': 'Plesk Web Pro',
                    'slug': 'plesk-pro',
                    'category': AddonCategory.CONTROL_PANEL,
                    'description': 'Plesk Web Pro Edition - 30 Domains',
                    'price': 1750.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Server',
                    'sort_order': 11
                },
                {
                    'name': 'Plesk Web Host',
                    'slug': 'plesk-host',
                    'category': AddonCategory.CONTROL_PANEL,
                    'description': 'Plesk Web Host Edition - Unlimited Domains',
                    'price': 2650.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Server',
                    'sort_order': 12
                },
                
                # Backup Storage
                {
                    'name': 'Backup Storage 100GB',
                    'slug': 'backup-100gb',
                    'category': AddonCategory.BACKUP,
                    'description': 'Cloud backup storage - 100GB',
                    'price': 750.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Database',
                    'sort_order': 20
                },
                {
                    'name': 'Backup Storage 200GB',
                    'slug': 'backup-200gb',
                    'category': AddonCategory.BACKUP,
                    'description': 'Cloud backup storage - 200GB',
                    'price': 1500.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Database',
                    'sort_order': 21
                },
                {
                    'name': 'Backup Storage 300GB',
                    'slug': 'backup-300gb',
                    'category': AddonCategory.BACKUP,
                    'description': 'Cloud backup storage - 300GB',
                    'price': 2250.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Database',
                    'sort_order': 22
                },
                {
                    'name': 'Backup Storage 500GB',
                    'slug': 'backup-500gb',
                    'category': AddonCategory.BACKUP,
                    'description': 'Cloud backup storage - 500GB',
                    'price': 3750.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Database',
                    'sort_order': 23
                },
                {
                    'name': 'Backup Storage 1000GB',
                    'slug': 'backup-1000gb',
                    'category': AddonCategory.BACKUP,
                    'description': 'Cloud backup storage - 1000GB',
                    'price': 7500.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Database',
                    'sort_order': 24
                },
                
                # SSL Certificates (Annual prices, will be divided by 12 for monthly)
                {
                    'name': 'Essential SSL (DV)',
                    'slug': 'ssl-essential',
                    'category': AddonCategory.SSL,
                    'description': '1 Website, Domain Validation SSL Certificate',
                    'price': 2700.00,  # Annual price
                    'billing_type': BillingType.ANNUAL,
                    'currency': 'INR',
                    'icon': 'Lock',
                    'sort_order': 30
                },
                {
                    'name': 'EssentialSSL Wildcard',
                    'slug': 'ssl-essential-wildcard',
                    'category': AddonCategory.SSL,
                    'description': 'Secure all subdomains with wildcard SSL',
                    'price': 13945.61,  # Annual price
                    'billing_type': BillingType.ANNUAL,
                    'currency': 'INR',
                    'icon': 'Lock',
                    'sort_order': 31
                },
                {
                    'name': 'Comodo PositiveSSL',
                    'slug': 'ssl-comodo',
                    'category': AddonCategory.SSL,
                    'description': '1 Website, DV SSL from Comodo',
                    'price': 2500.00,  # Annual price
                    'billing_type': BillingType.ANNUAL,
                    'currency': 'INR',
                    'icon': 'Lock',
                    'sort_order': 32
                },
                {
                    'name': 'Comodo Wildcard SSL',
                    'slug': 'ssl-comodo-wildcard',
                    'category': AddonCategory.SSL,
                    'description': 'Comodo wildcard for all subdomains',
                    'price': 13005.86,  # Annual price
                    'billing_type': BillingType.ANNUAL,
                    'currency': 'INR',
                    'icon': 'Lock',
                    'sort_order': 33
                },
                {
                    'name': 'RapidSSL Certificate',
                    'slug': 'ssl-rapid',
                    'category': AddonCategory.SSL,
                    'description': '1 Website, DV SSL - Quick issuance',
                    'price': 3000.00,  # Annual price
                    'billing_type': BillingType.ANNUAL,
                    'currency': 'INR',
                    'icon': 'Lock',
                    'sort_order': 34
                },
                {
                    'name': 'RapidSSL Wildcard',
                    'slug': 'ssl-rapid-wildcard',
                    'category': AddonCategory.SSL,
                    'description': 'RapidSSL wildcard for all subdomains',
                    'price': 16452.72,  # Annual price
                    'billing_type': BillingType.ANNUAL,
                    'currency': 'INR',
                    'icon': 'Lock',
                    'sort_order': 35
                },
                
                # Support Packages
                {
                    'name': 'BIDUA Hosting Support - Basic',
                    'slug': 'support-basic',
                    'category': AddonCategory.SUPPORT,
                    'description': 'Essential support with 24/7 ticket access',
                    'price': 2500.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Headphones',
                    'sort_order': 40
                },
                {
                    'name': 'BIDUA Hosting Support - Premium',
                    'slug': 'support-premium',
                    'category': AddonCategory.SUPPORT,
                    'description': 'Priority support with faster response time',
                    'price': 7500.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Headphones',
                    'sort_order': 41
                },
                
                # Managed Services
                {
                    'name': 'Managed Server - Basic',
                    'slug': 'managed-basic',
                    'category': AddonCategory.MANAGEMENT,
                    'description': 'Basic server management and monitoring',
                    'price': 2000.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Settings',
                    'sort_order': 50
                },
                {
                    'name': 'Managed Server - Premium',
                    'slug': 'managed-premium',
                    'category': AddonCategory.MANAGEMENT,
                    'description': 'Premium server management with proactive monitoring',
                    'price': 5000.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'Settings',
                    'sort_order': 51
                },
                
                # DDoS Protection
                {
                    'name': 'DDoS Protection - Advanced',
                    'slug': 'ddos-advanced',
                    'category': AddonCategory.SECURITY,
                    'description': 'Up to 100 Gbps DDoS protection',
                    'price': 1000.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'ShieldCheck',
                    'sort_order': 60
                },
                {
                    'name': 'DDoS Protection - Enterprise',
                    'slug': 'ddos-enterprise',
                    'category': AddonCategory.SECURITY,
                    'description': 'Unlimited DDoS protection with real-time mitigation',
                    'price': 3000.00,
                    'billing_type': BillingType.MONTHLY,
                    'currency': 'INR',
                    'icon': 'ShieldCheck',
                    'sort_order': 61
                },
            ]
            
            # Add all addons
            for addon_data in addons_data:
                addon = Addon(**addon_data)
                db.add(addon)
            
            await db.commit()
            print(f"✅ Successfully seeded {len(addons_data)} addons!")
            
        except Exception as e:
            print(f"❌ Error seeding addons: {e}")
            await db.rollback()


if __name__ == "__main__":
    print("🌱 Seeding addon pricing data...")
    asyncio.run(seed_addons())
