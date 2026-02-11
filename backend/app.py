from flask import Flask
from helpers import setar_db
from flask_cors import CORS
import os

app = Flask(__name__)

app.secret_key = os.getenv("CHAVE_SECRETA")

CORS(app, supports_credentials=True, origins=[os.getenv("LINK_FRONT")])

USUARIO = os.getenv("USUARIO")
SENHA = os.getenv("SENHA")
ID=os.getenv("ID_USUARIO")

setar_db()

# Outros arquivos
import ciclo
import login
import tarefas


#app.run(host="localhost", port=5000, debug=True)
