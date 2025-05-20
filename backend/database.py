from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from passlib.context import CryptContext

# Create Base here to avoid circular imports
Base = declarative_base()

# Get the DATABASE_URL from environment variable (provided by Heroku)
DATABASE_URL = os.environ.get('DATABASE_URL')

# Fix for Heroku PostgreSQL URL format (if needed)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    # For PostgreSQL, we don't need the check_same_thread argument
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800,
    )
    print(f"Using PostgreSQL database URL: {DATABASE_URL}")
else:
    # Use SQLite as fallback for local development
    DATABASE_URL = "sqlite:///./test.db"
    # SQLite requires check_same_thread=False for FastAPI
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"Using SQLite database for local development: {DATABASE_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    print("Initializing the database...")
    try:
        # Import models here to avoid circular imports
        from backend.models import Product, User  # Adjust import path based on your project structure
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")

        # Check if the products table exists
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Existing tables: {tables}")

        if "products" in tables:
            # Check if the popular_keywords column exists, and add it if not
            columns = [col['name'] for col in inspector.get_columns('products')]
            print(f"Columns in 'products' table: {columns}")
            
            # Add popular_keywords column if it doesn't exist
            # Note: The syntax might differ between SQLite and PostgreSQL
            if 'popular_keywords' not in columns:
                try:
                    with engine.connect() as conn:
                        if DATABASE_URL.startswith('sqlite'):
                            conn.execute("ALTER TABLE products ADD COLUMN popular_keywords TEXT")
                        else:  # PostgreSQL
                            conn.execute("ALTER TABLE products ADD COLUMN popular_keywords TEXT")
                        print("Added 'popular_keywords' column to 'products' table")
                except Exception as e:
                    print(f"Error adding column: {e}")

            # Create a test product if it doesn't already exist
            db = SessionLocal()
            try:
                test_product_name = "Test Product"
                existing_product = db.query(Product).filter(Product.name == test_product_name).first()
                if not existing_product:
                    test_product = Product(
                        name=test_product_name,
                        image_url="https://example.com/test_product.jpg",
                        average_ebay_price=10.0,
                        ebay_listings=100,
                        ebay_sale_amount=1000.0,
                        search_volume_us="1000",
                        search_volume_au="800",
                        search_volume_uk="900",
                        popular_keywords="test,product,example",
                        last_updated="2025-04-04"
                    )
                    db.add(test_product)
                    db.commit()
                    print("Test product created successfully!")
                else:
                    print("Test product already exists.")
                    
                # Create a default user if it doesn't exist
                default_username = "testuser"
                existing_user = db.query(User).filter(User.username == default_username).first()
                if not existing_user:
                    hashed_password = pwd_context.hash("testpassword")  # Hash the default password
                    default_user = User(username=default_username, hashed_password=hashed_password)
                    db.add(default_user)
                    db.commit()
                    print("Default user created successfully!")
                else:
                    print("Default user already exists.")
            except Exception as e:
                print(f"Error creating test data: {e}")
                db.rollback()
            finally:
                db.close()
        else:
            print("Products table not found, but will be created on first application run")
            
        print("Database initialization complete.")
        return True
    except Exception as e:
        print(f"Error during database initialization: {e}")
        return False