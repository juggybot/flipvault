from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from models import Base  # Import the Product model and Base
from passlib.context import CryptContext

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"  # Update this with your database URL

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    print("Initializing the database...")
    from models import Product, User  # Import models to create tables
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
        if 'popular_keywords' not in columns:
            with engine.connect() as conn:
                conn.execute("ALTER TABLE products ADD COLUMN popular_keywords STRING")
                print("Added 'popular_keywords' column to 'products' table")

        # Create a test product if it doesn't already exist
        db = SessionLocal()
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
        db.close()
    else:
        print("Error: products table not found!")
    print("Database initialization complete.")