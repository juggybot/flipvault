from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.database import SessionLocal, init_db
from pydantic import BaseModel
from backend import crud, models
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing import Optional, List
from backend.services.scraper import run_scraper
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine 
from sqlalchemy.ext.declarative import declarative_base
import json
from passlib.context import CryptContext
import stripe
import os
import httpx
import datetime

app = FastAPI()

# Update the CORS middleware to handle all required headers and methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://flipvault.netlify.app",
        "https://flipvault-738b0b011a0f.herokuapp.com",
        "https://flipvault-afea58153afb.herokuapp.com",
        "https://flipvault.herokuapp.com"
    ],
    allow_credentials=True,  # Changed to True since we're using credentials
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to properly initialize the database
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        # Don't raise exception here to prevent app from crashing

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

security = HTTPBasic()

def verify_password(credentials: HTTPBasicCredentials):
    correct_username = os.environ.get("ADMIN_USERNAME")
    correct_password = os.environ.get("ADMIN_PASSWORD")
    
    if credentials.username != correct_username or credentials.password != correct_password:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

class ProductCreate(BaseModel):
    name: str
    image_url: str

class ProductResponse(BaseModel):
    id: int
    name: str
    image_url: str
    average_ebay_price: Optional[float] = None
    ebay_listings: Optional[int] = None
    ebay_sale_amount: Optional[float] = None
    search_volume_us: Optional[str] = None
    search_volume_au: Optional[str] = None
    search_volume_uk: Optional[str] = None
    popular_keywords: Optional[List[str]] = None
    last_updated: Optional[str] = None
    
class FeeCalculator:
    PROCESSING_FEE_PERCENT = 0.029
    PROCESSING_FEE_FIXED = 0.30

    def __init__(self, sale_price: float, marketplace: str):
        self.sale_price = sale_price
        self.marketplace = marketplace.lower()
        self.marketplace_fees = {
            "stockx": self._calculate_stockx_fee,
            "ebay": self._calculate_ebay_fee,
            "depop": self._calculate_depop_fee,
            "mercari": self._calculate_mercari_fee,
            "offerup": self._calculate_offerup_fee,
            "poshmark": self._calculate_poshmark_fee,
        }

    def calculate_fee(self) -> float:
        if self.marketplace in self.marketplace_fees:
            return self.marketplace_fees[self.marketplace]()
        raise ValueError(f"Unsupported marketplace: {self.marketplace}")

    def _calculate_stockx_fee(self) -> float:
        return 0.095 * self.sale_price + self._processing_fee()

    def _calculate_ebay_fee(self) -> float:
        return 0.10 * self.sale_price + 0.35  # Insertion fee

    def _calculate_depop_fee(self) -> float:
        return 0.10 * self.sale_price + self._processing_fee()

    def _calculate_mercari_fee(self) -> float:
        return 0.10 * self.sale_price + self._processing_fee()

    def _calculate_offerup_fee(self) -> float:
        return 0.129 * self.sale_price

    def _calculate_poshmark_fee(self) -> float:
        return 2.95 if self.sale_price < 15 else 0.20 * self.sale_price

    def _processing_fee(self) -> float:
        return self.PROCESSING_FEE_PERCENT * self.sale_price + self.PROCESSING_FEE_FIXED

class FeeRequest(BaseModel):
    sale_price: float
    marketplace: str

@app.post("/api/calculate_fee/")
def calculate_fee(fee_request: FeeRequest):
    try:
        calculator = FeeCalculator(fee_request.sale_price, fee_request.marketplace)
        fee = calculator.calculate_fee()
        return {"fee": fee}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, username=user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Password validation
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    hashed_password = pwd_context.hash(user.password)
    new_user = crud.create_user(db, username=user.username, hashed_password=hashed_password)
    return {"message": "User registered successfully"}

@app.post("/login")
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=login_request.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(login_request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"success": True, "message": "Login successful"}

@app.post("/admin-login")
def admin_login(login_request: LoginRequest):
    if login_request.username != "juggy" or login_request.password != "Idus1234@@":
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {"success": True, "message": "Admin login successful"}

@app.post("/products/")
def create_product(product: ProductCreate, db: Session = Depends(get_db), credentials: HTTPBasicCredentials = Depends(security)):
    try:
        verify_password(credentials)
        return crud.create_product(db=db, name=product.name, image_url=product.image_url)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/products/{product_id}/delete")
