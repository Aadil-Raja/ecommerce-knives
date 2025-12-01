from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.products import products_bp
from routes.categories import categories_bp
from routes.orders import orders_bp
from database.seeder import seed_database

load_dotenv()

# Run seeder on startup
seed_database()

app = Flask(__name__)
app.url_map.strict_slashes = False

# Simple CORS - allow everything for development
CORS(app)

# Register blueprints
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(categories_bp, url_prefix='/api/categories')
app.register_blueprint(orders_bp, url_prefix='/api/orders')

@app.route('/')
def home():
    return {'message': 'Sharp Lab API'}

# Add a health check endpoint
@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'API is running'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')