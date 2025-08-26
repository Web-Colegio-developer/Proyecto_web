import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import "./Header.css";

export const Header = ({ user, onLogout, onBalanceClick }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
            <img src="/logo.webp" alt="Logo" className="logo-img" />
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

        {/* Bloque derecho dinámico (Escritorio) */}
        <div className="user-section desktop">
          {/* Saldo */}
          <button className="balance-button" onClick={onBalanceClick}>
            <div className="user-balance">
              <span>{user.balance.toLocaleString("es-CO")}</span>
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
                <Link to="/profile" className="profile-button">
                  Perfil
                </Link>
                {user.role === "administrador" && (
                  <Link to="/admin" className="profile-button">
                    Administrador
                  </Link>
                )}
                <button onClick={onLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Botón de menú móvil */}
        <div className="mobile-menu-button">
          <button onClick={toggleMobileMenu} className="mobile-menu-toggle">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Navegación móvil */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
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
          {/* Bloque derecho dinámico (Móvil) */}
          <div className="user-section mobile">
            {/* Perfil */}
            <Link to="/profile" className="avatar-container" style={{ textDecoration: 'none' }}>
              <button className="avatar-button-mobile">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="user-avatar"
                />
                <span>{user.name}</span>
              </button>
            </Link>

            {user.role === "administrador" && (
              <Link to="/admin" className="avatar-container">
                <span>Administrador</span>
              </Link>
            )}

            {/* Saldo */}
            <button className="balance-button" onClick={onBalanceClick}>
              <div className="user-balance">
                <span>Saldo</span>
                <span>{user.balance.toLocaleString("es-CO")}$</span>
              </div>
            </button>

            {/* Carrito */}
            <button className="cart-button">
              <ShoppingCart size={20} />
              <span>Carrito</span>
            </button>

            <button onClick={onLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
