# # from sqlalchemy import Column, String, Integer, DateTime, Boolean, Numeric, ForeignKey, Text, JSON
# # from sqlalchemy.sql import func
# # from sqlalchemy.orm import relationship
# # from app.core.database import Base

# # class UserProfile(Base):
# #     __tablename__ = "users_profiles"
    
# #     id = Column(Integer, primary_key=True, autoincrement=True)
# #     email = Column(String(255), unique=True, nullable=False, index=True)
# #     full_name = Column(String(255), nullable=False)
# #     role = Column(String(50), nullable=False, default='customer')
# #     account_status = Column(String(50), nullable=False, default='active')
    
# #     # Authentication
# #     hashed_password = Column(String(255), nullable=False)
    
# #     # Referral fields
# #     referral_code = Column(String(50), unique=True, index=True)
# #     referred_by = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
# #     referral_level_1 = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
# #     referral_level_2 = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
# #     referral_level_3 = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
    
# #     # Referral statistics
# #     total_referrals = Column(Integer, default=0)
# #     l1_referrals = Column(Integer, default=0)
# #     l2_referrals = Column(Integer, default=0)
# #     l3_referrals = Column(Integer, default=0)
# #     total_earnings = Column(Numeric(10, 2), default=0.00)
# #     available_balance = Column(Numeric(10, 2), default=0.00)
# #     total_withdrawn = Column(Numeric(10, 2), default=0.00)
    
# #     # Additional profile fields
# #     phone = Column(String(20), nullable=True)
# #     company = Column(String(255), nullable=True)
    
# #     # Timestamps
# #     created_at = Column(DateTime(timezone=True), server_default=func.now())
# #     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
# #     # Relationships
# #     servers = relationship("Server", back_populates="user")
# #     orders = relationship("Order", back_populates="user")
# #     invoices = relationship("Invoice", back_populates="user")
# #     support_tickets = relationship("SupportTicket", back_populates="user")
# #     referral_payouts = relationship("ReferralPayout", back_populates="user")
# #     referral_earnings = relationship("ReferralEarning", back_populates="user")
    
# #     # Self-referential relationships for referral hierarchy
# #     referrer = relationship("UserProfile", foreign_keys=[referred_by], remote_side=[id], backref="direct_referrals")
# #     level1_referrer = relationship("UserProfile", foreign_keys=[referral_level_1], remote_side=[id])
# #     level2_referrer = relationship("UserProfile", foreign_keys=[referral_level_2], remote_side=[id])
# #     level3_referrer = relationship("UserProfile", foreign_keys=[referral_level_3], remote_side=[id])

# #      # user who created the ticket
# #     support_tickets = relationship(
# #         "SupportTicket",
# #         back_populates="user",
# #         foreign_keys="[SupportTicket.user_id]"  # 👈 specify FK here
# #     )

# #     # user who is assigned to handle tickets
# #     assigned_tickets = relationship(
# #         "SupportTicket",
# #         back_populates="assigned_to",
# #         foreign_keys="[SupportTicket.assigned_to_id]"  # 👈 specify FK here
# #     )





# # from sqlalchemy import (
# #     Column, String, Integer, DateTime, Numeric, ForeignKey
# # )
# # from sqlalchemy.sql import func
# # from sqlalchemy.orm import relationship
# # from app.core.database import Base


# # class UserProfile(Base):
# #     __tablename__ = "users_profiles"
    
# #     id = Column(Integer, primary_key=True, autoincrement=True)
# #     email = Column(String(255), unique=True, nullable=False, index=True)
# #     full_name = Column(String(255), nullable=False)
# #     role = Column(String(50), nullable=False, default='customer')
# #     account_status = Column(String(50), nullable=False, default='active')
    
# #     # Authentication
# #     hashed_password = Column(String(255), nullable=False)
    
# #     # Referral fields
# #     referral_code = Column(String(50), unique=True, index=True)
# #     referred_by = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
# #     referral_level_1 = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
# #     referral_level_2 = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
# #     referral_level_3 = Column(Integer, ForeignKey('users_profiles.id'), nullable=True)
    
# #     # Referral statistics
# #     total_referrals = Column(Integer, default=0)
# #     l1_referrals = Column(Integer, default=0)
# #     l2_referrals = Column(Integer, default=0)
# #     l3_referrals = Column(Integer, default=0)
# #     total_earnings = Column(Numeric(10, 2), default=0.00)
# #     available_balance = Column(Numeric(10, 2), default=0.00)
# #     total_withdrawn = Column(Numeric(10, 2), default=0.00)
    
