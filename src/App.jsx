import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginForm from './components/LoginForm';
import Registro from './components/Registro';
import Header from './components/Header'; 
import UserProfile from './components/UserProfile';
import Tarjeta from './components/tarjeta'; // 👈 Importa la tarjeta

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [mostrarTarjeta, setMostrarTarjeta] = useState(false); // 👈 Estado para la tarjeta
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    } else {
      // Solo redirigir a /login si no estás en /register
      if (window.location.pathname !== "/register") {
        navigate('/login');
      }
    }
  }, [navigate]);

  // 👉 Refrescar datos del usuario (saldo, nombre, foto) desde backend
  useEffect(() => {
    let intervalId;

    const fetchUserBalance = async () => {  

      if (user && user.email) {
        try {
          const response = await fetch(`http://localhost:3001/profile/${user.email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setUser(prevUser => ({
                ...prevUser,
                balance: data.data.saldo,
                name: `${data.data.nombres} ${data.data.apellidos}`,
                avatarUrl: data.data.foto,
              }));
            }
          } else {
            console.error("Error al obtener perfil:", response.statusText);
          }
        } catch (error) {
          console.error("Error al conectar al servidor:", error);
        }
      }
    };

    if (user) {
      fetchUserBalance();
      intervalId = setInterval(fetchUserBalance, 15000); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  // 👉 Manejo de login
  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    navigate('/');
  };

  // 👉 Manejo de logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate('/login');
    window.location.reload(); // Force a full page reload
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
      {user && (
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onBalanceClick={() => setMostrarTarjeta(true)} // 👉 Click en saldo muestra tarjeta
        />
      )}
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

      {/* 👇 Modal de la tarjeta */}
      <Tarjeta 
        user={user} 
        open={mostrarTarjeta} 
        onClose={() => setMostrarTarjeta(false)} 
      />
    </>
  );
}

export default App;