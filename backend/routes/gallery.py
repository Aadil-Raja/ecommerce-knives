from flask import Blueprint, request, jsonify
from models.gallery import Gallery
from utils.image_helper import save_uploaded_image, delete_image_file
from routes.admin import admin_required
from werkzeug.utils import secure_filename
from pathlib import Path
import os

gallery_bp = Blueprint('gallery', __name__)

# Public endpoint - Get active gallery images for frontend
@gallery_bp.route('/', methods=['GET'])
def get_active_gallery():
    """Get all active gallery images for public display"""
    try:
        images = Gallery.get_active()
        return jsonify(images)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Admin endpoints
@gallery_bp.route('/admin', methods=['GET'])
@admin_required
def get_all_gallery():
    """Get all gallery images for admin management"""
    try:
        images = Gallery.get_all()
        return jsonify(images)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@gallery_bp.route('/admin', methods=['POST'])
@admin_required
def create_gallery_image():
    """Upload and create a new gallery image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get form data
        title = request.form.get('title', '').strip()
        alt_text = request.form.get('alt_text', '').strip()
        is_active = request.form.get('is_active', 'true').lower() == 'true'
        display_order = int(request.form.get('display_order', Gallery.get_max_display_order() + 1))
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        # Check for duplicate image names
        original_filename = secure_filename(file.filename)
        base_name = os.path.splitext(original_filename)[0]
        extension = os.path.splitext(original_filename)[1]
        
        # Create unique filename for gallery
        counter = 1
        test_filename = f"gallery_{base_name}{extension}"
        
        while Gallery.check_image_name_exists(test_filename):
            test_filename = f"gallery_{base_name}_{counter}{extension}"
            counter += 1
        
        # Save image to gallery folder
        saved_filename = save_uploaded_image(file, test_filename, image_type='gallery')
        
        if not saved_filename:
            return jsonify({'error': 'Failed to save image'}), 400
        
        # Create gallery record
        gallery_id = Gallery.create(title, saved_filename, alt_text, is_active, display_order)
        
        return jsonify({
            'success': True, 
            'id': gallery_id, 
            'filename': saved_filename,
            'message': 'Gallery image uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@gallery_bp.route('/admin/<int:gallery_id>', methods=['PUT'])
@admin_required
def update_gallery_image(gallery_id):
    """Update gallery image details"""
    try:
        data = request.get_json()
        
        # Check if image exists
        existing_image = Gallery.get_by_id(gallery_id)
        if not existing_image:
            return jsonify({'error': 'Gallery image not found'}), 404
        
        # Validate title if provided
        title = data.get('title', '').strip() if data.get('title') else None
        if title == '':
            return jsonify({'error': 'Title cannot be empty'}), 400
        
        # Check for duplicate image names if renaming
        new_image_name = data.get('image_name', '').strip() if data.get('image_name') else None
        if new_image_name and new_image_name != existing_image['image_name']:
            if Gallery.check_image_name_exists(new_image_name, gallery_id):
                return jsonify({'error': 'An image with this name already exists'}), 400
        
        success = Gallery.update(
            gallery_id,
            title=title,
            image_name=new_image_name,
            alt_text=data.get('alt_text'),
            is_active=data.get('is_active'),
            display_order=data.get('display_order')
        )
        
        if success:
            return jsonify({'success': True, 'message': 'Gallery image updated successfully'})
        else:
            return jsonify({'error': 'Failed to update gallery image'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@gallery_bp.route('/admin/<int:gallery_id>', methods=['DELETE'])
@admin_required
def delete_gallery_image(gallery_id):
    """Delete a gallery image"""
    try:
        # Get image info to delete file
        image = Gallery.get_by_id(gallery_id)
        if not image:
            return jsonify({'error': 'Gallery image not found'}), 404
        
        # Delete the physical file
        if image['image_name']:
            delete_image_file(image['image_name'])
        
        # Delete from database
        Gallery.delete(gallery_id)
        
        return jsonify({'success': True, 'message': 'Gallery image deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@gallery_bp.route('/admin/check-name/<filename>', methods=['GET'])
@admin_required
def check_image_name(filename):
    """Check if image name already exists"""
    try:
        exists = Gallery.check_image_name_exists(filename)
        return jsonify({'exists': exists})
    except Exception as e:
        return jsonify({'error': str(e)}), 400