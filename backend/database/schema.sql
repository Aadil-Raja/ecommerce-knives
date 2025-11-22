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
    stock INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Categories
INSERT INTO categories (name, slug, description) VALUES
('Chef Knives', 'chef-knives', 'Professional chef knives designed for precision cutting, slicing, and dicing.'),
('Butcher Knives', 'butcher-knives', 'Heavy-duty butcher knives built for breaking down large cuts of meat.'),
('Kitchen Knives', 'kitchen-knives', 'Versatile kitchen knives for everyday cooking tasks.'),
('Hunting Knives', 'hunting-knives', 'Durable hunting knives designed for field dressing and outdoor use.');

-- Sample Products
INSERT INTO products (name, description, price, category_id, image_name, stock, is_featured) VALUES
('Professional Chef Knife 8"', 'Premium 8-inch chef knife with high-carbon stainless steel blade. Perfect balance and razor-sharp edge.', 149.99, 1, 'chef-knife-1.jpg', 15, true),
('Santoku Chef Knife 7"', 'Japanese-style Santoku knife with Granton edge. Ideal for slicing, dicing, and mincing.', 129.99, 1, 'chef-knife-2.jpg', 20, false),
('Butcher Cleaver 10"', 'Heavy-duty cleaver for breaking down large cuts. Full tang construction for maximum durability.', 179.99, 2, 'butcher-knife-1.jpg', 10, true),
('Boning Knife 6"', 'Flexible boning knife for precise meat preparation. Ergonomic handle for comfort.', 89.99, 2, 'butcher-knife-2.jpg', 25, false),
('Utility Knife 5"', 'Versatile utility knife for everyday kitchen tasks. Comfortable grip and sharp edge.', 69.99, 3, 'kitchen-knife-1.jpg', 30, false),
('Paring Knife 3.5"', 'Small paring knife for detailed work. Perfect for peeling and trimming.', 49.99, 3, 'kitchen-knife-2.jpg', 40, false),
('Fixed Blade Hunter 5"', 'Full tang hunting knife with leather sheath. Built for the outdoors.', 159.99, 4, 'hunting-knife-1.jpg', 12, true),
('Skinning Knife 4"', 'Curved blade skinning knife for field dressing. Durable and reliable.', 119.99, 4, 'hunting-knife-2.jpg', 18, false);
