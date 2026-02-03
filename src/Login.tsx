import type { FormEvent } from "react";
import enderecoBack from "./others/VarsGlobal";

interface Props{
    onLogin: () => void
}

function Login({onLogin} : Props) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)

    const user = form.get('user') as string;
    const senha = form.get('senha') as string;

    await fetch(`${enderecoBack}/logar`, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'}, credentials: 'include', body: JSON.stringify({'user': user, 'senha':senha})
    }).then(res => res.ok ? onLogin() : alert('Acesso recusado')).catch(() => alert('Erro ao logar'))
  }

  return (
    <div className="text-center flex justify-center items-center min-h-screen">
      <div className="text-xl">
        <h1 className="text-4xl my-1 font-bold">Login</h1>

        <form className="flex flex-col items-center" onSubmit={submit}>
            <input type="text" name="user" required className="my-2 p-1.5 bg-white border-black border-1 rounded-xl" autoComplete="off" />
            <input type="password" name="senha" required className="my-2 p-1.5 bg-white border-black border-1 rounded-xl" />
            <button type="submit" className="bg-green-400 p-2 rounded-xl hover:bg-green-500 font-medium">Entrar</button>
        </form>
      </div>
    </div>
  )
}

export default Login;