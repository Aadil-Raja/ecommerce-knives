from config.database import get_db_connection

class Category:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM categories ORDER BY name')
        categories = cur.fetchall()
        cur.close()
        conn.close()
        return categories

    @staticmethod
    def get_by_id(category_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM categories WHERE id = %s', (category_id,))
        category = cur.fetchone()
        cur.close()
        conn.close()
        return category

    @staticmethod
    def get_by_slug(slug):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM categories WHERE slug = %s', (slug,))
        category = cur.fetchone()
        cur.close()
        conn.close()
        return category
