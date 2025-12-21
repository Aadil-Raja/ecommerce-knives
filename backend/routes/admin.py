from flask import Blueprint, request, jsonify, session
from functools import wraps
import os
import hashlib
import json
from config.database import get_db_connection
from utils.image_helper import save_uploaded_image, delete_image_file
from models.product_image import ProductImage
from werkzeug.utils import secure_filename
import uuid

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    admin_email = os.getenv('ADMIN_EMAIL')
    admin_password = os.getenv('ADMIN_PASSWORD')
    
    if email == admin_email and password == admin_password:
        session['admin_logged_in'] = True
        session['admin_email'] = email
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@admin_bp.route('/logout', methods=['POST'])
@admin_required
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_email', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@admin_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'admin_logged_in' in session:
        return jsonify({'authenticated': True, 'email': session.get('admin_email')})
    return jsonify({'authenticated': False})

# Dashboard Stats
@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get stats
    cur.execute('SELECT COUNT(*) as total FROM products')
    total_products = cur.fetchone()['total']
    
    cur.execute('SELECT COUNT(*) as total FROM categories')
    total_categories = cur.fetchone()['total']
    
    cur.execute('SELECT COUNT(*) as total FROM orders')
    total_orders = cur.fetchone()['total']
    
    cur.execute('SELECT COUNT(*) as total FROM banners WHERE is_active = true')
    active_banners = cur.fetchone()['total']
    
    cur.execute('SELECT SUM(total_amount) as total FROM orders')
    total_revenue = cur.fetchone()['total'] or 0
    
    # Recent orders
    cur.execute('''
        SELECT order_number, customer_name, total_amount, status, created_at 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5
    ''')
    recent_orders = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        'stats': {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_orders': total_orders,
            'active_banners': active_banners,
            'total_revenue': float(total_revenue)
        },
        'recent_orders': recent_orders
    })

