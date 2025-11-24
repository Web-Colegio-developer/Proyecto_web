import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBalance } from "../context/BalanceContext";
import "./Header.css";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://proyecto-web-6xzt.onrender.com"
    : "http://localhost:3001";

export const Header = ({ user, onLogout, onBalanceClick }) => {
  const { balance } = useBalance();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { toggleCart } = useCart();

  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarSrc = user.avatarUrl;

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <img src="/logo.webp" alt="Logo" className="logo-img" />
        </div>
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/about">Sobre nosotros</Link>
            </li>
            <li>
              <Link to="/contact">Contacto</Link>
            </li>
          </ul>
        </nav>
        <div className="user-section desktop">
          <button className="balance-button" onClick={onBalanceClick}>
            <div className="user-balance">
              <span>
                {balance.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          </button>
          <button className="cart-button" onClick={toggleCart}>
            <ShoppingCart size={26} />
          </button>
          <div className="avatar-container" ref={menuRef}>
            <button className="avatar-button" onClick={toggleMenu}>
              <img
                src={avatarSrc || "/placeholder.svg"}
                alt={user.name}
                className="user-avatar"
                crossOrigin="anonymous"
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
        <div className="mobile-menu-button">
          <button onClick={toggleMobileMenu} className="mobile-menu-toggle">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/about">Sobre nosotros</Link>
            </li>
            <li>
              <Link to="/contact">Contacto</Link>
            </li>
          </ul>
          <div className="user-section mobile">
            <Link
              to="/profile"
              className="avatar-container"
              style={{ textDecoration: "none" }}
            >
              <button className="avatar-button-mobile">
                <img
                  src={avatarSrc || "/placeholder.svg"}
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
            <button className="balance-button" onClick={onBalanceClick}>
              <div className="user-balance">
                <span>
                  {balance.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
            </button>
            <button className="cart-button" onClick={toggleCart}>
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
