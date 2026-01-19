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


@app.route('/add_data')
def add_data():
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401

  # verifica se há um arg 'data'
  if not request.args.get('data'):
    return json.dumps({"ok": False}), 400

  # lê arquivo json
  dados = ler_json()

  # cria nova data
  nova_data = {
    "data": request.args.get('data'),
    "aberto": False,
    "tarefas": []
  }
  
  # verfica se a data é repetida
  if is_data_list(dados, request.args.get('data')):
    return json.dumps({"ok": True}), 200

  # Adiciona nova data
  dados.append(nova_data)

  # Ordena as datas
  for i in range(len(dados)):
    for j in range(i+1, len(dados)):
      if dados[i]['data'] > dados[j]['data']:
        dados[i], dados[j] = dados[j], dados[i]

  salvar_json(dados)

  return json.dumps({"ok": True}), 200

@app.route('/ler_tarefas')
@login_required
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


#app.run(host="localhost", port=5000, debug=True)