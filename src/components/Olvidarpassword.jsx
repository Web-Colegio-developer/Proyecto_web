import "./Olvidarpassword.css";
import { useState } from "react";

export default function Olvidarpassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

    const backendURL = window.location.hostname.includes("netlify.app")
    ? "https://proyecto-web-6xzt.onrender.com"
    : "http://localhost:3001"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${backendURL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Te enviamos un código de recuperación a tu correo.");
      } else {
        setMessage(data.message || "Error al enviar el código.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error al conectar con el servidor.");
    }

    setLoading(false);
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        <h2 className="fp-title">¿Olvidaste tu contraseña?</h2>
        <p className="fp-subtitle">
          Ingresa tu correo para enviarte un código de recuperación.
        </p>

        <form onSubmit={handleSubmit} className="fp-form">
          <label className="fp-label">Correo electrónico</label>
          <input
            type="email"
            className="fp-input"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="fp-btn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        {message && <p className="fp-message">{message}</p>}
      </div>
    </div>
  );
}
