import { useState } from "react";
import enderecoBack from "../others/VarsGlobal";

interface Props{
    children: string,
    feito: boolean,
    subtarefas: []
    tipoPai: string,
    pai: string,
    i: number
}

function Tarefas(props: Props){

    // Marca tarefas
    function marcar_tarefa_como_feita(valor: boolean){
        fetch(`${enderecoBack}/checkar_tarefa?tipo=${props.tipoPai}&pai=${props.pai}&i=${props.i}&valor=${valor}`, {credentials:'include'}).then(
            res => !res.ok ? alert(`Não foi possível mudar tarefa ${props.children} como checado=${valor}`): setFeito(valor)
        ).catch((e)=>alert(`Erro: ${e}`))
    }

    const [feito, setFeito] = useState(props.feito)

    return (<>
    <div className="flex mt-1 ml-7">
        <button className="mr-3"><i className="fa-solid fa-bars"></i></button>
        <input type="checkbox" checked={feito} className="mr-3" onChange={()=>{marcar_tarefa_como_feita(!feito)}} />
        <p className={`text-left ${feito && 'line-through'}`}>{props.children}</p>
    </div>
    </>)

    // Evitar bug de não carregar classe
    return <p className="line-through"></p>
}



export default Tarefas;