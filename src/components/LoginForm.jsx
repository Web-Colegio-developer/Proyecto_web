import React from "react";
import COVER_IMAGE from '../assets/Imagen_Login.png';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, we'll simulate a successful login with dummy data
    const userData = {
      balance: 200,
      avatarUrl: 'https://unavatar.io/midudev',
      name: 'Jose'
    };
    onLogin(userData);
  };

  return (
    <div className="login">
        <div className="Contenedor_Imagen">
            <img src={COVER_IMAGE} className="Imagen" />
        <form onSubmit={handleSubmit}>
            <h1>Inicio Sesion</h1>
            <div className="input-box">
                <input type="text" placeholder="Correo" required/>
            </div>
            <div className="input-box">
                <input type="password" placeholder="Contraseña" required/>
            </div>
            <div className="remmerber-forgot">
                <label><input type="checkbox"/>Acepta Terminos y Condiciones</label>
                <a href="#">Olvido su Contraseña?</a>
            </div>
            <button type="submit" className="btn">Iniciar Sesion</button>

            <div className="register-link">
                <p>No tienes Cuenta? <a href="#">Registrate</a></p>
            </div>
        </form>    
        </div>
    </div>
  );
};

export default LoginForm;