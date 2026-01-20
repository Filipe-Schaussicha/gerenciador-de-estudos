import { use, useEffect, useState, type FormEvent } from "react";
import enderecoBack from "../others/VarsGlobal";
import Tarefas from "./Tarefas";

interface Props{
    children: string,
    tarefas: [],
    tarefasAbertas: boolean,
    onChange: () => void
}

function Datas(props: Props){

    // TODO: Continuar daqui
    const diasSemana = [
        'Dom',
        'Seg',
        'Ter',
        'Qua',
        'Qui',
        'Sex',
        'Sáb'
    ];

    const data = new Date(`${props.children}T00:00`)

    // Escolhe cor de acordo com a data
    const data_maior_menor_que_hoje = camparar_data(data, new Date())
    let cor = 'orange'
    if(data_maior_menor_que_hoje === -1){
        cor = 'red'
    }else if(data_maior_menor_que_hoje === 0){
        cor = 'blue'
    }else if(data_maior_menor_que_hoje === 1){
        cor = 'green'
    }

    // Vlw Tailwind
    if(false){
        return <p className="bg-green-100 bg-red-100 bg-blue-100"></p>
    }

    const [listaSubtarefasMenu, setListaSubtarefasMenu] = useState([])
    const [recarregarListaSubtarefasMenu, setRecarregarListaSubtarefasMenu] = useState(false);

    useEffect(() =>{
        fetch(`${enderecoBack}/todas_tarefas_data?data=${props.children}`, {credentials: 'include'}).then(
            res => res.json().then(json=>setListaSubtarefasMenu(json)).catch(e=>alert(`Erro: ${e}`)).finally(()=>setRecarregarListaSubtarefasMenu(false))
        )
    }, [recarregarListaSubtarefasMenu])

    const [tarefasAMostra, setTarefasAMostra] = useState(props.tarefasAbertas)
    const [addTarefaAMostra, setAddTarefaAMostra] = useState(false)
    const [textoInput, setTextoInput] = useState('')
    const [addSubtarefa, setAddSubtarefa] = useState(false)

    return (
    <article className={'flex flex-col mt-1.5 rounded-xl p-3 max-sm:text-sm bg-'+cor+'-100'}>
        {/* Data e seus botões */}
        <div className="flex"> 

            {tarefasAMostra ?
                <button className="mr-3" onClick={()=>{setTarefasAMostra(false); abre_fecha_tarefas(props.children, false)}}><i className="fa-solid fa-chevron-up"></i></button>
                :
                <button className="mr-3" onClick={()=>{setTarefasAMostra(true); abre_fecha_tarefas(props.children, true)}}><i className="fa-solid fa-chevron-down"></i></button>
            }

            <h3 className="font-medium">
                {diasSemana[data.getDay()] + ' - ' +data.getDate() +'/'+ (data.getMonth()+1)+'/'+data.getFullYear()}
            </h3>

            <div className="ml-auto">
                <button className="mr-3" onClick={()=>{remove_data(props.children); props.onChange(); setRecarregarListaSubtarefasMenu(true)}}><i className="fa-solid fa-trash"></i></button>

                {addTarefaAMostra ?
                    <button onClick={()=>{setAddTarefaAMostra(false); }}><i className="fa-solid fa-x"></i></button>
                    :
                    <button onClick={()=>{setAddTarefaAMostra(true); setTarefasAMostra(true); }}><i className="fa-solid fa-plus"></i></button>
                }
            </div>
        </div>

        {/* Menu para adiconar tarefas */}
        {addTarefaAMostra &&
            <form className="my-3" onSubmit={(e)=>{add_tarefa(e, addSubtarefa); props.onChange(); setRecarregarListaSubtarefasMenu(true); setTextoInput('')}}>
                <label htmlFor="toggleSubtarefa">Adicionar Subtarefa: </label>
                <input name="toggleSubtarefa" className="mr-1.5 text-xl" type="checkbox" onClick={()=>{
                    setAddSubtarefa(!addSubtarefa); setRecarregarListaSubtarefasMenu(true);
                }} checked={addSubtarefa} />

                <br />
                <select className={`${addSubtarefa ? 'bg-white' : 'bg-gray-50'} p-1 my-1.5 rounded-xl`} name="id" disabled={!addSubtarefa} required={addSubtarefa}>
                    <option selected disabled value="">Selecione uma tarefa</option>
                    {addSubtarefa &&
                        listaSubtarefasMenu.map(item => (
                            <option value={item['id']}>{item['texto']}</option>
                        ))
                    }
                </select>

                {!addSubtarefa && <input type="hidden" name="data" value={props.children} /> }
                <input name="texto" value={textoInput} onChange={(e)=>setTextoInput(e.currentTarget.value)} 
                className="bg-white mb-2 max-w-full rounded-xl p-2 block mx-auto" autoComplete="off" />

                <button type="submit" className="bg-green-400 hover:bg-green-500 px-3 py-1 rounded-xl font-medium block mx-auto">
                    Add Tarefa
                </button>
            </form>
        }
        
        {/* Lista de Tarefas */}
        {props.tarefas.length > 0 && tarefasAMostra && <div className="mt-3">
            {props.tarefas.map((tarefa, i) => (
                <Tarefas 
                    onChange={()=>{props.onChange(); setRecarregarListaSubtarefasMenu(true)}} 
                    tipoPai="tarefas" 
                    key={tarefa['id']} 
                    id={tarefa['id']} 
                    subtarefas={tarefa['subtarefas']} 
                    feito={tarefa['feito']}
                    isComeco={i == 0}
                    isFim={i + 1 == props.tarefas.length}
                    >{tarefa['nome']}
                </Tarefas>)
            )}
        </div>}
    </article>
    )

}

