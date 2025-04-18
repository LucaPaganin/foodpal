from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.oidc import get_token_data, TokenData
from app.models.meal_plan import MealPlanEntryCreate, MealPlanEntryUpdate, MealPlanEntryDB
from app.models.meal_plan import MealPlanEntry, MealPlanEntryWithMeal, MealPlanPeriod, MealPlanStatistics
from app.models.meal import MealDB
from app.db.cosmos_db import cosmos_db

router = APIRouter(
    prefix="/meal-plans",
    tags=["meal-plans"],
    responses={
        404: {"description": "Not found"},
        401: {"description": "Not authenticated"}
    },
)

@router.get("/", response_model=List[MealPlanEntryWithMeal])
async def get_meal_plans(
    token_data: TokenData = Depends(get_token_data),
    start_date: Optional[date] = Query(None, description="Start date for meal plans"),
    end_date: Optional[date] = Query(None, description="End date for meal plans"),
    meal_type: Optional[str] = Query(None, description="Filter by meal type")
):
    """
    Get all meal plans within a date range with optional filtering.
    """
    try:
        meal_plans_container = cosmos_db.get_container("meal_plans")
        meals_container = cosmos_db.get_container("meals")
        
        # Set default dates if not provided
        if not start_date:
            start_date = date.today()
        if not end_date:
            end_date = start_date + timedelta(days=7)
        
        # Base query to filter by household ID and date range
        query = "SELECT * FROM c WHERE c.household_id = @household_id AND c.planned_date >= @start_date AND c.planned_date <= @end_date"
        params = [
            {"name": "@household_id", "value": token_data.sub},
            {"name": "@start_date", "value": start_date.isoformat()},
            {"name": "@end_date", "value": end_date.isoformat()}
        ]
        
        # Add meal type filter if provided
        if meal_type:
            query += " AND c.meal_type = @meal_type"
            params.append({"name": "@meal_type", "value": meal_type})
        
        # Execute the query
        meal_plans = []
        async for plan in meal_plans_container.query_items(
            query=query,
            parameters=params,
            partition_key=token_data.sub
        ):
            meal_plan_entry = MealPlanEntryDB(**plan)
            
            # Get the associated meal
            meal_query = "SELECT * FROM c WHERE c.id = @meal_id"
            meal_params = [{"name": "@meal_id", "value": str(meal_plan_entry.meal_id)}]
            
            meals = []
            async for meal in meals_container.query_items(
                query=meal_query,
                parameters=meal_params,
                enable_cross_partition_query=True
            ):
                meals.append(MealDB(**meal))
            
            # Create the combined response object
            if meals:
                meal_plan_with_meal = MealPlanEntryWithMeal(
                    **meal_plan_entry.dict(),
                    meal=meals[0]
                )
                meal_plans.append(meal_plan_with_meal)
            else:
                # Handle case where meal doesn't exist anymore
                meal_plans.append(MealPlanEntryWithMeal(**meal_plan_entry.dict()))
            
        return meal_plans
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal plans: {str(e)}"
        )

@router.post("/", response_model=MealPlanEntry, status_code=status.HTTP_201_CREATED)
async def create_meal_plan(
    meal_plan: MealPlanEntryCreate,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Create a new meal plan entry.
    """
    try:
        meal_plans_container = cosmos_db.get_container("meal_plans")
        
        # Create meal plan with user info
        meal_plan_db = MealPlanEntryDB(
            **meal_plan.dict(),
            created_by=token_data.sub,
            household_id=token_data.sub  # Using user ID as household ID for now
        )
        
        # Save to database
        await meal_plans_container.create_item(meal_plan_db.dict())
        
        return meal_plan_db
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating meal plan: {str(e)}"
        )

@router.get("/{meal_plan_id}", response_model=MealPlanEntryWithMeal)
async def get_meal_plan(
    meal_plan_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Get a specific meal plan entry by ID.
    """
    try:
        meal_plans_container = cosmos_db.get_container("meal_plans")
        meals_container = cosmos_db.get_container("meals")
        
        # Query by ID
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(meal_plan_id)}]
        
        # Execute query
        meal_plans = []
        async for plan in meal_plans_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            meal_plans.append(MealPlanEntryDB(**plan))
        
        if not meal_plans:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal plan with ID {meal_plan_id} not found"
            )
            
        meal_plan_entry = meal_plans[0]
        
        # Check if user has access to this meal plan
        if str(meal_plan_entry.household_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this meal plan"
            )
            
        # Get the associated meal
        meal_query = "SELECT * FROM c WHERE c.id = @meal_id"
        meal_params = [{"name": "@meal_id", "value": str(meal_plan_entry.meal_id)}]
        
        meals = []
        async for meal in meals_container.query_items(
            query=meal_query,
            parameters=meal_params,
            enable_cross_partition_query=True
        ):
            meals.append(MealDB(**meal))
        
        # Create the combined response object
        if meals:
            return MealPlanEntryWithMeal(
                **meal_plan_entry.dict(),
                meal=meals[0]
            )
        else:
            # Handle case where meal doesn't exist anymore
            return MealPlanEntryWithMeal(**meal_plan_entry.dict())
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal plan: {str(e)}"
        )

