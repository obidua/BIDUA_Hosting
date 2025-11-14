from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

class HostingPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    plan_type: str
    cpu_cores: int
    ram_gb: int
    storage_gb: int
    bandwidth_gb: int
    base_price: Decimal
    monthly_price: Decimal
    quarterly_price: Decimal
    annual_price: Decimal
    biennial_price: Decimal
    triennial_price: Decimal
    is_active: bool = True
    is_featured: bool = False
    features: Optional[List[str]] = None

class HostingPlanResponse(HostingPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlanTypeResponse(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: str

class BillingCycleResponse(BaseModel):
    id: str
    name: str
    discount: int
    months: int

class PricingFiltersResponse(BaseModel):
    plan_types: List[PlanTypeResponse]
    billing_cycles: List[BillingCycleResponse]

class CalculatorAddonResponse(BaseModel):
    id: str
    name: str
    description: str
    unit: str
    price_per_unit: Decimal
    min_value: int
    max_value: int
    default_value: int
