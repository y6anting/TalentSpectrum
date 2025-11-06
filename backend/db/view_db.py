import sqlite3
import pandas as pd

# Path to your database file
db_path = "../../../../talentspectrum.db"

# Connect to the database
conn = sqlite3.connect(db_path)

# List all tables in the database
tables = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type='table';", conn)
print("📋 Tables in the database:")
print(tables)

# Choose which table to display
table_name = input("\nEnter table name to display: ").strip()

# Load table into a DataFrame
df = pd.read_sql_query(f"SELECT * FROM {table_name};", conn)

# Display the table
print(f"\n📊 Showing first 10 rows of '{table_name}' table:")
print(df.head(10).to_string(index=False))

# Close connection
conn.close()