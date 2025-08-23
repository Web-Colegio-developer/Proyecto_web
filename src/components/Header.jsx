import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import './Header.css';

export const Header = ({ user, onLogout }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="header-container">
        
        {/* Logo como imagen */}
        <div className="logo">
          <div>
            <img
              src="/logo.webp"
              alt="Logo"
              className="logo-img"
            />
          </div>
        </div>

        {/* Navegación centrada */}
        <nav className="header-nav">
          <ul>
            <li>
              <a href="#">Inicio</a>
            </li>
            <li>
              <a href="/about">Sobre nosotros</a> 
            </li>
            <li>
              <a href="/contact">Contacto</a>
            </li>
          </ul>
        </nav>

        {/* Bloque derecho dinámico */}
        <div className="user-section">
          {/* Saldo */}
          <button className="balance-button">
            
          <div className="user-balance">
            <span>
              {user.balance.toLocaleString("es-CO")}
            </span>
            <span className="currency-symbol">$</span>
          </div>
          </button>

          {/* Carrito */}
          <button className="cart-button">
            <ShoppingCart size={26} />
          </button>

          {/* Avatar */}
          <div className="avatar-container" ref={menuRef}>
            <button className="avatar-button" onClick={toggleMenu}>
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="user-avatar"
              />
            </button>
            {isMenuVisible && (
              <div className="logout-menu">
                <button onClick={onLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
