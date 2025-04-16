"""Authentication API endpoints."""
from datetime import timedelta
from typing import Any, Dict

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import (
    create_access_token, 
    get_current_user,
    get_password_hash,
    verify_password
)
from app.core.azure_auth import exchange_auth_code as azure_exchange_code
from app.core.azure_auth import verify_azure_token
from app.core.google_auth import verify_google_token
from app.core.config import settings
from app.db.cosmos_db import get_db
from app.models.user import UserCreate, UserInDB, UserResponse
from app.schemas.token import Token

router = APIRouter()


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
) -> Dict[str, str]:
    """OAuth2 compatible token login, get an access token for future requests."""
    # Find the user in the database
    user = await db.get_user_by_email(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_in: UserCreate = Body(...),
    db = Depends(get_db)
) -> Any:
    """Register a new user."""
    # Check if user with this email already exists
    existing_user = await db.get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    user = UserInDB(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        households=[]
    )
    
    # Save user to database
    created_user = await db.create_user(user)
    
    return UserResponse(
        id=created_user.id,
        email=created_user.email,
        full_name=created_user.full_name,
        households=created_user.households
    )


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: UserInDB = Depends(get_current_user)
) -> Any:
    """Get current user."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        households=current_user.households
    )


@router.post("/azure/callback", response_model=Token)
async def azure_callback(
    code: str = Body(..., embed=True),
    db = Depends(get_db)
) -> Dict[str, str]:
    """Handle Azure AD B2C callback and generate JWT token."""
    try:
        # Exchange code for token
        token_data = await azure_exchange_code(code)
        
        # Extract the ID token
        id_token = token_data.get("id_token")
        if not id_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid response from Azure AD B2C"
            )
        
        # Verify token and get claims
        claims = await verify_azure_token(id_token)
        
        # Get email from claims
        email = claims.get("emails")
        if isinstance(email, list) and len(email) > 0:
            email = email[0]
        else:
            email = claims.get("email")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in token claims"
            )
        
        # Find user in database or create new one
        user = await db.get_user_by_email(email)
        if not user:
            name = claims.get("name", "")
            user = UserInDB(
                email=email,
                hashed_password="",  # No password for Azure users
                full_name=name,
                is_azure_user=True,
                households=[]
            )
            user = await db.create_user(user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Azure authentication failed: {str(e)}"
        )


@router.post("/google/callback", response_model=Token)
async def google_callback(
    id_token: str = Body(..., embed=True),
    db = Depends(get_db)
) -> Dict[str, str]:
    """Handle Google OAuth callback and generate JWT token."""
    try:
        # Verify token and get claims
        claims = await verify_google_token(id_token)
        
        # Get email from claims
        email = claims.get("email")
        if not email or not claims.get("email_verified", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in token claims or not verified"
            )
        
        # Find user in database or create new one
        user = await db.get_user_by_email(email)
        if not user:
            name = claims.get("name", "")
            user = UserInDB(
                email=email,
                hashed_password="",  # No password for Google users
                full_name=name,
                is_google_user=True,
                households=[]
            )
            user = await db.create_user(user)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )
