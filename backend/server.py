import uvicorn
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import asyncpg
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# PostgreSQL connection pool
pool = None

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()
api_router = APIRouter(prefix="/api")


# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# ==================== Database Setup ====================
async def get_db_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            host=os.environ.get('POSTGRES_HOST', 'localhost'),
            port=int(os.environ.get('POSTGRES_PORT', '5432')),
            user=os.environ.get('POSTGRES_USER', 'postgres'),
            password=os.environ.get('POSTGRES_PASSWORD', 'Sourav'),
            database=os.environ.get('POSTGRES_DB', 'shawarmore_db'),
            min_size=5,
            max_size=20
        )
    return pool

async def init_db():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Users table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                address TEXT,
                role VARCHAR(50) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Categories table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Products table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                image_url TEXT,
                category_id VARCHAR(255) REFERENCES categories(id),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Orders table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id),
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                payment_status VARCHAR(50) DEFAULT 'pending',
                order_status VARCHAR(50) DEFAULT 'pending',
                delivery_address TEXT,
                phone VARCHAR(50),
                stripe_session_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Order items table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id VARCHAR(255) PRIMARY KEY,
                order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
                product_id VARCHAR(255) REFERENCES products(id),
                product_name VARCHAR(255),
                quantity INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Payment transactions table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS payment_transactions (
                id VARCHAR(255) PRIMARY KEY,
                order_id VARCHAR(255) REFERENCES orders(id),
                user_id VARCHAR(255) REFERENCES users(id),
                session_id VARCHAR(255) UNIQUE,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'usd',
                payment_status VARCHAR(50) DEFAULT 'pending',
                status VARCHAR(50) DEFAULT 'initiated',
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create admin user if not exists
        admin_exists = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE email = $1",
            'admin@shawarmore.com'
        )
        
        if admin_exists == 0:
            admin_id = str(uuid.uuid4())
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            await conn.execute(
                '''INSERT INTO users (id, email, password, full_name, role) 
                   VALUES ($1, $2, $3, $4, $5)''',
                admin_id, 'admin@shawarmore.com', hashed_password, 'Admin User', 'admin'
            )

# ==================== Models ====================
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    address: Optional[str]
    role: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    image_url: Optional[str]
    created_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    category_id: Optional[str]
    is_available: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    is_available: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    category_id: Optional[str]
    is_available: bool
    created_at: datetime

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method: str  # 'stripe' or 'cash'
    delivery_address: str
    phone: str

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    price: float

class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    payment_method: str
    payment_status: str
    order_status: str
    delivery_address: str
    phone: str
    stripe_session_id: Optional[str]
    created_at: datetime
    items: List[OrderItemResponse] = []

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

# ==================== Auth Helpers ====================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, email, full_name, phone, address, role FROM users WHERE id = $1",
                user_id
            )
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return dict(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== Auth Routes ====================
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Check if user exists
        existing = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE email = $1",
            user_data.email
        )
        if existing > 0:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        await conn.execute(
            '''INSERT INTO users (id, email, password, full_name, phone, address, role) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)''',
            user_id, user_data.email, hashed_password, user_data.full_name,
            user_data.phone, user_data.address, 'customer'
        )
        
        user = await conn.fetchrow(
            "SELECT id, email, full_name, phone, address, role FROM users WHERE id = $1",
            user_id
        )
        
        token = create_access_token({"sub": user_id})
        return TokenResponse(
            token=token,
            user=UserResponse(**dict(user))
        )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT * FROM users WHERE email = $1",
            credentials.email
        )
        
        if not user or not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = create_access_token({"sub": user['id']})
        return TokenResponse(
            token=token,
            user=UserResponse(
                id=user['id'],
                email=user['email'],
                full_name=user['full_name'],
                phone=user['phone'],
                address=user['address'],
                role=user['role']
            )
        )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)

# ==================== Category Routes ====================
@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        category_id = str(uuid.uuid4())
        await conn.execute(
            '''INSERT INTO categories (id, name, description, image_url) 
               VALUES ($1, $2, $3, $4)''',
            category_id, category.name, category.description, category.image_url
        )
        result = await conn.fetchrow("SELECT * FROM categories WHERE id = $1", category_id)
        return CategoryResponse(**dict(result))

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM categories ORDER BY created_at DESC")
        return [CategoryResponse(**dict(row)) for row in rows]

# ==================== Product Routes ====================
@api_router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        product_id = str(uuid.uuid4())
        await conn.execute(
            '''INSERT INTO products (id, name, description, price, image_url, category_id, is_available) 
               VALUES ($1, $2, $3, $4, $5, $6, $7)''',
            product_id, product.name, product.description, product.price,
            product.image_url, product.category_id, product.is_available
        )
        result = await conn.fetchrow("SELECT * FROM products WHERE id = $1", product_id)
        return ProductResponse(**dict(result))

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(category_id: Optional[str] = None):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        if category_id:
            rows = await conn.fetch(
                "SELECT * FROM products WHERE category_id = $1 AND is_available = TRUE ORDER BY created_at DESC",
                category_id
            )
        else:
            rows = await conn.fetch(
                "SELECT * FROM products WHERE is_available = TRUE ORDER BY created_at DESC"
            )
        return [ProductResponse(**dict(row)) for row in rows]

