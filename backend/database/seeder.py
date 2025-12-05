import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def table_exists(cur, table_name):
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = %s
        );
    """, (table_name,))
    return cur.fetchone()[0]

def seed_database():
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cur = conn.cursor()
        
        print("→ Creating tables and seeding data...")
        
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
        
        # Create Products Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                image_name VARCHAR(255),
                stock INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT FALSE,
                specifications JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Insert Sample Categories (skip if already exist)
        cur.execute("""
            INSERT INTO categories (name, slug, description) VALUES
            ('Chef Knives', 'chef-knives', 'Professional chef knives designed for precision cutting, slicing, and dicing.'),
            ('Butcher Knives', 'butcher-knives', 'Heavy-duty butcher knives built for breaking down large cuts of meat.'),
            ('Kitchen Knives', 'kitchen-knives', 'Versatile kitchen knives for everyday cooking tasks.'),
            ('Hunting Knives', 'hunting-knives', 'Durable hunting knives designed for field dressing and outdoor use.')
            ON CONFLICT (slug) DO NOTHING;
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
                payment_method VARCHAR(50) DEFAULT 'COD',
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
        
        # Create indexes
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
        """)
        
        # Insert Sample Products (Only Butcher Knife) - skip if already exists
        cur.execute("""
            INSERT INTO products (name, description, price, category_id, image_name, stock, is_featured, specifications) 
            SELECT 'Butcher Knife – Black & White 4 Pcs Set', 'Premium butcher knife set with high-quality J2 steel blades and elegant handles. Includes leather cover for protection.', 15000, 2, 'product_images/Butcher', 10, true, 
            '{"blade_lengths": ["10 inches", "8 inches", "6.5 inches"], "handle_lengths": ["5.5 inches", "5.5 inches"], "blade_material": "High-Quality J2 Steel", "handle_material": "Acrylic / Resin / Stone / Natural Wood / Sheesham Wood", "weight": "1100g (approx.)", "includes": "Leather cover"}'::jsonb
            WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Butcher Knife – Black & White 4 Pcs Set');
        """)
        
        conn.commit()
        print("✓ Database tables created successfully!")
        print("✓ Sample data inserted!")
        print("✓ Seeder completed!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error running seeder: {e}")

if __name__ == '__main__':
    seed_database()
