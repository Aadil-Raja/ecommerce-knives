from flask import Flask, send_from_directory, session
from flask_cors import CORS
from dotenv import load_dotenv
import os

from routes.products import products_bp
from routes.categories import categories_bp
from routes.orders import orders_bp
from routes.admin import admin_bp
from routes.banners import banners_bp
from routes.newsletter import newsletter_bp
from database.seeder import initialize_database

load_dotenv()

# Initialize database on startup
initialize_database()

app = Flask(__name__)
app.url_map.strict_slashes = False

# Configure session
app.secret_key = os.getenv('SECRET_KEY', 'your-super-secret-key-for-sessions')

# Simple CORS - allow everything for development
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(categories_bp, url_prefix='/api/categories')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(banners_bp, url_prefix='/api/banners')
app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')

@app.route('/')
def home():
    return {'message': 'Sharp Lab API'}

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'API is running'}

# Debug endpoint for local development
@app.route('/api/debug/session')
def debug_session():
    return {
        'session_data': dict(session),
        'has_admin': 'admin_logged_in' in session,
        'admin_email': session.get('admin_email', 'Not set')
    }

# Serve static files (images)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')