@api_router.get("/products/all", response_model=List[ProductResponse])
async def get_all_products(user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM products ORDER BY created_at DESC")
        return [ProductResponse(**dict(row)) for row in rows]

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product: ProductUpdate, user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        updates = []
        values = []
        idx = 1
        
        if product.name is not None:
            updates.append(f"name = ${idx}")
            values.append(product.name)
            idx += 1
        if product.description is not None:
            updates.append(f"description = ${idx}")
            values.append(product.description)
            idx += 1
        if product.price is not None:
            updates.append(f"price = ${idx}")
            values.append(product.price)
            idx += 1
        if product.image_url is not None:
            updates.append(f"image_url = ${idx}")
            values.append(product.image_url)
            idx += 1
        if product.category_id is not None:
            updates.append(f"category_id = ${idx}")
            values.append(product.category_id)
            idx += 1
        if product.is_available is not None:
            updates.append(f"is_available = ${idx}")
            values.append(product.is_available)
            idx += 1
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(product_id)
        query = f"UPDATE products SET {', '.join(updates)} WHERE id = ${idx}"
        await conn.execute(query, *values)
        
        result = await conn.fetchrow("SELECT * FROM products WHERE id = $1", product_id)
        if not result:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductResponse(**dict(result))

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM products WHERE id = $1", product_id)
        return {"message": "Product deleted"}

# ==================== Order Routes ====================
@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, user: dict = Depends(get_current_user)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Calculate total
        total_amount = 0.0
        order_items = []
        
        for item in order_data.items:
            product = await conn.fetchrow(
                "SELECT * FROM products WHERE id = $1 AND is_available = TRUE",
                item.product_id
            )
            if not product:
                raise HTTPException(status_code=400, detail=f"Product {item.product_id} not available")
            
            item_total = float(product['price']) * item.quantity
            total_amount += item_total
            order_items.append({
                'product_id': item.product_id,
                'product_name': product['name'],
                'quantity': item.quantity,
                'price': float(product['price'])
            })
        
        # Create order
        order_id = str(uuid.uuid4())
        payment_status = 'pending' if order_data.payment_method == 'stripe' else 'cash_on_delivery'
        
        await conn.execute(
            '''INSERT INTO orders (id, user_id, total_amount, payment_method, payment_status, 
                                   order_status, delivery_address, phone) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)''',
            order_id, user['id'], total_amount, order_data.payment_method,
            payment_status, 'pending', order_data.delivery_address, order_data.phone
        )
        
        # Create order items
        for item in order_items:
            item_id = str(uuid.uuid4())
            await conn.execute(
                '''INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) 
                   VALUES ($1, $2, $3, $4, $5, $6)''',
                item_id, order_id, item['product_id'], item['product_name'],
                item['quantity'], item['price']
            )
        
        # Fetch complete order
        order = await conn.fetchrow("SELECT * FROM orders WHERE id = $1", order_id)
        items_rows = await conn.fetch("SELECT * FROM order_items WHERE order_id = $1", order_id)
        
        return OrderResponse(
            **dict(order),
            items=[OrderItemResponse(**dict(row)) for row in items_rows]
        )

@api_router.get("/orders/my", response_model=List[OrderResponse])
async def get_my_orders(user: dict = Depends(get_current_user)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        orders = await conn.fetch(
            "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
            user['id']
        )
        
        result = []
        for order in orders:
            items = await conn.fetch(
                "SELECT * FROM order_items WHERE order_id = $1",
                order['id']
            )
            result.append(OrderResponse(
                **dict(order),
                items=[OrderItemResponse(**dict(item)) for item in items]
            ))
        return result

@api_router.get("/orders/all", response_model=List[OrderResponse])
async def get_all_orders(user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        orders = await conn.fetch("SELECT * FROM orders ORDER BY created_at DESC")
        
        result = []
        for order in orders:
            items = await conn.fetch(
                "SELECT * FROM order_items WHERE order_id = $1",
                order['id']
            )
            result.append(OrderResponse(
                **dict(order),
                items=[OrderItemResponse(**dict(item)) for item in items]
            ))
        return result

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, order_status: str, user: dict = Depends(require_admin)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE orders SET order_status = $1 WHERE id = $2",
            order_status, order_id
        )
        return {"message": "Order status updated"}
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    logger.info("Database initialized")

    yield  # <-- app runs while in this context

    # Shutdown
    global pool
    if pool:
        await pool.close()
    logger.info("Database connection closed")


app = FastAPI(lifespan=lifespan)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
       ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
def root():
    print("✅ [ROOT] Health check")
    return {
        "message": " API running with PostgreSQL",
        "version": "1.0",
        "auth": "JWT Bearer Token"
    }


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting FastAPI Server on port 8000...")
    print("=" * 60)
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
