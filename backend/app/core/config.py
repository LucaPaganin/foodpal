import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FoodPal"
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000"]
    
    # Azure Cosmos DB
    COSMOS_ENDPOINT: str = os.getenv("COSMOS_ENDPOINT", "")
    COSMOS_KEY: str = os.getenv("COSMOS_KEY", "")
    COSMOS_DATABASE: str = os.getenv("COSMOS_DATABASE", "foodpal-dev")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Azure AD B2C
    AZURE_AD_B2C_TENANT_NAME: str = os.getenv("AZURE_AD_B2C_TENANT_NAME", "")
    AZURE_AD_B2C_CLIENT_ID: str = os.getenv("AZURE_AD_B2C_CLIENT_ID", "")
    AZURE_AD_B2C_CLIENT_SECRET: str = os.getenv("AZURE_AD_B2C_CLIENT_SECRET", "")
    AZURE_AD_B2C_POLICY_SIGNIN: str = os.getenv("AZURE_AD_B2C_POLICY_SIGNIN", "B2C_1_signin")
    AZURE_AD_B2C_POLICY_SIGNUP: str = os.getenv("AZURE_AD_B2C_POLICY_SIGNUP", "B2C_1_signup")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
