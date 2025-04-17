from datetime import datetime, date
from enum import Enum
from typing import Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.models.meal import MealType, MealDB, Meal


class MealPlanStatus(str, Enum):
    PLANNED = "planned"
    PREPARED = "prepared"
    SKIPPED = "skipped"
    REPLACED = "replaced"


class MealPlanEntryBase(BaseModel):
    meal_id: UUID
    planned_date: date
    meal_type: MealType
    notes: Optional[str] = None
    status: MealPlanStatus = MealPlanStatus.PLANNED
    serving_count: int = 1
    
    class Config:
        use_enum_values = True


class MealPlanEntryCreate(MealPlanEntryBase):
    pass


class MealPlanEntryUpdate(BaseModel):
    meal_id: Optional[UUID] = None
    planned_date: Optional[date] = None
    meal_type: Optional[MealType] = None
    notes: Optional[str] = None
    status: Optional[MealPlanStatus] = None
    serving_count: Optional[int] = None
    
    class Config:
        use_enum_values = True


class MealPlanEntryDB(MealPlanEntryBase):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: UUID
    household_id: UUID
    
    # For CosmosDB
    pk: str = ""  # Partition key (will be set to household_id)
    
    def __init__(self, **data):
        super().__init__(**data)
        if self.household_id:
            self.pk = str(self.household_id)
    
    class Config:
        use_enum_values = True
        populate_by_name = True
        arbitrary_types_allowed = True


class MealPlanEntry(MealPlanEntryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: UUID
    household_id: UUID
    
    class Config:
        use_enum_values = True
        orm_mode = True


class MealPlanEntryWithMeal(MealPlanEntry):
    meal: Meal
    
    class Config:
        use_enum_values = True
        orm_mode = True


class MealPlanPeriod(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


class MealPlanStatistics(BaseModel):
    period: MealPlanPeriod
    start_date: date
    end_date: date
    total_planned: int
    prepared_count: int
    skipped_count: int
    replaced_count: int
    favorite_meal_id: Optional[UUID] = None
    favorite_meal_name: Optional[str] = None
    most_common_category: Optional[str] = None
    
    class Config:
        use_enum_values = True
