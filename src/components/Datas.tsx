interface Props{
    children: string,
    tarefas: [],
    tarefasAbertas: boolean
}

function Datas(props: Props){

    // TODO: Continuar daqui
    const diasSemana = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado'
    ];

    const data = new Date(`${props.children}T00:00`)

    // Escolhe cor de acordo com a data
    const data_maior_menor_que_hoje = camparar_data(data, new Date())
    let cor = 'orange'
    if(data_maior_menor_que_hoje === -1){
        cor = 'red'
    }else if(data_maior_menor_que_hoje === 0){
        cor = 'blue'
    }else if(data_maior_menor_que_hoje === 1){
        cor = 'green'
    }

    // Vlw Tailwind
    if(false){
        return <p className="bg-green-100 bg-red-100 bg-blue-100"></p>
    }

    return (
    <article className={'flex flex-col mt-1.5 rounded-xl p-3 max-sm:text-sm bg-'+cor+'-100'}>
        <h3 className="font-medium">
            {data.getDate() +'/'+ (data.getMonth()+1)+'/'+data.getFullYear()+' '+diasSemana[data.getDay()]}
        </h3>
    </article>
    )

}

// Compara se uma data é maior, igual ou menor que outra
function camparar_data(data1: any, data2: any): number{
    
    let result;
    if(typeof data1 === 'number' && typeof data2 == 'number'){

        if(data1 > data2) return 1;
        if(data1 < data2) return -1;
        else return 0;

    }else if(typeof data1 === 'object' && typeof data2 == 'object'){
        result = camparar_data(data1.getFullYear(), data2.getFullYear());

        if(result !== 0){
            return result;
        }

        result = camparar_data(data1.getMonth(), data2.getMonth());

        if(result !== 0){
            return result;
        }

        result = camparar_data(data1.getDate(), data2.getDate());

        return result;
    }

    return -2;
}


export default Datas;