# #     # Additional profile fields
# #     phone = Column(String(20), nullable=True)
# #     company = Column(String(255), nullable=True)
    
# #     # Timestamps
# #     created_at = Column(DateTime(timezone=True), server_default=func.now())
# #     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
# #     # ----------------------------------------------------
# #     # Relationships
# #     # ----------------------------------------------------

# #   # Relationship with PaymentMethod (defined in billing.py)
# #     payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete")


# #     servers = relationship("Server", back_populates="user")
# #     orders = relationship("Order", back_populates="user")
# #     invoices = relationship("Invoice", back_populates="user")

# #     # Referral system
# #     referral_payouts = relationship(
# #         "ReferralPayout",
# #         back_populates="user",
# #         foreign_keys="[ReferralPayout.user_id]"
# #     )

# #     referral_earnings = relationship(
# #         "ReferralEarning",
# #         back_populates="user",
# #         foreign_keys="[ReferralEarning.user_id]"
# #     )

# #     referrals_made = relationship(
# #         "ReferralEarning",
# #         back_populates="referred_user",
# #         foreign_keys="[ReferralEarning.referred_user_id]"
# #     )

# #     # Self-referential relationships for referral hierarchy
# #     referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referred_by],
# #         remote_side=[id],
# #         backref="direct_referrals"
# #     )
# #     level1_referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referral_level_1],
# #         remote_side=[id]
# #     )
# #     level2_referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referral_level_2],
# #         remote_side=[id]
# #     )
# #     level3_referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referral_level_3],
# #         remote_side=[id]
# #     )

# #     # ----------------------------------------------------
# #     # Support Ticket relationships
# #     # ----------------------------------------------------
# #     support_tickets = relationship(
# #         "SupportTicket",
# #         back_populates="user",
# #         foreign_keys="[SupportTicket.user_id]"
# #     )

# #     assigned_tickets = relationship(
# #         "SupportTicket",
# #         back_populates="assigned_to_user",
# #         foreign_keys="[SupportTicket.assigned_to]"
# #     )





# # from sqlalchemy import (
# #     Column, String, Integer, DateTime, Numeric, ForeignKey
# # )
# # from sqlalchemy.sql import func
# # from sqlalchemy.orm import relationship
# # from app.core.database import Base


# # class UserProfile(Base):
# #     __tablename__ = "users_profiles"

# #     id = Column(Integer, primary_key=True, autoincrement=True)
# #     email = Column(String(255), unique=True, nullable=False, index=True)
# #     full_name = Column(String(255), nullable=False)
# #     role = Column(String(50), nullable=False, default="customer")
# #     account_status = Column(String(50), nullable=False, default="active")

# #     # Authentication
# #     hashed_password = Column(String(255), nullable=False)

# #     # Referral fields
# #     referral_code = Column(String(50), unique=True, index=True)
# #     referred_by = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
# #     referral_level_1 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
# #     referral_level_2 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
# #     referral_level_3 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)

# #     # Referral statistics
# #     total_referrals = Column(Integer, default=0)
# #     l1_referrals = Column(Integer, default=0)
# #     l2_referrals = Column(Integer, default=0)
# #     l3_referrals = Column(Integer, default=0)
# #     total_earnings = Column(Numeric(10, 2), default=0.00)
# #     available_balance = Column(Numeric(10, 2), default=0.00)
# #     total_withdrawn = Column(Numeric(10, 2), default=0.00)

# #     # Additional profile fields
# #     phone = Column(String(20), nullable=True)
# #     company = Column(String(255), nullable=True)

# #     # Timestamps
# #     created_at = Column(DateTime(timezone=True), server_default=func.now())
# #     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# #     # ----------------------------------------------------
# #     # Relationships
# #     # ----------------------------------------------------
# #     # Billing Relationship
# #     payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")

# #     billing_settings = relationship("BillingSettings", back_populates="user")
# #     # Other module relationships (Server, Order, Invoice, etc.)
# #     servers = relationship("Server", back_populates="user")
# #     orders = relationship("Order", back_populates="user")
# #     invoices = relationship("Invoice", back_populates="user")

# #     # Referral system relationships
# #     referral_payouts = relationship(
# #         "ReferralPayout",
# #         back_populates="user",
# #         foreign_keys="[ReferralPayout.user_id]"
# #     )

# #     referral_earnings = relationship(
# #         "ReferralEarning",
# #         back_populates="user",
# #         foreign_keys="[ReferralEarning.user_id]"
# #     )

