import { useState } from "react"

interface Props{
    className: string
}

const Ciclo = (props: Props) => {
  const [configAberta, setConfigAberta] = useState(false)

  return (
    <section className={props.className}>
      <h2 className="text-4xl font-medium">Ciclo de estudos</h2>

      <div className="bg-orange-200 mt-3 rounded-xl">
        <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full">
        <i className="fa-solid fa-gear"></i> Configurar Ciclo</button>
      </div> 


    </section>
  )
}

export default Ciclo