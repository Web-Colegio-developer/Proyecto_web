import React, { useState } from "react";
import COVER_IMAGE from "../assets/Imagen_Login.png";
import "./Registro.css";
import { Link } from "react-router-dom";

const REGISTRO = () => {
  const [preview, setPreview] = useState(null);

  // estados para opciones tipo "chip"
  const [gender, setGender] = useState("");
  const [spayed, setSpayed] = useState("");
  const [weight, setWeight] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // aquí puedes recopilar los datos y enviarlos
    alert("Formulario enviado (aquí agrega tu lógica).");
  };

  return (
    <div className="reg-root">
      <div className="reg-container">
        <img src={COVER_IMAGE} alt="Imagen de registro" className="reg-image" />

        <form className="reg-form" onSubmit={handleSubmit}>
          <h1 className="reg-title">Registro</h1>

          {/* Grid: inputs organizados en matriz (2 columnas) */}
          <div className="reg-grid">
            {/* Foto (ocupando una columna completa) */}
            <div className="reg-field reg-field--full">
              <label htmlFor="foto">Foto de Perfil</label>
              <input
                type="file"
                id="foto"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* Vista previa */}
            {preview && (
              <div className="reg-field">
                <label>Vista previa</label>
                <img src={preview} alt="Vista previa" className="reg-preview" />
              </div>
            )}

            {/* Nombre y Apellido lado a lado */}
            <div className="reg-field">
              <input type="text" name="nombre" placeholder="Nombre" required />
            </div>

            <div className="reg-field">
              <input type="text" name="apellido" placeholder="Apellido" required />
            </div>

            {/* Correo y Teléfono lado a lado */}
            <div className="reg-field">
              <input type="email" name="email" placeholder="Correo" required />
            </div>

            <div className="reg-field">
              <input type="tel" name="telefono" placeholder="Teléfono" required />
            </div>

            {/* Dirección y Fecha de nacimiento */}
            <div className="reg-field">
              <input type="text" name="direccion" placeholder="Dirección" required />
            </div>

            <div className="reg-field">
              <input type="date" name="fecha_nacimiento" placeholder="Fecha de nacimiento" required />
            </div>

            {/* Ciudad y Género */}
            <div className="reg-field">
              <input type="text" name="ciudad" placeholder="Ciudad" required />
            </div>

            <div className="reg-field">
              <label>Género</label>
              <div className="reg-options">
                <button
                  type="button"
                  className={`reg-chip ${gender === "Female" ? "reg-chip--active" : ""}`}
                  onClick={() => setGender("Female")}
                >
                  Femenino
                </button>
                <button
                  type="button"
                  className={`reg-chip ${gender === "Male" ? "reg-chip--active" : ""}`}
                  onClick={() => setGender("Male")}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  className={`reg-chip ${gender === "Other" ? "reg-chip--active" : ""}`}
                  onClick={() => setGender("Other")}
                >
                  Otro
                </button>
              </div>
            </div>

            {/* Contraseña */}
            <div className="reg-field">
              <input type="password" name="password" placeholder="Contraseña" required />
            </div>

            {/* Checkbox y link, ocupar toda la fila */}
            <div className="reg-row reg-row--full">
              <label className="reg-agree">
                <input type="checkbox" /> Acepta Términos y Condiciones
              </label>
              <a className="reg-forgot" href="#">¿Olvidó su Contraseña?</a>
            </div>

            {/* Botones al final ocupando toda la fila */}
            <div className="reg-row reg-row--full reg-row--actions">
              <button type="button" className="reg-btn reg-btn--secondary">Back</button>
              <button type="submit" className="reg-btn reg-btn--primary">Registrar</button>
            </div>

            {/* Link para iniciar sesión (full) */}
            <div className="reg-login-link reg-row--full">
              <p>¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default REGISTRO;