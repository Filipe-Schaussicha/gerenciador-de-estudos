import json
from flask import session, jsonify
from functools import wraps

def is_data_list(lista, data):
    for tarefa in lista:
        if tarefa['data'] == data:
            return True
        
    return False

def ler_json(caminho='static/tarefas.json'):
    with open(caminho, 'r') as tasks:
        dados = json.load(tasks)

    return dados

def salvar_json(dados, caminho='static/tarefas.json'):
    with open(caminho, 'w') as tasks:
        tasks.write(json.dumps(dados, indent=2))

def login_required(fn):
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper

def get_index_data(dados, data):
    for i, dia in enumerate(dados):
        if dia['data'] == data:
            return i

    return -1