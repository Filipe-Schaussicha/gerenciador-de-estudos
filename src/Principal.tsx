import Ciclo from "./pages/Ciclo"
import Pomodoro from "./pages/Pomodoro"
import ListaTarefas from "./pages/ListaTarefas"
import { useState } from "react"

function Principal(){
    const clases = 'p-10 text-center'

    const [fimTimerPomodoro, setFimTimerPomodoro] = useState(0)

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
            </nav>
        </footer>
    </div>
    )
}

export default Principal