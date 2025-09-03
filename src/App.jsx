import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import './styles/users.css'; // Import styles
import LoginForm from './components/LoginForm';
import Registro from './components/Registro';
import Header from './components/Header';
import UserProfile from './components/UserProfile';
import Tarjeta from './components/tarjeta';
import Administrador from './components/Administrador';
import ProductsGrid from './components/ProductsGrid';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // State for all users
  const [selectedUser, setSelectedUser] = useState(null); // State for selected user
  const [view, setView] = useState('dashboard'); // State for admin view
  const [showRegister, setShowRegister] = useState(false);
  const [mostrarTarjeta, setMostrarTarjeta] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
      if (foundUser.role === 'administrador') {
        navigate('/administrador');
        fetchUsers(); // Fetch users if admin
      }
    } else {
      if (window.location.pathname !== "/register") {
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    let intervalId;
    const fetchUserBalance = async () => {
      if (user && user.id) { // Use user.id instead of user.email
        try {
          const response = await fetch(`http://localhost:3001/users/${user.id}`); // Use /users/:id endpoint
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Error al obtener los usuarios');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'administrador') {
      navigate('/administrador');
      fetchUsers();
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate('/login');
    window.location.reload();
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
      {user && user.role !== 'administrador' && (
        <Header
          user={user}
          onLogout={handleLogout}
          onBalanceClick={() => setMostrarTarjeta(true)}
        />
      )}
      <Routes>
        {user ? (
          <>
            {user.role === 'administrador' ? (
              <Route
                path="/administrador"
                element={
                  <Administrador
                    onLogout={handleLogout}
                    user={user}
                    view={view}
                    setView={setView}
                    users={users}
                    setUsers={setUsers}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                  />
                }
              />
            ) : (
              <Route path="/" element={<ProductsGrid />} />
            )}
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="*" element={<Navigate to={user.role === 'administrador' ? '/administrador' : '/'} />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} onSwitchToRegister={handleSwitchToRegister} />} />
            <Route path="/register" element={<Registro onRegister={handleLogin} onSwitchToLogin={handleSwitchToLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>)}
      </Routes>

      <Tarjeta
        user={user}
        open={mostrarTarjeta}
        onClose={() => setMostrarTarjeta(false)}
      />
    </>
  );
}

export default App;