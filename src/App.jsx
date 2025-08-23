import { useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import { Header } from './components/Header';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <>
      {user ? (
        <Header user={user} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
