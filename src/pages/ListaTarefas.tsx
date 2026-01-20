import { useEffect, useState, type FormEvent } from "react"
import enderecoBack from "../others/VarsGlobal";
import Datas from "../components/Datas";

interface Props{
    className: string
}

const ListaTarefas = (props: Props) => {

    // Adiciona tarefas
    function add_tarefa(e : FormEvent<HTMLFormElement>){
        e.preventDefault()

        const form = new FormData(e.currentTarget);
        const data = form.get('data') as string;

        fetch(`${enderecoBack}/add_data?data=${data}`, {credentials: 'include'}).then(res => {
            if(res.ok){
                setLogAddData(1);
                setRecarregar(true);
                setDataImput('')
            }else{
                setLogAddData(0)
            }
        }).catch(() => setLogAddData(0))
    }

    const [menuAddData, setMenuAddData] = useState(false);
    const [logAddData, setLogAddData] = useState(-1);
    const [recarregar, setRecarregar] = useState(false);

    // Carregar tarefas
    const [tarefasCarregadas, setTarefasCarregadas] = useState(0);
    const [tarefas, setTarefas] = useState([]);

    const [dataInput, setDataImput] = useState('')

    // Carrega tarefas
    useEffect(() => {fetch(`${enderecoBack}/ler_tarefas`, {credentials: 'include'}).then( res=>
        res.json(). then(json => {setTarefas(json); setTarefasCarregadas(1); console.log(json)})
    ).catch(()=>setTarefasCarregadas(-1)).finally(()=>setRecarregar(false))}, [recarregar])

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
                <form onSubmit={add_tarefa}/* Programar onSubmit */>
                    <input value={dataInput} onChange={(e)=>setDataImput(e.target.value)} type="date" name="data" id="data" className="bg-white mb-2 max-w-full rounded-xl p-2 mx-auto" required />
                    {logAddData == 0 && <p className="text-red-500">Erro!</p>}
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
        <div className="mt-3">
            {tarefasCarregadas == 0 && <p>Carregando Tarefas</p>}
            {tarefasCarregadas == -1 && <p>Erro ao carregar tarefas</p>}
            {tarefasCarregadas == 1 && tarefas.map(tarefa=>(
                <Datas onChange={()=>setRecarregar(true)} tarefasAbertas={tarefa['aberto']} key={tarefa["data"]} tarefas={tarefa['tarefas']}>{tarefa["data"]}</Datas>
            ))}
        </div>
    </section>
  )
}

export default ListaTarefas