from fastapi import APIRouter
from app.api.routes import meals, meal_plans, meal_ratings, auth

api_router = APIRouter()
api_router.include_router(meals.router)
api_router.include_router(meal_plans.router)
api_router.include_router(meal_ratings.router)
api_router.include_router(auth.router)

# Add more routers here as you develop other features
# api_router.include_router(ingredients.router)
# api_router.include_router(recipes.router)
