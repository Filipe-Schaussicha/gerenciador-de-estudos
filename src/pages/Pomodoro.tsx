import { useEffect, useState } from "react"

interface Props{
  className: string
}

const Pomodoro = (props: Props) => {
  // TODO: Salvar dados
  // TODO: Adicionar notificações

  const tempo = [25, 5, 15]
  const bgColor = ['bg-red', 'bg-blue', 'bg-green']

  const [timeSeconds, setTimeSeconds] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [tipoTimer, setTipoTimer] = useState(0)
  const [timeMinuts, setTimeMinuts] = useState(25)
  const [ciclo, setCiclo] = useState(1)

  useEffect(()=>{
    const timer = setTimeout(() => timerAtivo && setTimeSeconds(timeSeconds-1), 1000)
    return () => clearTimeout(timer)
  }, [timerAtivo, timeSeconds])

  if(timeSeconds < 0){
    setTimeSeconds(59);
    setTimeMinuts(timeMinuts - 1)
  }

  if(timeMinuts < 0){
    if(tipoTimer == 0){
      setCiclo(ciclo + 1)
      if(ciclo % 4 == 0){
        setTipoTimer(2)
        setTimeMinuts(15)
      }else{
        setTipoTimer(1)
        setTimeMinuts(5)
      }
    }else {
      setTipoTimer(0)
      setTimeMinuts(25)
    }
  }

  let segundos = String(timeSeconds)
  if (segundos.length < 2){
    segundos = '0'+segundos;
  }
  let minutos = String(timeMinuts)
  if(minutos.length < 2){
    minutos = '0' + minutos
  }

  const hoverColor = tipoTimer == 0 ? 'hover:bg-red-300' : tipoTimer == 1 ? 'hover:bg-blue-300' : 'hover:bg-green-300'

  return (
    <section className={`${props.className} flex flex-col`}>
      <h2 className="text-4xl font-medium">Pomodoro</h2>

      <div className="bg-orange-200 mt-3 rounded-xl">
        <button className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full">
        <i className="fa-solid fa-chart-column"></i> Mostar Estatísticas</button>
      </div> 

      <div className={`${bgColor[tipoTimer]}-200 mt-3 rounded-xl px-2 py-10`}>
        <h3 className="text-6xl font-semibold">{minutos+':'+segundos}</h3>

        <p className="mt-5">{`Ciclo nº ${tipoTimer == 0 ? ciclo : ciclo - 1}`}</p>

        <div className="flex justify-center text-2xl mt-5">
          <button className={`p-2 ${hoverColor} rounded-xl`} onClick={() => {setTimeSeconds(0); setTimeMinuts(tempo[tipoTimer])}}><i className="fa-solid fa-arrow-rotate-right"></i></button>
          <button className={`font-semibold mx-3 p-2 ${hoverColor} rounded-xl`} onClick={()=>setTimerAtivo(!timerAtivo)}>{timerAtivo ? 'Pause' : 'Start'}</button>
          <button onClick={()=>{setTimeMinuts(-1); setTimeSeconds(0)}} className={`p-2 ${hoverColor} rounded-xl`}><i className="fa-solid fa-forward-step"></i></button>
        </div>

      </div>
    </section>
  )

  return <p className="hover:bg-red-300 hover:bg-green-300 hover:bg-blue-300 bg-red-200 bg-blue-200 bg-green-200">a</p>
}

export default Pomodoro