from config.database import get_db_connection
from datetime import datetime

class Discount:
    @staticmethod
    def create_discount(product_id, discount_percentage, created_by='admin'):
        """Create a new discount for a product"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Validate discount percentage
            if discount_percentage < 0 or discount_percentage > 100:
                raise ValueError("Discount percentage must be between 0 and 100")
            
            # Deactivate any existing active discounts for this product
            cur.execute('''
                UPDATE discounts 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = %s AND is_active = TRUE
            ''', (product_id,))
            
            # Create new discount
            cur.execute('''
                INSERT INTO discounts (product_id, discount_percentage, created_by)
                VALUES (%s, %s, %s)
                RETURNING id
            ''', (product_id, discount_percentage, created_by))
            
            discount_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            return discount_id
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            raise e

    @staticmethod
    def remove_discount(product_id):
        """Remove/deactivate discount from a product"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute('''
                UPDATE discounts 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = %s AND is_active = TRUE
            ''', (product_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            return True
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            raise e

    @staticmethod
    def toggle_discount_status(product_id, is_active):
        """Toggle discount active/inactive status"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute('''
                UPDATE discounts 
                SET is_active = %s, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = %s
            ''', (is_active, product_id))
            
            conn.commit()
            cur.close()
            conn.close()
            return True
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            raise e

    @staticmethod
    def delete_discount(product_id):
        """Permanently delete discount entry from database"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute('''
                DELETE FROM discounts 
                WHERE product_id = %s
            ''', (product_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            return True
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            raise e

    @staticmethod
    def get_active_discount_for_product(product_id):
        """Get active discount for a specific product"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT d.* FROM discounts d
            WHERE d.product_id = %s 
            AND d.is_active = TRUE
            ORDER BY d.created_at DESC
            LIMIT 1
        ''', (product_id,))
        
        discount = cur.fetchone()
        cur.close()
        conn.close()
        return discount

    @staticmethod
    def get_all_active_discounts():
        """Get all products with active discounts"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT p.*, d.discount_percentage, d.created_at as discount_created_at,
                   ROUND(p.price * (1 - d.discount_percentage / 100), 2) as discounted_price,
                   ROUND(p.price * (d.discount_percentage / 100), 2) as discount_amount
            FROM products p 
            INNER JOIN discounts d ON p.id = d.product_id
            WHERE d.is_active = TRUE
            ORDER BY d.created_at DESC
        ''')
        
        products = cur.fetchall()
        cur.close()
        conn.close()
        return products

    @staticmethod
    def get_product_with_discount(product_id):
        """Get product with calculated discount information"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT p.*, 
                   d.discount_percentage,
                   CASE 
                       WHEN d.id IS NOT NULL THEN TRUE 
                       ELSE FALSE 
                   END as has_active_discount,
                   CASE 
                       WHEN d.id IS NOT NULL 
                       THEN ROUND(p.price * (1 - d.discount_percentage / 100), 2)
                       ELSE p.price 
                   END as final_price,
                   CASE 
                       WHEN d.id IS NOT NULL 
                       THEN ROUND(p.price * (d.discount_percentage / 100), 2)
                       ELSE 0 
                   END as discount_amount
            FROM products p 
            LEFT JOIN discounts d ON p.id = d.product_id 
                AND d.is_active = TRUE
            WHERE p.id = %s
        ''', (product_id,))
        
        product = cur.fetchone()
        cur.close()
        conn.close()
        return product

    @staticmethod
    def get_all_discounts_for_admin():
        """Get all discounts (active and inactive) for admin management"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT d.*, p.name as product_name, p.price as product_price,
                   ROUND(p.price * (1 - d.discount_percentage / 100), 2) as discounted_price,
                   ROUND(p.price * (d.discount_percentage / 100), 2) as discount_amount_calculated
            FROM discounts d
            INNER JOIN products p ON d.product_id = p.id
            ORDER BY d.created_at DESC
        ''')
        
        discounts = cur.fetchall()
        cur.close()
        conn.close()
        return discounts

    @staticmethod
    def calculate_discounted_price(original_price, discount_percentage):
        """Calculate discounted price"""
        if discount_percentage <= 0:
            return original_price
        
        discount_amount = original_price * (discount_percentage / 100)
        return round(original_price - discount_amount, 2)