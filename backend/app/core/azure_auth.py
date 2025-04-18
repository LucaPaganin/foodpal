"""Azure AD B2C authentication integration for FoodPal."""
import json
from typing import Dict, Optional

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.db.cosmos_db import get_db
from app.models.user import UserInDB

# OAuth2 scheme for Azure B2C token
oauth2_scheme_azure = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/azure", auto_error=False)

# Azure AD B2C configuration
B2C_TENANT = settings.AZURE_AD_B2C_TENANT
B2C_CLIENT_ID = settings.AZURE_AD_B2C_CLIENT_ID
B2C_CLIENT_SECRET = settings.AZURE_AD_B2C_CLIENT_SECRET
B2C_REDIRECT_URI = settings.AZURE_AD_B2C_REDIRECT_URI
B2C_TOKEN_ENDPOINT = f"https://{B2C_TENANT}.b2clogin.com/{B2C_TENANT}.onmicrosoft.com/oauth2/v2.0/token"
B2C_JWKS_URI = f"https://{B2C_TENANT}.b2clogin.com/{B2C_TENANT}.onmicrosoft.com/discovery/v2.0/keys"


async def get_jwks() -> Dict:
    """Get the JSON Web Key Set from Azure AD B2C."""
    async with httpx.AsyncClient() as client:
        response = await client.get(B2C_JWKS_URI)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not connect to authentication provider"
            )
        return response.json()


async def exchange_auth_code(code: str) -> Dict:
    """Exchange authorization code for access token."""
    data = {
        "grant_type": "authorization_code",
        "client_id": B2C_CLIENT_ID,
        "client_secret": B2C_CLIENT_SECRET,
        "code": code,
        "redirect_uri": B2C_REDIRECT_URI,
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(B2C_TOKEN_ENDPOINT, data=data)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication code"
            )
        return response.json()


async def verify_azure_token(token: str) -> Dict:
    """Verify Azure AD B2C token and extract claims."""
    jwks = await get_jwks()
    
    try:
        # Unverified decode to get the kid (key ID)
        header = jwt.get_unverified_header(token)
        kid = header["kid"]
        
        # Find the matching key in the JWKS
        key = None
        for jwk in jwks["keys"]:
            if jwk["kid"] == kid:
                key = jwk
                break
        
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Key ID not found"
            )
        
        # Create public key from JWK
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        
        # Verify the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=B2C_CLIENT_ID
        )
        
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


async def get_current_user_from_azure(
    token: Optional[str] = Depends(oauth2_scheme_azure),
    db=Depends(get_db)
) -> UserInDB:
    """Get user from Azure AD B2C token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Verify the token and get claims
    claims = await verify_azure_token(token)
    
    # Extract email from claims (Azure B2C typically provides it in 'emails' claim)
    email = claims.get("emails")
    if not email or not isinstance(email, list) or len(email) == 0:
        email = claims.get("email")  # Try alternative email claim
    
    if isinstance(email, list):
        email = email[0]
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Email not found"
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
            is_azure_user=True
        )
        user = await db.create_user(user)
    
    return user
