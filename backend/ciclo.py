from app import app

from helpers import enviar_resposta, execute_sql, ler_bd
from flask import request
from datetime import datetime, timedelta
import os
import psycopg2 as postgress

@app.route('/reseta_ciclo')
def reseta_ciclo():
    execute_sql("UPDATE disciplinas SET h_estudadas = 0;")

    return enviar_resposta({'msg': 'Sucesso'})

@app.route('/add_ciclo')
def add_ciclo():
    if not request.args.get("nome") or not request.args.get("pomodoros"):
      return enviar_resposta({'msg': 'Falta de parâmetros'}, codigo=400)

    dados = (request.args.get("nome"), request.args.get("pomodoros"))
    execute_sql("INSERT INTO disciplinas(nome, h_objetivo) VALUES (?, ?);", dados)

    return enviar_resposta({'msg': 'Sucesso'})

@app.route('/apaga_ciclo')
def apaga_ciclo():
    if not request.args.get("id"):
      return enviar_resposta({'msg': 'Falta de parâmetros'}, codigo=400)

    execute_sql("DELETE FROM disciplinas WHERE id = ?;", (request.args.get("id")))

    return enviar_resposta({'msg': 'Sucesso'})

@app.route('/ler_ciclo')
def ler_ciclo():
    dados = ler_bd()
    return enviar_resposta(dados)

@app.route('/get_pomodoro_disciplina')
def get_pomoro_disciplina():
  """Retorna um array com os pomodoros gastos por disciplina"""
  min_data = '2026-01-01'

  if request.args.get("timespan"):
    try:
      timespan = int(request.args.get("timespan"))
    except ValueError:
      return enviar_resposta({'msg': 'Timespan deve ser um número inteiro'}, codigo=400)
    
    if timespan != -1:
      min_data = (datetime.now() - timedelta(days=timespan)).strftime("%Y-%m-%d")

  dados = execute_sql("SELECT disciplina, SUM(horas) FROM historico WHERE data >= ? GROUP BY disciplina ORDER BY SUM(horas) DESC;", 
    (min_data,))

  formato_final = []
  for dado in dados:
    formato_final.append({
      "disciplina": dado[0],
      "pomodoros": dado[1]
    })

  return enviar_resposta(formato_final)

@app.route('/get_pomodoro_data')
def get_pomoro_data():
  """Retorna um array com os pomodoros gastos por dia"""
  min_data = '2026-01-01'

  if request.args.get("timespan"):
    try:
      timespan = int(request.args.get("timespan"))
    except ValueError:
      return enviar_resposta({'msg': 'Timespan deve ser um número inteiro'}, codigo=400)

    if timespan != -1:
      min_data = (datetime.now() - timedelta(days=timespan)).strftime("%Y-%m-%d")

  dados = execute_sql("SELECT data, SUM(horas) FROM historico WHERE data >= ? GROUP BY data ORDER BY data ASC;", 
    (min_data,))

  print(dados)

  formato_final = []
  for dado in dados:
    formato_final.append({
      "data": dado[0],
      "pomodoros": dado[1]
    })

  return enviar_resposta(formato_final)

@app.route('/add_tempo')
def add_tempo():
  if not request.args.get("id"):
    return enviar_resposta({'msg': 'Falta de parâmetros'}, codigo=400)

  dados = ler_bd()
  nome = 'Outros'
  hoje = datetime.today().strftime("%Y-%m-%d")
  try:
    id = int(request.args.get("id"))
  except ValueError:
    return enviar_resposta({'msg': 'erro'}, codigo=400)

  for dado in dados:
    if dado["id"] == id:
      execute_sql("UPDATE disciplinas SET h_estudadas = ?;", (dado["estudadas"] + 1,))
      nome = dado["nome"]

  execute_sql("""
    INSERT INTO historico (data, disciplina, horas)
    VALUES (?, ?, 1)
    ON CONFLICT(data, disciplina)
    DO UPDATE SET horas = horas + 1;
  """, (hoje, nome))

  return enviar_resposta({'msg': 'success'})