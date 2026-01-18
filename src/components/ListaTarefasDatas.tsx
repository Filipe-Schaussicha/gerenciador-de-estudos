import { useEffect, useState } from "react";
import enderecoBack from "../others/VarsGlobal";

function ListaTarefasDatas(){

    const [tarefasCarregadas, setTarefasCarregadas] = useState(false);
    const [tarefas, setTarefas] = useState([]);

    useEffect(() => {fetch(`${enderecoBack}/ler_tarefas`, {credentials: 'include'}).then( res=>
        res.json(). then(json => {setTarefas(json); setTarefasCarregadas(true); console.log(json)})
    )}, [])

    if (!tarefasCarregadas){
        return <p>Carregando tarefas</p>
    }

    // Melhorar isso aqui
    return (<div className="mt-3">
        {tarefas.map(tarefa=> (<p>{tarefa['data']}</p>))}
    </div>)
}

export default ListaTarefasDatas