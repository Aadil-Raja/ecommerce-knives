# Sharp Lab Backend API

Flask backend for Sharp Lab e-commerce website.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with your Neon DB connection:
```
DATABASE_URL=postgresql://user:password@host/database
PORT=5000
```

4. Run the database schema:
- Connect to your Neon DB and run `database/schema.sql`

5. Start the server:
```bash
python app.py
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/<id>` - Get category by ID
- `GET /api/categories/<slug>/products` - Get products by category slug

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category_id=<id>` - Get products by category
- `GET /api/products/<id>` - Get product by ID

## Database Structure

- **categories**: id, name, slug, description, created_at
- **products**: id, name, description, price, category_id, image_name, stock, is_featured, created_at, updated_at

Images are stored in frontend `/public` folder and referenced by `image_name` field.
