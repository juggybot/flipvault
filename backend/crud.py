from sqlalchemy.orm import Session
from . import models
import json  # Import JSON for serialization
from .models import Product
import datetime  # Import datetime for subscription dates

def create_product(db: Session, name: str, image_url: str):
    db_product = Product(name=name, image_url=image_url)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return {"message": "Product deleted successfully"}
    return None

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Product).offset(skip).limit(limit).all()

def update_product(db: Session, product_id: int, product_data: dict):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        for key, value in product_data.items():
            setattr(product, key, value)
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    return None

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, hashed_password: str, plan: str = "free"):
    db_user = models.User(username=username, hashed_password=hashed_password, plan=plan)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return user
    return None

def update_user_plan(db: Session, user_id: int, plan: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.plan = plan
        db.commit()
        db.refresh(user)
        return user
    return None

def update_user_subscription(db: Session, user_id: int, plan: str, start: datetime.datetime = None, end: datetime.datetime = None, stripe_subscription_id: str = None):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.plan = plan
        if start:
            user.subscription_start = start
        if end:
            user.subscription_end = end
        if stripe_subscription_id:
            user.stripe_subscription_id = stripe_subscription_id
        db.commit()
        db.refresh(user)
        return user
    return None

