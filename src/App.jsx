import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginForm from './components/LoginForm';
import Registro from './components/Registro';
import { Header } from './components/Header';
import UserProfile from './components/UserProfile';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    } else {
      navigate('/login');
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate('/login');
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
    navigate('/register');
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    navigate('/login');
  };

  return (
    <>
      {user && <Header user={user} onLogout={handleLogout} />}
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<div><h1>AQUI METEMOS LOS PRODUCTOS</h1></div>} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />} />
            <Route path="/register" element={<Registro onRegister={handleLogin} onSwitchToLogin={handleSwitchToLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