function add_tarefa(e: FormEvent<HTMLFormElement>, addSubtarefa: boolean){
    e.preventDefault()

    const form = new FormData(e.currentTarget);

    const texto = form.get('texto') as string;
    let url = '';
    if(addSubtarefa){
        const id = form.get('id') as string;

        url = `${enderecoBack}/add_subtarefa?texto=${texto}&id=${id}`
    }else{
        const data = form.get('data') as string;
        url = `${enderecoBack}/add_tarefa?data=${data}&texto=${texto}`
    }

    fetch(url, {credentials: 'include'}).then(res =>{
        if(!res.ok){
            alert(`Não foi possível adicionar a tarefas ${texto}`)
        }
    }).catch((e)=>alert(`Erro: ${e}`))
}

function remove_data(data:string){
    fetch(`${enderecoBack}/remover_data?data=${data}`, {credentials: 'include'}).then(res =>
        !res.ok && alert(`Não foi possível remover ${data}`)
    ).catch(()=>alert(`Erro: Não foi possível remover ${data}`))
}

function abre_fecha_tarefas(data: string, valor: boolean){
    fetch(`${enderecoBack}/abrir_data?data=${data}&valor=${valor}`, {credentials: 'include'}).then(res =>
        !res.ok && alert(`Não foi possível setar ${data} como aberto: ${valor}`)
    ).catch(()=>alert(`Erro: Não foi possível setar ${data} como aberto: ${valor}`))
}

// Compara se uma data é maior, igual ou menor que outra
function camparar_data(data1: any, data2: any): number{
    
    let result;
    if(typeof data1 === 'number' && typeof data2 == 'number'){

        if(data1 > data2) return 1;
        if(data1 < data2) return -1;
        else return 0;

    }else if(typeof data1 === 'object' && typeof data2 == 'object'){
        result = camparar_data(data1.getFullYear(), data2.getFullYear());

        if(result !== 0){
            return result;
        }

        result = camparar_data(data1.getMonth(), data2.getMonth());

        if(result !== 0){
            return result;
        }

        result = camparar_data(data1.getDate(), data2.getDate());

        return result;
    }

    return -2;
}


export default Datas;