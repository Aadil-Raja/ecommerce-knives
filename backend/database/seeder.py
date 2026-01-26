import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

def initialize_database():
    """
    Initialize database by creating tables and indexes only.
    No sample data is inserted - clean database for production use.
    """
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'), cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        print("→ Initializing database tables...")
        
        # Create Categories Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create Products Table (with barcode field)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                barcode VARCHAR(100) UNIQUE,
                image_name VARCHAR(255),
                stock INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT FALSE,
                specifications JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create Orders Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(200) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_email VARCHAR(200),
                delivery_address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                order_notes TEXT,
                total_amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'EasyPaisa',
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create Order Items Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                product_name VARCHAR(200) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                quantity INTEGER NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create Banners Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS banners (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                subtitle TEXT,
                image_name VARCHAR(255) NOT NULL,
                link_url VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create Product Images Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS product_images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                image_name VARCHAR(255) NOT NULL,
                is_main BOOLEAN DEFAULT FALSE,
                display_order INTEGER DEFAULT 0,
                alt_text VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create Newsletter Subscribers Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            );
        """)
        
        # Create Gallery Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS gallery (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                image_name VARCHAR(255) NOT NULL UNIQUE,
                alt_text VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create indexes for better performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);",
            "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);",
            "CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);",
            "CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);",
            "CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_product_images_main ON product_images(is_main);",
            "CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(display_order);",
            "CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);",
            "CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(display_order);",
            "CREATE INDEX IF NOT EXISTS idx_gallery_image_name ON gallery(image_name);"
        ]
        
        for index_sql in indexes:
            cur.execute(index_sql)
        
        conn.commit()
        print("✓ Database tables created successfully!")
        print("✓ Database indexes created!")
        print("✓ Database initialization completed - ready for use!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error initializing database: {e}")

# Keep backward compatibility
def seed_database():
    """Backward compatibility wrapper"""
    initialize_database()

if __name__ == '__main__':
    initialize_database()
