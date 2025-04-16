from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(
    prefix="/meals",
    tags=["meals"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_meals():
    """
    Get all meals.
    """
    # This is a placeholder for actual database interaction
    return {"meals": [
        {"id": "1", "name": "Spaghetti Carbonara", "category": "dinner"},
        {"id": "2", "name": "Greek Yogurt with Berries", "category": "breakfast"},
    ]}

@router.get("/{meal_id}")
async def get_meal(meal_id: str):
    """
    Get a specific meal by ID.
    """
    # This is a placeholder for actual database interaction
    return {"id": meal_id, "name": "Example Meal", "category": "lunch"}
