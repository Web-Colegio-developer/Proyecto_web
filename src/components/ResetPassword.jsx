import "./ResetPassword.css";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";



export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resp = await fetch(`${backendURL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await resp.json();
    setMessage(data.message || "Error al cambiar la contraseña");
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        
        {/* ENCABEZADO */}
        <div className="reset-header">
          <div className="reset-icon">
            <span className="lock-icon">🔒</span>
          </div>

          <h1>Recuperar Contraseña</h1>
          <p>Ingresa tu nueva clave segura</p>
        </div>

        {/* CUERPO */}
        <div className="reset-body">
          {!token ? (
            <div className="invalid-wrapper">
              <div className="invalid-icon">❗</div>

              <h2>Enlace Inválido</h2>

              <p className="invalid-text">
                El enlace para restablecer la contraseña es inválido o ha expirado.  
                Por favor solicita uno nuevo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reset-form">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit">Cambiar contraseña</button>
            </form>
          )}

          {message && <p className="reset-message">{message}</p>}
        </div>

        {/* FOOTER */}
        <div className="reset-footer">
          © 2025 Colegio Sistema Seguro
        </div>
      </div>
    </div>
  );
}