# Products Management
@admin_bp.route('/products', methods=['GET'])
@admin_required
def get_products():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.created_at DESC
    ''')
    products = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(products)

@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    try:
        data = request.get_json()
        
        # Debug logging
        print(f"Creating product with data: {data}")
        print(f"Specifications type: {type(data.get('specifications', {}))}")
        print(f"Specifications value: {data.get('specifications', {})}")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Convert specifications to JSON string if it's a dict
        specifications = data.get('specifications', {})
        if isinstance(specifications, dict):
            specifications_json = json.dumps(specifications)
        else:
            specifications_json = specifications
        
        print(f"Final specifications JSON: {specifications_json}")
        
        cur.execute('''
            INSERT INTO products (name, description, price, category_id, barcode, image_name, stock, is_featured, specifications)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            data['name'],
            data.get('description', ''),
            data['price'],
            data.get('category_id'),
            data.get('barcode', ''),
            data.get('image_name', ''),
            data.get('stock', 0),
            data.get('is_featured', False),
            specifications_json
        ))
        
        product_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Product created successfully with ID: {product_id}")
        return jsonify({'success': True, 'id': product_id})
    except Exception as e:
        print(f"Error creating product: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    try:
        data = request.get_json()
        
        # Debug logging
        print(f"Updating product {product_id} with data: {data}")
        print(f"Specifications type: {type(data.get('specifications', {}))}")
        print(f"Specifications value: {data.get('specifications', {})}")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Convert specifications to JSON string if it's a dict
        specifications = data.get('specifications', {})
        if isinstance(specifications, dict):
            specifications_json = json.dumps(specifications)
        else:
            specifications_json = specifications
        
        print(f"Final specifications JSON: {specifications_json}")
        
        cur.execute('''
            UPDATE products 
            SET name = %s, description = %s, price = %s, category_id = %s, barcode = %s,
                image_name = %s, stock = %s, is_featured = %s, specifications = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            data['name'],
            data.get('description', ''),
            data['price'],
            data.get('category_id'),
            data.get('barcode', ''),
            data.get('image_name', ''),
            data.get('stock', 0),
            data.get('is_featured', False),
            specifications_json,
            product_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Product {product_id} updated successfully")
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error updating product {product_id}: {str(e)}")
        print(f"Error type: {type(e)}")
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get product details and images before deletion
        cur.execute('''
            SELECT p.barcode, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = %s
        ''', (product_id,))
        product = cur.fetchone()
        
        # Get all product images to delete files
        cur.execute('SELECT image_name FROM product_images WHERE product_id = %s', (product_id,))
        images = cur.fetchall()
        
        # Delete product (CASCADE will delete product_images from DB)
        cur.execute('DELETE FROM products WHERE id = %s', (product_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        # Delete image files and folder
        if product and product['barcode'] and product['category_name']:
            from pathlib import Path
            from werkzeug.utils import secure_filename
            import shutil
            
            # Delete individual image files
            for img in images:
                delete_image_file(img['image_name'])
            
            # Delete the entire product folder
            static_path = Path(__file__).parent.parent / 'static'
            product_folder = static_path / 'product_images' / secure_filename(product['category_name']) / secure_filename(product['barcode'])
            
            if product_folder.exists() and product_folder.is_dir():
                shutil.rmtree(product_folder)
                print(f"Deleted product folder: {product_folder}")
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Categories Management
@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM categories ORDER BY name')
    categories = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(categories)

@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO categories (name, slug, description)
            VALUES (%s, %s, %s)
            RETURNING id
        ''', (
            data['name'],
            data['slug'],
            data.get('description', '')
        ))
        
        category_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'id': category_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE categories 
            SET name = %s, slug = %s, description = %s
            WHERE id = %s
        ''', (
            data['name'],
            data['slug'],
            data.get('description', ''),
            category_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM categories WHERE id = %s', (category_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Orders Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_orders():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM orders ORDER BY created_at DESC')
    orders = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(orders)

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE orders 
            SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (data['status'], order_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Banners Management
@admin_bp.route('/banners', methods=['GET'])
@admin_required
def get_banners():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM banners ORDER BY display_order, created_at DESC')
    banners = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(banners)

@admin_bp.route('/banners', methods=['POST'])
@admin_required
def create_banner():
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO banners (title, subtitle, image_name, link_url, is_active, display_order)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            data['title'],
            data.get('subtitle', ''),
            data['image_name'],
            data.get('link_url', ''),
            data.get('is_active', True),
            data.get('display_order', 0)
        ))
        
        banner_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'id': banner_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/banners/<int:banner_id>', methods=['PUT'])
@admin_required
def update_banner(banner_id):
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            UPDATE banners 
            SET title = %s, subtitle = %s, image_name = %s, link_url = %s, 
                is_active = %s, display_order = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            data['title'],
            data.get('subtitle', ''),
            data['image_name'],
            data.get('link_url', ''),
            data.get('is_active', True),
            data.get('display_order', 0),
            banner_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/banners/<int:banner_id>', methods=['DELETE'])
@admin_required
def delete_banner(banner_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get banner image to delete file
        cur.execute('SELECT image_name FROM banners WHERE id = %s', (banner_id,))
        banner = cur.fetchone()
        
        if banner and banner['image_name']:
            delete_image_file(banner['image_name'])
        
        cur.execute('DELETE FROM banners WHERE id = %s', (banner_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Product Images Management
@admin_bp.route('/products/<int:product_id>/images', methods=['GET'])
@admin_required
def get_product_images(product_id):
    try:
        images = ProductImage.get_by_product_id(product_id)
        return jsonify(images)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/products/<int:product_id>/images', methods=['POST'])
@admin_required
def add_product_image(product_id):
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate unique filename
        filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
        
        # Save the image
        saved_filename = save_uploaded_image(file, filename)
        
        # Get form data
        is_main = request.form.get('is_main', 'false').lower() == 'true'
        display_order = int(request.form.get('display_order', 0))
        alt_text = request.form.get('alt_text', '')
        
        # Create product image record
        image_id = ProductImage.create(product_id, saved_filename, is_main, display_order, alt_text)
        
        return jsonify({'success': True, 'id': image_id, 'filename': saved_filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/product-images/<int:image_id>', methods=['PUT'])
@admin_required
def update_product_image(image_id):
    try:
        data = request.get_json()
        
        success = ProductImage.update(
            image_id,
            is_main=data.get('is_main'),
            display_order=data.get('display_order'),
            alt_text=data.get('alt_text')
        )
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/product-images/<int:image_id>', methods=['DELETE'])
@admin_required
def delete_product_image(image_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get image info to delete file
        cur.execute('SELECT image_name FROM product_images WHERE id = %s', (image_id,))
        image = cur.fetchone()
        
        if image:
            delete_image_file(image['image_name'])
            ProductImage.delete(image_id)
            
        cur.close()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Image Upload
@admin_bp.route('/upload-image', methods=['POST'])
@admin_required
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get parameters for organized storage
        category_name = request.form.get('category_name')
        product_name = request.form.get('product_name')
        barcode = request.form.get('barcode')
        image_type = request.form.get('image_type', 'product')  # 'product' or 'banner'
        
        # Save the image with organized structure
        saved_filename = save_uploaded_image(file, file.filename, category_name, product_name, barcode, image_type)
        
        return jsonify({'success': True, 'filename': saved_filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Upload product image with organized structure
@admin_bp.route('/products/<int:product_id>/upload-image', methods=['POST'])
@admin_required
def upload_product_image(product_id):
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get product details for organized storage
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.name, p.barcode, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = %s
        ''', (product_id,))
        product = cur.fetchone()
        cur.close()
        conn.close()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Save the image with organized structure
        saved_filename = save_uploaded_image(
            file, 
            file.filename, 
            product['category_name'], 
            product['name'], 
            product['barcode'],
            'product'
        )
        
        # Get form data for product image record
        is_main = request.form.get('is_main', 'false').lower() == 'true'
        display_order = int(request.form.get('display_order', 0))
        alt_text = request.form.get('alt_text', '')
        
        # Create product image record
        image_id = ProductImage.create(product_id, saved_filename, is_main, display_order, alt_text)
        
        return jsonify({'success': True, 'id': image_id, 'filename': saved_filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Bulk upload multiple product images
@admin_bp.route('/products/<int:product_id>/upload-images-bulk', methods=['POST'])
@admin_required
def upload_product_images_bulk(product_id):
    try:
        files = request.files.getlist('images')
        if not files or len(files) == 0:
            return jsonify({'error': 'No image files provided'}), 400
        
        # Get product details for organized storage
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.name, p.barcode, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = %s
        ''', (product_id,))
        product = cur.fetchone()
        cur.close()
        conn.close()
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Get form data
        start_display_order = int(request.form.get('display_order', 0))
        set_first_as_main = request.form.get('is_main', 'false').lower() == 'true'
        
        uploaded_images = []
        
        # Upload each file
        for i, file in enumerate(files):
            if file.filename == '':
                continue
                
            # Save the image with organized structure
            saved_filename = save_uploaded_image(
                file, 
                file.filename, 
                product['category_name'], 
                product['name'], 
                product['barcode'],
                'product'
            )
            
            # Create product image record
            is_main = set_first_as_main and i == 0  # Only first image can be main
            display_order = start_display_order + i
            alt_text = f"{product['name']} - Image {i + 1}"  # Auto-generate alt text
            
            image_id = ProductImage.create(product_id, saved_filename, is_main, display_order, alt_text)
            
            uploaded_images.append({
                'id': image_id,
                'filename': saved_filename,
                'is_main': is_main,
                'display_order': display_order
            })
        
        return jsonify({
            'success': True, 
            'uploaded_count': len(uploaded_images),
            'images': uploaded_images
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400