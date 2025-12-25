from flask import Blueprint, jsonify
from models.category import Category
from models.product import Product

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/', methods=['GET'])
def get_categories():
    categories = Category.get_all()
    return jsonify(categories)

@categories_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.get_by_id(category_id)
    if category:
        return jsonify(category)
    return jsonify({'error': 'Category not found'}), 404

@categories_bp.route('/<slug>/products', methods=['GET'])
def get_category_products(slug):
    category = Category.get_by_slug(slug)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    products = Product.get_by_category(category['id'])
    return jsonify({
        'category': category,
        'products': products
    })

@categories_bp.route('/<slug>/products/lightweight', methods=['GET'])
def get_category_products_lightweight(slug):
    """Get category products with only essential data for faster loading"""
    category = Category.get_by_slug(slug)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    products = Product.get_by_category_lightweight(category['id'])
    return jsonify({
        'category': category,
        'products': products
    })
