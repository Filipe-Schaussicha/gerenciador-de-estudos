import Ciclo from "./pages/Ciclo"
import Pomodoro from "./pages/Pomodoro"
import Tarefas from "./pages/Tarefas"

function Principal(){
    const clases = 'p-10 text-center'

    return (
    <>
        <div className="bg-amber-50 grid grid-cols-3 min-h-screen max-lg:grid-cols-1">
            {/* Lista de tarefas */}
            <Tarefas className={clases + ' bg-orange-50'} />

            {/* Pomodoro timer */}
            <Pomodoro className={clases + ' bg-orange-100'} />

            {/* Ciclo de estudos */}
            <Ciclo className={clases + ' bg-orange-50'} />
        </div>
    </>
    )
}

export default Principal