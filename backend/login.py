from app import app

from flask import Flask, request, make_response
from helpers import enviar_resposta, esta_logado, execute_sql
from werkzeug.security import check_password_hash, generate_password_hash
import os

#  Endpoint para criar usuários, descomente para criar um usuário e comente denovo para evitar acessos indesejados
"""
@app.route('/criar_user', methods=['POST'])
def criar_user():
  data = request.get_json()

  if not data.get('user') or not data.get('senha') or not data:
    return enviar_resposta({'msg': 'Falta de informações'}, codigo=400)

  usuario = data.get('user')
  senha = data.get('senha')

  dados = execute_sql("SELECT * FROM usuarios WHERE nome = %s;", argumentos=(usuario,))
  if dados != []:
    return enviar_resposta({'msg': 'Nome de usuário já existente'}, codigo=403)

  execute_sql("INSERT INTO usuarios(nome, hash) VALUES (%s, %s);", argumentos=(usuario, generate_password_hash(senha)))

  return enviar_resposta({'msg': 'Usuário adicionado com sucesso'})
"""

@app.route('/islogado')
def islogado():
  """Verifica se está logado"""
  if not esta_logado():
    return enviar_resposta({'logado': False}, codigo=401)
  return enviar_resposta({'logado': True})

@app.route('/logar', methods=['POST'])
def logar():
  """
  Fazer login
  """
  data = request.get_json()

  if not data.get('user') or not data.get('senha') or not data:
    return enviar_resposta({'msg': 'Falta de informações'}, codigo=400)
  
  usuario = data.get('user')
  senha = data.get('senha')

  user_banco = execute_sql("SELECT * FROM usuarios WHERE nome = %s;", (usuario,))

  if len(user_banco) == 0:
    return enviar_resposta({'msg': 'Usuário não encontrado'}, codigo=403)

  if check_password_hash(user_banco[0][2], senha):
    res = make_response('Cookie criado')
    res.set_cookie(
      key='user',
      value=str(user_banco[0][0]),
      max_age=60*60*12,
      httponly=True,
      secure=True,
      samesite='None'     
    )
    return res

  return enviar_resposta({'msg': 'Senha incorreta'}, codigo=401)

@app.route('/logout')
def logout():
  """Deslogar"""
  resp = make_response('Deslogado')
  resp.set_cookie(
    'user', 
    '', 
    max_age=0,
    httponly=True,
    secure=True,
    samesite='None'
  )
  return resp
