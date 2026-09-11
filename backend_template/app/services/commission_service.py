from decimal import Decimal
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from fastapi import HTTPException

from app.models.payment import PaymentTransaction, ReferralCommissionRate, PaymentType
from app.models.referrals import ReferralEarning
from app.models.users import UserProfile
from app.models.order import Order


class CommissionService:
    """
    Handles referral commission distribution logic:
    - Fetches referral chain (L1, L2, L3)
    - Gets commission rates from configuration
    - Calculates and distributes commissions
    - Updates user balances
    - Creates ReferralEarning records
    """

    async def distribute_commission(
        self,
        db: AsyncSession,
        payment_transaction_id: int
    ) -> List[ReferralEarning]:
        """
        Distribute commission for a payment transaction
        
        Args:
            db: Database session
            payment_transaction_id: PaymentTransaction ID
        
        Returns:
            List of created ReferralEarning records
        """
        print(f"🔍 [CommissionService] Starting commission distribution for payment_transaction_id={payment_transaction_id}")
        
        # Get payment transaction
        result = await db.execute(
            select(PaymentTransaction).where(
                PaymentTransaction.id == payment_transaction_id
            )
        )
        payment_transaction = result.scalars().first()

        if not payment_transaction:
            print(f"❌ [CommissionService] Payment transaction not found: {payment_transaction_id}")
            raise HTTPException(
                status_code=404,
                detail="Payment transaction not found"
            )

        print(f"✅ [CommissionService] Found payment transaction: user_id={payment_transaction.user_id}, type={payment_transaction.payment_type.value}, order_id={payment_transaction.order_id}")

        # Check if commission distribution is required
        if not payment_transaction.requires_commission():
            print(f"⚠️  [CommissionService] Payment transaction does not require commission")
            return []
        
        # ✅ Commission केवल server purchase के लिए जहां enable_commission=True
        enable_commission = payment_transaction.payment_metadata and \
                          payment_transaction.payment_metadata.get('enable_commission', False)
        
        print(f"🔍 [CommissionService] enable_commission from metadata: {enable_commission}")
        
        if not enable_commission:
            # Mark as distributed but don't create earnings
            print(f"⚠️  [CommissionService] enable_commission is False, skipping commission distribution")
            payment_transaction.commission_distributed = True
            payment_transaction.commission_distributed_at = datetime.utcnow()
            await db.commit()
            return []

        # Check if already distributed (idempotency)
        if payment_transaction.commission_distributed:
            # Return existing earnings
            print(f"ℹ️  [CommissionService] Commission already distributed for this transaction")
            result = await db.execute(
                select(ReferralEarning).where(
                    ReferralEarning.order_id == payment_transaction.order_id
                )
            )
            return result.scalars().all()

        # Get the user who made the payment
        result = await db.execute(
            select(UserProfile).where(UserProfile.id == payment_transaction.user_id)
        )
        user = result.scalars().first()

        if not user:
            print(f"❌ [CommissionService] User not found: {payment_transaction.user_id}")
            return []
            
        print(f"🔍 [CommissionService] User found: email={user.email}, referred_by={user.referred_by}")

        if not user.referred_by:
            # No referrer, mark as distributed anyway
            print(f"⚠️  [CommissionService] User has no referrer (referred_by is NULL), skipping commission")
            payment_transaction.commission_distributed = True
            payment_transaction.commission_distributed_at = datetime.utcnow()
            await db.commit()
            return []

        # Get eligible amount for commission
        eligible_amount = Decimal(str(payment_transaction.get_commission_eligible_amount()))
        print(f"💰 [CommissionService] Eligible amount for commission: ₹{eligible_amount}")

        # Get billing cycle from payment transaction or order
        billing_cycle = payment_transaction.billing_cycle
        if not billing_cycle and payment_transaction.order:
            billing_cycle = payment_transaction.order.billing_cycle
        
        if not billing_cycle:
            print(f"⚠️  [CommissionService] No billing_cycle found, skipping commission")
            payment_transaction.commission_distributed = True
            payment_transaction.commission_distributed_at = datetime.utcnow()
            await db.commit()
            return []
        
        print(f"📅 [CommissionService] Billing cycle: {billing_cycle}")

        # Get referral chain
        referral_chain = await self._get_referral_chain(db, user)
        print(f"🔗 [CommissionService] Referral chain: {referral_chain}")

        # Get commission rates based on billing cycle
        commission_rates = await self._get_commission_rates(
            db,
            billing_cycle
        )
        print(f"📊 [CommissionService] Commission rates for {billing_cycle}: {commission_rates}")

        # Distribute to each level
        earnings = []
        for level, referrer_id in referral_chain.items():
            if referrer_id and level <= 3:  # Max 3 levels
                rate = commission_rates.get(level, Decimal('0.00'))
                if rate > 0:
                    print(f"💸 [CommissionService] Creating commission for Level {level}, referrer_id={referrer_id}, rate={rate}%")
                    earning = await self._create_earning(
                        db=db,
                        referrer_id=referrer_id,
                        referred_user_id=user.id,
                        order_id=payment_transaction.order_id,
                        level=level,
                        commission_rate=rate,
                        order_amount=eligible_amount,
                        payment_transaction=payment_transaction
                    )
                    earnings.append(earning)
                    print(f"✅ [CommissionService] Created earning: id={earning.id}, amount=₹{earning.commission_amount}")

        # Mark commission as distributed
        payment_transaction.commission_distributed = True
        payment_transaction.commission_distributed_at = datetime.utcnow()
        
        await db.commit()
        
        print(f"✅ [CommissionService] Commission distribution complete. Created {len(earnings)} earnings.")

        return earnings

    async def _get_referral_chain(
        self,
        db: AsyncSession,
        user: UserProfile
    ) -> Dict[int, Optional[int]]:
        """
        Get the referral chain for a user (L1, L2, L3)
        
        Returns:
            Dict mapping level to referrer user_id
        """
        return {
            1: user.referral_level_1 or user.referred_by,  # L1 is direct referrer
            2: user.referral_level_2,  # L2 is referrer's referrer
            3: user.referral_level_3,  # L3 is referrer's referrer's referrer
        }

    async def _get_commission_rates(
        self,
        db: AsyncSession,
        billing_cycle: str
    ) -> Dict[int, Decimal]:
        """
        Get active commission rates for a billing cycle
        
        Args:
            db: Database session
            billing_cycle: Billing cycle (monthly, quarterly, semi_annual, annual, biennial, triennial)
        
        Returns:
            Dict mapping level to commission percentage
        """
        result = await db.execute(
            select(ReferralCommissionRate).where(
                and_(
                    ReferralCommissionRate.billing_cycle == billing_cycle,
                    ReferralCommissionRate.is_active == True
                )
            ).order_by(ReferralCommissionRate.level)
        )
        rates = result.scalars().all()

        # Convert to dictionary
        rate_dict = {}
        for rate in rates:
            rate_dict[rate.level] = rate.commission_percent

        # Default rates if not configured based on billing cycle
        if not rate_dict:
            # Short-term plans: 7% total (L1: 5%, L2: 1%, L3: 1%)
            if billing_cycle in ['monthly', 'quarterly', 'semi_annual']:
                rate_dict = {1: Decimal('5.00'), 2: Decimal('1.00'), 3: Decimal('1.00')}
            # Long-term plans: 20% total (L1: 15%, L2: 3%, L3: 2%)
            else:  # annual, biennial, triennial
                rate_dict = {1: Decimal('15.00'), 2: Decimal('3.00'), 3: Decimal('2.00')}

        return rate_dict

    async def _create_earning(
        self,
        db: AsyncSession,
        referrer_id: int,
        referred_user_id: int,
        order_id: Optional[int],
        level: int,
        commission_rate: Decimal,
        order_amount: Decimal,
        payment_transaction: PaymentTransaction
    ) -> ReferralEarning:
        """
        Create a referral earning record and update user balance
        
        Args:
            db: Database session
            referrer_id: User receiving the commission
            referred_user_id: User who made the purchase
            order_id: Associated order ID
            level: Referral level (1, 2, or 3)
            commission_rate: Commission percentage
            order_amount: Order amount for commission calculation
            payment_transaction: Payment transaction
        
        Returns:
            Created ReferralEarning
        """
        # Calculate commission amount
        commission_amount = (order_amount * commission_rate / Decimal('100')).quantize(Decimal('0.01'))

        # Create earning record
        earning = ReferralEarning(
            user_id=referrer_id,
            referred_user_id=referred_user_id,
            order_id=order_id,
            level=level,
            commission_rate=commission_rate,
            order_amount=order_amount,
            commission_amount=commission_amount,
            status='approved',  # Automatically approve
            earned_at=datetime.utcnow()
        )

        db.add(earning)

        # Update referrer's balance
        result = await db.execute(
            select(UserProfile).where(UserProfile.id == referrer_id)
        )
        referrer = result.scalars().first()

        if referrer:
            referrer.total_earnings = (referrer.total_earnings or Decimal('0.00')) + commission_amount
            referrer.available_balance = (referrer.available_balance or Decimal('0.00')) + commission_amount
            
            # Update referral statistics
            if level == 1:
                referrer.l1_referrals = (referrer.l1_referrals or 0) + 1
            elif level == 2:
                referrer.l2_referrals = (referrer.l2_referrals or 0) + 1
            elif level == 3:
                referrer.l3_referrals = (referrer.l3_referrals or 0) + 1

        return earning

    async def seed_default_commission_rates(self, db: AsyncSession):
        """
        Seed default commission rates based on billing cycles
        This should be called during application startup or migration
        """
        # Check if billing cycle rates already exist
        result = await db.execute(
            select(ReferralCommissionRate).where(
                ReferralCommissionRate.billing_cycle.isnot(None)
            )
        )
        existing_rates = result.scalars().all()

        if existing_rates:
            return  # Already seeded

        # Commission structure based on billing terms
        billing_cycle_rates = []
        
        # Short-term plans: 7% total (L1: 5%, L2: 1%, L3: 1%)
        short_term_cycles = [
            ('monthly', 'Monthly'),
            ('quarterly', 'Quarterly'),
            ('semi_annual', 'Half-Yearly')
        ]
        
        for cycle_key, cycle_name in short_term_cycles:
            billing_cycle_rates.extend([
                {
                    'level': 1,
                    'billing_cycle': cycle_key,
                    'commission_percent': Decimal('5.00'),
                    'description': f'Level 1 - Direct referrer for {cycle_name} plan'
                },
                {
                    'level': 2,
                    'billing_cycle': cycle_key,
                    'commission_percent': Decimal('1.00'),
                    'description': f'Level 2 - Referrer of referrer for {cycle_name} plan'
                },
                {
                    'level': 3,
                    'billing_cycle': cycle_key,
                    'commission_percent': Decimal('1.00'),
                    'description': f'Level 3 - Third level referrer for {cycle_name} plan'
                },
            ])
        
        # Long-term plans: 20% total (L1: 15%, L2: 3%, L3: 2%)
        long_term_cycles = [
            ('annual', 'Yearly'),
            ('biennial', '2-Year'),
            ('triennial', '3-Year')
        ]
        
        for cycle_key, cycle_name in long_term_cycles:
            billing_cycle_rates.extend([
                {
                    'level': 1,
                    'billing_cycle': cycle_key,
                    'commission_percent': Decimal('15.00'),
                    'description': f'Level 1 - Direct referrer for {cycle_name} plan'
                },
                {
                    'level': 2,
                    'billing_cycle': cycle_key,
                    'commission_percent': Decimal('3.00'),
                    'description': f'Level 2 - Referrer of referrer for {cycle_name} plan'
                },
                {
                    'level': 3,
                    'billing_cycle': cycle_key,
                    'commission_percent': Decimal('2.00'),
                    'description': f'Level 3 - Third level referrer for {cycle_name} plan'
                },
            ])

        # Create all rates (18 total: 6 billing cycles × 3 levels)
        for rate_data in billing_cycle_rates:
            rate = ReferralCommissionRate(**rate_data)
            db.add(rate)

        await db.commit()
        print(f"✅ [CommissionService] Seeded {len(billing_cycle_rates)} commission rates based on billing cycles")
