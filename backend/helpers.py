import json
from flask import session, jsonify, request
from functools import wraps
import sqlite3 as sql 
import os
import psycopg2 as postgress

def execute_sql(comando, argumentos=()):
    """ Faz um query sql """

    conn = postgress.connect(os.getenv("LINK_DB_POSTGRES"))
    cur = conn.cursor()

    cur.execute(comando, argumentos)

    try:
        dados = cur.fetchall()
    except postgress.ProgrammingError:
        dados = []

    conn.commit()
    cur.close()
    conn.close()

    return dados

def setar_db():
    """ Seta tabelas, caso ainda não existam """

    conn = postgress.connect(os.getenv("LINK_DB_POSTGRES"))
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS usuarios(
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            nome TEXT NOT NULL UNIQUE,
            hash TEXT NOT NULL
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS disciplinas(
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            nome TEXT NOT NULL,
            h_objetivo INTEGER NOT NULL,
            h_estudadas INTEGER DEFAULT 0,
            id_user INTEGER NOT NULL,
            FOREIGN KEY (id_user) REFERENCES usuarios(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS historico(
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            data DATE,
            horas INTEGER DEFAULT 1,
            disciplina TEXT NOT NULL,
            id_user INTEGER NOT NULL,
            FOREIGN KEY (id_user) REFERENCES usuarios(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS tarefas(
            id_user INTEGER PRIMARY KEY,
            tarefas JSON NOT NULL,
            FOREIGN KEY (id_user) REFERENCES usuarios(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    """)

    conn.commit()
    cur.close()
    conn.close()

def esta_logado():
    if not request.cookies.get('user') or request.cookies.get('user') == '':
        return None
    return request.cookies.get('user')

def enviar_resposta(dados, codigo=200):
    return json.dumps(dados), codigo, {
        "Access-Control-Allow-Origin": os.getenv("LINK_FRONT"),
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    }

def ler_json():
    user_id = esta_logado()
    if not esta_logado():
        return []

    dados = execute_sql("SELECT tarefas FROM tarefas WHERE id_user = %s;", (user_id,))

    if dados == []:
        return dados
    return dados[0][0]

def salvar_json(dados):
    user_id = esta_logado()
    if not esta_logado():
        return

    dados_json = json.dumps(dados)

    execute_sql("INSERT INTO tarefas VALUES (%s, %s) ON CONFLICT (id_user) DO UPDATE SET tarefas = %s;", (user_id, dados_json, dados_json))

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
    id_user = esta_logado()
    if not id_user:
        return []

    dados = execute_sql("SELECT * FROM disciplinas WHERE id_user = %s;", (id_user, ))

    final = []

    for dado in dados:
        final.append({
            "id": dado[0],
            "nome": dado[1],
            "objetivo": dado[2],
            "estudadas": dado[3]
        })

    return final
