from config.database import get_db_connection
from services.email_service import EmailService
import random
import string
import threading

class Order:
    @staticmethod
    def generate_order_number():
        """Generate a unique order number"""
        return 'ORD' + ''.join(random.choices(string.digits, k=8))
    
    @staticmethod
    def create(customer_data, items, total_amount, payment_method='COD'):
        """Create a new order with items"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Generate unique order number
            order_number = Order.generate_order_number()
            
            # Insert order
            cur.execute('''
                INSERT INTO orders (
                    order_number, customer_name, customer_phone, customer_email,
                    delivery_address, city, order_notes, total_amount, payment_method
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, order_number
            ''', (
                order_number,
                customer_data['fullName'],
                customer_data['phone'],
                customer_data.get('email', ''),
                customer_data['address'],
                customer_data['city'],
                customer_data.get('notes', ''),
                total_amount,
                payment_method
            ))
            
            order = cur.fetchone()
            order_id = order['id']
            order_number = order['order_number']
            
            # Insert order items
            for item in items:
                # Convert price to float if it's a string
                price = float(item['price']) if isinstance(item['price'], str) else item['price']
                quantity = int(item['quantity'])
                subtotal = price * quantity
                
                cur.execute('''
                    INSERT INTO order_items (
                        order_id, product_id, product_name, price, quantity, subtotal
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    order_id,
                    item['productId'],
                    item['name'],
                    price,
                    quantity,
                    subtotal
                ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            # Send emails in background thread (non-blocking)
            def send_emails_async():
                # Send confirmation email to customer (if email provided)
                if customer_data.get('email'):
                    try:
                        EmailService.send_order_confirmation(
                            customer_email=customer_data['email'],
                            customer_name=customer_data['fullName'],
                            order_number=order_number,
                            items=items,
                            total_amount=total_amount,
                            payment_method=payment_method
                        )
                    except Exception as e:
                        print(f"Failed to send customer email: {e}")
                
                # Send notification to admin
                try:
                    EmailService.send_admin_notification(
                        order_number=order_number,
                        customer_name=customer_data['fullName'],
                        customer_phone=customer_data['phone'],
                        customer_email=customer_data.get('email', 'Not provided'),
                        items=items,
                        total_amount=total_amount,
                        delivery_address=customer_data['address'],
                        city=customer_data['city'],
                        payment_method=payment_method
                    )
                except Exception as e:
                    print(f"Failed to send admin notification: {e}")
            
            # Start background thread for email sending
            email_thread = threading.Thread(target=send_emails_async, daemon=True)
            email_thread.start()
            
            return {'orderId': order_number, 'success': True}
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            raise e
    
    @staticmethod
    def get_by_order_number(order_number):
        """Get order details by order number"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT * FROM orders WHERE order_number = %s
        ''', (order_number,))
        
        order = cur.fetchone()
        
        if order:
            # Get order items
            cur.execute('''
                SELECT * FROM order_items WHERE order_id = %s
            ''', (order['id'],))
            
            items = cur.fetchall()
            order['items'] = items
        
        cur.close()
        conn.close()
        
        return order
    
    @staticmethod
    def get_all():
        """Get all orders"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT * FROM orders ORDER BY created_at DESC
        ''')
        
        orders = cur.fetchall()
        cur.close()
        conn.close()
        
        return orders
    
    @staticmethod
    def delete(order_id):
        """Delete an order and its items"""
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            # Delete order items first (due to foreign key constraint)
            cur.execute('DELETE FROM order_items WHERE order_id = %s', (order_id,))
            
            # Delete the order
            cur.execute('DELETE FROM orders WHERE id = %s', (order_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return True
            
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            raise e