@router.patch("/{meal_plan_id}", response_model=MealPlanEntry)
async def update_meal_plan(
    meal_plan_id: UUID,
    meal_plan_update: MealPlanEntryUpdate,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Update a specific meal plan by ID.
    """
    try:
        meal_plans_container = cosmos_db.get_container("meal_plans")
        
        # First get the existing meal plan
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(meal_plan_id)}]
        
        # Execute query
        meal_plans = []
        async for plan in meal_plans_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            meal_plans.append(MealPlanEntryDB(**plan))
        
        if not meal_plans:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal plan with ID {meal_plan_id} not found"
            )
        
        existing_plan = meal_plans[0]
        
        # Check if user has access to update this meal plan
        if str(existing_plan.household_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this meal plan"
            )
        
        # Update the meal plan with new values
        update_data = meal_plan_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing_plan, key, value)
        
        # Update the timestamp
        existing_plan.updated_at = datetime.utcnow()
        
        # Save the updated meal plan
        await meal_plans_container.replace_item(
            item=str(existing_plan.id), 
            body=existing_plan.dict()
        )
        
        return existing_plan
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating meal plan: {str(e)}"
        )

@router.delete("/{meal_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal_plan(
    meal_plan_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Delete a specific meal plan by ID.
    """
    try:
        meal_plans_container = cosmos_db.get_container("meal_plans")
        
        # First get the existing meal plan
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(meal_plan_id)}]
        
        # Execute query
        meal_plans = []
        async for plan in meal_plans_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            meal_plans.append(MealPlanEntryDB(**plan))
        
        if not meal_plans:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal plan with ID {meal_plan_id} not found"
            )
        
        existing_plan = meal_plans[0]
        
        # Check if user has access to delete this meal plan
        if str(existing_plan.household_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this meal plan"
            )
        
        # Delete the meal plan
        await meal_plans_container.delete_item(
            item=str(existing_plan.id),
            partition_key=str(existing_plan.household_id)
        )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting meal plan: {str(e)}"
        )

@router.get("/statistics/{period}", response_model=MealPlanStatistics)
async def get_meal_plan_statistics(
    period: MealPlanPeriod,
    start_date: Optional[date] = Query(None, description="Start date for statistics"),
    token_data: TokenData = Depends(get_token_data)
):
    """
    Get meal plan statistics for a specific period.
    """
    try:
        meal_plans_container = cosmos_db.get_container("meal_plans")
        
        # Set default start date if not provided
        if not start_date:
            start_date = date.today()
        
        # Calculate end date based on period
        if period == MealPlanPeriod.DAY:
            end_date = start_date
        elif period == MealPlanPeriod.WEEK:
            end_date = start_date + timedelta(days=6)
        elif period == MealPlanPeriod.MONTH:
            end_date = start_date + timedelta(days=30)  # Approximate
        
        # Query to get all meal plans within the period
        query = """
        SELECT
            c.status,
            c.meal_id
        FROM c
        WHERE c.household_id = @household_id
        AND c.planned_date >= @start_date
        AND c.planned_date <= @end_date
        """
        
        params = [
            {"name": "@household_id", "value": token_data.sub},
            {"name": "@start_date", "value": start_date.isoformat()},
            {"name": "@end_date", "value": end_date.isoformat()}
        ]
        
        # Execute query to collect statistics
        total_planned = 0
        prepared_count = 0
        skipped_count = 0
        replaced_count = 0
        meal_counts = {}  # meal_id -> count
        
        async for item in meal_plans_container.query_items(
            query=query,
            parameters=params,
            partition_key=token_data.sub
        ):
            total_planned += 1
            
            # Count by status
            if item.get('status') == 'prepared':
                prepared_count += 1
                meal_id = item.get('meal_id')
                meal_counts[meal_id] = meal_counts.get(meal_id, 0) + 1
            elif item.get('status') == 'skipped':
                skipped_count += 1
            elif item.get('status') == 'replaced':
                replaced_count += 1
        
        # Find most common meal
        favorite_meal_id = None
        favorite_meal_name = None
        most_common_count = 0
        
        for meal_id, count in meal_counts.items():
            if count > most_common_count:
                most_common_count = count
                favorite_meal_id = meal_id
        
        # Get the name of the favorite meal if there is one
        if favorite_meal_id:
            meal_query = "SELECT c.name FROM c WHERE c.id = @meal_id"
            meal_params = [{"name": "@meal_id", "value": favorite_meal_id}]
            
            async for meal in meals_container.query_items(
                query=meal_query,
                parameters=meal_params,
                enable_cross_partition_query=True
            ):
                favorite_meal_name = meal.get('name')
                break
        
        # Create the statistics object
        statistics = MealPlanStatistics(
            period=period,
            start_date=start_date,
            end_date=end_date,
            total_planned=total_planned,
            prepared_count=prepared_count,
            skipped_count=skipped_count,
            replaced_count=replaced_count,
            favorite_meal_id=favorite_meal_id,
            favorite_meal_name=favorite_meal_name,
            most_common_category=None  # Would require additional complexity to calculate
        )
        
        return statistics
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal plan statistics: {str(e)}"
        )
