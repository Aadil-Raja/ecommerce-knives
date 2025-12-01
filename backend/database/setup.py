"""
Database setup script - Run this to initialize the database with all tables
Usage: python database/setup.py
"""
import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from config.database import get_db_connection

def setup_database():
    """Initialize database with schema"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Read and execute the schema file
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            cur.execute(sql)
        
        conn.commit()
        print("✓ Database setup completed successfully!")
        print("✓ All tables created")
        print("✓ Sample data inserted")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error during setup: {e}")
        conn.rollback()
        cur.close()
        conn.close()
        raise e

if __name__ == '__main__':
    print("Setting up database...")
    setup_database()
