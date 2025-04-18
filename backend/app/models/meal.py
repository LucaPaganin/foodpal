from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Union
from uuid import UUID, uuid4
from pydantic import Field
from app.schemas import BaseSchema


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    OTHER = "other"


class MealCategory(str, Enum):
    ITALIAN = "italian"
    AMERICAN = "american"
    ASIAN = "asian"
    MEXICAN = "mexican"
    MEDITERRANEAN = "mediterranean"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"
    QUICK = "quick"
    MEAL_PREP = "meal_prep"
    COMFORT_FOOD = "comfort_food"
    HEALTHY = "healthy"
    DESSERT = "dessert"
    CUSTOM = "custom"


class MealRating(int, Enum):
    TERRIBLE = 1
    BAD = 2
    AVERAGE = 3
    GOOD = 4
    EXCELLENT = 5


class MealBase(BaseSchema):
    name: str
    meal_type: MealType = Field(..., alias="mealType")
    categories: List[MealCategory] = []
    recipe_id: Optional[UUID] = None
    notes: Optional[str] = None
    serving_count: int = 1
    calories_per_serving: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    is_favorite: bool = False
    custom_categories: List[str] = []
    
    class Config:
        use_enum_values = True
        allow_population_by_field_name = True
        allow_population_by_alias = True
        


class MealCreate(MealBase):
    pass


class MealUpdate(BaseSchema):
    name: Optional[str] = None
    meal_type: Optional[MealType] = Field(None, alias="mealType")
    categories: Optional[List[MealCategory]] = None
    recipe_id: Optional[UUID] = None
    notes: Optional[str] = None
    serving_count: Optional[int] = None
    calories_per_serving: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    is_favorite: Optional[bool] = None
    custom_categories: Optional[List[str]] = None
    rating: Optional[MealRating] = None
    
    class Config:
        use_enum_values = True
        allow_population_by_field_name = True
        allow_population_by_alias = True
        


class MealDB(MealBase):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: UUID
    household_id: UUID
    rating: Optional[MealRating] = None
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
        allow_population_by_field_name = True
        allow_population_by_alias = True
        


class Meal(MealBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: UUID
    household_id: UUID
    rating: Optional[MealRating] = None
    
    class Config:
        use_enum_values = True
        orm_mode = True
        allow_population_by_field_name = True
        allow_population_by_alias = True

