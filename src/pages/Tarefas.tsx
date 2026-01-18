import { useEffect, useState } from "react"
import enderecoBack from "../others/VarsGlobal";
import ListaTarefasDatas from "../components/ListaTarefasDatas";

interface Props{
    className: string
}

const Tarefas = (props: Props) => {

    // Continuar as tarefas

    const [menuAddData, setMenuAddData] = useState(false);
    const [logAddData, setLogAddData] = useState(-1);

    return (
    <section className={props.className}>

        {/* Botão de abrir e fechar o adicionador de datas */}
        <div className="flex justify-center items-center mb-3">
            <h2 className="text-4xl font-medium">Tarefas</h2>
        </div>

        {/* Menu para adicionar datas */}
        {menuAddData ? 
            <div className="bg-orange-100 mt-3 rounded-xl p-3 flex flex-col" id="add_tarefa" >
                <button onClick={() => {setMenuAddData(false); setLogAddData(-1)}} className="ml-auto"><i className="fa-solid fa-x"></i></button>
                <form /* Programar onSubmit */>
                    <input type="date" name="data" id="data" className="bg-white mb-2 max-w-full rounded-xl p-2 mx-auto" required />
                    {logAddData == 0 && <p className="text-red-500">Escolha uma data!</p>}
                    {logAddData == 1 && <p className="text-green-500">Data adicionada!</p>}
                    <button type="submit" className="bg-green-400 hover:bg-green-500 px-3 py-1 rounded-xl font-medium block mx-auto" id="add_data">Adicionar data</button>
                </form>
            </div>
            :
            <div className="bg-orange-100 mt-3 rounded-xl">
                <button className="hover:bg-orange-200 px-3 py-1 rounded-xl font-medium block w-full"
                onClick={() => {setMenuAddData(true); setLogAddData(-1)}}><i className="fa-solid fa-plus"></i> Adicionar Data</button>
            </div> 
        }
           
        {/* Tarefas */}
        <ListaTarefasDatas />
    </section>
  )
}

export default Tarefas