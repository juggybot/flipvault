from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Body, Request, Response
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
import logging
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import HTTPException as FastAPIHTTPException

app = FastAPI()

''' @app.middleware("http")
async def user_agent_filter(request: Request, call_next):
    user_agent = request.headers.get("User-Agent", "").lower()

    blocked_patterns = [
        "python", "curl", "wget", "httpclient", "scrapy",
        "bot", "spider", "aiohttp", ""
    ]

    if any(pattern in user_agent for pattern in blocked_patterns):
        raise HTTPException(status_code=403, detail="Forbidden: suspicious User-Agent")

    return await call_next(request)'''

# Set up basic logging to file and console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Update the CORS middleware to handle all required headers and methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://flipvault.netlify.app",
        "https://www.flipvault.vip",
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
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
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

    # Return the user's plan in the response
    return {"success": True, "message": "Login successful", "plan": user.plan or "free"}

@app.post("/admin-login")
def admin_login(login_request: LoginRequest):
    admin_username = os.environ.get("ADMIN_USERNAME")
    admin_password = os.environ.get("ADMIN_PASSWORD")

    if login_request.username != admin_username or login_request.password != admin_password:
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
        logger.error(f"Error creating product: {e}")
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
        logger.error(f"Error retrieving products: {e}")
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
        logger.error(f"Error retrieving product {product_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/search/")
def search_products(query: str, db: Session = Depends(get_db)):
    try:
        products = db.query(models.Product).filter(models.Product.name.ilike(f"%{query}%")).all()
        return products
    except Exception as e:
        logger.error(f"Error searching products: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/products/scrape")
