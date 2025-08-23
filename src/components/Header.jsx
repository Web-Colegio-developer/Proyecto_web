import { ShoppingCart } from "lucide-react";
import './Header.css';

export const Header = ({ user }) => {
  return (
    <header className="main-header">
      <div className="header-container">
        
        {/* Logo como imagen */}
        <div className="logo">
          <a href="/">
            <img
              src="/logo.webp"
              alt="Logo"
              className="logo-img"
            />
          </a>
        </div>

        {/* Navegación centrada */}
        <nav className="header-nav">
          <ul>
            <li>
              <a href="/">Inicio</a>
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
          <button className="avatar-button">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="user-avatar"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
