import os
import sys
import json
import sqlite3
import pymysql
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Step 1: Dump all data from db.sqlite3 using sqlite3 connection directly
sqlite_db_path = BASE_DIR / 'db.sqlite3'
print(f"Reading SQLite database from: {sqlite_db_path}")

sqlite_conn = sqlite3.connect(sqlite_db_path)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

# Get list of tables
sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'django_migrations';")
tables = [row[0] for row in sqlite_cur.fetchall()]

# Filter non-empty tables
non_empty_tables = []
for table in tables:
    count = sqlite_cur.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
    if count > 0:
        non_empty_tables.append((table, count))

print(f"Found {len(non_empty_tables)} non-empty tables in SQLite:")
for table, count in non_empty_tables:
    print(f"  - {table}: {count} rows")

# Step 2: Connect to Railway MySQL using PyMySQL
import environ
env = environ.Env()
env_file = BASE_DIR / '.env'
if env_file.exists():
    environ.Env.read_env(str(env_file))

if env('DATABASE_URL', default=None):
    parsed_db = env.db('DATABASE_URL')
    mysql_host = parsed_db.get('HOST')
    mysql_port = int(parsed_db.get('PORT', 3306))
    mysql_user = parsed_db.get('USER')
    mysql_pass = parsed_db.get('PASSWORD')
    mysql_db   = parsed_db.get('NAME')
else:
    mysql_host = env('DB_HOST', default='altaria.proxy.rlwy.net')
    mysql_port = env.int('DB_PORT', default=32365)
    mysql_user = env('DB_USER', default='root')
    mysql_pass = env('DB_PASSWORD', default='lZKCRfpRMlYhagVplRXIMSyRBMyIjCxh')
    mysql_db   = env('DB_NAME', default='railway')

print(f"\nConnecting to Railway MySQL at {mysql_host}:{mysql_port}...")
mysql_conn = pymysql.connect(
    host=mysql_host,
    port=mysql_port,
    user=mysql_user,
    password=mysql_pass,
    database=mysql_db,
    charset='utf8mb4',
    autocommit=False
)
mysql_cur = mysql_conn.cursor()

try:
    # Disable foreign key checks for clean bulk transfer
    mysql_cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
    
    # Priority order for tables (parents before children / independent first)
    # We will copy data table by table
    for table, count in non_empty_tables:
        if table in ('django_content_type', 'auth_permission'):
            # These are populated by Django migrations automatically, skip or insert IGNORE
            continue

        # Get column names for the table
        sqlite_cur.execute(f'PRAGMA table_info("{table}")')
        columns = [col[1] for col in sqlite_cur.fetchall()]
        
        # Select all rows from SQLite
        sqlite_cur.execute(f'SELECT * FROM "{table}"')
        rows = [tuple(row) for row in sqlite_cur.fetchall()]
        
        if not rows:
            continue
            
        col_names = ", ".join([f"`{c}`" for c in columns])
        placeholders = ", ".join(["%s"] * len(columns))
        
        # Clear existing data in MySQL table to prevent duplicates
        mysql_cur.execute(f'TRUNCATE TABLE `{table}`;')
        
        insert_sql = f"INSERT INTO `{table}` ({col_names}) VALUES ({placeholders});"
        mysql_cur.executemany(insert_sql, rows)
        print(f"Successfully transferred {len(rows)} rows into MySQL table `{table}`")

    mysql_conn.commit()
    print("\nSUCCESS: All data successfully transferred and committed from SQLite to Railway MySQL!")

except Exception as e:
    mysql_conn.rollback()
    print(f"\nERROR during data transfer: {e}")
    raise
finally:
    mysql_cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
    mysql_conn.close()
    sqlite_conn.close()
