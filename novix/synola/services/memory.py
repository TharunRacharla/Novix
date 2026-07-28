import sqlite3

conn = sqlite3.connect("chat.db")

cur = conn.cursor()

cur.execute("CREATE table if not exists ")