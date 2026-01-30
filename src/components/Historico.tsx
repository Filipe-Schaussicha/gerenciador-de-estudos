import { LineChart } from "@mui/x-charts";

function Historico(){

    return (<>
        <h2>Estatísticas</h2>
        
        <h3>Horas estudadas</h3>
        <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
                {
                data: [2, 5.5, 2, 8.5, 1.5, 5],
                },
            ]}
            height={300}
        />
    </>)
}

export default Historico;