from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import datetime, timedelta
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.users import UserProfile
from app.models.server import Server
from app.models.order import Order
from app.models.support import SupportTicket
from app.models.affiliate import Referral

router = APIRouter()


def require_admin(current_user: UserProfile = Depends(get_current_user)):
    """Dependency to ensure user is admin or super_admin"""
    if current_user.role not in ['admin', 'super_admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """Get admin dashboard statistics"""
    
    # Get total users count
    users_stmt = select(func.count(UserProfile.id))
    users_result = await db.execute(users_stmt)
    total_users = users_result.scalar() or 0
    
    # Get users created this month
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    users_this_month_stmt = select(func.count(UserProfile.id)).where(
        UserProfile.created_at >= current_month_start
    )
    users_this_month_result = await db.execute(users_this_month_stmt)
    users_this_month = users_this_month_result.scalar() or 0
    
    # Get active servers count
    servers_stmt = select(func.count(Server.id)).where(Server.status == 'active')
    servers_result = await db.execute(servers_stmt)
    active_servers = servers_result.scalar() or 0
    
    # Get total servers count
    total_servers_stmt = select(func.count(Server.id))
    total_servers_result = await db.execute(total_servers_stmt)
    total_servers = total_servers_result.scalar() or 0
    
    # Get total orders count
    orders_stmt = select(func.count(Order.id))
    orders_result = await db.execute(orders_stmt)
    total_orders = orders_result.scalar() or 0
    
    # Get monthly revenue (sum of completed orders this month)
    monthly_revenue_stmt = select(func.sum(Order.total_amount)).where(
        and_(
            Order.created_at >= current_month_start,
            Order.status == 'completed'
        )
    )
    monthly_revenue_result = await db.execute(monthly_revenue_stmt)
    monthly_revenue = float(monthly_revenue_result.scalar() or 0)
    
    # Get open support tickets
    open_tickets_stmt = select(func.count(SupportTicket.id)).where(
        SupportTicket.status.in_(['open', 'in_progress'])
    )
    open_tickets_result = await db.execute(open_tickets_stmt)
    open_tickets = open_tickets_result.scalar() or 0
    
    # Get referral program status
    referrals_stmt = select(func.count(Referral.id)).where(Referral.status == 'active')
    referrals_result = await db.execute(referrals_stmt)
    active_referrals = referrals_result.scalar() or 0
    
    return {
        "total_users": total_users,
        "users_this_month": users_this_month,
        "active_servers": active_servers,
        "total_servers": total_servers,
        "total_orders": total_orders,
        "monthly_revenue": monthly_revenue,
        "open_tickets": open_tickets,
        "active_referrals": active_referrals,
        "referral_status": "Active" if active_referrals > 0 else "Inactive"
    }


@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """Get all users with pagination"""
    stmt = select(UserProfile).offset(skip).limit(limit).order_by(UserProfile.created_at.desc())
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    # Get total count
    count_stmt = select(func.count(UserProfile.id))
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
    return {
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "account_status": user.account_status,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "referral_code": user.referral_code
            }
            for user in users
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/servers")
async def get_all_servers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """Get all servers with pagination"""
    stmt = select(Server).offset(skip).limit(limit).order_by(Server.created_at.desc())
    result = await db.execute(stmt)
    servers = result.scalars().all()
    
    # Get total count
    count_stmt = select(func.count(Server.id))
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
    return {
        "servers": [
            {
                "id": server.id,
                "user_id": server.user_id,
                "hostname": server.hostname,
                "ip_address": server.ip_address,
                "status": server.status,
                "plan_id": server.plan_id,
                "created_at": server.created_at.isoformat() if server.created_at else None,
            }
            for server in servers
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/orders")
async def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """Get all orders with pagination"""
    stmt = select(Order).offset(skip).limit(limit).order_by(Order.created_at.desc())
    result = await db.execute(stmt)
    orders = result.scalars().all()
    
    # Get total count
    count_stmt = select(func.count(Order.id))
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
    return {
        "orders": [
            {
                "id": order.id,
                "user_id": order.user_id,
                "plan_id": order.plan_id,
                "status": order.status,
                "total_amount": float(order.total_amount) if order.total_amount else 0,
                "created_at": order.created_at.isoformat() if order.created_at else None,
            }
            for order in orders
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/tickets")
async def get_all_tickets(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(require_admin)
):
    """Get all support tickets with pagination"""
    stmt = select(SupportTicket).offset(skip).limit(limit).order_by(SupportTicket.created_at.desc())
    result = await db.execute(stmt)
    tickets = result.scalars().all()
    
    # Get total count
    count_stmt = select(func.count(SupportTicket.id))
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0
    
    return {
        "tickets": [
            {
                "id": ticket.id,
                "user_id": ticket.user_id,
                "subject": ticket.subject,
                "status": ticket.status,
                "priority": ticket.priority,
                "category": ticket.category,
                "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            }
            for ticket in tickets
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }
