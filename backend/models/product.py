from config.database import get_db_connection

class Product:
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
        return products

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
        return product

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
        return products
