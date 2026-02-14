from app import app

from helpers import enviar_resposta, execute_sql, ler_bd
from flask import request
from datetime import datetime, timedelta
import os
import psycopg2 as postgress

id_user = 1

@app.route('/reseta_ciclo')
def reseta_ciclo():
    execute_sql("UPDATE disciplinas SET h_estudadas = 0 WHERE id_user = %s;", (id_user,))

    return enviar_resposta({'msg': 'Sucesso'})

@app.route('/add_ciclo')
def add_ciclo():
    if not request.args.get("nome") or not request.args.get("pomodoros"):
      return enviar_resposta({'msg': 'Falta de parâmetros'}, codigo=400)

    dados = (request.args.get("nome"), request.args.get("pomodoros"), id_user)
    execute_sql("INSERT INTO disciplinas(nome, h_objetivo, id_user) VALUES (%s, %s, %s);", dados)

    return enviar_resposta({'msg': 'Sucesso'})

@app.route('/apaga_ciclo')
def apaga_ciclo():
    if not request.args.get("id"):
      return enviar_resposta({'msg': 'Falta de parâmetros'}, codigo=400)

    execute_sql("DELETE FROM disciplinas WHERE id = %s AND id_user = %s;", (request.args.get("id"), id_user))

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

  dados = execute_sql("SELECT disciplina, SUM(horas) FROM historico WHERE data >= %s AND id_user = %s GROUP BY disciplina ORDER BY SUM(horas) DESC;", 
    (min_data, id_user))

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

  dados = execute_sql("SELECT data, SUM(horas) FROM historico WHERE data >= %s AND id_user = %s GROUP BY data ORDER BY data ASC;", 
    (min_data, id_user))

  print(dados)

  formato_final = []
  for dado in dados:
    formato_final.append({
      "data": dado[0].strftime("%Y-%m-%d"),
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

  conn = postgress.connect(os.getenv("LINK_DB_POSTGRES"))
  cur = conn.cursor()

  for dado in dados:
    if dado["id"] == id:
      cur.execute("UPDATE disciplinas SET h_estudadas = %s WHERE id = %s AND id_user = %s;", (dado["estudadas"] + 1, dado["id"], id_user))
      nome = dado["nome"]

  cur.execute("""
    DO $$
    BEGIN
      IF NOT EXISTS(
        SELECT * FROM historico WHERE data = %s AND disciplina = %s AND id_user = %s
      ) THEN
        INSERT INTO historico(data, disciplina, id_user) VALUES (%s, %s, %s);
      ELSE
        UPDATE historico SET horas = horas + 1 WHERE data = %s AND disciplina = %s AND id_user = %s;
      END IF;
    END $$;
  """, (hoje, nome, id_user, hoje, nome, id_user, hoje, nome, id_user))

  conn.commit()
  cur.close()
  conn.close()

  return enviar_resposta({'msg': 'success'})