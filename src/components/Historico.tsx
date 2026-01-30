import { ChartDataProvider, ChartsAxisHighlight, ChartsGrid, ChartsLegend, ChartsSurface, ChartsTooltip, ChartsXAxis, ChartsYAxis, LinePlot, PieChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import enderecoBack from "../others/VarsGlobal";
import { Box, Typography } from "@mui/material";

interface Props{
    mudanca: number
}

function Historico(props: Props){

    // Guarda janela de tempo
    const [timespan, setTimespan] = useState(-1)

    // Guarda dados do backend
    const [dadosData, setDadosData] = useState([])
    const [dadosDisciplina, setDadosDisciplina] = useState([])
    const [carregandoData, setCarregandoData] = useState(1)
    const [carregandoDisciplina, setCarregandoDisciplina] = useState(1)

    useEffect(()=>{
        // Recebe os dados de pomodoros por dia
        fetch(`${enderecoBack}/get_pomodoro_data?timespan=${timespan}`, {credentials: 'include'}).then(res => {
            res.json().then(json => {setDadosData(json.map((dia: any) => {
                return {'data': new Date(`${dia['data']}T00:00`), 'pomodoros': dia['pomodoros']}
            })); setCarregandoData(0); console.log(json)})
        }).catch(e => {alert(`Erro: ${e}`); setCarregandoData(-1)});

        // Recebe os dados de pomodoros por disciplina
        fetch(`${enderecoBack}/get_pomodoro_disciplina?timespan=${timespan}`, {credentials: 'include'}).then(res => {
            res.json().then(json => {setDadosDisciplina(json.map((item: any, index: number) => (
                {id: index, value: item['pomodoros'], label: item['disciplina']}
            ))); setCarregandoDisciplina(0)})
        }).catch(e => {alert(`Erro: ${e}`); setCarregandoDisciplina(-1)})
    }, [timespan, props.mudanca])

    return (<div className="mt-3">
        {/* Título */}
        <h3 className="text-3xl font-medium">Estatísticas</h3>

        {/* Selecionar Janela de tempo */}
        <div className="my-3">
            <label htmlFor="timespan" className="block">Janela de tempo:</label>
            <select name="timespan" key={-1} onChange={(e)=>{setTimespan(Number(e.currentTarget.value));}}
                className="bg-white p-1.5 mb-1.5 mt-1 rounded-xl">

                <option value={-1}>Todo Período</option>
                <option value={7}>Última Semana</option>
                <option value={30}>Último Mês</option>
                <option value={365}>Último Ano</option>
            </select>
        </div>
        
        {/* Gráfico de linha */}
        <div className="mt-1.5 ">
        {carregandoData == 1 ?
        <p>Carregando...</p> : carregandoData == -1 ? <p>Erro ao carregar</p>
            :
        <Box sx={{ width: '100%' }}>
            <Typography textAlign="center">Pomodoros por dia</Typography>

            <ChartDataProvider
                height = {300}
                dataset={dadosData}
                xAxis={[{
                    id: 'tempo-x',
                    scaleType: 'time',
                    dataKey: 'data',
                    tickNumber: 0,
                    valueFormatter: (data)=> {
                        return data.toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })
                    }
                }]}

                yAxis={[{
                    id: 'promodoro-y',
                    scaleType: 'linear',
                    width: 50,
                    position: 'left'
                }]}

                series={[{
                    type: 'line',
                    dataKey: 'pomodoros',
                    label: 'Pomodoros',
                    color: 'red',
                    yAxisId: 'promodoro-y'
                }]}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <ChartsLegend />
                </Box>

                <ChartsSurface>
                    <LinePlot />
                    <ChartsGrid horizontal/>
                    <ChartsXAxis />
                    <ChartsYAxis label="Pomodoros" />
                    <ChartsAxisHighlight x="line" />
                    
                </ChartsSurface>
                <ChartsTooltip />
            </ChartDataProvider>
        </Box>
        }</div>

        {/* Gráfico de donut */}
        <div className="mt-3">
            {carregandoDisciplina == 1 ? <p>Carregando...</p> : carregandoDisciplina == -1 ? <p>Erro ao carregar</p>
            :
            <Box sx={{ width: '100%' }}>
                <Typography textAlign="center" marginBottom={1} >Pomodoros por Disciplina</Typography>

                <PieChart 
                    width={250}
                    height={250}
                    series={[{
                        arcLabel: (item) => `${item.value}`,
                        innerRadius: 40,
                        data: dadosDisciplina
                    }]}
                />
            </Box>
            }
        </div> 
    </div>)
}

export default Historico;