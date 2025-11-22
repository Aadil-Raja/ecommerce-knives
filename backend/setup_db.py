import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def setup_database():
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cur = conn.cursor()
        
        # Read and execute schema.sql
        with open('database/schema.sql', 'r') as f:
            sql = f.read()
            cur.execute(sql)
        
        conn.commit()
        print("✓ Database tables created successfully!")
        print("✓ Sample data inserted!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error setting up database: {e}")

if __name__ == '__main__':
    setup_database()
