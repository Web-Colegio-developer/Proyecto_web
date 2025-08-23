import React from "react";
import COVER_IMAGE from '../assets/Imagen_Login.png';
import './Registro.css';

const registro = () => {
  return (
    <div className="login">
      <div className="Contenedor_Imagen">
        <img src={COVER_IMAGE} className="Imagen" />
        <form action="">
          <h1>Inicio Sesion</h1>
          <div className="input-box">
            <input type="text" placeholder="Correo" required/>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Contraseña" required/>
          </div>
          <div className="input-box">
            <input type="password" placeholder="Contraseña" required/>
          </div>
          <div className="remmerber-forgot">
            <label>
              <input type="checkbox"/> Acepta Términos y Condiciones
            </label>
            <a href="#">¿Olvidó su Contraseña?</a>
          </div>
          <button type="submit" className="btn">Iniciar Sesión</button>
          <div className="register-link">
            <p>No tienes Cuenta? <a href="#">Regístrate</a></p>
          </div>
        </form>    
      </div>
    </div>
  );
};

export default registro;
