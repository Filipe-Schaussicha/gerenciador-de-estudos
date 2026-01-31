from werkzeug.security import generate_password_hash
import sqlite3 as sql

user = ''
senha = ''

con = sql.connect("static/banco.db")
cur = con.cursor()
cur.execute("INSERT INTO usuarios(username, hash) VALUES (?, ?);", (user, generate_password_hash(senha)))
con.commit()