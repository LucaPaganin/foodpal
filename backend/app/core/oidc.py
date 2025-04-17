from typing import Dict, Optional, List, Any
from authlib.integrations.starlette_client import OAuth
from authlib.oidc.core import CodeIDToken
from authlib.jose import jwt
import time
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel

from app.core.config import settings

# Setup logger
logger = logging.getLogger(__name__)

# OAuth2 scheme for swagger docs
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"https://{settings.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/{settings.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/{settings.AZURE_AD_B2C_POLICY}/oauth2/v2.0/authorize",
    tokenUrl=f"https://{settings.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/{settings.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/{settings.AZURE_AD_B2C_POLICY}/oauth2/v2.0/token"
)

# Initialize OAuth with Authlib
oauth = OAuth()

# Register Azure AD B2C provider
oauth.register(
    name="azure_ad_b2c",
    client_id=settings.AZURE_AD_B2C_CLIENT_ID,
    client_secret=settings.AZURE_AD_B2C_CLIENT_SECRET,
    server_metadata_url=f"https://{settings.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/{settings.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/{settings.AZURE_AD_B2C_POLICY}/v2.0/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid profile email",
        "response_type": "code",
        "prompt": "login",
        "code_challenge_method": "S256",  # Enable PKCE with SHA-256
    },
)

# Register Google provider (if using direct Google integration without B2C)
if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={
            "scope": "openid email profile",
            "prompt": "select_account",
            "code_challenge_method": "S256",  # Enable PKCE with SHA-256
        },
    )

class TokenData(BaseModel):
    sub: str
    name: Optional[str] = None
    preferred_username: Optional[str] = None
    email: Optional[str] = None
    exp: Optional[int] = None

async def get_token_data(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    Decode and validate JWT token
    """
    try:
        # Get Azure AD B2C JWKS
        jwks_uri = f"https://{settings.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/{settings.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/discovery/v2.0/keys?p={settings.AZURE_AD_B2C_POLICY}"
        
        # Decode the token
        payload = jwt.decode(
            token,
            jwks_uri,
            claims_options={
                "iss": {"essential": True, "value": f"https://{settings.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/{settings.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/v2.0/"},
                "aud": {"essential": True, "value": settings.AZURE_AD_B2C_CLIENT_ID}
            }
        )
        
        # Check if token is expired
        if "exp" in payload and payload["exp"] < time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Extract token data
        token_data = TokenData(
            sub=payload["sub"],
            name=payload.get("name"),
            preferred_username=payload.get("preferred_username"),
            email=payload.get("emails", [None])[0] if isinstance(payload.get("emails"), list) else payload.get("email"),
            exp=payload.get("exp")
        )
        
        return token_data
        
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def validate_google_token(token: str) -> Dict[str, Any]:
    """
    Validate Google ID token
    """
    try:
        google_client = oauth.create_client('google')
        userinfo = await google_client.parse_id_token(token)
        return userinfo
    except Exception as e:
        logger.error(f"Google token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )
