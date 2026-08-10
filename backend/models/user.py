# from sqlalchemy import Boolean, Column, DateTime, Integer, String
# from sqlalchemy.orm import relationship

# from core.database import Base


# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, nullable=False, index=True)
#     hashed_password = Column(String, nullable=False)
#     name = Column(String, nullable=False)
#     role = Column(String, default="student")
#     is_active = Column(Boolean, default=True)
#     created_at = Column(DateTime(timezone=True))

#     profile = relationship(
#         "UserProfile",
#         back_populates="user",
#         uselist=False
#     )
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="student")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True))

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False
    )