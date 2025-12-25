from flask import Blueprint, jsonify, request
from models.product import Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    category_id = request.args.get('category_id')
    
    if category_id:
        products = Product.get_by_category(category_id)
    else:
        products = Product.get_all()
    
    return jsonify(products)

@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """Get only featured products with lightweight data"""
    products = Product.get_featured_lightweight()
    return jsonify(products)

@products_bp.route('/lightweight', methods=['GET'])
def get_products_lightweight():
    """Get products with only essential data for listings (faster loading)"""
    category_id = request.args.get('category_id')
    
    if category_id:
        products = Product.get_by_category_lightweight(category_id)
    else:
        products = Product.get_all_lightweight()
    
    return jsonify(products)

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.get_by_id(product_id)
    if product:
        # Debug logging for specifications
        print(f"Product {product_id} specifications:")
        print(f"Type: {type(product.get('specifications'))}")
        print(f"Value: {product.get('specifications')}")
        return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404
