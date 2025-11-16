import "./tarjeta.css";
import { ArrowDownCircle, ArrowUpCircle, Repeat, PlusCircle, Bell } from "lucide-react";
import { useBalance } from "../context/BalanceContext";

const Tarjeta = ({ user, open, onClose }) => {
  const { balance, setBalance } = useBalance();

  if (!open) return null;

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://proyecto-web-gufr.onrender.com"
    : "http://localhost:3001";

const handleRetirar = async () => {
  const monto = 1000; // monto de ejemplo
  try {
    const response = await fetch(`${API_URL}/user/${user.id}/saldo/retirar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto })
    });

    if (!response.ok) throw new Error("Error al retirar saldo");
    const data = await response.json();
    setBalance(data.saldo);
    alert(`Se retiraron ${monto.toLocaleString("es-CO")} pesos`);
  } catch (error) {
    console.error(error);
    alert("Error al retirar saldo");
  }
};

const handleRecargar = async () => {
  const monto = 2000; // monto de ejemplo
  try {
    const response = await fetch(`${API_URL}/user/${user.id}/saldo/recargar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monto })
    });

    if (!response.ok) throw new Error("Error al recargar saldo");
    const data = await response.json();
    setBalance(data.saldo);
    alert(`Se recargaron ${monto.toLocaleString("es-CO")} pesos`);
  } catch (error) {
    console.error(error);
    alert("Error al recargar saldo");
  }
};


  const handleTransferencia = () => alert("Función de Transferir dinero");
  const handleRecompra = () => alert("Función de Recompra");

  return (
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
            <button onClick={handleRetirar}><ArrowDownCircle size={26} /><span>Retirar</span></button>
            <button onClick={handleRecargar}><ArrowUpCircle size={26} /><span>Recargar</span></button>
            <button onClick={handleTransferencia}><Repeat size={26} /><span>Transferencia</span></button>
            <button onClick={handleRecompra}><PlusCircle size={26} /><span>Recompra</span></button>
          </div>

          <button className="tarjeta-cerrar" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default Tarjeta;

