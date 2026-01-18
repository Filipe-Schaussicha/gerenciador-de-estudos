interface Props{
    className: string
}

const Ciclo = (props: Props) => {
  return (
    <section className={props.className}>
        <h2 className="text-4xl font-medium mb-3">Ciclo de estudos</h2>
    </section>
  )
}

export default Ciclo