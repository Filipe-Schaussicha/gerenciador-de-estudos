interface Props{
    className: string
}

const Pomodoro = (props: Props) => {
  return (
    <section className={props.className}>
        <h2 className="text-4xl font-medium mb-3">Pomodoro</h2>
    </section>
  )
}

export default Pomodoro