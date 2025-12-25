from config.database import get_db_connection
from models.product_image import ProductImage

class Product:
    @staticmethod
    def _add_images_to_product(product):
        """Add image information to a product dict"""
        if product:
            # Get images from product_images table
            product_images = ProductImage.get_by_product_id(product['id'])
            
            if product_images:
                # Use images from product_images table
                main_image = next((img for img in product_images if img['is_main']), product_images[0] if product_images else None)
                product['main_image'] = main_image['image_name'] if main_image else None
                product['all_images'] = [img['image_name'] for img in product_images]
                product['gallery_images'] = product_images
            else:
                product['main_image'] = None
                product['all_images'] = []
                product['gallery_images'] = []
        return product
    
    @staticmethod
    def _add_main_image_to_products(products):
        """Add only main image information to a list of product dicts for listings"""
        products_with_images = []
        for p in products:
            product = dict(p)
            # Get only the main image for listings
            product_images = ProductImage.get_by_product_id(product['id'])
            
            if product_images:
                main_image = next((img for img in product_images if img['is_main']), product_images[0] if product_images else None)
                product['main_image'] = main_image['image_name'] if main_image else None
                # Only include products that have at least one valid image
                if product['main_image']:
                    products_with_images.append(product)
        return products_with_images
    
    @staticmethod
    def _add_images_to_products(products):
        """Add image information to a list of product dicts and filter out products without images"""
        products_with_images = []
        for p in products:
            product = Product._add_images_to_product(dict(p))
            # Only include products that have at least one valid image
            if product and product.get('main_image') and product.get('all_images') and len(product.get('all_images', [])) > 0:
                products_with_images.append(product)
        return products_with_images
    
    @staticmethod
    def get_all_lightweight():
        """Get all products with only essential data for listings (id, name, price, main_image)"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.id, p.name, p.price, p.is_featured, p.stock
            FROM products p
            ORDER BY p.created_at DESC
        ''')
        products = cur.fetchall()
        cur.close()
        conn.close()
        return Product._add_main_image_to_products(products)

    @staticmethod
    def get_by_category_lightweight(category_id):
        """Get products by category with only essential data for listings"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.id, p.name, p.price, p.is_featured, p.stock
            FROM products p
            WHERE p.category_id = %s
            ORDER BY p.created_at DESC
        ''', (category_id,))
        products = cur.fetchall()
        cur.close()
        conn.close()
        return Product._add_main_image_to_products(products)

    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        ''')
        products = cur.fetchall()
        cur.close()
        conn.close()
        return Product._add_images_to_products(products)

    @staticmethod
    def get_by_id(product_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = %s
        ''', (product_id,))
        product = cur.fetchone()
        cur.close()
        conn.close()
        if product:
            product = dict(product)
            return Product._add_images_to_product(product)
        return None

    @staticmethod
    def get_by_category(category_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = %s
            ORDER BY p.created_at DESC
        ''', (category_id,))
        products = cur.fetchall()
        cur.close()
        conn.close()
        return Product._add_images_to_products(products)
