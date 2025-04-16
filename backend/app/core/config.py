from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FoodPal"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000"]

settings = Settings()
