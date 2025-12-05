from config.database import get_db_connection
from utils.image_helper import get_product_images

class Product:
    @staticmethod
    def _add_images_to_product(product):
        """Add image information to a product dict"""
        if product and product.get('image_name'):
            images = get_product_images(product['image_name'])
            product['main_image'] = images['main_image']
            product['all_images'] = images['all_images']
        return product
    
    @staticmethod
    def _add_images_to_products(products):
        """Add image information to a list of product dicts"""
        return [Product._add_images_to_product(dict(p)) for p in products]
    
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
