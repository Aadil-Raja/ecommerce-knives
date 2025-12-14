import os
from pathlib import Path
from werkzeug.utils import secure_filename

def get_product_images(image_folder_path):
    """
    Get all images from a product folder
    Returns a dict with 'main_image' and 'all_images'
    """
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
            relative_path = f"{image_folder_path}/{file.name}"
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

def save_uploaded_image(file, filename):
    """
    Save an uploaded image file to the static directory
    Returns the saved filename
    """
    # Ensure the static directory exists
    static_path = Path(__file__).parent.parent / 'static'
    static_path.mkdir(exist_ok=True)
    
    # Secure the filename
    filename = secure_filename(filename)
    
    # Save the file
    file_path = static_path / filename
    file.save(str(file_path))
    
    return filename

def delete_image_file(filename):
    """
    Delete an image file from the static directory
    """
    if not filename:
        return
        
    try:
        static_path = Path(__file__).parent.parent / 'static'
        file_path = static_path / filename
        
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
    except Exception as e:
        print(f"Error deleting image file {filename}: {e}")