import json
from flask import session, jsonify
from functools import wraps
import sqlite3 as sql 
import os

def enviar_resposta(dados, codigo=200):
    return json.dumps(dados), codigo, {
        "Access-Control-Allow-Origin": os.getenv("LINK_FRONT"),
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    }

def ler_json(caminho='tarefas'):
    with open(f'static/{caminho}.json', 'r') as tasks:
        dados = json.load(tasks)

    return dados

def salvar_json(dados, caminho='tarefas'):
    with open(f'static/{caminho}.json', 'w') as tasks:
        tasks.write(json.dumps(dados, indent=2))

def login_required(fn):
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper

def achar_tarefa(tarefas: list, id_tarefa: str):
    """
    Procura uma tarefa por seu id
    """
    for i, tarefa in enumerate(tarefas):
        if tarefa['id'] == id_tarefa:
            return tarefa, tarefas, i
        
        encontrada, pai_encontrada, i_encontrada = achar_tarefa(tarefa['subtarefas'], id_tarefa)
        if encontrada:
            return encontrada, pai_encontrada, i_encontrada
        
    return None, None, None

def contatenar_arvore_tarefas(tarefas: list, texto=''):
    arr = []

    for i, tarefa in enumerate(tarefas):
        if texto == '':
            novo_texto = f"{str(i+1)} {tarefa['nome']}"
        else:
            novo_texto = f"{texto}{str(i+1)} {tarefa['nome']}"
        arr.append({'texto': novo_texto, 'id': tarefa['id']})
        arr = arr + contatenar_arvore_tarefas(tarefa.get('subtarefas', []), texto=texto + str(i + 1) + '.')
    
    return arr

def ler_bd():
    con = sql.connect("static/banco.db")
    cur = con.cursor()

    res = cur.execute("SELECT * FROM disciplinas;")

    dados = res.fetchall()

    con.close()

    final = []

    for dado in dados:
        final.append({
            "id": dado[0],
            "nome": dado[1],
            "objetivo": dado[2],
            "estudadas": dado[3]
        })

    return final