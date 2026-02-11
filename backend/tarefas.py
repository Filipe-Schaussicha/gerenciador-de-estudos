from app import app

from flask import request
from helpers import ler_json, salvar_json, contatenar_arvore_tarefas, achar_tarefa, enviar_resposta, esta_logado, execute_sql
import uuid

@app.route('/setar_tarefa_aberta')
def setar_tarefa_aberta():
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  if not request.args.get('id') or not request.args.get('valor'):
    return enviar_resposta({'msg': 'erro'}, codigo=400)
  
  id = request.args.get('id')
  valor =  True if request.args.get('valor') == 'true' else False

  dados = ler_json()

  tarefa, _, _ = achar_tarefa(dados, id)
  if tarefa == None:
    return enviar_resposta({'msg': 'erro'}, codigo=400)

  tarefa['aberto'] = valor
  
  salvar_json(dados)

  return enviar_resposta({'msg': 'success'})

@app.route('/add_tarefa')
def add_tarefa():
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  if not request.args.get('texto'):
    return enviar_resposta({'msg': 'Falta do parâmetro texto'}, codigo=400)
  
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
  return enviar_resposta({'msg': 'success'})

@app.route('/todas_tarefas_arvore')
def todas_tarefas_data():
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  
  dados = ler_json()

  return enviar_resposta(contatenar_arvore_tarefas(dados))

@app.route('/mover_tarefa')
def mover_tarefa():
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  if not request.args.get('id') or not request.args.get('nova_pos'):
    return enviar_resposta({'msg': 'Falta de informações'}, codigo=400)
  
  dados = ler_json()
  _, tarefas, i = achar_tarefa(dados, request.args.get('id'))
  
  try:
    new_i = int(request.args.get('nova_pos')) + i
  except ValueError:
    return enviar_resposta({'msg': 'new_i tem que ser um número inteiro'}, codigo=500)

  if tarefas == None or new_i < 0 or new_i >= len(tarefas):
    return enviar_resposta({'msg': 'Fora dos limites do array'}, codigo=400)
  
  tarefas[i], tarefas[new_i] = tarefas[new_i], tarefas[i]

  salvar_json(dados)  
  return enviar_resposta({'msg': 'success'})

@app.route('/deletar_tarefa')
def deletar_tarefa_route():
  """ Deleta tarefas """
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  if not request.args.get('id'):
    return enviar_resposta({'msg': 'Falta de informações'}, codigo=400)
  
  dados = ler_json()

  _, tarefas, i = achar_tarefa(dados, request.args.get('id'))

  if tarefas == None:
    return enviar_resposta({'msg': 'Tarefa não encontrada'}, codigo=400)
  
  tarefas.pop(i)

  salvar_json(dados)  
  return enviar_resposta({'msg': 'success'})

@app.route('/checkar_tarefa')
def checar_tarefa():
  """ Salva se uma tarefa foi checada ou não """
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  if not request.args.get('id') or not request.args.get('valor'):
    return enviar_resposta({'msg': 'Falta de parâmetros'}, codigo=400)
  
  id = request.args.get('id')
  valor =  True if request.args.get('valor') == 'true' else False

  dados = ler_json()

  tarefa, _, _ = achar_tarefa(dados, id)
  if tarefa == None:
    return enviar_resposta({'msg': 'Tarefa não encontrada'}, codigo=400)

  tarefa['feito'] = valor
  
  salvar_json(dados)

  return enviar_resposta({'msg': 'success'})

@app.route('/ler_tarefas')
def ler_tarefas():
  """Envia a lista de tarefas"""
  if not esta_logado():
    return enviar_resposta({'ok': False}, codigo=401)
  return enviar_resposta(ler_json())
