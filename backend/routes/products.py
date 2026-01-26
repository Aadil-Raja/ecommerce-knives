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
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))  # Default fallback, but frontend controls this
    
    if category_id:
        result = Product.get_by_category_lightweight(category_id, page, limit)
    else:
        result = Product.get_all_lightweight(page, limit)
    
    return jsonify(result)

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
@products_bp.route('/<int:product_id>/discount', methods=['POST'])
def apply_discount(product_id):
    """Apply discount to a product"""
    try:
        data = request.get_json()
        discount_percentage = float(data.get('discount_percentage', 0))
        created_by = data.get('created_by', 'admin')
        
        # Validate discount percentage
        if discount_percentage < 0 or discount_percentage > 100:
            return jsonify({'error': 'Discount percentage must be between 0 and 100'}), 400
        
        discount_id = Product.apply_discount(product_id, discount_percentage, created_by)
        
        if discount_id:
            return jsonify({'message': 'Discount applied successfully', 'discount_id': discount_id})
        else:
            return jsonify({'error': 'Failed to apply discount'}), 500
            
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/<int:product_id>/discount', methods=['DELETE'])
def remove_discount(product_id):
    """Remove/deactivate discount from a product"""
    try:
        success = Product.remove_discount(product_id)
        
        if success:
            return jsonify({'message': 'Discount deactivated successfully'})
        else:
            return jsonify({'error': 'Failed to deactivate discount'}), 500
            
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/<int:product_id>/discount/toggle', methods=['PUT'])
def toggle_discount_status(product_id):
    """Toggle discount active/inactive status"""
    try:
        data = request.get_json()
        is_active = data.get('is_active', True)
        
        from models.discount import Discount
        success = Discount.toggle_discount_status(product_id, is_active)
        
        if success:
            status = 'activated' if is_active else 'deactivated'
            return jsonify({'message': f'Discount {status} successfully'})
        else:
            return jsonify({'error': 'Failed to update discount status'}), 500
            
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/<int:product_id>/discount/delete', methods=['DELETE'])
def delete_discount_permanently(product_id):
    """Permanently delete discount entry from database"""
    try:
        from models.discount import Discount
        success = Discount.delete_discount(product_id)
        
        if success:
            return jsonify({'message': 'Discount deleted permanently'})
        else:
            return jsonify({'error': 'Failed to delete discount'}), 500
            
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/discounts', methods=['GET'])
def get_discounted_products():
    """Get all products with active discounts"""
    try:
        from models.discount import Discount
        products = Discount.get_all_active_discounts()
        return jsonify(products)
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@products_bp.route('/discounts/admin', methods=['GET'])
def get_all_discounts_admin():
    """Get all discounts for admin management"""
    try:
        from models.discount import Discount
        discounts = Discount.get_all_discounts_for_admin()
        return jsonify(discounts)
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500