"""Google OAuth authentication integration for FoodPal."""
from typing import Dict, Optional

import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.db.cosmos_db import get_db
from app.models.user import UserInDB

# OAuth2 scheme for Google token
oauth2_scheme_google = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/google", auto_error=False)

# Google OAuth configuration
GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI


async def verify_google_token(token: str) -> Dict:
    """Verify Google ID token and extract claims."""
    try:
        # Request information to get Google certs
        request = google_requests.Request()
        
        # Verify the token
        id_info = id_token.verify_oauth2_token(token, request, GOOGLE_CLIENT_ID)
        
        # Check if issuer is Google
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError("Invalid issuer")
        
        return id_info
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


async def exchange_auth_code(code: str) -> Dict:
    """Exchange authorization code for access token and ID token."""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication code"
            )
        return response.json()


async def get_current_user_from_google(
    token: Optional[str] = Depends(oauth2_scheme_google),
    db=Depends(get_db)
) -> UserInDB:
    """Get user from Google ID token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Verify the token and get claims
    claims = await verify_google_token(token)
    
    # Extract email from claims
    email = claims.get("email")
    if not email or not claims.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Email not found or not verified"
        )
    
    # Look for the user in the database
    user = await db.get_user_by_email(email)
    
    # If the user doesn't exist, create a new one (auto-registration)
    if not user:
        name = claims.get("name", "")
        user = UserInDB(
            email=email,
            hashed_password="",  # No password for social login
            full_name=name,
            is_google_user=True
        )
        user = await db.create_user(user)
    
    return user
