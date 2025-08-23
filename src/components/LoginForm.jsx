import React from "react";
import COVER_IMAGE from '../assets/Imagen_Login.png';

const LoginForm = () => {
  return (
    <div className="w-full h-screen flex items-start">
        <div className="relative w-1/2 h-full flex flex-col">
            <img src={COVER_IMAGE} className="w-full h-full object-cover" />
        </div>
        <div className="w-full h-full bg=[#E0E0E0] flex flex-col">
            <h1 className="text-base text-"></h1>
        </div>
    </div>
  );
};

export default LoginForm;