from flask import Flask, session, request
from flask_session import Session
from helpers import is_data_list, ler_json, salvar_json, login_required, get_index_data, achar_tarefa_data, contatenar_arvore_tarefas
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

@app.route('/mover_tarefa')
def mover_tarefa():
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('id') or not request.args.get('arquivo') or not request.args.get('nova_pos'):
    return 'erro', 400
  
  dados = ler_json(caminho=request.args.get('arquivo'))
  _, tarefas, i = achar_tarefa_data(dados, request.args.get('id'))
  new_i = int(request.args.get('nova_pos')) + i

  if tarefas == None or new_i < 0 or new_i >= len(tarefas):
    return 'erro', 400
  
  tarefas[i], tarefas[new_i] = tarefas[new_i], tarefas[i]

  # Criar um route próprio
  teste = []
  for data in dados:
    teste.extend(contatenar_arvore_tarefas(data['tarefas']))
  print(teste)

  salvar_json(dados, caminho=request.args.get('arquivo'))  
  return 'sucess', 200

@app.route('/deletar_tarefa')
def deletar_tarefa_route():
  """ Deleta tarefas """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('id') or not request.args.get('arquivo'):
    return 'erro', 400
  
  dados = ler_json(caminho=request.args.get('arquivo'))

  _, tarefas, i = achar_tarefa_data(dados, request.args.get('id'))

  if tarefas == None:
    return 'erro', 400
  
  tarefas.pop(i)

  salvar_json(dados, caminho=request.args.get('arquivo'))  
  return 'sucess', 200


@app.route('/checkar_tarefa')
def checar_tarefa():
  """ Salva se uma tarefa foi checada ou não """
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  
  if not request.args.get('tipo') or not request.args.get('id_tarefa') or not request.args.get('valor'):
    return 'erro', 400
  
  tipo = request.args.get('tipo')
  id = request.args.get('id_tarefa')
  valor =  True if request.args.get('valor') == 'true' else False

  dados = ler_json(caminho=tipo)

  tarefa, _, _ = achar_tarefa_data(dados, id)
  if tarefa == None:
    return 'erro', 400

  tarefa['feito'] = valor

  salvar_json(dados, caminho=tipo)

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
    "id": str(uuid.uuid4()),
    "nome": texto,
    "feito": False,
    "subtarefas": []
  }

  dados[get_index_data(dados, data)]["tarefas"].append(nova_tarefa)

  if dados:
    salvar_json(dados)
    return 'sucess', 200
  else:
    return 'erro', 400 

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