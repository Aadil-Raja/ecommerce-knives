from config.database import get_db_connection
from models.product_image import ProductImage
from datetime import datetime

class Product:
    @staticmethod
    def _add_discount_info_to_product(product):
        """Add discount information to a product dict"""
        if product:
            from models.discount import Discount
            
            # Get active discount for this product
            discount = Discount.get_active_discount_for_product(product['id'])
            
            if discount:
                original_price = float(product['price'])
                discount_percentage = float(discount['discount_percentage'])
                discount_amount = original_price * (discount_percentage / 100)
                final_price = round(original_price - discount_amount, 2)
                
                product['has_active_discount'] = True
                product['original_price'] = original_price
                product['final_price'] = final_price
                product['discount_amount'] = round(discount_amount, 2)
                product['savings'] = round(discount_amount, 2)
                product['discount_percentage'] = discount_percentage
            else:
                product['has_active_discount'] = False
                product['original_price'] = float(product['price'])
                product['final_price'] = float(product['price'])
                product['discount_amount'] = 0
                product['savings'] = 0
                product['discount_percentage'] = 0
        
        return product

    @staticmethod
    def _add_images_to_product(product):
        """Add image information to a product dict"""
        if product:
            # Add discount info first
            product = Product._add_discount_info_to_product(product)
            
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
            # Add discount info first
            product = Product._add_discount_info_to_product(product)
            
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
    def get_featured_lightweight():
        """Get only featured products with lightweight data ordered by featured_order"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.id, p.name, p.price, p.is_featured, p.stock, p.featured_order
            FROM products p
            WHERE p.is_featured = TRUE
            ORDER BY p.featured_order ASC, p.created_at DESC
        ''')
        products = cur.fetchall()
        cur.close()
        conn.close()
        return Product._add_main_image_to_products(products)

    @staticmethod
    def get_all_lightweight(page=1, limit=10):
        """Get all products with pagination and only essential data for listings"""
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get products that have images with pagination
        cur.execute('''
            SELECT p.id, p.name, p.price, p.is_featured, p.stock
            FROM products p
            WHERE EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
            ORDER BY p.created_at DESC
            LIMIT %s OFFSET %s
        ''', (limit, offset))
        products = cur.fetchall()
        
        # Get total count of products with images
        cur.execute('''
            SELECT COUNT(p.id) as total
            FROM products p
            WHERE EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
        ''')
        total_count = cur.fetchone()['total']
        
        cur.close()
        conn.close()
        
        products_with_images = Product._add_main_image_to_products(products)
        
        return {
            'products': products_with_images,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'has_more': (page * limit) < total_count,
                'total_pages': (total_count + limit - 1) // limit
            }
        }

    @staticmethod
    def get_by_category_lightweight(category_id, page=1, limit=10):
        """Get products by category with pagination and lightweight data"""
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get products that have images with pagination
        # Join with product_images to ensure we only get products with images
        cur.execute('''
            SELECT p.id, p.name, p.price, p.is_featured, p.stock
            FROM products p
            WHERE p.category_id = %s 
            AND EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
            ORDER BY p.created_at DESC
            LIMIT %s OFFSET %s
        ''', (category_id, limit, offset))
        products = cur.fetchall()
        
        # Get total count of products with images
        cur.execute('''
            SELECT COUNT(p.id) as total
            FROM products p
            WHERE p.category_id = %s 
            AND EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)
        ''', (category_id,))
        total_count = cur.fetchone()['total']
        
        cur.close()
        conn.close()
        
        products_with_images = Product._add_main_image_to_products(products)
        
        return {
            'products': products_with_images,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'has_more': (page * limit) < total_count,
                'total_pages': (total_count + limit - 1) // limit
            }
        }

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

    @staticmethod
    def get_featured_for_admin():
        """Get featured products for admin management with full details"""
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_featured = TRUE
            ORDER BY p.featured_order ASC, p.created_at DESC
        ''')
        products = cur.fetchall()
        cur.close()
        conn.close()
        return Product._add_images_to_products(products)

    @staticmethod
    def update_featured_order(product_id, new_order):
        """Update the featured order of a product with validation"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Validate order (must be positive, max 999)
            if new_order < 1:
                new_order = 1
            elif new_order > 999:
                new_order = 999
            
            # Check if product exists and is featured
            cur.execute('SELECT is_featured FROM products WHERE id = %s', (product_id,))
            product = cur.fetchone()
            
            if not product:
                raise ValueError("Product not found")
            
            if not product['is_featured']:
                raise ValueError("Product is not featured")
            
            # Update the featured order
            cur.execute('''
                UPDATE products 
                SET featured_order = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (new_order, product_id))
            
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
    def set_featured_status(product_id, is_featured, featured_order=None):
        """Set featured status and order for a product"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            if is_featured:
                # If setting as featured, determine order
                if featured_order is None:
                    # Get the next available order
                    cur.execute('''
                        SELECT COALESCE(MAX(featured_order), 0) + 1 as next_order
                        FROM products 
                        WHERE is_featured = TRUE
                    ''')
                    result = cur.fetchone()
                    featured_order = result['next_order']
                
                # Validate order
                if featured_order < 1:
                    featured_order = 1
                elif featured_order > 999:
                    featured_order = 999
                
                cur.execute('''
                    UPDATE products 
                    SET is_featured = %s, featured_order = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (is_featured, featured_order, product_id))
            else:
                # If removing from featured, set order to default
                cur.execute('''
                    UPDATE products 
                    SET is_featured = %s, featured_order = 999, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (is_featured, product_id))
            
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
    def apply_discount(product_id, discount_percentage, created_by='admin'):
        """Apply discount to a product using the discount table"""
        from models.discount import Discount
        return Discount.create_discount(product_id, discount_percentage, created_by)

    @staticmethod
    def remove_discount(product_id):
        """Remove discount from a product using the discount table"""
        from models.discount import Discount
        return Discount.remove_discount(product_id)