import "./tarjeta.css";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  PlusCircle,
  Bell,
} from "lucide-react";
import { useBalance } from "../context/BalanceContext";
import ModalOperacion from "./ModalOperacion"; // Importamos el modal
import { useState } from "react";

const Tarjeta = ({ user, open, onClose }) => {
  const { balance, setBalance } = useBalance();
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoOperacion, setTipoOperacion] = useState(""); // Estado para el tipo de operación

  if (!open) return null;

  const API_URL =
    process.env.NODE_ENV === "production"
      ? "https://proyecto-web-gufr.onrender.com"
      : "http://localhost:3001";

  const abrirModal = (tipo) => {
    setTipoOperacion(tipo); 
    setModalOpen(true); 
  };

  return (
    <>
      <ModalOperacion
        user={user}
        tipo={tipoOperacion}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onActualizarSaldo={setBalance}
        API_URL={API_URL}
      />

      {/* Tarjeta con las acciones */}
      <div className="tarjeta-overlay" onClick={onClose}>
        <div className="tarjeta-container" onClick={(e) => e.stopPropagation()}>
          <div className="tarjeta">
            <div className="tarjeta-header">
              <div className="tarjeta-icon">
                <img src="/logo.webp" alt="Moneda" className="icono-moneda" />
              </div>
              <Bell size={20} />
            </div>

            <div className="tarjeta-info">
              <p className="tarjeta-nombre">{user?.name || "Usuario"}</p>
              <p className="tarjeta-saldo">${balance.toLocaleString("es-CO")}</p>
            </div>

            <div className="tarjeta-chip">
              <img src="/chip.png" alt="Chip" className="chip-img" />
            </div>

            <div className="tarjeta-actions">
              {/* Botones para abrir el modal con el tipo correspondiente */}
              <button onClick={() => abrirModal("retirar")}>
                <ArrowDownCircle size={26} />
                <span>Retirar</span>
              </button>
              <button onClick={() => abrirModal("recargar")}>
                <ArrowUpCircle size={26} />
                <span>Recargar</span>
              </button>
              <button onClick={() => abrirModal("transferir")}>
                <Repeat size={26} />
                <span>Transferencia</span>
              </button>
              <button onClick={() => abrirModal("recargar")}>
                <PlusCircle size={26} />
                <span>Recompra</span>
              </button>
            </div>

            <button className="tarjeta-cerrar" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tarjeta;
