import { useState, useEffect } from "react"
import enderecoBack from "../others/VarsGlobal.tsx"

interface Props{
    className: string
}

const Ciclo = (props: Props) => {
  const [configAberta, setConfigAberta] = useState(false)
  const [nomeInput, setNomeInput] = useState('')
  const [horasInput, setHorasInput] = useState('')
  const [updateValues, setUpdateValues] = useState(false)
  const [values, setValues] = useState([])

  useEffect(() => {
    fetch(`${enderecoBack}/ler_ciclo`, {credentials: 'include'}).then(res=>
      res.json().then(json => setValues(json)).catch(()=>{alert('Erro ao carregar ciclo'); setValues([])}).finally(setUpdateValues(false))
    )

    return () => {
      setValues([])
    }
  }, [updateValues])

  // Funções de carregamento
  function add_disciplina(e: FormElement<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)

    const nome = form.get('nome') as string;
    const horas = form.get('horas') as number;

    fetch(`${enderecoBack}/add_ciclo?nome=${nome}&horas=${horas}`, {credentials: 'include'}).then(res =>
      !res.ok ? alert('Erro ao adicionar disciplina') : setUpdateValues(true)
    ).catch(e => alert(`Erro: ${e}`))
  }

  function reseta_ciclo() {
    fetch(`${enderecoBack}/reseta_ciclo`, {credentials: 'include'}).then(res=>
      !res.ok ? alert('Erro ao resetar ciclo') : setUpdateValues(true)
    ).catch(e=> alert(`Erro: ${e}`))
  }

  return (
    <section className={props.className}>
      <h2 className="text-4xl font-medium">Ciclo de estudos</h2>

      {/* Abrir configs */}
      {!configAberta ? 
      <div className="bg-orange-200 mt-3 rounded-xl">
        <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=>{setConfigAberta(true)}}>
        <i className="fa-solid fa-gear"></i> Configurar Ciclo</button>
      </div> 
      :
      <div className="mt-3 rounded-xl">
        <button className="hover:bg-red-300 bg-red-200 mt-3 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=> setConfigAberta(false)}>
        <i className="fa-solid fa-x"></i> Fechar Configurações</button>

        <button className="hover:bg-blue-300 mt-3 bg-blue-200 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=>{reseta_ciclo();}}>
        <i className="fa-solid fa-rotate"></i> Resetar Ciclo</button>

        <div className="bg-orange-100 mt-3 rounded-xl pb-3">
          <form onSubmit={(e)=>{add_disciplina(e); setNomeInput(''); setHorasInput('');}}>  
            <button type="submit" className="hover:bg-green-300 mt-3 bg-green-200 px-3 py-1 rounded-xl font-medium block w-full">
            <i className="fa-solid fa-plus"></i> Adicionar Disciplina</button>
            
            <div className="w-full mt-3">
              <input type="text" name="nome" value={nomeInput} onChange={(e)=>setNomeInput(e.currentTarget.value)} required placeHolder="Disciplina" className="bg-white rounded-xl mr-1.5 p-1.5" />

              <input type="number" name="horas" required value={horasInput} onChange={(e)=>setHorasInput(e.currentTarget.value)} placeHolder="Horas" min="0" 
              className="bg-white rounded-xl mr-1.5 p-1.5" />
            </div>
          </form>
        </div>
      </div>
      }

      {/* Ciclo de estudos */}
      <div>
        {values.map(item => (
          <div key={item["id"]} className="mt-3">
            <input name="ciclo" type="radio" value={item["id"]} />
            <label for={item["id"]}>{item["nome"]}</label>
          </div>
        ))}
      </div>

    </section>
  )
}

export default Ciclo
