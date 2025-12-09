"""
Authentication utilities: JWT tokens, password hashing, etc.
"""
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config.settings import settings
from config.database import get_db
from users.models import User

# HTTP Bearer token
security = HTTPBearer()

def _normalize_password(password: str) -> bytes:
    """
    Normalize password to handle bcrypt's 72-byte limit.
    Always uses SHA-256 to hash passwords before bcrypt to ensure:
    1. No password ever exceeds bcrypt's 72-byte limit
    2. Consistent hashing behavior for all password lengths
    3. No edge cases with multi-byte UTF-8 characters
    
    Returns bytes for direct use with bcrypt.
    """
    password_bytes = password.encode('utf-8')
    # Always hash with SHA-256 to stay well within bcrypt's 72-byte limit
    # SHA-256 hex digest is exactly 64 characters (64 bytes in ASCII)
    sha256_hash = hashlib.sha256(password_bytes).hexdigest()
    return sha256_hash.encode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash"""
    normalized_password = _normalize_password(plain_password)
    return bcrypt.checkpw(normalized_password, hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    normalized_password = _normalize_password(password)
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(normalized_password, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Data to encode in token
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    Decode JWT access token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user
    
    Args:
        credentials: HTTP bearer credentials
        db: Database session
        
    Returns:
        User model instance
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def get_current_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current verified user
    
    Args:
        current_user: Current user from token
        
    Returns:
        Verified user
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )
    return current_user
