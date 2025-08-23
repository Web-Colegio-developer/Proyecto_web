import React from "react";
import COVER_IMAGE from '../assets/Imagen_Login.png';

const LoginForm = () => {
  return (
    <div className="login">
        <div className="relative w-1/2 h-full flex flex-col">
            <img src={COVER_IMAGE} className="w-full h-full object-cover" />
        <form action="">
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