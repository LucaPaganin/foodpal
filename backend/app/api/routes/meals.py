from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.oidc import get_token_data, TokenData
from app.models.meal import Meal, MealCreate, MealUpdate, MealDB, MealType, MealCategory
from app.db.cosmos_db import get_container

router = APIRouter(
    prefix="/meals",
    tags=["meals"],
    responses={
        404: {"description": "Not found"},
        401: {"description": "Not authenticated"}
    },
)

@router.get("/", response_model=List[Meal])
async def get_meals(
    token_data: TokenData = Depends(get_token_data),
    household_id: Optional[str] = Query(None, description="Filter by household ID"),
    meal_type: Optional[MealType] = Query(None, description="Filter by meal type"),
    category: Optional[MealCategory] = Query(None, description="Filter by category")
):
    """
    Get all meals with optional filtering.
    """
    try:
        meals_container = await get_container("meals")
        
        # Base query to filter by household ID
        query = "SELECT * FROM c WHERE "
        params = []
        
        # Always filter by current user's household
        actual_household_id = household_id or token_data.sub  # Use token sub as default
        query += "c.household_id = @household_id"
        params.append({"name": "@household_id", "value": actual_household_id})
        
        # Add meal type filter if provided
        if meal_type:
            query += " AND c.meal_type = @meal_type"
            params.append({"name": "@meal_type", "value": meal_type})
        
        # Add category filter if provided
        if category:
            query += " AND ARRAY_CONTAINS(c.categories, @category)"
            params.append({"name": "@category", "value": category})
        
        # Execute the query
        meals = []
        async for meal in meals_container.query_items(
            query=query,
            parameters=params,
            partition_key=actual_household_id
        ):
            meals.append(Meal(**meal))
            
        return meals
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meals: {str(e)}"
        )

@router.post("/", response_model=Meal, status_code=status.HTTP_201_CREATED)
async def create_meal(
    meal: MealCreate,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Create a new meal.
    """
    try:
        meals_container = await get_container("meals")
        
        # Create meal with user info
        meal_db = MealDB(
            **meal.dict(),
            created_by=token_data.sub,
            household_id=token_data.sub  # Using user ID as household ID for now
        )
        
        # Save to database
        await meals_container.create_item(meal_db.dict())
        
        return meal_db
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating meal: {str(e)}"
        )

@router.get("/{meal_id}", response_model=Meal)
async def get_meal(
    meal_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Get a specific meal by ID.
    """
    try:
        meals_container = await get_container("meals")
        
        # Query by ID
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(meal_id)}]
        
        # Execute query
        meals = []
        async for meal in meals_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            meals.append(MealDB(**meal))
        
        if not meals:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal with ID {meal_id} not found"
            )
            
        # Check if user has access to this meal
        if str(meals[0].household_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this meal"
            )
            
        return meals[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal: {str(e)}"
        )

@router.patch("/{meal_id}", response_model=Meal)
async def update_meal(
    meal_id: UUID,
    meal_update: MealUpdate,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Update a specific meal by ID.
    """
    try:
        meals_container = await get_container("meals")
        
        # First get the existing meal
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(meal_id)}]
        
        # Execute query
        meals = []
        async for meal in meals_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            meals.append(MealDB(**meal))
        
        if not meals:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal with ID {meal_id} not found"
            )
        
        existing_meal = meals[0]
        
        # Check if user has access to update this meal
        if str(existing_meal.household_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this meal"
            )
        
        # Update the meal with new values
        update_data = meal_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_meal, key, value)
        
        # Update the timestamp
        from datetime import datetime
        existing_meal.updated_at = datetime.utcnow()
        
        # Save the updated meal
        await meals_container.replace_item(
            item=str(existing_meal.id), 
            body=existing_meal.dict()
        )
        
        return existing_meal
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating meal: {str(e)}"
        )

@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal(
    meal_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Delete a specific meal by ID.
    """
    try:
        meals_container = await get_container("meals")
        
        # First get the existing meal
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(meal_id)}]
        
        # Execute query
        meals = []
        async for meal in meals_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            meals.append(MealDB(**meal))
        
        if not meals:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal with ID {meal_id} not found"
            )
        
        existing_meal = meals[0]
        
        # Check if user has access to delete this meal
        if str(existing_meal.household_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this meal"
            )
        
        # Delete the meal
        await meals_container.delete_item(
            item=str(existing_meal.id),
            partition_key=str(existing_meal.household_id)
        )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting meal: {str(e)}"
        )
