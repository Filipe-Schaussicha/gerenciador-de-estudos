import { useState } from "react";
import enderecoBack from "../others/VarsGlobal";
import { Menu, MenuItem } from "@szhsin/react-menu";

interface Props{
    children: string,
    feito: boolean,
    id: string,
    subtarefas: []
    onChange: ()=> void,
    isComeco: boolean,
    isFim: boolean,
    isTitulo: boolean
}

function Tarefas(props: Props){

    // Marca tarefas
    function marcar_tarefa_como_feita(valor: boolean){
        fetch(`${enderecoBack}/checkar_tarefa?id_tarefa=${props.id}&valor=${valor}`, {credentials:'include'}).then(
            res => {
                if(res.ok){
                    setFeito(valor);
                    props.onChange() 
                }else{
                    alert(`Não foi possível mudar tarefa ${props.children} como checado=${valor}`)
                }
            }
        ).catch((e)=>alert(`Erro: ${e}`))
    }
    
    // Deleta tarefas
    function deletar_tarefa(){
        fetch(`${enderecoBack}/deletar_tarefa?id=${props.id}`, {credentials: 'include'}).then(
            res=> res.ok ? props.onChange() : alert("Não foi possível deletar essa tarefa")
        ).catch(e=> alert(`Erro: ${e}`))
    }

    // Move tarefas
    function mover_tarefas(pos: number){
        fetch(`${enderecoBack}/mover_tarefa?id=${props.id}&nova_pos=${pos}`, {credentials: 'include'}).then(
            res => res.ok ? props.onChange() : alert("Não foi possível mover essa tarefa")
        ).catch(e=> alert(`Erro: ${e}`))
    }

    const [feito, setFeito] = useState(props.feito)

    return (<>
    <div className={`flex flex-col ${!props.isTitulo ? 'ml-7 mt-1' : 'ml-3'}`}>
        {/* Adicionar menu */}
        <div className="flex items-center">
            <Menu menuButton={<div className="mr-3"><i className="fa-solid fa-bars"></i></div>}>
                {!props.isComeco && <MenuItem onClick={()=>mover_tarefas(-1)}><i className="fa-solid fa-angle-up"></i> Subir</MenuItem>}
                {!props.isFim && <MenuItem onClick={()=>mover_tarefas(1)}><i className="fa-solid fa-angle-down"></i> Descer</MenuItem>}
                <MenuItem onClick={deletar_tarefa}><i className="fa-solid fa-trash"></i> Deletar</MenuItem>
            </Menu>
            {/*<button className="mr-3"><i className="fa-solid fa-bars"></i></button>*/}
            <input type="checkbox" checked={feito} className={'mr-3'} onChange={()=>{marcar_tarefa_como_feita(!feito)}} />
            <p className={`text-left ${feito && 'line-through'} ${props.isTitulo && 'text-xl font-semibold'}`}>{props.children}</p>
        </div>
        {props.subtarefas.map((tarefa, i) => (
            <Tarefas 
                onChange={props.onChange} 
                key={tarefa['id']} 
                id={tarefa['id']} 
                subtarefas={tarefa['subtarefas']} 
                feito={tarefa['feito']}
                isComeco={i == 0}
                isFim={i + 1 == props.subtarefas.length}
                isTitulo={false}
                >{tarefa['nome']}
            </Tarefas>
        ))}
    </div>
    </>)

    // Evitar bug de não carregar classe
    return <p className="line-through bg-green-100 bg-red-100 bg-blue-100"></p>
}

export default Tarefas;