def scrape_products(background_tasks: BackgroundTasks, credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    try:
        # Add better error handling for scraper
        background_tasks.add_task(run_scraper)
        return {"message": "Scraper started in the background"}
    except ValueError as ve:
        logger.error(f"Proxy error: {str(ve)}")
        raise HTTPException(status_code=500, detail="Scraper configuration error: Check proxy settings")
    except Exception as e:
        logger.error(f"Error starting scraper: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/products/scrape/{product_id}")
def scrape_product(product_id: int, background_tasks: BackgroundTasks, credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    try:
        background_tasks.add_task(run_scraper, product_id)  # Run the scraper in the background for a specific product
        return {"message": f"Scraper started in the background for product ID {product_id}"}
    except Exception as e:
        logger.error(f"Error starting scraper for product {product_id}: {e}")
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
        logger.error(f"Error updating database: {e}")
        return JSONResponse(content={"message": f"Database update failed: {str(e)}"}, status_code=500)

# Initialize Stripe with appropriate error handling
try:
    stripe_env = os.environ.get("STRIPE_ENVIRONMENT", "test")
    if stripe_env == "test":
        stripe.api_key = os.environ.get("STRIPE_TEST_SECRET_KEY")
    else:
        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
    
    if not stripe.api_key:
        raise ValueError("Stripe API key not set")
except Exception as e:
    logger.error(f"Error initializing Stripe: {e}")

class StripeCheckoutSessionRequest(BaseModel):
    plan: str

@app.post("/create-checkout-session")
async def create_checkout_session(request: StripeCheckoutSessionRequest, db: Session = Depends(get_db), current_request: Request = None):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    price_ids = {
        "pro-lite": os.environ.get("STRIPE_PRICE_PRO_LITE"),
        "pro": os.environ.get("STRIPE_PRICE_PRO"),
        "exclusive": os.environ.get("STRIPE_PRICE_EXCLUSIVE"),
    }
    
    if request.plan not in price_ids or not price_ids[request.plan]:
        raise HTTPException(status_code=400, detail="Invalid plan or price ID not configured")

    base_url = os.environ.get("APP_BASE_URL", "https://flipvault.netlify.app").rstrip('/')

    # Try to get username from frontend (e.g., via header or body in production)
    username = None
    try:
        # If you want to pass username from frontend, add it to the request body or headers
        data = await current_request.json() if current_request else None
        if data and "username" in data:
            username = data["username"]
    except Exception:
        pass

    # Fallback: username is not required for session creation, but needed for webhook
    metadata = {"plan": request.plan}
    if username:
        metadata["username"] = username

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_ids[request.plan], 'quantity': 1}],
            mode='subscription',
            success_url=f"{base_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{base_url}/pricing?canceled=true",
            metadata=metadata
        )
        return {"sessionId": checkout_session.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CurrencyConversionResponse(BaseModel):
    convertedPrice: float

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check(response: Response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return {"status": "ok"}

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

@app.put("/users/{user_id}/plan", response_model=UserResponse)
def update_user_plan(
    user_id: int,
    plan_data: UpdateUserPlan,
    db: Session = Depends(get_db),
    credentials: HTTPBasicCredentials = Depends(security)
):
    verify_password(credentials)
    user = crud.update_user_plan(db=db, user_id=user_id, plan=plan_data.plan)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), credentials: HTTPBasicCredentials = Depends(security)):
    verify_password(credentials)
    user = crud.delete_user(db=db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.get("/user/plan/{username}")
def get_user_plan(username: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "plan": user.plan or "free",
        "subscription_start": user.subscription_start.isoformat() if user.subscription_start else None,
        "subscription_end": user.subscription_end.isoformat() if user.subscription_end else None
    }

# Stripe webhook endpoint for automatic plan updates
from fastapi import Header

@app.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)):
    payload = await request.body()
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    try:
        if endpoint_secret:
            event = stripe.Webhook.construct_event(payload, stripe_signature, endpoint_secret)
        else:
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return JSONResponse(status_code=400, content={"error": str(e)})

    logger.debug(f"Stripe event: {json.dumps(event, indent=2)}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        username = session.get("metadata", {}).get("username")
        plan = session.get("metadata", {}).get("plan")
        subscription_id = session.get("subscription")

        # Fetch line items to get price ID (new API)
        line_items = stripe.checkout.Session.list_line_items(session["id"])
        price_id = line_items.data[0].price.id if line_items.data else None

        if not plan and price_id:
            price_ids = {
                os.environ.get("STRIPE_PRICE_PRO_LITE"): "pro-lite",
                os.environ.get("STRIPE_PRICE_PRO"): "pro",
                os.environ.get("STRIPE_PRICE_EXCLUSIVE"): "exclusive",
            }
            plan = price_ids.get(price_id)

        if username and plan:
            user = crud.get_user_by_username(db, username)
            if user:
                now = datetime.datetime.utcnow()
                if plan == "pro-lite":
                    end = now + datetime.timedelta(days=7)
                elif plan == "pro":
                    end = now + datetime.timedelta(days=30)
                elif plan == "exclusive":
                    end = None
                else:
                    end = None

                crud.update_user_subscription(db, user_id=user.id, plan=plan, start=now, end=end, stripe_subscription_id=subscription_id)
                db.commit()
                logger.info(f"Updated user {username} to plan {plan} with subscription {subscription_id}")
            else:
                logger.warning(f"User {username} not found")
        else:
            logger.warning(f"Missing username or plan in webhook metadata")

    return {"status": "success"}

class CancelSubscriptionRequest(BaseModel):
    username: str

@app.post("/cancel-subscription")
def cancel_subscription(request: CancelSubscriptionRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, request.username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="User does not have an active subscription")

    try:
        # Cancel the Stripe subscription immediately
        stripe.Subscription.delete(user.stripe_subscription_id)

        # Update user's plan and reset subscription fields
        crud.update_user_subscription(
            db,
            user_id=user.id,
            plan="free",
            start=None,
            end=None
        )
        user.stripe_subscription_id = None
        db.commit()

        logger.info(f"Subscription cancelled for user {user.username}")
        return {"message": "Subscription cancelled successfully", "status": "success"}

    except Exception as e:
        logger.error(f"Error cancelling subscription for user {request.username}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

@app.get("/products-last-scraped")
def get_latest_scraped_date(db: Session = Depends(get_db)):
    try:
        latest = db.query(models.Product.last_updated).order_by(models.Product.last_updated.desc()).first()
        if not latest or not latest.last_updated:
            return {"lastScraped": None}
        
        return {"lastScraped": latest.last_updated}  # No isoformat() needed
    except Exception as e:
        logger.error(f"Error fetching latest last_updated: {e}")
        raise HTTPException(status_code=500, detail="Database error")


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "code": exc.status_code},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"message": "Validation error", "code": 422, "errors": exc.errors()},
    )