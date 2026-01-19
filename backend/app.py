from flask import Flask, session, request
from flask_session import Session
import json
from helpers import is_data_list, ler_json, salvar_json, login_required, get_index_data
from flask_cors import CORS

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

usuarios = [
  {'id': 1, 'user': 'filipe', 'senha': 'filipe378'}
]


@app.route('/checkar_tarefa')
def checar_tarefa():
  """ Salva se uma tarefa foi checada ou não """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  
  if not request.args.get('tipo') or not request.args.get('pai') or not request.args.get('i') or not request.args.get('valor'):
    return 'erro', 400
  
  tipo = request.args.get('tipo')
  pai = request.args.get('pai')
  i = int(request.args.get('i'))
  valor =  True if request.args.get('valor') == 'true' else False

  if tipo == 'data':
    dados = ler_json()
    dados[get_index_data(dados, pai)]["tarefas"][i]["feito"] = valor
    salvar_json(dados)

  return 'sucess', 200

@app.route('/add_tarefa')
def add_tarefa():
  """ adiciona tarefa ao arquivo .json """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  
  if not request.args.get('data') or not request.args.get('texto'):
    return 'erro', 400
  
  dados = ler_json()
  
  data = request.args.get('data')
  texto = request.args.get('texto')

  nova_tarefa = {
    "nome": texto,
    "feito": False,
    "subtarefas": []
  }

  dados[get_index_data(dados, data)]["tarefas"].append(nova_tarefa)

  salvar_json(dados)

  return 'sucess', 200

@app.route('/remover_data')
def remover_data():
  """ Remove datas """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401

  if not request.args.get('data'):
    return json.dumps({"ok": False}), 400
  
  dados = ler_json()

  data_remover = request.args.get('data')
  novos_dados = [data for data in dados if data['data'] != data_remover]

  salvar_json(novos_dados)

  return json.dumps({"ok": True})

@app.route('/abrir_data')
def abrir_data():
  """Salva se uma data teve as tarefas mostradas ou não"""

  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  
  if not request.args.get('data') or not request.args.get('valor'):
    return 'erro', 400
  
  dados = ler_json()

  data = request.args.get('data')
  valor =  True if request.args.get('valor') == 'true' else False

  dados[get_index_data(dados, data)]['aberto'] = valor

  salvar_json(dados)

  return 'sucess', 200

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