-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_name VARCHAR(255),
    images TEXT[], -- Array of image filenames for multiple angles
    stock INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    specifications JSONB, -- Store product specifications as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Orders Table
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

-- Order Items Table
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

-- Banners Table
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

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_name VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_main ON product_images(is_main);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(display_order);

-- Sample Categories
INSERT INTO categories (name, slug, description) VALUES
('Chef Knives', 'chef-knives', 'Professional chef knives designed for precision cutting, slicing, and dicing.'),
('Butcher Knives', 'butcher-knives', 'Heavy-duty butcher knives built for breaking down large cuts of meat.'),
('Kitchen Knives', 'kitchen-knives', 'Versatile kitchen knives for everyday cooking tasks.'),
('Hunting Knives', 'hunting-knives', 'Durable hunting knives designed for field dressing and outdoor use.')
ON CONFLICT (slug) DO NOTHING;

-- Sample Products (Only Butcher Knife) - skip if already exists
INSERT INTO products (name, description, price, category_id, image_name, stock, is_featured, specifications) 
SELECT 'Butcher Knife – Black & White 4 Pcs Set', 'Premium butcher knife set with high-quality J2 steel blades and elegant handles. Includes leather cover for protection.', 15000, 2, 'product_images/Butcher', 10, true, 
'{"blade_lengths": ["10 inches", "8 inches", "6.5 inches"], "handle_lengths": ["5.5 inches", "5.5 inches"], "blade_material": "High-Quality J2 Steel", "handle_material": "Acrylic / Resin / Stone / Natural Wood / Sheesham Wood", "weight": "1100g (approx.)", "includes": "Leather cover"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Butcher Knife – Black & White 4 Pcs Set');

-- Sample Banners - skip if already exist
INSERT INTO banners (title, subtitle, image_name, is_active, display_order) 
SELECT 'Sharp Lab by OWAIS', 'Premium Knives. Crafted for Precision.', 'desktop_banner/Untitled-1.jpg', true, 1
WHERE NOT EXISTS (SELECT 1 FROM banners WHERE image_name = 'desktop_banner/Untitled-1.jpg');

INSERT INTO banners (title, subtitle, image_name, is_active, display_order) 
SELECT 'Sharp Lab by OWAIS', 'Professional Grade Cutlery', 'desktop_banner/Untitled-2.jpg', true, 2
WHERE NOT EXISTS (SELECT 1 FROM banners WHERE image_name = 'desktop_banner/Untitled-2.jpg');
