import "./tarjeta.css";
import logo from "/public/logo.webp";
import { ArrowDownCircle, ArrowUpCircle, Repeat, PlusCircle, Bell } from "lucide-react";

const Tarjeta = ({ user, open, onClose }) => {
  if (!open) return null;

  const handleRetirar = () => {
    alert("Función de Retirar dinero");
  };

  const handleRecargar = () => {
    alert("Función de Recargar saldo");
  };

  const handleTransferencia = () => {
    alert("Función de Transferir dinero");
  };

  const handleRecompra = () => {
    alert("Función de Recompra");
  };

  return (
    <div className="tarjeta-overlay" onClick={onClose}>
      <div className="tarjeta-container" onClick={(e) => e.stopPropagation()}>
        <div className="tarjeta">
          {/* Encabezado */}
          <div className="tarjeta-header">
            <div className="tarjeta-icon">
              <img src={logo} alt="Moneda" className="icono-moneda" />
            </div>
            <Bell className="tarjeta-bell" size={20} />
          </div>

          {/* Info del usuario */}
          <div className="tarjeta-info">
            <p className="tarjeta-nombre">{user?.name || "Usuario"}</p>
            <p className="tarjeta-saldo">${user?.balance?.toLocaleString("es-CO")}</p>
          </div>

          {/* Chip de tarjeta */}
          <div className="tarjeta-chip"></div>

          {/* Botones */}
          <div className="tarjeta-actions">
            <button onClick={handleRetirar}>
              <ArrowDownCircle size={26} />
              <span>Retirar</span>
            </button>
            <button onClick={handleRecargar}>
              <ArrowUpCircle size={26} />
              <span>Recargar</span>
            </button>
            <button onClick={handleTransferencia}>
              <Repeat size={26} />
              <span>Transferencia</span>
            </button>
            <button onClick={handleRecompra}>
              <PlusCircle size={26} />
              <span>Recompra</span>
            </button>
          </div>

          {/* Botón cerrar */}
          <button className="tarjeta-cerrar" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default Tarjeta;
