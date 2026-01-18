from flask import Flask, session, request
from flask_session import Session
import json
from helpers import is_data_list, ler_json, salvar_json, login_required
from flask_cors import CORS

app = Flask(__name__)

app.secret_key = '3789'

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

usuarios = [
  {'id': 1, 'user': 'filipe', 'senha': 'filipe378'}
]


@app.route('/ler_tarefas')
def ler_tarefas():
  """Envia a lista de tarefas"""
  return json.dumps(ler_json())

@app.route('/islogado')
def islogado():
  """Verifica se está logado"""
  if session.get('user_id') is None:
    return json.dumps({'logado': False}), 401
  return json.dumps({'logado': True})

@app.route('/logar', methods=['POST'])
def logar():
  """
  Fazer login
  """
  data = request.get_json()

  if not data.get('user') or not data.get('senha') or not data:
    return json.dumps({'msg': 'loginRecusado'}), 401
  
  usuario = data.get('user')
  senha = data.get('senha')

  for user in usuarios:
    if user["user"] == usuario and user["senha"] == senha:
      session['user_id'] = user['id']
      return json.dumps({'msg': 'loginAceito'})
  
  return json.dumps({'msg': 'loginRecusado'}), 401

@app.route('/logout')
def logout():
  """Deslogar"""
  session.clear()
  redirect('/login')


app.run(host="localhost", port=5000, debug=True)