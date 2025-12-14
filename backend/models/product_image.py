from config.database import get_db_connection

class ProductImage:
    @staticmethod
    def get_by_product_id(product_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT * FROM product_images 
            WHERE product_id = %s 
            ORDER BY is_main DESC, display_order ASC, created_at ASC
        ''', (product_id,))
        images = cur.fetchall()
        cur.close()
        conn.close()
        return images

    @staticmethod
    def get_main_image(product_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT * FROM product_images 
            WHERE product_id = %s AND is_main = true 
            LIMIT 1
        ''', (product_id,))
        image = cur.fetchone()
        cur.close()
        conn.close()
        return image

    @staticmethod
    def create(product_id, image_name, is_main=False, display_order=0, alt_text=''):
        conn = get_db_connection()
        cur = conn.cursor()
        
        # If this is set as main image, unset other main images for this product
        if is_main:
            cur.execute('''
                UPDATE product_images SET is_main = false 
                WHERE product_id = %s AND is_main = true
            ''', (product_id,))
        
        cur.execute('''
            INSERT INTO product_images (product_id, image_name, is_main, display_order, alt_text)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        ''', (product_id, image_name, is_main, display_order, alt_text))
        
        image_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return image_id

    @staticmethod
    def update(image_id, image_name=None, is_main=None, display_order=None, alt_text=None):
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get current image data
        cur.execute('SELECT * FROM product_images WHERE id = %s', (image_id,))
        current_image = cur.fetchone()
        
        if not current_image:
            cur.close()
            conn.close()
            return False
        
        # If setting as main image, unset other main images for this product
        if is_main:
            cur.execute('''
                UPDATE product_images SET is_main = false 
                WHERE product_id = %s AND is_main = true AND id != %s
            ''', (current_image['product_id'], image_id))
        
        # Build update query dynamically
        updates = []
        params = []
        
        if image_name is not None:
            updates.append('image_name = %s')
            params.append(image_name)
        if is_main is not None:
            updates.append('is_main = %s')
            params.append(is_main)
        if display_order is not None:
            updates.append('display_order = %s')
            params.append(display_order)
        if alt_text is not None:
            updates.append('alt_text = %s')
            params.append(alt_text)
        
        if updates:
            params.append(image_id)
            cur.execute(f'''
                UPDATE product_images SET {', '.join(updates)}
                WHERE id = %s
            ''', params)
        
        conn.commit()
        cur.close()
        conn.close()
        return True

    @staticmethod
    def delete(image_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM product_images WHERE id = %s', (image_id,))
        conn.commit()
        cur.close()
        conn.close()

    @staticmethod
    def delete_by_product_id(product_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM product_images WHERE product_id = %s', (product_id,))
        conn.commit()
        cur.close()
        conn.close()