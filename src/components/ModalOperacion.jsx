import { useState, useEffect } from "react";
import { useBalance } from "../context/BalanceContext";
import "./modalOperacion.css";

const ModalOperacion = ({
  user,
  tipo,
  open,
  onClose,
  API_URL,
  onActualizarSaldo,
}) => {
  const [monto, setMonto] = useState("");
  const [destinatariocorreo, setdestinatariocorreo] = useState("");
  const [destinatario, setDestinatario] = useState(null);
  const [errorDestinatario, setErrorDestinatario] = useState("");
  const { balance } = useBalance();

  useEffect(() => {
    if (!destinatariocorreo || tipo !== "transferir") {
      setDestinatario(null);
      setErrorDestinatario("");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDestinatario = async () => {
      try {
        const response = await fetch(`${API_URL}/user/${destinatariocorreo}`, {
          signal,
        });
        if (!response.ok) throw new Error("Usuario no encontrado");
        const data = await response.json();
        setDestinatario(data);
        setErrorDestinatario("");
      } catch (error) {
        setDestinatario(null);
        setErrorDestinatario("Usuario no encontrado");
      }
    };

    fetchDestinatario();
    return () => controller.abort();
  }, [destinatariocorreo, tipo, API_URL]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (tipo === "transferir") {
      if (destinatariocorreo === user.email) return alert("No puedes transferirte a ti mismo");
      if (!destinatario) return alert("Seleccione un destinatario válido");
      if (monto <= 0 || monto > balance) return alert("Monto inválido");
    }

    try {
      let endpoint = `saldo/${tipo}`;
      let body = { monto };

      if (tipo === "transferir") body.destinatariocorreo = destinatariocorreo;
      const response = await fetch(`${API_URL}/user/${user.id}/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Error al ${tipo}`);
      const data = await response.json();

      if (tipo !== "transferir") onActualizarSaldo(data.saldo);
      if (tipo === "transferir") {
        onActualizarSaldo(data.saldoOrigen);
        alert(
          `Se transfirieron ${monto.toLocaleString("es-CO")} pesos a ${
            destinatario.data.nombres
          } ${destinatario.data.apellidos}`
        );
      } else {
        alert(
          `${
            tipo.charAt(0).toUpperCase() + tipo.slice(1)
          } realizado correctamente`
        );
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert(`Error al ${tipo}`);
    }
  };
  return (
    <div className="op-modal-overlay" onClick={onClose}>
      <div className="op-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="op-modal-header">
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </div>

        {tipo === "transferir" && (
          <div className="op-modal-input-group">
            <label>Correo del usuario destinatario:</label>
            <input
              type="email"
              value={destinatariocorreo.toLowerCase()}
              onChange={(e) => setdestinatariocorreo(e.target.value)}
            />
            {destinatario && (
              <p>
                Destinatario: {destinatario.data.nombres}{" "}
                {destinatario.data.apellidos}
              </p>
            )}
            {errorDestinatario && (
              <p className="op-modal-error">{errorDestinatario}</p>
            )}
          </div>
        )}

        <div className="op-modal-input-group">
          <label>Monto:</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
          />
          {tipo === "transferir" && (
            <p>Saldo actual: {balance.toLocaleString("es-CO")}</p>
          )}
        </div>

        <div className="op-modal-actions">
          <button onClick={handleSubmit}>Confirmar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>

        <button className="op-modal-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ModalOperacion;
