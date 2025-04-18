from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.oidc import get_token_data, TokenData
from app.models.meal_rating import MealRatingBase, MealRatingCreate, MealRatingUpdate, MealRatingDB
from app.models.meal_rating import MealRating, MealRatingStatistics
from app.db.cosmos_db import cosmos_db

router = APIRouter(
    prefix="/meal-ratings",
    tags=["meal-ratings"],
    responses={
        404: {"description": "Not found"},
        401: {"description": "Not authenticated"}
    },
)

@router.post("/", response_model=MealRating, status_code=status.HTTP_201_CREATED)
async def create_meal_rating(
    rating: MealRatingCreate,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Create a new meal rating.
    """
    try:
        ratings_container = cosmos_db.get_container("meal_ratings")
        
        # Create rating with user info
        rating_db = MealRatingDB(
            **rating.dict(),
            user_id=token_data.sub,
            household_id=token_data.sub  # Using user ID as household ID for now
        )
        
        # Save to database
        await ratings_container.create_item(rating_db.dict())
        
        # After rating is saved, update the meal's average rating
        await update_meal_average_rating(rating_db.meal_id, token_data.sub)
        
        return rating_db
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating meal rating: {str(e)}"
        )

@router.get("/meal/{meal_id}", response_model=List[MealRating])
async def get_meal_ratings(
    meal_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Get all ratings for a specific meal.
    """
    try:
        ratings_container = cosmos_db.get_container("meal_ratings")
        
        # Query to get all ratings for this meal
        query = "SELECT * FROM c WHERE c.household_id = @household_id AND c.meal_id = @meal_id"
        params = [
            {"name": "@household_id", "value": token_data.sub},
            {"name": "@meal_id", "value": str(meal_id)}
        ]
        
        # Execute the query
        ratings = []
        async for rating in ratings_container.query_items(
            query=query,
            parameters=params,
            partition_key=token_data.sub
        ):
            ratings.append(MealRating(**rating))
            
        return ratings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal ratings: {str(e)}"
        )

@router.get("/meal/{meal_id}/statistics", response_model=MealRatingStatistics)
async def get_meal_rating_statistics(
    meal_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Get rating statistics for a specific meal.
    """
    try:
        ratings_container = cosmos_db.get_container("meal_ratings")
        meals_container = cosmos_db.get_container("meals")
        
        # Get meal name first
        meal_query = "SELECT c.name FROM c WHERE c.id = @meal_id"
        meal_params = [{"name": "@meal_id", "value": str(meal_id)}]
        
        meal_name = "Unknown Meal"
        async for meal in meals_container.query_items(
            query=meal_query,
            parameters=meal_params,
            enable_cross_partition_query=True
        ):
            meal_name = meal.get('name')
            break
        
        # Query to get all ratings for this meal
        query = "SELECT * FROM c WHERE c.household_id = @household_id AND c.meal_id = @meal_id"
        params = [
            {"name": "@household_id", "value": token_data.sub},
            {"name": "@meal_id", "value": str(meal_id)}
        ]
        
        # Execute the query and calculate statistics
        ratings = []
        rating_sum = 0
        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        comments = []
        
        async for rating in ratings_container.query_items(
            query=query,
            parameters=params,
            partition_key=token_data.sub
        ):
            ratings.append(MealRating(**rating))
            rating_value = rating.get('rating')
            rating_sum += rating_value
            rating_distribution[rating_value] = rating_distribution.get(rating_value, 0) + 1
            
            if rating.get('comments'):
                comments.append(rating.get('comments'))
        
        # Calculate average rating
        total_ratings = len(ratings)
        average_rating = rating_sum / total_ratings if total_ratings > 0 else 0
        
        # Get the most recent comments (limit to 5)
        recent_comments = comments[-5:] if comments else []
        
        # Create the statistics object
        statistics = MealRatingStatistics(
            meal_id=str(meal_id),
            meal_name=meal_name,
            average_rating=round(average_rating, 1),
            total_ratings=total_ratings,
            rating_distribution=rating_distribution,
            recent_comments=recent_comments
        )
        
        return statistics
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal rating statistics: {str(e)}"
        )

@router.delete("/{rating_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal_rating(
    rating_id: UUID,
    token_data: TokenData = Depends(get_token_data)
):
    """
    Delete a specific meal rating by ID.
    """
    try:
        ratings_container = cosmos_db.get_container("meal_ratings")
        
        # First get the existing rating
        query = "SELECT * FROM c WHERE c.id = @id"
        params = [{"name": "@id", "value": str(rating_id)}]
        
        # Execute query
        ratings = []
        async for rating in ratings_container.query_items(
            query=query,
            parameters=params,
            enable_cross_partition_query=True
        ):
            ratings.append(MealRatingDB(**rating))
        
        if not ratings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rating with ID {rating_id} not found"
            )
        
        existing_rating = ratings[0]
        
        # Check if user has access to delete this rating
        if str(existing_rating.user_id) != token_data.sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this rating"
            )
        
        meal_id = existing_rating.meal_id
        
        # Delete the rating
        await ratings_container.delete_item(
            item=str(existing_rating.id),
            partition_key=str(existing_rating.household_id)
        )
        
        # Update the meal's average rating
        await update_meal_average_rating(meal_id, token_data.sub)
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting meal rating: {str(e)}"
        )

async def update_meal_average_rating(meal_id: UUID, household_id: str):
    """
    Helper function to update a meal's average rating based on all ratings.
    """
    try:
        ratings_container = cosmos_db.get_container("meal_ratings")
        meals_container = cosmos_db.get_container("meals")
        
        # Query to get all ratings for this meal
        query = "SELECT c.rating FROM c WHERE c.household_id = @household_id AND c.meal_id = @meal_id"
        params = [
            {"name": "@household_id", "value": household_id},
            {"name": "@meal_id", "value": str(meal_id)}
        ]
        
        # Calculate average rating
        ratings = []
        async for rating in ratings_container.query_items(
            query=query,
            parameters=params,
            partition_key=household_id
        ):
            ratings.append(rating.get('rating'))
        
        # Calculate average
        average_rating = sum(ratings) / len(ratings) if ratings else None
        
        # Round to nearest integer for the enum
        if average_rating is not None:
            average_rating = round(average_rating)
        
        # Update the meal with the new average rating
        meal_query = "SELECT * FROM c WHERE c.id = @meal_id"
        meal_params = [{"name": "@meal_id", "value": str(meal_id)}]
        
        meals = []
        async for meal in meals_container.query_items(
            query=meal_query,
            parameters=meal_params,
            enable_cross_partition_query=True
        ):
            meals.append(meal)
        
        if meals:
            meal = meals[0]
            meal['rating'] = average_rating
            await meals_container.replace_item(
                item=meal['id'],
                body=meal
            )
            
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error updating meal average rating: {str(e)}")
        pass
