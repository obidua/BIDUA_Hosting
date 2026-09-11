"""
Provider Dashboard API Endpoints
Handles server provider operations: monitoring, renewals, and analytics
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import csv
import io

from app.core.database import get_db
from app.models.server import Server
from app.models.users import UserProfile
from app.core.security import get_current_user
from pydantic import BaseModel, Field

router = APIRouter()


# ============================================================================
# Pydantic Models
# ============================================================================

class DashboardStats(BaseModel):
    totalServers: int = Field(alias="total_servers")
    activeServers: int = Field(alias="active_servers")
    expiringoon: int = Field(alias="expiring_soon")
    monthlyRecurring: float = Field(alias="monthly_revenue")
    serversByStatus: dict = Field(default_factory=dict, alias="servers_by_status")
    
    model_config = {
        "populate_by_name": True
    }


class ServerListItem(BaseModel):
    id: int
    name: str
    ip_address: str
    location: str
    status: str
    expiry_date: datetime
    plan_name: str
    customer_email: str


class ServerDetailResponse(BaseModel):
    id: int
    name: str
    ip_address: str
    location: str
    status: str
    expiry_date: datetime
    plan_name: str
    customer_email: str
    customer_name: str
    created_at: datetime
    last_renewed: Optional[datetime]
    specs: dict
    billing_cycle: str


class ExpiryTrackerItem(BaseModel):
    id: int
    name: str
    ip_address: str
    customer_email: str
    expiry_date: datetime
    days_until_expiry: int
    status: str
    urgency: str


class RenewRequest(BaseModel):
    years: int = 1


class BulkRenewRequest(BaseModel):
    server_ids: List[int]
    years: int = 1


# ============================================================================
# Permission Check
# ============================================================================

def check_provider_access(current_user: UserProfile):
    """Verify user has provider access"""
    provider_roles = ['provider_admin', 'operations_lead', 'support_staff']
    if current_user.role not in provider_roles:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Provider role required."
        )
    return current_user


# ============================================================================
# Dashboard Statistics
# ============================================================================

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Get provider dashboard statistics"""
    check_provider_access(current_user)
    
    # Total servers
    total_result = await db.execute(select(func.count(Server.id)))
    total_servers = total_result.scalar() or 0
    
    # Active servers
    active_result = await db.execute(
        select(func.count(Server.id)).where(Server.server_status == 'active')
    )
    active_servers = active_result.scalar() or 0
    
    # Expiring soon (within 30 days)
    expiry_threshold = datetime.now(timezone.utc) + timedelta(days=30)
    expiring_result = await db.execute(
        select(func.count(Server.id)).where(
            and_(
                Server.server_status == 'active',
                Server.expiry_date <= expiry_threshold
            )
        )
    )
    expiring_soon = expiring_result.scalar() or 0
    
    # Monthly revenue (mock for now - should come from billing)
    monthly_revenue = total_servers * 50.0  # Placeholder calculation
    
    return DashboardStats(
        total_servers=total_servers,
        active_servers=active_servers,
        expiring_soon=expiring_soon,
        monthly_revenue=monthly_revenue,
        servers_by_status={}
    )


# ============================================================================
# Server List
# ============================================================================

