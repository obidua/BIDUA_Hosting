from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.plan import HostingPlan
from app.schemas.pricing import (
    HostingPlanResponse, 
    PlanTypeResponse, 
    BillingCycleResponse,
    PricingFiltersResponse
)

router = APIRouter(prefix="/pricing", tags=["Pricing"])

@router.get("/plans", response_model=List[HostingPlanResponse])
async def get_all_plans(
    plan_type: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all hosting plans, optionally filtered by plan type
    """
    query = select(HostingPlan).where(HostingPlan.is_active == True)
    
    if plan_type:
        query = query.where(HostingPlan.plan_type == plan_type)
    
    query = query.order_by(HostingPlan.monthly_price)
    
    result = await db.execute(query)
    plans = result.scalars().all()
    
    return plans

@router.get("/plans/{plan_id}", response_model=HostingPlanResponse)
async def get_plan_by_id(
    plan_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific hosting plan by ID
    """
    result = await db.execute(
        select(HostingPlan).where(HostingPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return plan

@router.get("/plan-types", response_model=List[PlanTypeResponse])
async def get_plan_types():
    """
    Get all available plan types with metadata
    """
    return [
        {
            "id": "general_purpose",
            "name": "General Purpose VM",
            "icon": "Server",
            "color": "blue",
            "description": "Balanced CPU and memory resources perfect for web applications"
        },
        {
            "id": "cpu_optimized",
            "name": "CPU Optimized VM",
            "icon": "Zap",
            "color": "orange",
            "description": "Dedicated CPU cores with high-performance Intel Xeon processors"
        },
        {
            "id": "memory_optimized",
            "name": "Memory Optimized VM",
            "icon": "Database",
            "color": "green",
            "description": "High memory-to-CPU ratio for memory-intensive applications"
        }
    ]

@router.get("/billing-cycles", response_model=List[BillingCycleResponse])
async def get_billing_cycles():
    """
    Get all available billing cycles with discounts
    """
    return [
        {"id": "monthly", "name": "Monthly", "discount": 5, "months": 1},
        {"id": "quarterly", "name": "Quarterly", "discount": 10, "months": 3},
        {"id": "semiannually", "name": "Semi-Annually", "discount": 15, "months": 6},
        {"id": "annually", "name": "Annually", "discount": 20, "months": 12},
        {"id": "biennially", "name": "Biennially", "discount": 25, "months": 24},
        {"id": "triennially", "name": "Triennially", "discount": 35, "months": 36}
    ]

@router.get("/filters", response_model=PricingFiltersResponse)
async def get_pricing_filters():
    """
    Get all filters (plan types and billing cycles) in one call
    """
    return {
        "plan_types": await get_plan_types(),
        "billing_cycles": await get_billing_cycles()
    }
