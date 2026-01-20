import { useEffect, useState, type FormEvent } from "react"
import enderecoBack from "../others/VarsGlobal";
import Tarefas from "../components/Tarefas";

interface Props{
    className: string
}

const ListaTarefas = (props: Props) => {

    const [menuAddData, setMenuAddData] = useState(false);
    const [recarregar, setRecarregar] = useState(false);

    // Carregar tarefas
    const [tarefasCarregadas, setTarefasCarregadas] = useState(0);
    const [tarefas, setTarefas] = useState([]);
    const [textoInput, setTextoInput] = useState('')
    const [addSubtarefa, setAddSubtarefa] = useState(false)
    const [listaSubtarefasMenu, setListaSubtarefasMenu] = useState([])
    const [recarregarListaSubtarefasMenu, setRecarregarListaSubtarefasMenu] = useState(false);

    // Carrega tarefas
    useEffect(() => {fetch(`${enderecoBack}/ler_tarefas`, {credentials: 'include'}).then( res=>
        res.json(). then(json => {setTarefas(json); setTarefasCarregadas(1); console.log(json)})
    ).catch(()=>setTarefasCarregadas(-1)).finally(()=>setRecarregar(false))}, [recarregar])

    useEffect(() => {fetch(`${enderecoBack}/todas_tarefas_arvore`, {credentials: 'include'}).then( res=>
        res.json(). then(json => {setListaSubtarefasMenu(json); console.log(json)})
    ).catch((e) => console.error(e)).finally(()=>setRecarregarListaSubtarefasMenu(false))}, [recarregarListaSubtarefasMenu])

    return (
    <section className={props.className}>

        {/* Botão de abrir e fechar o adicionador de datas */}
        <div className="flex justify-center items-center mb-3">
            <h2 className="text-4xl font-medium">Projetos</h2>
        </div>

        {/* Menu para adicionar datas */}
        {menuAddData ?<>
            <div className="bg-orange-200 mt-3 rounded-xl">
                <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full"
                onClick={() => {setMenuAddData(false);}}><i className="fa-solid fa-x"></i> Fechar Menu</button>
            </div> 
        
            <form className="my-3 bg-orange-100 rounded-xl py-3"
             onSubmit={(e)=>{add_tarefa(e, addSubtarefa); setRecarregar(true); setRecarregarListaSubtarefasMenu(true); setTextoInput('')}}>

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
                <input name="texto" value={textoInput} onChange={(e)=>setTextoInput(e.currentTarget.value)} 
                className="bg-white mb-2 max-w-full rounded-xl p-2 block mx-auto" autoComplete="off" />

                <button type="submit" className="bg-green-400 hover:bg-green-500 px-3 py-1 rounded-xl font-medium block mx-auto">
                    Adicionar Tarefa
                </button>
            </form>
            </>
            :
            <div className="bg-orange-200 mt-3 rounded-xl">
                <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full"
                onClick={() => {setMenuAddData(true);}}><i className="fa-solid fa-plus"></i> Adicionar Tarefas</button>
            </div> 
        }
           
        {/* Tarefas */}
        <div className="mt-3">
            {tarefasCarregadas == 0 && <p>Carregando Tarefas</p>}
            {tarefasCarregadas == -1 && <p>Erro ao carregar tarefas</p>}
            {tarefasCarregadas == 1 && tarefas.map((tarefa, i)=>(
                <div className="bg-orange-100 mt-3 rounded-xl py-3">
                    <Tarefas 
                        onChange={()=>{setRecarregar(true); setRecarregarListaSubtarefasMenu(true)}} 
                        key={tarefa['id']} 
                        id={tarefa['id']} 
                        subtarefas={tarefa['subtarefas']} 
                        feito={tarefa['feito']}
                        isComeco={i == 0}
                        isFim={i + 1 == tarefas.length}
                        isTitulo={true}
                        >{tarefa['nome']}
                    </Tarefas>
                </div>
            ))}
        </div>
    </section>
  )
}

function add_tarefa(e: FormEvent<HTMLFormElement>, addSubtarefa: boolean){
    e.preventDefault()

    const form = new FormData(e.currentTarget);

    const texto = form.get('texto') as string;
    let url = '';
    if(addSubtarefa){
        const id = form.get('id') as string;

        url = `${enderecoBack}/add_tarefa?texto=${texto}&id=${id}`
    }else{
        url = `${enderecoBack}/add_tarefa?texto=${texto}`
    }

    fetch(url, {credentials: 'include'}).then(res =>{
        if(!res.ok){
            alert(`Não foi possível adicionar a tarefas ${texto}`)
        }
    }).catch((e)=>alert(`Erro: ${e}`))
}

export default ListaTarefas