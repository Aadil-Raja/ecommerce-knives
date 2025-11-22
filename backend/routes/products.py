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

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.get_by_id(product_id)
    if product:
        return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404
