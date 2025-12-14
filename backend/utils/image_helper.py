import os
from pathlib import Path

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
