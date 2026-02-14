import json
from flask import session, jsonify, request
from functools import wraps
import sqlite3 as sql 
import os
import json

user_id = 1

def execute_sql(comando, argumentos=()):
    """ Faz um query sql """
    conn = sql.connect("banco.db")
    cur = conn.cursor()

    res = cur.execute(comando, argumentos)

    dados = res.fetchall()

    conn.commit()

    return dados

def setar_db():
    """ Seta tabelas, caso ainda não existam """
    conn = sql.connect("banco.db")
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS disciplinas(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            h_objetivo INTEGER NOT NULL,
            h_estudadas INTEGER DEFAULT 0
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS historico(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data DATE,
            horas INTEGER DEFAULT 1,
            disciplina TEXT NOT NULL
        );
    """)

    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_historico_unique ON historico(data, disciplina);")

    conn.commit()

    print("DEV: Tabelas criadas!")

def enviar_resposta(dados, codigo=200):
    return json.dumps(dados), codigo, {
        "Access-Control-Allow-Origin": os.getenv("LINK_FRONT"),
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    }

def ler_json():
    try:
        with open('tarefas.json', 'r') as file:
            dados = json.loads(file.read())
    except FileNotFoundError:
        salvar_json([])
        return []

    return dados

def salvar_json(dados):
    dados_json = json.dumps(dados)

    with open('tarefas.json', 'w') as file:
        file.write(json.dumps(dados, indent=4))

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
    dados = execute_sql("SELECT * FROM disciplinas;")

    final = []

    for dado in dados:
        final.append({
            "id": dado[0],
            "nome": dado[1],
            "objetivo": dado[2],
            "estudadas": dado[3]
        })

    return final
