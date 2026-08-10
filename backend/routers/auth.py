from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest

router = APIRouter(tags=["auth"])

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "Email already registered")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token({"sub": str(user.id)}), "token_type": "bearer"}

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer"
    }
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from database import get_db
# from models.user import User

# from schemas.auth import RegisterRequest, LoginRequest

# from core.security import (
#     hash_password,
#     verify_password,
#     create_access_token,
#     create_refresh_token
# )


# router = APIRouter(tags=["auth"])


# @router.post("/register")
# def register(
#     payload: RegisterRequest,
#     db: Session = Depends(get_db)
# ):
#     # Check if email already exists
#     existing = db.query(User).filter(
#         User.email == payload.email
#     ).first()

#     if existing:
#         raise HTTPException(
#             status_code=400,
#             detail="Email already registered"
#         )

#     # Create user
#     user = User(
#         email=payload.email,
#         hashed_password=hash_password(payload.password),
#         name=payload.name,
#         role="student"
#     )

#     db.add(user)
#     db.commit()
#     db.refresh(user)

#     # Create JWT
#     access_token = create_access_token({
#         "sub": str(user.id)
#     })

#     refresh_token = create_refresh_token({
#         "sub": str(user.id)
#     })

#     return {
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "token_type": "bearer"
#     }


# @router.post("/login")
# def login(
#     payload: LoginRequest,
#     db: Session = Depends(get_db)
# ):
#     # Find user
#     user = db.query(User).filter(
#         User.email == payload.email
#     ).first()

#     # Check credentials
#     if not user or not verify_password(
#         payload.password,
#         user.hashed_password
#     ):
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid credentials"
#         )

#     # Create tokens
#     access_token = create_access_token({
#         "sub": str(user.id)
#     })

#     refresh_token = create_refresh_token({
#         "sub": str(user.id)
#     })

#     return {
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "token_type": "bearer"
#     }