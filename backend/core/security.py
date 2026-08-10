# from passlib.context import CryptContext
# from jose import jwt, JWTError
# from datetime import datetime, timedelta
# from core.config import settings

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)

# def verify_password(plain: str, hashed: str) -> bool:
#     return pwd_context.verify(plain, hashed)

# def create_access_token(data: dict, expires_minutes: int = 30):
#     to_encode = data.copy()
#     to_encode["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
#     return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

# def create_refresh_token(data: dict, expires_days: int = 7):
#     to_encode = data.copy()
#     to_encode["exp"] = datetime.utcnow() + timedelta(days=expires_days)
#     return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

# def decode_token(token: str):
#     try:
#         return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
#     except JWTError:
#         return None

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

from core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode["exp"] = expire

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    to_encode["exp"] = expire

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str):
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        return None