# #     referrals_made = relationship(
# #         "ReferralEarning",
# #         back_populates="referred_user",
# #         foreign_keys="[ReferralEarning.referred_user_id]"
# #     )

# #     # Self-referential hierarchy
# #     referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referred_by],
# #         remote_side=[id],
# #         backref="direct_referrals"
# #     )
# #     level1_referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referral_level_1],
# #         remote_side=[id]
# #     )
# #     level2_referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referral_level_2],
# #         remote_side=[id]
# #     )
# #     level3_referrer = relationship(
# #         "UserProfile",
# #         foreign_keys=[referral_level_3],
# #         remote_side=[id]
# #     )

# #     # Support Tickets
# #     support_tickets = relationship(
# #         "SupportTicket",
# #         back_populates="user",
# #         foreign_keys="[SupportTicket.user_id]"
# #     )
# #     assigned_tickets = relationship(
# #         "SupportTicket",
# #         back_populates="assigned_to_user",
# #         foreign_keys="[SupportTicket.assigned_to]"
# #     )

# #     def __repr__(self):
# #         return f"<UserProfile(id={self.id}, email='{self.email}', role='{self.role}')>"



# from sqlalchemy import Column, String, Integer, DateTime, Numeric, ForeignKey, Index
# from sqlalchemy.sql import func
# from sqlalchemy.orm import relationship
# from app.core.database import Base


# class UserProfile(Base):
#     __tablename__ = "users_profiles"

#     # ----------------------------------------------------
#     # Basic Details
#     # ----------------------------------------------------
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     email = Column(String(255), unique=True, nullable=False, index=True)
#     full_name = Column(String(255), nullable=False)
#     role = Column(String(50), nullable=False, default="customer")       # customer, admin, employee, etc.
#     account_status = Column(String(50), nullable=False, default="active")  # active, suspended, etc.

#     # Authentication
#     hashed_password = Column(String(255), nullable=False)

#     # ----------------------------------------------------
#     # Referral System
#     # ----------------------------------------------------
#     referral_code = Column(String(50), unique=True, index=True)
#     referred_by = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
#     referral_level_1 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
#     referral_level_2 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
#     referral_level_3 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)

#     # Referral statistics
#     total_referrals = Column(Integer, default=0)
#     l1_referrals = Column(Integer, default=0)
#     l2_referrals = Column(Integer, default=0)
#     l3_referrals = Column(Integer, default=0)

#     total_earnings = Column(Numeric(10, 2), default=0.00)
#     available_balance = Column(Numeric(10, 2), default=0.00)
#     total_withdrawn = Column(Numeric(10, 2), default=0.00)

#     # ----------------------------------------------------
#     # Contact & Profile Info
#     # ----------------------------------------------------
#     phone = Column(String(20), nullable=True)
#     company = Column(String(255), nullable=True)

#         # 🔹 New fields
#     subscription_status = Column(String, default="inactive")
#     subscription_start = Column(DateTime, nullable=True)
#     subscription_end = Column(DateTime, nullable=True)

#     # ----------------------------------------------------
#     # Timestamp Fields
#     # ----------------------------------------------------
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

#     # ----------------------------------------------------
#     # Relationships
#     # ----------------------------------------------------

#     # Billing Relationships
#     payment_methods = relationship(
#         "PaymentMethod",
#         back_populates="user",
#         cascade="all, delete-orphan"
#     )

#     billing_settings = relationship(
#         "BillingSettings",
#         back_populates="user",
#         uselist=False  # each user has one billing settings record
#     )

#     # Other Modules
#     servers = relationship("Server", back_populates="user")
#     orders = relationship("Order", back_populates="user")
#     invoices = relationship("Invoice", back_populates="user")

#     # Referral Relationships

#     referral_payouts = relationship(
#         "ReferralPayout",
#         back_populates="user",
#         foreign_keys="[ReferralPayout.user_id]",
#         lazy="select",  # 🔹 Better performance
#         cascade="all, delete-orphan"
#     )
    
#     referral_earnings = relationship(
#         "ReferralEarning",
#         back_populates="user", 
#         foreign_keys="[ReferralEarning.user_id]",
#         cascade="all, delete-orphan"  # 🔹 Add this
#     )

#     referrals_made = relationship(
#         "ReferralEarning",
#         back_populates="referred_user",
#         foreign_keys="[ReferralEarning.referred_user_id]"
#     )

#     # Self-Referential Hierarchy (Multi-Level Referrals)
#     referrer = relationship(
#         "UserProfile",
#         foreign_keys=[referred_by],
#         remote_side=[id],
#         backref="direct_referrals"
#     )

