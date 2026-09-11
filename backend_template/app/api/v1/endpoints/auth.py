from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.core.database import get_db
# from app.core.utils import get_password_hash,verify_token
from app.utils.security_utils import  verify_password

from app.core.security import (
    verify_password, create_access_token,
    get_current_user, verify_token
)
from app.services.user_service import UserService
from sqlalchemy import select
from app.models.affiliate import AffiliateSubscription
from app.models.users import UserProfile
from app.schemas.users import User, UserCreate, LoginRequest, Token, PasswordChange,SubscriptionInfo, SubscriptionActivate
from app.services.email_service import email_service
from pydantic import BaseModel, EmailStr, validator

router = APIRouter()
security = HTTPBearer()


# Request schemas for email verification
class ResendVerificationRequest(BaseModel):
    email: EmailStr

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    
    @validator('otp')
    def validate_otp(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('OTP must be a 6-digit number')
        return v


@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Register a new user
    """
    try:
        # Check if user already exists
        existing_user = await user_service.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Validate referral code if provided (accept both AffiliateSubscription codes and legacy UserProfile codes)
        referrer_code_to_track: str | None = None
        provided_code = user_data.referral_code
        if provided_code:
            # 1) Check affiliate subscription codes (primary)
            aff_result = await db.execute(
                select(AffiliateSubscription).where(
                    AffiliateSubscription.referral_code == provided_code
                )
            )
            aff_sub = aff_result.scalar_one_or_none()
            if aff_sub and aff_sub.is_active:
                referrer_code_to_track = aff_sub.referral_code
            else:
                # 2) Check legacy user referral codes and map to their affiliate code if active
                legacy_user = await user_service.get_user_by_referral_code(db, provided_code)
                if legacy_user:
                    # Try to fetch the user's affiliate subscription to get canonical code
                    aff_result2 = await db.execute(
                        select(AffiliateSubscription).where(
                            AffiliateSubscription.user_id == legacy_user.id
                        )
                    )
                    aff_sub2 = aff_result2.scalar_one_or_none()
                    if aff_sub2 and aff_sub2.is_active:
                        referrer_code_to_track = aff_sub2.referral_code
                    else:
                        # No active affiliate program for this referrer; proceed without blocking signup
                        referrer_code_to_track = None
                else:
                    # Invalid code provided; do not block signup, just ignore
                    referrer_code_to_track = None
        
        # Create new user without referral_code (we'll track via AffiliateService separately)
        user = await user_service.create_user(db, user_data)
        
        # ⚠️ IMPORTANT: Capture all user attributes NOW while session is active
        # before doing any other operations that might change session context
        from datetime import datetime
        user_dict_base = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "account_status": user.account_status,
            "phone": user.phone if hasattr(user, 'phone') else "",
            "company": user.company if hasattr(user, 'company') else "",
            "referral_code": user.referral_code,
            "referred_by": user.referred_by,  # Will be None initially
            "subscription_status": user.subscription_status,
            "subscription_start": user.subscription_start,
            "subscription_end": user.subscription_end,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "total_referrals": user.total_referrals if hasattr(user, 'total_referrals') else 0,
            "l1_referrals": user.l1_referrals if hasattr(user, 'l1_referrals') else 0,
            "l2_referrals": user.l2_referrals if hasattr(user, 'l2_referrals') else 0,
            "l3_referrals": user.l3_referrals if hasattr(user, 'l3_referrals') else 0,
            "total_earnings": float(user.total_earnings) if user.total_earnings else 0.00,
            "available_balance": float(user.available_balance) if user.available_balance else 0.00,
            "total_withdrawn": float(user.total_withdrawn) if user.total_withdrawn else 0.00,
            "is_email_verified": False,  # New users are not verified
        }
        
        # 🆕 Send OTP verification email
        try:
            otp_code = email_service.generate_otp()
            otp_expiry = email_service.get_otp_expiry(minutes=10)
            
            # Save OTP to database
            await user_service.set_email_otp(
                db, user.id, otp_code, otp_expiry
            )
            
            # Send OTP email via Brevo API
            await email_service.send_otp_email(
                to_email=user.email,
                user_name=user.full_name,
                otp_code=otp_code
            )
            print(f"✅ OTP verification email sent to {user.email}")
        except Exception as email_error:
            print(f"⚠️ Failed to send OTP email: {str(email_error)}")
            # Don't fail registration if email fails
        
        # 🆕 Track affiliate referral if a valid code was provided/mapped
        # This happens AFTER we've captured all attributes
        if referrer_code_to_track:
            try:
                from app.services.affiliate_service import AffiliateService
                affiliate_service = AffiliateService()
                await affiliate_service.track_referral(
                    db, referrer_code_to_track, user.id, signup_ip=None
                )
                # Update the referred_by in our captured dict
                user_dict_base["referred_by"] = (await user_service.get_user_by_id(db, user.id)).referred_by if await user_service.get_user_by_id(db, user.id) else None
            except Exception as aff_error:
                # Log error but don't fail registration
                print(f"⚠️ Affiliate referral tracking error: {str(aff_error)}")
        
        # Generate access token
        access_token = create_access_token(
            subject=str(user.id),
            expires_delta=timedelta(minutes=30)
        )
        
        # Ensure all required fields are present for response validation
        from datetime import datetime as dt
        user_dict = {
            **user_dict_base,
            "created_at": user_dict_base["created_at"] or dt.utcnow(),
            "updated_at": user_dict_base["updated_at"] or dt.utcnow(),
        }
        # Return minimal user info (don't include hashed_password or other sensitive fields)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_dict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Log the actual error for debugging
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Login user and return access token
    """
    # Add await here since authenticate_user is an async method
    user = await user_service.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or inactive"
        )
    
    # Generate access token
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=30)
    )
    
    # Build response dict IMMEDIATELY while user object is still attached to session
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "account_status": user.account_status,
        "phone": user.phone,
        "company": user.company,
        "referral_code": user.referral_code,
        "referred_by": user.referred_by,
        "subscription_status": user.subscription_status,
        "subscription_start": user.subscription_start,
        "subscription_end": user.subscription_end,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "total_referrals": user.total_referrals,
        "l1_referrals": user.l1_referrals,
        "l2_referrals": user.l2_referrals,
        "l3_referrals": user.l3_referrals,
        "total_earnings": float(user.total_earnings) if user.total_earnings else 0.00,
        "available_balance": float(user.available_balance) if user.available_balance else 0.00,
        "total_withdrawn": float(user.total_withdrawn) if user.total_withdrawn else 0.00,
        "is_email_verified": user.is_email_verified if hasattr(user, 'is_email_verified') else True,
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """
    Refresh access token
    """
    access_token = create_access_token(
        subject=str(current_user.id),
        expires_delta=timedelta(minutes=300)
    )
    
    # Build response dict IMMEDIATELY while user object is still attached to session
    user_dict = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "account_status": current_user.account_status,
        "phone": current_user.phone,
        "company": current_user.company,
        "referral_code": current_user.referral_code,
        "referred_by": current_user.referred_by,
        "subscription_status": current_user.subscription_status,
        "subscription_start": current_user.subscription_start,
        "subscription_end": current_user.subscription_end,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "total_referrals": current_user.total_referrals,
        "l1_referrals": current_user.l1_referrals,
        "l2_referrals": current_user.l2_referrals,
        "l3_referrals": current_user.l3_referrals,
        "total_earnings": float(current_user.total_earnings) if current_user.total_earnings else 0.00,
        "available_balance": float(current_user.available_balance) if current_user.available_balance else 0.00,
        "total_withdrawn": float(current_user.total_withdrawn) if current_user.total_withdrawn else 0.00,
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends()
):
    """
    Change user password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    # success = user_service.update_password(
    #     db, current_user.id, password_data.new_password
    # )

    success = await user_service.update_password(
        db, current_user.id, password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"message": "Password updated successfully"}



@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    """
    return current_user


