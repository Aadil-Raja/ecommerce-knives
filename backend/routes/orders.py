from flask import Blueprint, jsonify, request
from models.order import Order

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['POST'])
def create_order():
    """Create a new order"""
    try:
        data = request.get_json()
        print(f"Received order data: {data}")
        
        customer_data = data.get('customer')
        items = data.get('items')
        total_amount = data.get('totalAmount')
        
        if not customer_data or not items or not total_amount:
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = Order.create(customer_data, items, total_amount)
        print(f"Order created successfully: {result}")
        
        return jsonify(result), 201
        
    except Exception as e:
        print(f"Error creating order: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_number>', methods=['GET'])
def get_order(order_number):
    """Get order by order number"""
    order = Order.get_by_order_number(order_number)
    
    if order:
        return jsonify(order)
    
    return jsonify({'error': 'Order not found'}), 404

@orders_bp.route('', methods=['GET'])
def get_all_orders():
    """Get all orders (for admin)"""
    orders = Order.get_all()
    return jsonify(orders)
