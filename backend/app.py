from flask import Flask, session, request
from flask_session import Session
from helpers import ler_json, salvar_json, login_required, contatenar_arvore_tarefas, achar_tarefa, ler_bd
from flask_cors import CORS
import json
import uuid
import sqlite3 as sql
from datetime import datetime, timedelta
import time
from werkzeug.security import check_password_hash
import os

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "redis"
Session(app)
CORS(app, supports_credentials=True, origins=[os.getenv("LINK_FRONT")])

DB_PATH = "static/banco.db"

@app.route('/get_pomodoro_disciplina')
def get_pomoro_disciplina():
  """Retorna um array com os pomodoros gastos por disciplina"""
  if "user_id" not in session:
    return 'erro', 401
  
  min_data = '2026-01-01'

  if request.args.get("timespan"):
    try:
      timespan = int(request.args.get("timespan"))
    except ValueError:
      return 'erro', 400
    
    if timespan != -1:
      min_data = (datetime.now() - timedelta(days=timespan)).strftime("%Y-%m-%d")

  con = sql.connect("static/banco.db")
  cur = con.cursor()
  res = cur.execute("SELECT disciplina, SUM(horas) FROM historico WHERE data >= ? GROUP BY disciplina ORDER BY SUM(horas) DESC;", (min_data,))
  dados = res.fetchall()
  con.close()

  formato_final = []
  for dado in dados:
    formato_final.append({
      "disciplina": dado[0],
      "pomodoros": dado[1]
    })

  return json.dumps(formato_final)

@app.route('/get_pomodoro_data')
def get_pomoro_data():
  """Retorna um array com os pomodoros gastos por dia"""
  if "user_id" not in session:
    return 'erro', 401
  
  min_data = '2026-01-01'

  if request.args.get("timespan"):
    try:
      timespan = int(request.args.get("timespan"))
    except ValueError:
      return 'erro', 400

    if timespan != -1:
      min_data = (datetime.now() - timedelta(days=timespan)).strftime("%Y-%m-%d")

  con = sql.connect("static/banco.db")
  cur = con.cursor()

  res = cur.execute("SELECT data, SUM(horas) FROM historico WHERE data >= ? GROUP BY data ORDER BY data ASC;", (min_data,))

  dados = res.fetchall()
  con.close()

  formato_final = []
  for dado in dados:
    formato_final.append({
      "data": dado[0],
      "pomodoros": dado[1]
    })

  return json.dumps(formato_final)

@app.route('/add_tempo')
def add_tempo():
  if "user_id" not in session:
    return 'erro', 401
  if not request.args.get("id"):
    return 'erro', 400

  dados = ler_bd()
  nome = 'Outros'
  hoje = datetime.today().strftime("%Y-%m-%d")
  try:
    id = int(request.args.get("id"))
  except ValueError:
    return 'erro', 400

  con = sql.connect(DB_PATH)
  cur = con.cursor()

  for dado in dados:
    if dado["id"] == id:
      cur.execute("UPDATE disciplinas SET h_estudadas = ? WHERE id = ?;", (dado["estudadas"] + 1, dado["id"]))
      nome = dado["nome"]
  
  res = cur.execute("SELECT * FROM historico WHERE data = ? AND disciplina = ?;", (hoje, nome))

  dados_historico = res.fetchall()

  if len(dados_historico) == 0:
    cur.execute("INSERT INTO historico(data, disciplina) VALUES (?, ?);", (hoje, nome))
  else:
    cur.execute("UPDATE historico SET horas = ? WHERE data = ? AND disciplina = ?;", (dados_historico[0][2] + 1, hoje, nome))

  con.commit()

  return 'sucesso', 200

@app.route('/reseta_ciclo')
def reseta_ciclo():
    if "user_id" not in session:
      return 'erro', 401

    con = sql.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("UPDATE disciplinas SET h_estudadas = 0;")
    con.commit()

    return 'sucess'

@app.route('/add_ciclo')
def add_ciclo():
    if "user_id" not in session:
      return 'erro', 401
    if not request.args.get("nome") or not request.args.get("horas"):
      return 'erro', 400

    con = sql.connect(DB_PATH)
    cur = con.cursor()
    dados = (request.args.get("nome"), request.args.get("horas"))
    cur.execute("INSERT INTO disciplinas(nome, h_objetivo) VALUES (?, ?);", dados)
    con.commit()

    return 'sucess'

@app.route('/apaga_ciclo')
def apaga_ciclo():
    if "user_id" not in session:
      return 'erro', 401
    if not request.args.get("id"):
      return 'erro', 400

    con = sql.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DELETE FROM disciplinas WHERE id = ?;", (request.args.get("id")))
    con.commit()

    return 'sucesso', 200

@app.route('/ler_ciclo')
def ler_ciclo():
    if "user_id" not in session:
      return 'erro', 401

    dados = ler_bd()
    return json.dumps(dados)

@app.route('/setar_tarefa_aberta')
def setar_tarefa_aberta():
  if "user_id" not in session:
    return json.dumps({"ok": False}), 401
  if not request.args.get('id') or not request.args.get('valor'):
    return 'erro', 400
  
  id = request.args.get('id')
  valor =  True if request.args.get('valor') == 'true' else False

  dados = ler_json()

  tarefa, _, _ = achar_tarefa(dados, id)
  if tarefa == None:
    return 'erro', 400

  tarefa['aberto'] = valor
  
  salvar_json(dados)

  return 'sucess', 200

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
    "aberto": True,
    "subtarefas": []
  }

  if request.args.get('id'):
    tarefa, pai, _ = achar_tarefa(dados, request.args.get('id'))
    tarefa['subtarefas'].append(nova_tarefa)
    #pai['aberto'] = True
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

  con = sql.connect("static/banco.db")
  cur = con.cursor()
  res = cur.execute("SELECT * FROM usuarios;")
  usuarios = res.fetchall()
  con.close()

  for user in usuarios:
    if user[1] == usuario and check_password_hash(user[2], data.get('senha')):
      session['user_id'] = user[0]
      return json.dumps({'msg': 'loginAceito'})
  
  return json.dumps({'msg': 'loginRecusado'}), 401

@app.route('/logout')
def logout():
  """Deslogar"""
  session.clear()
  redirect('/login')

#app.run(host="localhost", port=5000, debug=True)
