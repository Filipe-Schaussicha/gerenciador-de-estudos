from flask import Flask, session, request
from flask_session import Session
from helpers import ler_json, salvar_json, login_required, contatenar_arvore_tarefas, achar_tarefa
from flask_cors import CORS
import json
import uuid

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

usuarios = [
  {'id': 1, 'user': 'filipe', 'senha': 'filipe378'}
]

@app.route('/add_tarefa')
def add_tarefa():
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('texto'):
    return 'erro', 400
  
  dados = ler_json()

  nova_tarefa = {
    "id": str(uuid.uuid4()),
    "nome": request.args.get('texto'),
    "feito": False,
    "subtarefas": []
  }

  if request.args.get('id'):
    tarefa, _, _ = achar_tarefa(dados, request.args.get('id'))
    tarefa['subtarefas'].append(nova_tarefa)
  else:
    dados.append(nova_tarefa)

  salvar_json(dados)
  return 'sucess', 200

@app.route('/todas_tarefas_arvore')
def todas_tarefas_data():
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  
  dados = ler_json()

  return json.dumps(contatenar_arvore_tarefas(dados))

@app.route('/mover_tarefa')
def mover_tarefa():
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('id') or not request.args.get('nova_pos'):
    return 'erro', 400
  
  dados = ler_json()
  _, tarefas, i = achar_tarefa(dados, request.args.get('id'))
  new_i = int(request.args.get('nova_pos')) + i

  if tarefas == None or new_i < 0 or new_i >= len(tarefas):
    return 'erro', 400
  
  tarefas[i], tarefas[new_i] = tarefas[new_i], tarefas[i]

  salvar_json(dados)  
  return 'sucess', 200

@app.route('/deletar_tarefa')
def deletar_tarefa_route():
  """ Deleta tarefas """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('id'):
    return 'erro', 400
  
  dados = ler_json()

  _, tarefas, i = achar_tarefa(dados, request.args.get('id'))

  if tarefas == None:
    return 'erro', 400
  
  tarefas.pop(i)

  salvar_json(dados)  
  return 'sucess', 200

@app.route('/checkar_tarefa')
def checar_tarefa():
  """ Salva se uma tarefa foi checada ou não """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('id_tarefa') or not request.args.get('valor'):
    return 'erro', 400
  
  id = request.args.get('id_tarefa')
  valor =  True if request.args.get('valor') == 'true' else False

  dados = ler_json()

  tarefa, _, _ = achar_tarefa(dados, id)
  if tarefa == None:
    return 'erro', 400

  tarefa['feito'] = valor
  
  salvar_json(dados)

  return 'sucess', 200

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

"""
@app.route('/abrir_data')
def abrir_data():
  #Salva se uma data teve as tarefas mostradas ou não

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
"""

#app.run(host="localhost", port=5000, debug=True)