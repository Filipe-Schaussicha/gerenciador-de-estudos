import { useEffect, useState } from "react"
import Principal from "./Principal";
import Login from "./Login";
import enderecoBack from "./others/VarsGlobal";


function App() {
  const [logado, setLogado] = useState(0);

  useEffect(() => {
    fetch(`${enderecoBack}/islogado`, {credentials: 'include'}).then(res =>
      res.status === 200 ? setLogado(1) : setLogado(-1)
    ).catch(() => setLogado(-1))
  }, [])

  return (
    <>
      {logado == 0 ? <p>Esperando resposta BackEnd</p> :
      logado == 1 ? <Principal /> : <Login onLogin={() => setLogado(1)}/>}
    </>
  )
}

export default App
