from config.database import get_db_connection

class Banner:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM banners ORDER BY display_order, created_at DESC')
        banners = cur.fetchall()
        cur.close()
        conn.close()
        return banners

    @staticmethod
    def get_active():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM banners WHERE is_active = true ORDER BY display_order, created_at DESC')
        banners = cur.fetchall()
        cur.close()
        conn.close()
        return banners

    @staticmethod
    def get_by_id(banner_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM banners WHERE id = %s', (banner_id,))
        banner = cur.fetchone()
        cur.close()
        conn.close()
        return banner