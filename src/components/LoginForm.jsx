import React, { useEffect, useState } from "react";
import COVER_IMAGE from "../assets/Imagen_Login.png";
import "./LoginForm.css";
import { Link } from "react-router-dom";


function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleInputLogin = (e, type) => {
    const value = e.target.value;
    setError("");

    if (type === "user") {
      setUser(value);
    } else if (type === "pass") {
      setPass(value);
    }
  };

  const loginSubmit = (e) => {
    e.preventDefault();

    if (user === "" || pass === "") {
      setError("Por favor complete todos los campos");
      return;
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const data = { user, pass };

    fetch("http://localhost:3001/login", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.result !== "Login exitoso") {
          setError(response.message);
        } else {
          setMsg(response.result);
          onLogin(response.user);
        }
      })
      .catch((err) => {
        setError("Error en la conexión al servidor: " + err.message);
      });
  };

  return (
    <div className="login">
      <div className="Contenedor_Imagen">
        <img src={COVER_IMAGE} alt="Login cover" className="Imagen" />

        <form onSubmit={loginSubmit}>
          <h1>Inicio Sesión</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {msg && <p style={{ color: "green" }}>{msg}</p>}

          <div className="input-box">
            <input
              type="text"
              placeholder="Correo"
              value={user}
              onChange={(e) => handleInputLogin(e, "user")}
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => handleInputLogin(e, "pass")}
            />
          </div>

          <div className="remmerber-forgot">
            <label>
              <input type="checkbox" /> Acepta Términos y Condiciones
            </label>
            <a href="#">¿Olvidó su Contraseña?</a>
          </div>

          <button type="submit" className="btn">
            Iniciar Sesión
          </button>

          <div className="register-link">
            <p>
              No tienes Cuenta? <Link to="/register">Regístrate</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;