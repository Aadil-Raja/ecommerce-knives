from flask import Blueprint, jsonify
from models.banner import Banner

banners_bp = Blueprint('banners', __name__)

@banners_bp.route('/', methods=['GET'])
def get_banners():
    """Get all active banners for public display"""
    try:
        banners = Banner.get_active()
        return jsonify(banners)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@banners_bp.route('/<int:banner_id>', methods=['GET'])
def get_banner(banner_id):
    """Get a specific banner by ID"""
    try:
        banner = Banner.get_by_id(banner_id)
        if banner:
            return jsonify(banner)
        return jsonify({'error': 'Banner not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500