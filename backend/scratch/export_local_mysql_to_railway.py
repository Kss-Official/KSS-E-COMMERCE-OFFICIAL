import pymysql
import sys

# Local MySQL credentials
LOCAL_HOST = '127.0.0.1'
LOCAL_PORT = 3306
LOCAL_USER = 'root'
LOCAL_PASS = 'admin@123'
LOCAL_DB   = 'buyzo_db'

# Railway MySQL credentials
RAILWAY_HOST = 'altaria.proxy.rlwy.net'
RAILWAY_PORT = 32365
RAILWAY_USER = 'root'
RAILWAY_PASS = 'lZKCRfpRMlYhagVplRXIMSyRBMyIjCxh'
RAILWAY_DB   = 'railway'

print(f"Connecting to Local MySQL ({LOCAL_HOST}:{LOCAL_PORT}/{LOCAL_DB})...")
local_conn = pymysql.connect(
    host=LOCAL_HOST,
    port=LOCAL_PORT,
    user=LOCAL_USER,
    password=LOCAL_PASS,
    database=LOCAL_DB,
    charset='utf8mb4'
)
local_cur = local_conn.cursor(pymysql.cursors.DictCursor)

print(f"Connecting to Railway MySQL ({RAILWAY_HOST}:{RAILWAY_PORT}/{RAILWAY_DB})...")
railway_conn = pymysql.connect(
    host=RAILWAY_HOST,
    port=RAILWAY_PORT,
    user=RAILWAY_USER,
    password=RAILWAY_PASS,
    database=RAILWAY_DB,
    charset='utf8mb4',
    autocommit=False
)
railway_cur = railway_conn.cursor()

try:
    # Disable foreign key checks
    railway_cur.execute("SET FOREIGN_KEY_CHECKS = 0;")

    # Get list of tables from local MySQL
    local_cur.execute("SHOW TABLES;")
    tables = [list(row.values())[0] for row in local_cur.fetchall()]
    
    total_rows_transferred = 0
    print(f"\nFound {len(tables)} tables in local `{LOCAL_DB}`:")

    for table in tables:
        if table in ('django_content_type', 'auth_permission', 'django_migrations'):
            continue

        local_cur.execute(f"SELECT COUNT(*) AS cnt FROM `{table}`;")
        count = local_cur.fetchone()['cnt']
        
        if count == 0:
            continue

        print(f"Transferring table `{table}` ({count} rows)...")

        # Get column names
        local_cur.execute(f"DESCRIBE `{table}`;")
        columns = [row['Field'] for row in local_cur.fetchall()]

        # Select all rows
        local_cur.execute(f"SELECT * FROM `{table}`;")
        rows = local_cur.fetchall()

        if not rows:
            continue

        col_names = ", ".join([f"`{c}`" for c in columns])
        placeholders = ", ".join(["%s"] * len(columns))

        # Clear existing data in Railway table to prevent key collision
        railway_cur.execute(f"TRUNCATE TABLE `{table}`;")

        insert_values = []
        for r in rows:
            insert_values.append(tuple(r[c] for c in columns))

        insert_sql = f"INSERT INTO `{table}` ({col_names}) VALUES ({placeholders});"
        railway_cur.executemany(insert_sql, insert_values)
        total_rows_transferred += len(insert_values)
        print(f"  -> Transferred {len(insert_values)} rows to Railway MySQL table `{table}`")

    railway_conn.commit()
    print(f"\nSUCCESS: Transferred total {total_rows_transferred} rows from local MySQL `{LOCAL_DB}` to Railway MySQL `{RAILWAY_DB}`!")

except Exception as e:
    railway_conn.rollback()
    print(f"\nERROR during transfer: {e}")
    raise
finally:
    railway_cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
    railway_conn.close()
    local_conn.close()
