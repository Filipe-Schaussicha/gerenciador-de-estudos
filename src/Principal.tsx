import Ciclo from "./pages/Ciclo"
import Pomodoro from "./pages/Pomodoro"
import ListaTarefas from "./pages/ListaTarefas"
import { useState } from "react"

function Principal(){
    const clases = 'p-10 text-center'

    const [fimTimerPomodoro, setFimTimerPomodoro] = useState(0)

    return (
    <>
        <div className="grid grid-cols-3 max-xl:grid-cols-1 min-h-screen">
            {/* Lista de tarefas */}
            <ListaTarefas className={clases + ' bg-orange-50'} />

            {/* Pomodoro timer */}
            <Pomodoro className={clases + ' bg-orange-100'} onFimPomodoro={()=>{setFimTimerPomodoro(Date.now())}} />

            {/* Ciclo de estudos */}
            <Ciclo className={clases + ' bg-orange-50'} fimPomodoro={fimTimerPomodoro} />
        </div>
    </>
    )
}

export default Principal