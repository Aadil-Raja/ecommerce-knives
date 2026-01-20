from flask import Blueprint, request, jsonify
from models.newsletter import Newsletter
import re

newsletter_bp = Blueprint('newsletter', __name__)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@newsletter_bp.route('/subscribe', methods=['POST'])
def subscribe():
    """Subscribe to newsletter"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        result = Newsletter.subscribe(email)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 409  # Conflict - already exists
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500

@newsletter_bp.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    """Unsubscribe from newsletter"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        success = Newsletter.unsubscribe(email)
        
        if success:
            return jsonify({'success': True, 'message': 'Successfully unsubscribed'})
        else:
            return jsonify({'success': False, 'message': 'Email not found'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Server error occurred'}), 500