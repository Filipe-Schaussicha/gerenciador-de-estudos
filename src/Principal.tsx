import Ciclo from "./pages/Ciclo"
import Pomodoro from "./pages/Pomodoro"
import ListaTarefas from "./pages/ListaTarefas"
import { useEffect, useState } from "react"
import enderecoBack from "./others/VarsGlobal"

interface Props{
    onDeslogar: ()=>void
}

function Principal({onDeslogar} : Props){
    const clases = 'p-10 text-center'

    const [fimTimerPomodoro, setFimTimerPomodoro] = useState(0)

    async function deslogar(){
        const res = await fetch(`${enderecoBack}/logout`, {credentials: 'include'})

        if(res.ok){
            console.log('Deslogado com sucesso');
            onDeslogar()
        }else{
            console.log('Erro ao deslogar')
        }
    }

    return (
    <div className="min-h-screen flex flex-col">
        <div className="grid grid-cols-3 max-xl:grid-cols-1 flex-1">
            {/* Lista de tarefas */}
            <ListaTarefas className={clases + ' bg-orange-50'} />

            {/* Pomodoro timer */}
            <Pomodoro className={clases + ' bg-orange-100'} onFimPomodoro={()=>{setFimTimerPomodoro(Date.now())}} />

            {/* Ciclo de estudos */}
            <Ciclo className={clases + ' bg-orange-50'} fimPomodoro={fimTimerPomodoro} />
        </div>

        <footer className="bg-orange-200 xl:col-span-3 py-1 px-3">
            <nav className="text-sm">
                <a href="https://github.com/Filipe-Schaussicha/gerenciador-de-estudos" target="_blank" className="mr-3 hover:underline">Repositório no GitHub</a>
                <a onClick={deslogar} className="mr-3 hover:underline cursor-pointer">Deslogar</a>
            </nav>
        </footer>
    </div>
    )
}

export default Principal