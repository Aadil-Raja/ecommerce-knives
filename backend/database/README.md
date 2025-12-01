# Database Setup

This folder contains the database schema and setup scripts for Sharp Lab e-commerce application.

## Files

- **schema.sql** - Complete database schema with all tables and sample data
- **seeder.py** - Automatic seeder (runs on app startup)
- **setup.py** - Manual database setup script

## Database Tables

### 1. Categories
- Stores product categories (Chef Knives, Butcher Knives, etc.)

### 2. Products
- Stores product information
- Includes support for multiple product images
- Links to categories

### 3. Orders
- Stores customer orders
- Includes customer information and delivery details
- Tracks order status

### 4. Order Items
- Stores individual items in each order
- Links to products and orders

## Setup Instructions

### Option 1: Automatic (Recommended)
The database is automatically initialized when you run the Flask app:
```bash
python app.py
```

### Option 2: Manual Setup
Run the setup script manually:
```bash
cd backend
python database/setup.py
```

## Database Schema

```sql
categories
├── id (PRIMARY KEY)
├── name
├── slug (UNIQUE)
├── description
└── created_at

products
├── id (PRIMARY KEY)
├── name
├── description
├── price
├── category_id (FOREIGN KEY → categories)
├── image_name
├── images (TEXT[])
├── stock
├── is_featured
├── created_at
└── updated_at

orders
├── id (PRIMARY KEY)
├── order_number (UNIQUE)
├── customer_name
├── customer_phone
├── customer_email
├── delivery_address
├── city
├── order_notes
├── total_amount
├── payment_method
├── status
├── created_at
└── updated_at

order_items
├── id (PRIMARY KEY)
├── order_id (FOREIGN KEY → orders)
├── product_id (FOREIGN KEY → products)
├── product_name
├── price
├── quantity
├── subtotal
└── created_at
```

## Environment Variables

Make sure your `.env` file has the database connection:
```
DATABASE_URL=postgresql://user:password@host/database
```

## Notes

- All tables use `CREATE TABLE IF NOT EXISTS` to prevent errors on re-run
- Sample data uses `ON CONFLICT DO NOTHING` to prevent duplicates
- Indexes are created for better query performance
- Foreign keys ensure data integrity
