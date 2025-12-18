import os
from pathlib import Path
from werkzeug.utils import secure_filename

def get_product_images(image_folder_path):
    """
    Get all images from a product folder
    Returns a dict with 'main_image' and 'all_images'
    Handles both old and new folder structures
    """
    if not image_folder_path:
        return {
            'main_image': None,
            'all_images': []
        }
    
    # Path to static folder in backend
    # Normalize the path separators
    normalized_path = image_folder_path.replace('/', os.sep).replace('\\', os.sep)
    static_path = Path(__file__).parent.parent / 'static' / normalized_path
    
    if not static_path.exists():
        return {
            'main_image': None,
            'all_images': []
        }
    
    # Get all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    all_images = []
    main_image = None
    
    for file in static_path.iterdir():
        if file.is_file() and file.suffix.lower() in image_extensions:
            # Construct relative path from static folder using forward slashes for web
            relative_path = f"{image_folder_path}/{file.name}".replace(os.sep, '/')
            all_images.append(relative_path)
            
            # Check if this is the main image
            if 'main' in file.name.lower():
                main_image = relative_path
    
    # Sort images to have consistent order
    all_images.sort()
    
    # If no main image found, use the first image
    if not main_image and all_images:
        main_image = all_images[0]
    
    return {
        'main_image': main_image,
        'all_images': all_images
    }

def save_uploaded_image(file, filename, category_name=None, product_name=None, barcode=None, image_type='product'):
    """
    Save an uploaded image file to the static directory with organized folder structure
    Returns the saved filename with path
    """
    import uuid
    from datetime import datetime
    
    # Ensure the static directory exists
    static_path = Path(__file__).parent.parent / 'static'
    static_path.mkdir(exist_ok=True)
    
    # Get file extension
    file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
    
    if image_type == 'banner':
        # Create desktop_banner folder
        folder_path = static_path / 'desktop_banner'
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename for banner
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        new_filename = f"banner-{timestamp}-{str(uuid.uuid4())[:8]}.{file_extension}"
        
        # Full path for saving
        file_path = folder_path / new_filename
        
        # Return path relative to static folder
        relative_path = f"desktop_banner/{new_filename}"
        
    elif image_type == 'product' and category_name and barcode:
        # Create folder: product_images/CategoryName/ProductBarcode
        folder_path = static_path / 'product_images' / secure_filename(category_name) / secure_filename(barcode)
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Count existing images to get image number
        existing_images = list(folder_path.glob(f"{secure_filename(category_name)}-{barcode}-*.{file_extension}"))
        image_number = len(existing_images) + 1
        
        # Generate filename: category-barcode-imagenumber.ext
        new_filename = f"{secure_filename(category_name)}-{barcode}-{image_number:02d}.{file_extension}"
        
        # Full path for saving
        file_path = folder_path / new_filename
        
        # Return path relative to static folder
        relative_path = f"product_images/{secure_filename(category_name)}/{secure_filename(barcode)}/{new_filename}"
        
    else:
        # Fallback to simple filename with UUID
        new_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = static_path / new_filename
        relative_path = new_filename
    
    # Save the file
    file.save(str(file_path))
    
    return relative_path

def delete_image_file(filename):
    """
    Delete an image file from the static directory
    Handles both old flat structure and new organized structure
    """
    if not filename:
        return
        
    try:
        static_path = Path(__file__).parent.parent / 'static'
        
        # Handle both relative paths and simple filenames
        if '/' in filename or '\\' in filename:
            # It's a relative path from static folder
            file_path = static_path / filename.replace('/', os.sep).replace('\\', os.sep)
        else:
            # It's just a filename in the root static folder
            file_path = static_path / filename
        
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            print(f"Deleted image file: {filename}")
    except Exception as e:
        print(f"Error deleting image file {filename}: {e}")