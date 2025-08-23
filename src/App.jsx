import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import LoginForm from './components/LoginForm'
import { Header } from './components/Header'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header user={{ balance: 100, avatarUrl: reactLogo, name: 'Usuario' }} />
    {/*<LoginForm />*/}
    </>
  )
}

export default App