@router.get("/servers", response_model=List[ServerListItem])
async def get_servers(
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Get paginated server list with filters"""
    check_provider_access(current_user)
    
    # Build query
    query = select(Server).join(UserProfile, Server.user_id == UserProfile.id)
    
    # Apply filters
    filters = []
    if status:
        filters.append(Server.server_status == status)
    # Note: Server model doesn't have location field, so we skip location filter
    if search:
        search_filter = or_(
            Server.server_name.ilike(f"%{search}%"),
            Server.ip_address.ilike(f"%{search}%"),
            UserProfile.email.ilike(f"%{search}%")
        )
        filters.append(search_filter)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    servers = result.scalars().all()
    
    # Get user details for each server
    server_list = []
    for server in servers:
        user_result = await db.execute(
            select(UserProfile).where(UserProfile.id == server.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        server_list.append(ServerListItem(
            id=server.id,
            name=server.server_name or f"Server-{server.id}",
            ip_address=server.ip_address or "N/A",
            location="Global",  # Server model doesn't have location field
            status=server.server_status,
            expiry_date=server.expiry_date,
            plan_name=server.plan_name or "Standard",
            customer_email=user.email if user else "Unknown"
        ))
    
    return server_list


# ============================================================================
# Server Details
# ============================================================================

@router.get("/servers/{server_id}", response_model=ServerDetailResponse)
async def get_server_details(
    server_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Get detailed server information"""
    check_provider_access(current_user)
    
    # Get server
    result = await db.execute(
        select(Server).where(Server.id == server_id)
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Get user details
    user_result = await db.execute(
        select(UserProfile).where(UserProfile.id == server.user_id)
    )
    user = user_result.scalar_one_or_none()
    
    return ServerDetailResponse(
        id=server.id,
        name=server.server_name or f"Server-{server.id}",
        ip_address=server.ip_address or "N/A",
        location="Global",
        status=server.server_status,
        expiry_date=server.expiry_date,
        plan_name=server.plan_name or "Standard",
        customer_email=user.email if user else "Unknown",
        customer_name=user.full_name if user else "Unknown",
        created_at=server.created_at,
        last_renewed=server.updated_at,
        specs={
            "cpu": server.vcpu or 2,
            "ram": server.ram_gb or 4,
            "storage": server.storage_gb or 50,
            "bandwidth": server.bandwidth_gb or 1000
        },
        billing_cycle=server.billing_cycle or "monthly"
    )


# ============================================================================
# Expiry Tracker
# ============================================================================

@router.get("/expiry-tracker", response_model=List[ExpiryTrackerItem])
async def get_expiry_tracker(
    urgency: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Get servers expiry tracking with urgency levels"""
    check_provider_access(current_user)
    
    # Get active servers
    query = select(Server).join(
        UserProfile, Server.user_id == UserProfile.id
    ).where(Server.server_status == 'active')
    
    result = await db.execute(query)
    servers = result.scalars().all()
    
    # Calculate urgency and filter
    now = datetime.now(timezone.utc)
    tracker_items = []
    
    for server in servers:
        # Handle both timezone-aware and naive datetimes
        expiry = server.expiry_date
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        
        days_until_expiry = (expiry - now).days
        
        # Determine urgency level
        if days_until_expiry < 0:
            urgency_level = "expired"
        elif days_until_expiry <= 7:
            urgency_level = "critical"
        elif days_until_expiry <= 15:
            urgency_level = "warning"
        elif days_until_expiry <= 30:
            urgency_level = "caution"
        else:
            urgency_level = "safe"
        
        # Apply urgency filter
        if urgency and urgency_level != urgency:
            continue
        
        # Get user details
        user_result = await db.execute(
            select(UserProfile).where(UserProfile.id == server.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        tracker_items.append(ExpiryTrackerItem(
            id=server.id,
            name=server.server_name or f"Server-{server.id}",
            ip_address=server.ip_address or "N/A",
            customer_email=user.email if user else "Unknown",
            expiry_date=server.expiry_date,
            days_until_expiry=days_until_expiry,
            status=server.server_status,
            urgency=urgency_level
        ))
    
    # Sort by expiry date (closest first)
    tracker_items.sort(key=lambda x: x.days_until_expiry)
    
    return tracker_items


# ============================================================================
# Server Renewal
# ============================================================================

@router.post("/servers/{server_id}/renew")
async def renew_server(
    server_id: int,
    renew_data: RenewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Renew a server subscription"""
    check_provider_access(current_user)
    
    # Get server
    result = await db.execute(
        select(Server).where(Server.id == server_id)
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Calculate new expiry date
    days_to_add = renew_data.years * 365
    
    # If expired, start from today, otherwise extend
    now = datetime.now(timezone.utc)
    expiry = server.expiry_date
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    
    if expiry < now:
        new_expiry = now + timedelta(days=days_to_add)
    else:
        new_expiry = expiry + timedelta(days=days_to_add)
    
    # Update server
    server.expiry_date = new_expiry
    server.server_status = 'active'
    server.updated_at = now
    
    await db.commit()
    await db.refresh(server)
    
    return {
        "success": True,
        "message": f"Server renewed for {renew_data.years} year(s)",
        "new_expiry_date": new_expiry.isoformat()
    }


# ============================================================================
# Bulk Renewal
# ============================================================================

@router.post("/servers/bulk-renew")
async def bulk_renew_servers(
    bulk_data: BulkRenewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Renew multiple servers at once"""
    check_provider_access(current_user)
    
    results = []
    days_to_add = bulk_data.years * 365
    
    for server_id in bulk_data.server_ids:
        try:
            # Get server
            result = await db.execute(
                select(Server).where(Server.id == server_id)
            )
            server = result.scalar_one_or_none()
            
            if not server:
                results.append({
                    "server_id": server_id,
                    "success": False,
                    "error": "Server not found"
                })
                continue
            
            # Calculate new expiry
            now = datetime.now(timezone.utc)
            expiry = server.expiry_date
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            
            if expiry < now:
                new_expiry = now + timedelta(days=days_to_add)
            else:
                new_expiry = expiry + timedelta(days=days_to_add)
            
            # Update server
            server.expiry_date = new_expiry
            server.server_status = 'active'
            server.updated_at = now
            
            results.append({
                "server_id": server_id,
                "success": True,
                "new_expiry_date": new_expiry.isoformat()
            })
            
        except Exception as e:
            results.append({
                "server_id": server_id,
                "success": False,
                "error": str(e)
            })
    
    await db.commit()
    
    successful = sum(1 for r in results if r["success"])
    
    return {
        "total": len(bulk_data.server_ids),
        "successful": successful,
        "failed": len(bulk_data.server_ids) - successful,
        "results": results
    }


# ============================================================================
# Export Servers
# ============================================================================

@router.get("/servers/export/{format}")
async def export_servers(
    format: str,
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    """Export servers list to CSV or JSON"""
    check_provider_access(current_user)
    
    if format not in ['csv', 'json']:
        raise HTTPException(status_code=400, detail="Format must be 'csv' or 'json'")
    
    # Build query
    query = select(Server).join(UserProfile, Server.user_id == UserProfile.id)
    
    # Apply filters
    filters = []
    if status:
        filters.append(Server.status == status)
    if location:
        filters.append(Server.location == location)
    
    if filters:
        query = query.where(and_(*filters))
    
    result = await db.execute(query)
    servers = result.scalars().all()
    
    # Get data with user info
    export_data = []
    for server in servers:
        user_result = await db.execute(
            select(UserProfile).where(UserProfile.id == server.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        export_data.append({
            'ID': server.id,
            'Name': server.server_name or f"Server-{server.id}",
            'IP Address': server.ip_address or "N/A",
            'Location': "Global",
            'Status': server.server_status,
            'Expiry Date': server.expiry_date.strftime('%Y-%m-%d'),
            'Plan': server.plan_name or "Standard",
            'Customer Email': user.email if user else "Unknown",
            'Customer Name': user.full_name if user else "Unknown"
        })
    
    if format == 'csv':
        # Generate CSV
        output = io.StringIO()
        if export_data:
            writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
        
        csv_content = output.getvalue()
        output.close()
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=servers-{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
            }
        )
    
    # JSON format
    return export_data


# ============================================================================
# Notifications (Placeholder)
# ============================================================================

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: UserProfile = Depends(get_current_user)
):
    """Get provider notifications"""
    check_provider_access(current_user)
    
    # Placeholder - implement actual notification system
    return {
        "notifications": [],
        "unread_count": 0
    }