#     level1_referrer = relationship(
#         "UserProfile",
#         foreign_keys=[referral_level_1],
#         remote_side=[id]
#     )

#     level2_referrer = relationship(
#         "UserProfile",
#         foreign_keys=[referral_level_2],
#         remote_side=[id]
#     )

#     level3_referrer = relationship(
#         "UserProfile",
#         foreign_keys=[referral_level_3],
#         remote_side=[id]
#     )


#     # 🔹 ADD this relationship in UserProfile
#     user_settings = relationship(
#         "UserSettings",
#         back_populates="user",
#         foreign_keys="[UserSettings.user_id]",
#         uselist=False,  # One-to-one relationship
#         cascade="all, delete-orphan"
#     )

#     # Support Ticket Relationships
#     created_tickets = relationship(
#         "SupportTicket",
#         back_populates="user",
#         foreign_keys="[SupportTicket.user_id]"
#     )

#     assigned_tickets = relationship(
#         "SupportTicket",
#         back_populates="assigned_to_user",
#         foreign_keys="[SupportTicket.assigned_to]"
#     )

#     # ----------------------------------------------------
#     # Representation
#     # ----------------------------------------------------
#     def __repr__(self):
#         return f"<UserProfile(id={self.id}, email='{self.email}', role='{self.role}')>"

#  # ... your existing columns ...
    
#     # 🔹 Indexes for better performance
#     __table_args__ = (
#         Index('idx_user_email', 'email'),
#         Index('idx_user_referral_code', 'referral_code'),
#         Index('idx_user_status_role', 'account_status', 'role'),
#         Index('idx_user_referred_by', 'referred_by'),
#         Index('idx_user_created_at', 'created_at'),
#         Index('idx_user_subscription', 'subscription_status', 'subscription_end'),
#         Index('idx_user_balance_status', 'available_balance', 'account_status'),  # 🔹 New
#     )





