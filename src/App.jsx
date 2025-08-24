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

  // New useEffect for polling user balance
  useEffect(() => {
    let intervalId;

    const fetchUserBalance = async () => {
      if (user && user.email) {
        try {
          const response = await fetch(`http://localhost:3001/profile/${user.email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Update only the balance, or relevant user data
              setUser(prevUser => ({
                ...prevUser,
                balance: data.data.saldo,
                // Update other fields if necessary, e.g., name, avatarUrl
                name: `${data.data.nombres} ${data.data.apellidos}`,
                avatarUrl: data.data.foto,
              }));
            }
          } else {
            console.error("Failed to fetch user profile:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    if (user) {
      // Fetch immediately on login/app load if user exists
      fetchUserBalance();
      // Set up polling every 15 seconds
      intervalId = setInterval(fetchUserBalance, 15000); 
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user]); // Re-run effect if user object changes (e.g., on login/logout)

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
