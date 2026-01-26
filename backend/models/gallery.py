from config.database import get_db_connection

class Gallery:
    @staticmethod
    def get_all():
        """Get all gallery images ordered by display_order and created_at"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT * FROM gallery 
            ORDER BY display_order ASC, created_at DESC
        ''')
        images = cur.fetchall()
        cur.close()
        conn.close()
        return images

    @staticmethod
    def get_active():
        """Get only active gallery images for frontend display"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT * FROM gallery 
            WHERE is_active = true 
            ORDER BY display_order ASC, created_at DESC
        ''')
        images = cur.fetchall()
        cur.close()
        conn.close()
        return images

    @staticmethod
    def get_by_id(gallery_id):
        """Get a specific gallery image by ID"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM gallery WHERE id = %s', (gallery_id,))
        image = cur.fetchone()
        cur.close()
        conn.close()
        return image

    @staticmethod
    def check_image_name_exists(image_name, exclude_id=None):
        """Check if image name already exists (for duplicate prevention)"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        if exclude_id:
            cur.execute('SELECT id FROM gallery WHERE image_name = %s AND id != %s', (image_name, exclude_id))
        else:
            cur.execute('SELECT id FROM gallery WHERE image_name = %s', (image_name,))
        
        exists = cur.fetchone() is not None
        cur.close()
        conn.close()
        return exists

    @staticmethod
    def create(title, image_name, alt_text='', is_active=True, display_order=0):
        """Create a new gallery image"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO gallery (title, image_name, alt_text, is_active, display_order)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        ''', (title, image_name, alt_text, is_active, display_order))
        
        gallery_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        return gallery_id

    @staticmethod
    def update(gallery_id, title=None, image_name=None, alt_text=None, is_active=None, display_order=None):
        """Update gallery image details"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Build update query dynamically
        updates = []
        params = []
        
        if title is not None:
            updates.append('title = %s')
            params.append(title)
        if image_name is not None:
            updates.append('image_name = %s')
            params.append(image_name)
        if alt_text is not None:
            updates.append('alt_text = %s')
            params.append(alt_text)
        if is_active is not None:
            updates.append('is_active = %s')
            params.append(is_active)
        if display_order is not None:
            updates.append('display_order = %s')
            params.append(display_order)
        
        if updates:
            updates.append('updated_at = CURRENT_TIMESTAMP')
            params.append(gallery_id)
            cur.execute(f'''
                UPDATE gallery SET {', '.join(updates)}
                WHERE id = %s
            ''', params)
        
        conn.commit()
        cur.close()
        conn.close()
        return True

    @staticmethod
    def delete(gallery_id):
        """Delete a gallery image"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM gallery WHERE id = %s', (gallery_id,))
        conn.commit()
        cur.close()
        conn.close()

    @staticmethod
    def get_max_display_order():
        """Get the maximum display order for new images"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT COALESCE(MAX(display_order), 0) as max_order FROM gallery')
        result = cur.fetchone()
        cur.close()
        conn.close()
        return result['max_order'] if result else 0