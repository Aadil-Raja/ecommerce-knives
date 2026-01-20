from datetime import datetime
from config.database import get_db_connection
import psycopg2
from psycopg2.extras import RealDictCursor

class Newsletter:
    def __init__(self):
        pass
    
    @staticmethod
    def create_table():
        """Create newsletter table if it doesn't exist"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE
                    );
                    
                    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
                    CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);
                """)
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def subscribe(email):
        """Subscribe an email to newsletter"""
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check if email already exists
                cursor.execute(
                    "SELECT id, is_active FROM newsletter_subscribers WHERE email = %s",
                    (email,)
                )
                existing = cursor.fetchone()
                
                if existing:
                    if existing['is_active']:
                        return {'success': False, 'message': 'Email already subscribed'}
                    else:
                        # Reactivate subscription
                        cursor.execute(
                            "UPDATE newsletter_subscribers SET is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP WHERE email = %s",
                            (email,)
                        )
                        conn.commit()
                        return {'success': True, 'message': 'Subscription reactivated successfully'}
                else:
                    # Add new subscription
                    cursor.execute(
                        "INSERT INTO newsletter_subscribers (email) VALUES (%s) RETURNING id",
                        (email,)
                    )
                    subscriber_id = cursor.fetchone()['id']
                    conn.commit()
                    return {'success': True, 'message': 'Successfully subscribed to newsletter', 'id': subscriber_id}
                    
        except psycopg2.IntegrityError:
            conn.rollback()
            return {'success': False, 'message': 'Email already subscribed'}
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def get_all_subscribers():
        """Get all active newsletter subscribers"""
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT id, email, subscribed_at, is_active 
                    FROM newsletter_subscribers 
                    ORDER BY subscribed_at DESC
                """)
                return cursor.fetchall()
        except Exception as e:
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def unsubscribe(email):
        """Unsubscribe an email from newsletter"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE newsletter_subscribers SET is_active = FALSE WHERE email = %s",
                    (email,)
                )
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def delete_subscriber(subscriber_id):
        """Delete a subscriber (admin only)"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM newsletter_subscribers WHERE id = %s",
                    (subscriber_id,)
                )
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def toggle_subscriber_status(subscriber_id):
        """Toggle subscriber active/inactive status"""
        conn = get_db_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get current status
                cursor.execute(
                    "SELECT is_active FROM newsletter_subscribers WHERE id = %s",
                    (subscriber_id,)
                )
                result = cursor.fetchone()
                
                if not result:
                    return {'success': False, 'message': 'Subscriber not found'}
                
                # Toggle status
                new_status = not result['is_active']
                cursor.execute(
                    "UPDATE newsletter_subscribers SET is_active = %s WHERE id = %s",
                    (new_status, subscriber_id)
                )
                conn.commit()
                
                if cursor.rowcount > 0:
                    status_text = 'activated' if new_status else 'deactivated'
                    return {
                        'success': True, 
                        'message': f'Subscriber {status_text} successfully',
                        'new_status': new_status
                    }
                else:
                    return {'success': False, 'message': 'Failed to update subscriber status'}
                    
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    @staticmethod
    def get_subscriber_count():
        """Get count of active subscribers"""
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = TRUE")
                result = cursor.fetchone()
                return result['count'] if result else 0
        except Exception as e:
            raise e
        finally:
            conn.close()