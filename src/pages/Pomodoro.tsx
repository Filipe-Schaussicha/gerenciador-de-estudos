import { useEffect, useRef, useState } from "react"
import useSound from "use-sound"
import alerta from "../assets/alerta.mp3"
import click_sound from "../assets/click.mp3"
import { useCountdown } from "usehooks-ts"

interface Props{
  className: string
}

const Pomodoro = (props: Props) => {
  // TODO: Salvar dados
  // TODO: Adicionar notificações

  const tempo = [25, 5, 15]
  const bgColor = ['bg-red-200', 'bg-blue-200', 'bg-green-200']

  const [timer25, timer25opt] = useCountdown({countStart: 25 * 60})
  const [timer15, timer15opt] = useCountdown({countStart: 15 * 60})
  const [timer5, timer5opt] = useCountdown({countStart: 5 * 60})

  const [isRunning, setIsRunning] = useState(false)
  const [tipoTimer, setTipoTimer] = useState(0)
  const [ciclo, setCiclo] = useState(1)
  const pulado = useRef(false)
  const refCiclo = useRef(1)

  const [play_alerta, opt_alerta] = useSound(alerta, {volume: 0.5});
  const [play_click] = useSound(click_sound, {volume: 0.5});

  let timerAtual = timer25;
  let timerAtualOpt = timer25opt;
  
  function troca_timer(){
    if(!pulado.current){
      let texto = tipoTimer != 0 ? 'Volte ao trabalho!' : 'Descanse um pouco'

      play_alerta()
      alert(texto)
      opt_alerta.stop()
    }else{
      timerAtualOpt.resetCountdown()
    }

    pulado.current = false
    setIsRunning(false)

    if(tipoTimer == 0){
      setTipoTimer(refCiclo.current % 4 == 0 ? 2 : 1)
    }else{
      refCiclo.current = refCiclo.current + 1
      setCiclo(refCiclo.current)
      setTipoTimer(0)
    }
  }

  if(tipoTimer == 0){
    [timerAtual, timerAtualOpt] = [timer25, timer25opt]
  }else if(tipoTimer == 2){
    [timerAtual, timerAtualOpt] = [timer15, timer15opt]
  }else{
    [timerAtual, timerAtualOpt] = [timer5, timer5opt]
  }

  useEffect(()=>{
    document.title = isRunning ? `Timer: ${minutos}:${segundos}` : 'Gerenciador de Estudos'
  }, [timerAtual, isRunning])

  timerAtual == 0 && troca_timer();

  // Adiciona um zero a esquerda se necessário
  let minutos_number = Math.trunc((timerAtual / 60))
  let minutos = String(minutos_number)
  if(minutos.length < 2){
    minutos = '0' + minutos
  }
  let segundos = String(timerAtual - minutos_number * 60)
  if (segundos.length < 2){
    segundos = '0'+segundos;
  }

  const hoverColor = tipoTimer == 0 ? 'hover:bg-red-300' : tipoTimer == 1 ? 'hover:bg-blue-300' : 'hover:bg-green-300'

  return (
    <section className={`${props.className} flex flex-col`}>
      <h2 className="text-4xl font-medium">Pomodoro</h2>

      <div className="bg-orange-200 mt-3 rounded-xl">
        <button onClick={() =>play_alerta()} className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full">
        <i className="fa-solid fa-chart-column"></i> Mostar Estatísticas</button>
      </div> 

      <div className={`${bgColor[tipoTimer]} mt-3 rounded-xl px-2 py-10`}>
        <h3 className="text-6xl font-semibold">{minutos}:{segundos}</h3>

        <p className="mt-5">{`Ciclo nº ${ciclo}`}</p>

        <div className="flex justify-center text-2xl mt-5">
          <button className={`p-2 ${hoverColor} rounded-xl`} onClick={() =>{play_click(); timerAtualOpt.resetCountdown(); setIsRunning(false)}}>
            <i className="fa-solid fa-arrow-rotate-right"></i>
          </button>

          {isRunning ? 
          <button className={`font-semibold mx-3 p-2 ${hoverColor} rounded-xl`} onClick={()=>{play_click(); timerAtualOpt.stopCountdown(); setIsRunning(false)}}>
            Pause
          </button>
          :
          <button className={`font-semibold mx-3 p-2 ${hoverColor} rounded-xl`} onClick={()=>{play_click(); timerAtualOpt.startCountdown(); setIsRunning(true)}}>
            Start
          </button>
          }
          
          <button onClick={()=>{pulado.current = true; play_click(); troca_timer();}} className={`p-2 ${hoverColor} rounded-xl`}>
            <i className="fa-solid fa-forward-step"></i>
          </button>
        </div>

      </div>
    </section>
  )
}

export default Pomodoro