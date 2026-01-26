import { useState } from "react"

interface Props{
    className: string
}

const Ciclo = (props: Props) => {
  const [configAberta, setConfigAberta] = useState(false)

  return (
    <section className={props.className}>
      <h2 className="text-4xl font-medium">Ciclo de estudos</h2>

      {!configAberta ? 
      <div className="bg-orange-200 mt-3 rounded-xl">
        <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=>{setConfigAberta(true)}}>
        <i className="fa-solid fa-gear"></i> Configurar Ciclo</button>
      </div> 
      :
      <div className="mt-3 rounded-xl">
        <button className="hover:bg-red-300 bg-red-200 mt-3 px-3 py-1 rounded-xl font-medium block w-full" onClick={()=> setConfigAberta(false)}>
        <i className="fa-solid fa-x"></i> Fechar Configurações</button>

        <button className="hover:bg-blue-300 mt-3 bg-blue-200 px-3 py-1 rounded-xl font-medium block w-full">
        <i className="fa-solid fa-rotate"></i> Resetar Ciclo</button>

        <div className="bg-orange-100 mt-3 rounded-xl">
          <form>  
            <button type="submit" className="hover:bg-green-300 mt-3 bg-green-200 px-3 py-1 rounded-xl font-medium block w-full">
            <i className="fa-solid fa-plus"></i> Adicionar Disciplina</button>
            
            <input type="text" name="nome"  />
            <input type="number" name="horas" />
          </form>
        </div>
      </div>
      }

      

    </section>
  )
}

export default Ciclo
