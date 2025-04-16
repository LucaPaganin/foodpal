from fastapi import APIRouter
from app.api.routes import meals

api_router = APIRouter()
api_router.include_router(meals.router)

# Add more routers here as you develop other features
# api_router.include_router(ingredients.router)
# api_router.include_router(recipes.router)
# api_router.include_router(auth.router)