from sqlalchemy import Column, String, Integer, DateTime, Numeric, ForeignKey, Index, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserProfile(Base):
    __tablename__ = "users_profiles"

    # ----------------------------------------------------
    # Basic Details
    # ----------------------------------------------------
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="customer")
    account_status = Column(String(50), nullable=False, default="active")

    # Authentication
    hashed_password = Column(String(255), nullable=False)

    # ----------------------------------------------------
    # Referral System
    # ----------------------------------------------------
    referral_code = Column(String(50), unique=True, index=True)
    referred_by = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
    referral_level_1 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
    referral_level_2 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)
    referral_level_3 = Column(Integer, ForeignKey("users_profiles.id"), nullable=True)

    # Referral statistics
    total_referrals = Column(Integer, default=0)
    l1_referrals = Column(Integer, default=0)
    l2_referrals = Column(Integer, default=0)
    l3_referrals = Column(Integer, default=0)

    total_earnings = Column(Numeric(10, 2), default=0.00)
    available_balance = Column(Numeric(10, 2), default=0.00)
    total_withdrawn = Column(Numeric(10, 2), default=0.00)

    # ----------------------------------------------------
    # Contact & Profile Info
    # ----------------------------------------------------
    phone = Column(String(20), nullable=True)
    company = Column(String(255), nullable=True)

    # 🔹 Subscription & Payment fields
    subscription_status = Column(String, default="inactive")
    subscription_start = Column(DateTime, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    
    # Activation tracking
    activation_type = Column(String(20), default="direct", nullable=False)  # direct or referral
    discount_percent = Column(Numeric(5, 2), default=0.00)  # User-specific discount percentage

    # Email verification fields
    is_email_verified = Column(Boolean, default=False, nullable=False)
    email_verification_token = Column(String(255), nullable=True, index=True)  # Legacy - kept for backward compatibility
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)  # Legacy
    
    # OTP verification fields (primary method)
    email_otp = Column(String(6), nullable=True)
    email_otp_expires = Column(DateTime(timezone=True), nullable=True)
    email_otp_attempts = Column(Integer, default=0)  # Track failed attempts (max 5)
    
    # Password reset fields (now uses OTP)
    password_reset_token = Column(String(255), nullable=True, index=True)  # Legacy
    password_reset_otp = Column(String(6), nullable=True)
    password_reset_otp_expires = Column(DateTime(timezone=True), nullable=True)
    password_reset_token_expires = Column(DateTime(timezone=True), nullable=True)  # Legacy

    # ----------------------------------------------------
    # Timestamp Fields
    # ----------------------------------------------------
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ----------------------------------------------------
    # Relationships
    # ----------------------------------------------------

    # Billing Relationships
    payment_methods = relationship(
        "PaymentMethod",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    billing_settings = relationship(
        "BillingSettings",
        back_populates="user",
        uselist=False
    )

    # Other Modules
    servers = relationship("Server", back_populates="user")
    orders = relationship("Order", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")

    # Payment Transactions
    payment_transactions = relationship(
        "PaymentTransaction",
        back_populates="user",
        foreign_keys="[PaymentTransaction.user_id]",
        cascade="all, delete-orphan"
    )

    # Referral Relationships
    referral_payouts = relationship(
        "ReferralPayout",
        back_populates="user",
        foreign_keys="[ReferralPayout.user_id]",
        lazy="select",
        cascade="all, delete-orphan"
    )
    
    referral_earnings = relationship(
        "ReferralEarning",
        back_populates="user", 
        foreign_keys="[ReferralEarning.user_id]",
        cascade="all, delete-orphan"
    )

    referrals_made = relationship(
        "ReferralEarning",
        back_populates="referred_user",
        foreign_keys="[ReferralEarning.referred_user_id]"
    )

    # Self-Referential Hierarchy (Multi-Level Referrals)
    referrer = relationship(
        "UserProfile",
        foreign_keys=[referred_by],
        remote_side=[id],
        backref="direct_referrals"
    )

    level1_referrer = relationship(
        "UserProfile",
        foreign_keys=[referral_level_1],
        remote_side=[id]
    )

    level2_referrer = relationship(
        "UserProfile",
        foreign_keys=[referral_level_2],
        remote_side=[id]
    )

    level3_referrer = relationship(
        "UserProfile",
        foreign_keys=[referral_level_3],
        remote_side=[id]
    )

    # User Settings
    user_settings = relationship(
        "UserSettings",
        back_populates="user",
        foreign_keys="[UserSettings.user_id]",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Support Ticket Relationships
    created_tickets = relationship(
        "SupportTicket",
        back_populates="user",
        foreign_keys="[SupportTicket.user_id]"
    )

    assigned_tickets = relationship(
        "SupportTicket",
        back_populates="assigned_to_user",
        foreign_keys="[SupportTicket.assigned_to]"
    )

    # ----------------------------------------------------
    # Properties for convenience
    # ----------------------------------------------------
    @property
    def is_admin(self):
        return self.role == "admin"

    @property
    def is_active(self):
        return self.account_status == "active"

    @property
    def has_active_subscription(self):
        return self.subscription_status == "active"

    # ----------------------------------------------------
    # Representation
    # ----------------------------------------------------
    def __repr__(self):
        return f"<UserProfile(id={self.id}, email='{self.email}', role='{self.role}')>"

    # 🔹 Indexes for better performance
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_referral_code', 'referral_code'),
        Index('idx_user_status_role', 'account_status', 'role'),
        Index('idx_user_referred_by', 'referred_by'),
        Index('idx_user_created_at', 'created_at'),
        Index('idx_user_subscription', 'subscription_status', 'subscription_end'),
        Index('idx_user_balance_status', 'available_balance', 'account_status'),
    )


# 🔹 ADD this User class for backward compatibility
class User(UserProfile):
    """Backward compatibility class - use UserProfile instead"""
    __tablename__ = "users_profiles"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


class SignupOTP(Base):
    """
    Temporary storage for pre-registration email OTPs.
    Used to verify email BEFORE user account is created.
    This table is essential for multi-worker environments where in-memory cache doesn't work.
    """
    __tablename__ = "signup_otps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)  # Email being verified
    otp = Column(String(6), nullable=False)  # 6-digit OTP code
    expires_at = Column(DateTime(timezone=True), nullable=False)  # When OTP expires
    attempts = Column(Integer, default=0)  # Failed verification attempts (max 5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SignupOTP(email='{self.email}', expires_at='{self.expires_at}')>"


class PasswordResetOTP(Base):
    """
    Temporary storage for password reset OTPs.
    Used to verify user identity during password reset.
    This table is essential for multi-worker environments where in-memory cache doesn't work.
    """
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)  # User's email
    otp = Column(String(6), nullable=False)  # 6-digit OTP code
    expires_at = Column(DateTime(timezone=True), nullable=False)  # When OTP expires
    attempts = Column(Integer, default=0)  # Failed verification attempts (max 5)
    is_verified = Column(Boolean, default=False)  # Whether OTP was verified
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PasswordResetOTP(email='{self.email}', expires_at='{self.expires_at}')>"