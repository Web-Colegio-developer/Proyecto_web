import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import Registro from './components/Registro';
import { Header } from './components/Header';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {user ? (
        <Header user={user} onLogout={handleLogout} />
      ) : (
        showRegister ? (
          <Registro onRegister={handleLogin} onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
        )
      )}
    </>
  );
}

export default App;