def delete_product(product_id: int, db: Session = Depends(get_db), credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    product = crud.delete_product(db=db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/products/")
def read_products(skip: int = 0, limit: int = 15, db: Session = Depends(get_db)):
    try:
        return crud.get_products(db, skip=skip, limit=limit)
    except Exception as e:
        print(f"Error retrieving products: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/products/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    try:
        product = crud.get_product(db, product_id=product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Handle popular_keywords safely
        try:
            keywords = json.loads(product.popular_keywords) if isinstance(product.popular_keywords, str) else product.popular_keywords or []
        except (json.JSONDecodeError, TypeError):
            keywords = []

        # Convert SQLAlchemy object to dictionary with safe defaults
        product_dict = {
            "id": product.id,
            "name": product.name,
            "image_url": product.image_url,
            "average_ebay_price": product.average_ebay_price or 0.0,
            "ebay_listings": product.ebay_listings or 0,
            "ebay_sale_amount": product.ebay_sale_amount or 0.0,
            "search_volume_us": product.search_volume_us or "0",
            "search_volume_au": product.search_volume_au or "0",
            "search_volume_uk": product.search_volume_uk or "0",
            "popular_keywords": keywords,
            "last_updated": product.last_updated or None,
        }
        return product_dict
    except Exception as e:
        print(f"Error retrieving product {product_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/search/")
def search_products(query: str, db: Session = Depends(get_db)):
    try:
        products = db.query(models.Product).filter(models.Product.name.ilike(f"%{query}%")).all()
        return products
    except Exception as e:
        print(f"Error searching products: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/products/scrape")
def scrape_products(background_tasks: BackgroundTasks, credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    try:
        # Add better error handling for scraper
        background_tasks.add_task(run_scraper)
        return {"message": "Scraper started in the background"}
    except ValueError as ve:
        print(f"Proxy error: {str(ve)}")
        raise HTTPException(status_code=500, detail="Scraper configuration error: Check proxy settings")
    except Exception as e:
        print(f"Error starting scraper: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/products/scrape/{product_id}")
def scrape_product(product_id: int, background_tasks: BackgroundTasks, credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    try:
        background_tasks.add_task(run_scraper, product_id)  # Run the scraper in the background for a specific product
        return {"message": f"Scraper started in the background for product ID {product_id}"}
    except Exception as e:
        print(f"Error starting scraper for product {product_id}: {e}")
        return {"message": f"Error starting scraper: {str(e)}"}

@app.get("/test/")
def test_endpoint():
    return {"message": "Server is running"}

@app.get("/update/database")
def update_database():
    try:
        init_db()
        return JSONResponse(content={"message": "Database updated successfully!"})
    except Exception as e:
        print(f"Error updating database: {e}")
        return JSONResponse(content={"message": f"Database update failed: {str(e)}"}, status_code=500)

# Initialize Stripe with appropriate error handling
try:
    stripe_env = os.environ.get("STRIPE_ENVIRONMENT", "production")
    if stripe_env == "test":
        stripe.api_key = os.environ.get("STRIPE_TEST_SECRET_KEY")
    else:
        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
    
    if not stripe.api_key:
        raise ValueError("Stripe API key not set")
except Exception as e:
    print(f"Error initializing Stripe: {e}")

class StripeCheckoutSessionRequest(BaseModel):
    plan: str

@app.post("/create-checkout-session")
async def create_checkout_session(request: StripeCheckoutSessionRequest, db: Session = Depends(get_db)):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    price_ids = {
        "pro-lite": os.environ.get("STRIPE_PRICE_PRO_LITE"),
        "pro": os.environ.get("STRIPE_PRICE_PRO"),
        "exclusive": os.environ.get("STRIPE_PRICE_EXCLUSIVE"),
    }
    
    if request.plan not in price_ids or not price_ids[request.plan]:
        raise HTTPException(status_code=400, detail="Invalid plan or price ID not configured")

    base_url = os.environ.get("APP_BASE_URL", "https://flipvault.netlify.app")
    
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_ids[request.plan], 'quantity': 1}],
            mode='subscription',
            success_url=f"{base_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{base_url}/pricing?canceled=true",
        )
        return {"sessionId": checkout_session.id}
    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CurrencyConversionResponse(BaseModel):
    convertedPrice: float

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@app.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    users = db.query(models.User).all()
    return users

class UpdateUserPlan(BaseModel):
    plan: str

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    user = crud.delete_user(db=db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.put("/users/{user_id}/plan")
def update_user_plan(
    user_id: int, 
    plan_update: UpdateUserPlan, 
    db: Session = Depends(get_db),
    credentials: HTTPBasicCredentials = Depends(security)
):
    verify_password(credentials)
    valid_plans = ["Free", "Pro", "Exclusive"]
    if plan_update.plan not in valid_plans:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    user = crud.update_user_plan(db=db, user_id=user_id, plan=plan_update.plan)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user