@router.get("/me/inviter")
async def get_my_inviter(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Get current user's inviter information (if they were referred)
    """
    if not current_user.referred_by:
        return {"referred_by": None, "inviter": None}
    
    # Fetch inviter's basic info
    inviter = await user_service.get_user_by_id(db, current_user.referred_by)
    if not inviter:
        return {"referred_by": current_user.referred_by, "inviter": None}
    
    return {
        "referred_by": current_user.referred_by,
        "inviter": {
            "id": inviter.id,
            "full_name": inviter.full_name,
            "email": inviter.email,
            "referral_code": inviter.referral_code
        }
    }


@router.post("/logout")
async def logout():
    """
    Logout user (client should remove token)
    """
    return {"message": "Successfully logged out"}





# ================================ Subscription Endpoints ================================


# # 🔹 1. Check subscription status (for user dashboard)
# @router.get("/status", response_model=SubscriptionInfo)
# async def get_subscription_status(
#     db: AsyncSession = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     user = await UserService.get_user_by_id(db, current_user.id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user


# # 🔹 2. Activate subscription (after successful payment)
# @router.post("/activate")
# async def activate_subscription(
#     subscription: SubscriptionActivate,
#     db: AsyncSession = Depends(get_db)
# ):
#     result = await UserService.activate_subscription(
#         db=db,
#         user_id=subscription.user_id,
#         plan_name=subscription.plan_name,
#         amount=subscription.amount
#     )
#     return {"success": True, **result}





@router.get("/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    user = await user_service.get_user_by_id(db, current_user.id)
    return {
        "subscription_status": user.subscription_status,
        "subscription_start": user.subscription_start,
        "subscription_end": user.subscription_end,
    }
# 🔹 2. Activate subscription (after successful payment)


@router.post("/activate")
async def activate_subscription(
    subscription: SubscriptionActivate,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    result = await user_service.activate_subscription(
        db=db,
        user_id=subscription.user_id,
        plan_name=subscription.plan_name,
        amount=subscription.amount
    )
    return {"success": True, **result}


# ================================ Email Verification Endpoints (OTP-based) ================================

from datetime import datetime
from sqlalchemy import delete
from app.models.users import SignupOTP


@router.post("/send-signup-otp")
async def send_signup_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Send OTP verification code to email for pre-registration verification.
    This works BEFORE user account is created.
    Uses database storage for multi-worker compatibility.
    """
    # Check if email already exists as a registered user
    existing_user = await user_service.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead."
        )
    
    try:
        # Generate new OTP
        otp_code = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry(minutes=10)
        
        # Delete any existing OTP for this email
        await db.execute(
            delete(SignupOTP).where(SignupOTP.email == request.email)
        )
        
        # Store OTP in database
        signup_otp = SignupOTP(
            email=request.email,
            otp=otp_code,
            expires_at=otp_expiry,
            attempts=0
        )
        db.add(signup_otp)
        await db.commit()
        
        # Send OTP email via Brevo API
        success = await email_service.send_otp_email(
            to_email=request.email,
            user_name="New User",  # No name yet during signup
            otp_code=otp_code
        )
        
        if success:
            print(f"✅ Signup OTP sent to {request.email}: {otp_code}")
            return {
                "success": True,
                "message": "OTP sent successfully"
            }
        else:
            print(f"❌ Failed to send OTP email to {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Failed to send signup OTP: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )


@router.post("/verify-signup-otp")
async def verify_signup_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Verify OTP code for pre-registration email verification.
    Uses database storage for multi-worker compatibility.
    """
    # Check if email already exists
    existing_user = await user_service.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Get OTP from database
    result = await db.execute(
        select(SignupOTP).where(SignupOTP.email == request.email)
    )
    signup_otp = result.scalar_one_or_none()
    
    if not signup_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Please request a new one."
        )
    
    # Check attempts (max 5)
    if signup_otp.attempts >= 5:
        await db.execute(
            delete(SignupOTP).where(SignupOTP.email == request.email)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts. Please request a new OTP."
        )
    
    # Check if OTP has expired
    if datetime.utcnow() > signup_otp.expires_at.replace(tzinfo=None):
        await db.execute(
            delete(SignupOTP).where(SignupOTP.email == request.email)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Verify OTP
    if signup_otp.otp != request.otp:
        # Increment attempt counter
        signup_otp.attempts += 1
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # OTP is valid - remove from database and return success
    await db.execute(
        delete(SignupOTP).where(SignupOTP.email == request.email)
    )
    await db.commit()
    
    return {
        "success": True,
        "message": "Email verified successfully",
        "email": request.email
    }


@router.post("/send-otp")
async def send_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Send OTP verification code to email
    """
    user = await user_service.get_user_by_email(db, request.email)
    
    if not user:
        # Don't reveal if email exists (security)
        return {
            "success": True,
            "message": "If this email exists, an OTP will be sent"
        }
    
    if user.is_email_verified:
        return {
            "success": True,
            "message": "Email is already verified"
        }
    
    try:
        # Generate new OTP
        otp_code = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry(minutes=10)
        
        # Save OTP to database
        await user_service.set_email_otp(db, user.id, otp_code, otp_expiry)
        
        # Send OTP email via Brevo API
        await email_service.send_otp_email(
            to_email=user.email,
            user_name=user.full_name,
            otp_code=otp_code
        )
        
        return {
            "success": True,
            "message": "OTP sent successfully"
        }
        
    except Exception as e:
        print(f"❌ Failed to send OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )


@router.post("/verify-otp")
async def verify_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Verify email using 6-digit OTP code
    """
    success, message, user = await user_service.verify_email_otp(
        db, request.email, request.otp
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Send welcome email after successful verification
    if user:
        try:
            await email_service.send_welcome_email(
                to_email=user.email,
                user_name=user.full_name
            )
        except Exception as e:
            print(f"⚠️ Failed to send welcome email: {str(e)}")
    
    return {
        "success": True,
        "message": message,
        "email": user.email if user else None
    }


@router.post("/resend-otp")
async def resend_otp(
    request: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Resend OTP verification code
    """
    user = await user_service.get_user_by_email(db, request.email)
    
    if not user:
        # Don't reveal if email exists (security)
        return {
            "success": True,
            "message": "If this email exists, an OTP will be sent"
        }
    
    if user.is_email_verified:
        return {
            "success": True,
            "message": "Email is already verified"
        }
    
    try:
        # Generate new OTP
        otp_code = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry(minutes=10)
        
        # Save OTP to database (resets attempt counter)
        await user_service.set_email_otp(db, user.id, otp_code, otp_expiry)
        
        # Send OTP email
        await email_service.send_otp_email(
            to_email=user.email,
            user_name=user.full_name,
            otp_code=otp_code
        )
        
        return {
            "success": True,
            "message": "OTP sent successfully"
        }
        
    except Exception as e:
        print(f"❌ Failed to resend OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )


@router.get("/verification-status")
async def get_verification_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Get current user's email verification status
    """
    user = await user_service.get_user_by_id(db, current_user.id)
    return {
        "email": user.email,
        "is_email_verified": user.is_email_verified
    }


# ================================ Password Reset Endpoints ================================


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Request password reset email
    """
    user = await user_service.get_user_by_email(db, request.email)
    
    # Don't reveal if email exists (security best practice)
    if not user:
        return {
            "success": True,
            "message": "If this email exists, a password reset link will be sent"
        }
    
    try:
        # Generate reset token (1 hour expiry)
        reset_token = email_service.generate_verification_token()
        token_expiry = email_service.get_verification_expiry(hours=1)
        
        # Save token to database
        await user_service.set_password_reset_token(
            db, user.id, reset_token, token_expiry
        )
        
        # Send reset email
        await email_service.send_password_reset_email(
            to_email=user.email,
            user_name=user.full_name,
            reset_token=reset_token
        )
        
        return {
            "success": True,
            "message": "If this email exists, a password reset link will be sent"
        }
        
    except Exception as e:
        print(f"❌ Failed to send password reset email: {str(e)}")
        # Still return success to not reveal email existence
        return {
            "success": True,
            "message": "If this email exists, a password reset link will be sent"
        }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Reset password with token
    """
    success, message = await user_service.reset_password_with_token(
        db, request.token, request.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return {
        "success": True,
        "message": message
    }


@router.get("/verify-reset-token/{token}")
async def verify_reset_token(
    token: str,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Verify if password reset token is valid
    """
    valid, message, user = await user_service.verify_reset_token(db, token)
    
    return {
        "valid": valid,
        "message": message,
        "email": user.email if user and valid else None
    }


# ================================ OTP-Based Password Reset Endpoints ================================

from app.models.users import PasswordResetOTP


class ResetPasswordWithOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    
    @validator('otp')
    def validate_otp(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('OTP must be a 6-digit number')
        return v
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


@router.post("/send-reset-otp")
async def send_reset_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Send OTP for password reset.
    Uses database storage for multi-worker compatibility.
    """
    user = await user_service.get_user_by_email(db, request.email)
    
    # Don't reveal if email exists (security best practice)
    if not user:
        return {
            "success": True,
            "message": "If this email exists, a password reset OTP will be sent"
        }
    
    try:
        # Generate new OTP
        otp_code = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry(minutes=10)
        
        # Delete any existing OTP for this email
        await db.execute(
            delete(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
        )
        
        # Store OTP in database
        reset_otp = PasswordResetOTP(
            email=request.email,
            otp=otp_code,
            expires_at=otp_expiry,
            attempts=0
        )
        db.add(reset_otp)
        await db.commit()
        
        # Send OTP email via Brevo API
        success = await email_service.send_password_reset_email(
            to_email=user.email,
            user_name=user.full_name,
            reset_token=otp_code  # Using OTP as the reset code
        )
        
        if success:
            print(f"✅ Password reset OTP sent to {request.email}")
            return {
                "success": True,
                "message": "If this email exists, a password reset OTP will be sent"
            }
        else:
            print(f"❌ Failed to send password reset OTP to {request.email}")
            return {
                "success": True,
                "message": "If this email exists, a password reset OTP will be sent"
            }
        
    except Exception as e:
        print(f"❌ Failed to send password reset OTP: {str(e)}")
        # Still return success to not reveal email existence
        return {
            "success": True,
            "message": "If this email exists, a password reset OTP will be sent"
        }


@router.post("/verify-reset-otp")
async def verify_reset_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Verify OTP code for password reset.
    Returns success if OTP is valid (allows proceeding to password change).
    """
    # Get OTP from database
    result = await db.execute(
        select(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
    )
    reset_otp = result.scalar_one_or_none()
    
    if not reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Please request a new one."
        )
    
    # Check attempts (max 5)
    if reset_otp.attempts >= 5:
        await db.execute(
            delete(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts. Please request a new OTP."
        )
    
    # Check if OTP has expired
    if datetime.utcnow() > reset_otp.expires_at.replace(tzinfo=None):
        await db.execute(
            delete(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Verify OTP
    if reset_otp.otp != request.otp:
        # Increment attempt counter
        reset_otp.attempts += 1
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # OTP is valid - mark as verified but don't delete yet (will be deleted after password reset)
    reset_otp.is_verified = True
    await db.commit()
    
    return {
        "success": True,
        "message": "OTP verified successfully. You can now reset your password.",
        "email": request.email
    }


@router.post("/reset-password-with-otp")
async def reset_password_with_otp(
    request: ResetPasswordWithOTPRequest,
    db: AsyncSession = Depends(get_db),
    user_service: UserService = Depends()
):
    """
    Reset password after OTP verification.
    Requires valid OTP that was previously verified.
    """
    # Get OTP from database
    result = await db.execute(
        select(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
    )
    reset_otp = result.scalar_one_or_none()
    
    if not reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verified OTP found. Please start the reset process again."
        )
    
    # Verify OTP matches (double-check)
    if reset_otp.otp != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Check if OTP has expired
    if datetime.utcnow() > reset_otp.expires_at.replace(tzinfo=None):
        await db.execute(
            delete(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Get user
    user = await user_service.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Reset password
    from app.core.security import get_password_hash
    hashed_password = await get_password_hash(request.new_password)
    
    from sqlalchemy import update
    await db.execute(
        update(UserProfile)
        .where(UserProfile.id == user.id)
        .values(hashed_password=hashed_password)
    )
    
    # Delete OTP from database
    await db.execute(
        delete(PasswordResetOTP).where(PasswordResetOTP.email == request.email)
    )
    
    await db.commit()
    
    print(f"✅ Password reset successfully for {request.email}")
    
    return {
        "success": True,
        "message": "Password reset successfully. You can now login with your new password."
    }
