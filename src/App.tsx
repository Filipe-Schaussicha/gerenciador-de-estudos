import { useEffect, useState } from "react"
import Principal from "./Principal";
import Login from "./Login";
import enderecoBack from "./others/VarsGlobal";


function App() {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    fetch(`${enderecoBack}/islogado`, {credentials: 'include'}).then(res =>
      res.status === 200 ? setLogado(true) : setLogado(false)
    ).catch(() => setLogado(false))
  }, [])

  return (
    <>
      {logado ? <Principal /> : <Login onLogin={() => setLogado(true)}/>}
    </>
  )
}

export default App
