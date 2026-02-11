import { useState, useEffect, type FormEvent, useRef } from "react"
import enderecoBack from "../others/VarsGlobal.tsx"

interface Props{
  className: string
  fimPomodoro: number
}

const Ciclo = (props: Props) => {

  // Estado do menu de configs
  const [configAberta, setConfigAberta] = useState(false)

  // Guarda texto dos inputs
  const [nomeInput, setNomeInput] = useState('')
  const [horasInput, setHorasInput] = useState('')

  // Salva lista de disciplinas vindo do backend
  const [updateValues, setUpdateValues] = useState(false)
  const [values, setValues] = useState([])

  // Disciplina selecionada
  const selecionada = useRef(-1)
  const ultimoFetch = useRef<null | number>(null)

  // Lê a lista de disciplinas do backend
  useEffect(() => {
    fetch(`${enderecoBack}/ler_ciclo`, {credentials: 'include'}).then(res=>
      res.json().then(json => {
        setValues(json.sort((a: any,b: any)=>{
          // Ordena o array, para que as disciplinas com mais horas à fazer fiquem encima
          if(a['objetivo'] - a['estudadas'] > b['objetivo'] - b['estudadas']){
            return -1
          }else{
            return 1
          };
        }))
      }
    ).catch(()=>{alert('Erro ao carregar ciclo');}).finally(()=>setUpdateValues(false)))
  }, [updateValues])

  // Função para adicionar disciplina
  function add_disciplina(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)

    const nome = form.get('nome') as string;
    const pomodoros = form.get('pomodoros') as string;

    fetch(`${enderecoBack}/add_ciclo?nome=${nome}&pomodoros=${pomodoros}`, {credentials: 'include'}).then(res =>
      !res.ok ? alert('Erro ao adicionar disciplina') : setUpdateValues(true)
    ).catch(e => alert(`Erro: ${e}`))
  }

  // Função para resetar ciclo (seta horas feitas para 0)
  function reseta_ciclo() {
    fetch(`${enderecoBack}/reseta_ciclo`, {credentials: 'include'}).then(res=>
      !res.ok ? alert('Erro ao resetar ciclo') : setUpdateValues(true)
    ).catch(e=> alert(`Erro: ${e}`))
  }

  // Deleta disciplinas
  function deleta_ciclo(id: number) {
    fetch(`${enderecoBack}/apaga_ciclo?id=${id}`, {credentials: 'include'}).then(res => 
      !res.ok ? alert('Erro ao apagar disciplina') : setUpdateValues(true)
    ).catch(e=> alert(`Erro: ${e}`))
  }

  // Adiciona um ciclo ao fim do pomodoro timer
  // TODO: Terminar essa funcionalidade
  useEffect(()=>{
    if (props.fimPomodoro == 0 || props.fimPomodoro == ultimoFetch.current) return

    fetch(`${enderecoBack}/add_tempo?id=${selecionada.current}`, {credentials: 'include'}).then(res => {
      !res.ok ? alert("Erro ao atualizar horas") : setUpdateValues(true)
    }).catch((e) => alert(`Erro: ${e}`))
  }, [props.fimPomodoro])

  return (
    <section className={props.className}>
      {/* Título */}
      <h2 className="text-4xl font-medium">Ciclo de estudos</h2>

      {/* Abrir configs */}
      {!configAberta ? 
      <div className="bg-orange-200 mt-3 rounded-xl">
        <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=>{setConfigAberta(true)}}>
        <i className="fa-solid fa-gear"></i> Configurar Ciclo</button>
      </div> 
      :
      <div className="mt-3 rounded-xl">
        {/* Btn fechar config */}
        <button className="hover:bg-red-300 bg-red-200 mt-3 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=> setConfigAberta(false)}>
        <i className="fa-solid fa-x"></i> Fechar Configurações</button>

        {/* Btn restar ciclo */}
        <button className="hover:bg-blue-300 mt-3 bg-blue-200 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=>{reseta_ciclo();}}>
        <i className="fa-solid fa-rotate"></i> Resetar Ciclo</button>

        {/* Form para adicionar disciplinas */}
        <div className="bg-orange-100 mt-3 rounded-xl pb-3">
          <form onSubmit={(e)=>{add_disciplina(e); setNomeInput(''); setHorasInput('');}}>  
            {/* Btn adicionar */}
            <button type="submit" className="hover:bg-green-300 mt-3 bg-green-200 px-3 py-1 rounded-xl font-medium block w-full">
            <i className="fa-solid fa-plus"></i> Adicionar Disciplina</button>
            
            <div className="w-full mt-3">
              {/* Disciplina */}
              <input type="text" name="nome" autoComplete="off" value={nomeInput} onChange={(e)=>setNomeInput(e.currentTarget.value)} required placeholder="Disciplina" className="bg-white rounded-xl mr-1.5 p-1.5" />

              {/* Horas */}
              <input type="number" name="pomodoros" required value={horasInput} onChange={(e)=>setHorasInput(e.currentTarget.value)} placeholder="Pomodoros" min="0" 
              className="bg-white rounded-xl mr-1.5 p-1.5" />
            </div>
          </form>
        </div>
      </div>
      }

      {/* Ciclo de estudos */}
      <div>
        {values.map(item => {
          // Escolhe fundo
          const bg = item["estudadas"] == item["objetivo"] ? 'bg-blue-100' : item["estudadas"] > item["objetivo"] ? 'bg-green-100' : 'bg-red-100'

          return <div key={item["id"]} 
            className={`mt-3 flex p-3 rounded-xl w-full ${bg}`}>

            {/* Apagar disciplina */}
            <button className="mr-1.5" onClick={()=> deleta_ciclo(item["id"])}><i className="fa-solid fa-trash" /></button>
            {/* Radio button */}
            <input name="ciclo" type="radio" value={item["id"]} className="mr-1.5" onChange={()=>{selecionada.current = item['id'];}} />
            <label htmlFor={item["id"]}>{item["nome"]}</label>

            {/* Horas estudadas e á fazer */}
            <p className="ml-auto">{item["estudadas"]}/{item["objetivo"]}</p>
          </div>
        })}
      </div>
    </section>
  )
}

export default Ciclo
