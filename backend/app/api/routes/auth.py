from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from app.core.oidc import oauth, get_token_data, validate_google_token, TokenData
from app.core.config import settings
from app.models.user import User
import jwt
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class CodeRequest(BaseModel):
    code: str
    
class GoogleTokenRequest(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None

@router.get("/login/azure")
async def login_azure(request: Request):
    """
    Initiate Azure AD B2C login
    """
    try:
        azure_client = oauth.create_client('azure_ad_b2c')
        redirect_uri = request.url_for('azure_callback')
        return await azure_client.authorize_redirect(request, redirect_uri)
    except Exception as e:
        logger.error(f"Azure login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Azure login error: {str(e)}"
        )

@router.post("/azure/callback")
async def azure_callback(request: CodeRequest):
    """
    Handle Azure AD B2C callback
    """
    try:
        azure_client = oauth.create_client('azure_ad_b2c')
        # Exchange code for token
        token = await azure_client.authorize_access_token(code=request.code)
        user_info = token.get('userinfo', {})
        
        if not user_info:
            # Extract information from ID token if userinfo is not available
            id_token = token.get('id_token')
            if id_token:
                user_info = jwt.decode(id_token, options={"verify_signature": False})
        
        # Get or create user in your database
        user = await get_or_create_user(
            provider="azure",
            sub=user_info.get('sub'),
            email=user_info.get('emails', [None])[0] if isinstance(user_info.get('emails'), list) else user_info.get('email'),
            name=user_info.get('name'),
            username=user_info.get('preferred_username')
        )
        
        # Create a JWT token for your API
        api_token = create_api_token(user)
        
        return TokenResponse(access_token=api_token)
    
    except Exception as e:
        logger.error(f"Azure callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Azure callback error: {str(e)}"
        )

@router.post("/google/callback")
async def google_callback(request: GoogleTokenRequest):
    """
    Handle Google callback with ID token
    """
    try:
        # Validate the Google ID token
        user_info = await validate_google_token(request.id_token)
        
        # Get or create user in your database
        user = await get_or_create_user(
            provider="google",
            sub=user_info.get('sub'),
            email=user_info.get('email'),
            name=user_info.get('name'),
            username=user_info.get('email')
        )
        
        # Create a JWT token for your API
        api_token = create_api_token(user)
        
        return TokenResponse(access_token=api_token)
    
    except Exception as e:
        logger.error(f"Google callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google callback error: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token_data: TokenData = Depends(get_token_data)):
    """
    Get current authenticated user
    """
    try:
        # Find user in database
        user = await User.find_by_sub(token_data.sub)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name
        )
        
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user: {str(e)}"
        )

async def get_or_create_user(provider: str, sub: str, email: str, name: Optional[str] = None, username: Optional[str] = None):
    """
    Get or create a user in the database based on the provider and subject identifier
    """
    try:
        # Try to find user by provider and sub
        user = await User.find_by_provider_and_sub(provider, sub)
        
        # If user doesn't exist, create a new one
        if not user:
            user = User(
                provider=provider,
                provider_user_id=sub,
                email=email,
                username=username or email.split('@')[0],
                full_name=name
            )
            await user.save()
            
        return user
    
    except Exception as e:
        logger.error(f"Error in get_or_create_user: {str(e)}")
        raise

def create_api_token(user: User) -> str:
    """
    Create a JWT token for API authentication
    """
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "name": user.full_name,
        "iat": int(time.time()),
        "exp": int(time.time() + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
