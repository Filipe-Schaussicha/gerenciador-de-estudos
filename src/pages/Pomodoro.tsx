import { useEffect, useRef, useState } from "react"
import useSound from "use-sound"
import alerta from "../assets/alerta.mp3"
import click_sound from "../assets/click.mp3"
import { useCountdown } from "usehooks-ts"

interface Props{
  className: string
  onFimPomodoro: ()=>void
}

const Pomodoro = (props: Props) => {
  // TODO: Salvar dados

  // Timers
  const [timer25, timer25opt] = useCountdown({countStart: 25 * 60})
  const [timer15, timer15opt] = useCountdown({countStart: 15 * 60})
  const [timer5, timer5opt] = useCountdown({countStart: 5 * 60})

  // Variáveis úteis
  const [isRunning, setIsRunning] = useState(false)
  const [tipoTimer, setTipoTimer] = useState(0)
  const refCiclo = useRef(1)

  // Sons
  const [play_alerta, opt_alerta] = useSound(alerta, {volume: 0.5});
  const [play_click] = useSound(click_sound, {volume: 0.5});

  let timerAtual = timer25;
  let timerAtualOpt = timer25opt;
  
  // Roda quando timer chega ao fim ou é pulado
  function troca_timer(pulado: boolean){
    // Reseta algumas variáveis
    opt_alerta.stop()
    timerAtualOpt.resetCountdown()
    setIsRunning(false)

    // Mostra alerta se não foi pulado
    if(!pulado){
      let texto = tipoTimer != 0 ? 'Volte ao trabalho!' : 'Descanse um pouco'

      play_alerta()
      alert(texto)
    }
    
    // Muda o tipo de timer
    if(tipoTimer == 0){
      setTipoTimer(refCiclo.current % 4 == 0 ? 2 : 1)
      props.onFimPomodoro()
    }else{
      refCiclo.current = refCiclo.current + 1
      setTipoTimer(0)
    }
  }

  // Troca o timer quando ele chega ao fim
  timerAtual == 0 && troca_timer(false);

  // Troca o o timer baseado em 'tipoTimer'
  if(tipoTimer == 0){
    [timerAtual, timerAtualOpt] = [timer25, timer25opt]
  }else if(tipoTimer == 2){
    [timerAtual, timerAtualOpt] = [timer15, timer15opt]
  }else{
    [timerAtual, timerAtualOpt] = [timer5, timer5opt]
  }

  // Mostra o tempo no título da aba do navegador
  useEffect(()=>{
    document.title = isRunning ? `Timer: ${minutos}:${segundos}` : 'Gerenciador de Estudos'
  }, [timerAtual, isRunning])

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

  // Cores de fundo
  const bgColor = ['bg-red-200', 'bg-blue-200', 'bg-green-200']
  const hoverColor = ['hover:bg-red-300', 'hover:bg-blue-300', 'hover:bg-green-300']

  return (
    <section className={`${props.className} flex flex-col`}>
      {/* Título */}
      <h2 className="text-4xl font-medium">Pomodoro</h2>

      {/* Botão de estátísticas */}
      <div className="bg-orange-200 mt-3 rounded-xl">
        <button onClick={() =>play_alerta()} className="hover:bg-orange-300 px-3 py-1 rounded-xl font-medium block w-full">
        <i className="fa-solid fa-chart-column"></i> Mostar Estatísticas</button>
      </div> 

      {/* Timer */}
      <div className={`${bgColor[tipoTimer]} mt-3 rounded-xl px-2 py-10`}>
        {/* Mostra o tempo */}
        <h3 className="text-6xl font-semibold">{minutos}:{segundos}</h3>

        {/* Mostra o ciclo atual */}
        <p className="mt-5">{`Ciclo nº ${refCiclo.current}`}</p>

        {/* Botões */}
        <div className="flex justify-center text-2xl mt-5">
          {/* Botão de reset */}
          <button className={`p-2 ${hoverColor[tipoTimer]} rounded-xl`} onClick={() =>{play_click(); timerAtualOpt.resetCountdown(); setIsRunning(false)}}>
            <i className="fa-solid fa-arrow-rotate-right"></i>
          </button>

          {/* Botões de start e pause */}
          {isRunning ? 
          <button className={`font-semibold mx-3 p-2 ${hoverColor[tipoTimer]} rounded-xl`} onClick={()=>{play_click(); timerAtualOpt.stopCountdown(); setIsRunning(false)}}>
            Pause
          </button>
          :
          <button className={`font-semibold mx-3 p-2 ${hoverColor[tipoTimer]} rounded-xl`} onClick={()=>{play_click(); timerAtualOpt.startCountdown(); setIsRunning(true)}}>
            Start
          </button>
          }
          
          {/* Botão de pular */}
          <button onClick={()=>{play_click(); troca_timer(true);}} className={`p-2 ${hoverColor[tipoTimer]} rounded-xl`}>
            <i className="fa-solid fa-forward-step"></i>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Pomodoro