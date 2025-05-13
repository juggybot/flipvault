from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    image_url = Column(String)
    average_ebay_price = Column(Float, nullable=True)
    ebay_listings = Column(Integer, nullable=True)
    ebay_sale_amount = Column(Float, nullable=True)
    search_volume_us = Column(String, nullable=True)
    search_volume_au = Column(String, nullable=True)
    search_volume_uk = Column(String, nullable=True)
    popular_keywords = Column(Text, nullable=True)
    last_updated = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
