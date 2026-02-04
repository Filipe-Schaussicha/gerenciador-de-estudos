import { useEffect, useState } from "react"
import Principal from "./Principal";
import Login from "./Login";
import enderecoBack from "./others/VarsGlobal";


function App() {
  const [logado, setLogado] = useState(0);
  const [recarregaLogin, setRecarregaLogin] = useState(0)

  useEffect(() => {
    fetch(`${enderecoBack}/islogado`, {credentials: 'include'}).then(res =>
      res.status === 200 ? setLogado(1) : setLogado(-1)
    ).catch(() => setLogado(-1))
  }, [recarregaLogin])

  return (
    <div className="bg-amber-50">
      {logado == 0 ? <div className="min-h-screen"><p className="m-auto">Esperando resposta BackEnd</p></div> :
      logado == 1 ? <Principal onDeslogar={()=>{setLogado(0); setRecarregaLogin(val => val+1)}} /> : <Login onLogin={() => setLogado(1)}/>}
    </div>
  )
}



export default App
