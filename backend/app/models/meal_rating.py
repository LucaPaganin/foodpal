from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4
from pydantic import Field
from app.models.meal import MealRating
from app.schemas import BaseSchema


class MealRatingBase(BaseSchema):
    meal_id: UUID
    rating: MealRating
    comments: Optional[str] = None
    date_consumed: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        use_enum_values = True
        


class MealRatingCreate(MealRatingBase):
    pass


class MealRatingUpdate(BaseSchema):
    rating: Optional[MealRating] = None
    comments: Optional[str] = None
    
    class Config:
        use_enum_values = True
        


class MealRatingDB(MealRatingBase):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: UUID
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
        


class MealRating(MealRatingBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    user_id: UUID
    household_id: UUID
    
    class Config:
        use_enum_values = True
        orm_mode = True
        


class MealRatingStatistics(BaseSchema):
    meal_id: UUID
    meal_name: str
    average_rating: float
    total_ratings: int
    rating_distribution: Dict[int, int]  # Rating value -> count
    recent_comments: List[str]
    
    class Config:
        use_enum_values = True
