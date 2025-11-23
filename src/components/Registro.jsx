
// Componente REGISTRO con validación estilo 3 (bordes rojos / verdes)
// Puedes reemplazar tu archivo Registro.jsx con este

import { useState } from "react";
import COVER_IMAGE from "../assets/Imagen_Login.png";
import "./Registro.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const getBackendURL = () => {
  const envURL = import.meta.env.VITE_BACKEND_URL;
  if (envURL) return envURL;
  if (window.location.hostname === "localhost") return "http://localhost:3001";
  return "https://proyecto-web-gufr.onrender.com";
};


const REGISTRO = () => {
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");

  // ER Validaciones
  const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const validateField = (value, regex) => regex.test(value);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const inputClass = (isValid) =>
    isValid === null ? "" : isValid ? "valid-input" : "invalid-input";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones finales
    if (!validateField(nombre, nameRegex)) return toast.error("Nombre inválido");
    if (!validateField(apellido, nameRegex)) return toast.error("Apellido inválido");
    if (!validateField(email, emailRegex)) return toast.error("Correo inválido");
    if (telefono.length !== 10) return toast.error("El teléfono debe tener 10 dígitos");
    if (!validateField(password, passwordRegex))
      return toast.error("La contraseña no cumple los requisitos");

    if (document.getElementById("foto").files.length === 0)
      return toast.error("Debe subir una foto");

    const formData = new FormData();
    const formDataimg = new FormData();

    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("email", email);
    formData.append("telefono", telefono);
    formData.append("direccion", direccion);
    formData.append("fechaNacimiento", fechaNacimiento);
    formData.append("ciudad", ciudad);
    formData.append("gender", gender);
    formData.append("password", password);
    formData.append("rol", "estudiante");

    formDataimg.append("foto", document.getElementById("foto").files[0]);

    const tipo = "perfil";

    try {
      const res = await fetch(`${getBackendURL()}/upload-image?tipo=${tipo}`, {
        method: "POST",
        body: formDataimg,
      });

      const data = await res.json();
      if (data.success) formData.append("foto", data.url);
      else return toast.error("Error al subir la imagen");
    } catch (err) {
      return toast.error("Error al conectar con el servidor");
    }

    fetch(`${getBackendURL()}/register`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) toast.error(res.message);
        else {
          toast.success("Registro exitoso, revise su correo");
          setTimeout(() => navigate("/login"), 2000);
        }
      })
      .catch((err) => toast.error("Error del servidor"));
  };

  return (
    <div className="reg-root">
      <div className="reg-container">
        <img src={COVER_IMAGE} alt="Imagen de registro" className="reg-image" />

        <form className="reg-form" onSubmit={handleSubmit}>
          <h1 className="reg-title">Registro</h1>

          <div className="reg-grid">
            <div className="reg-field reg-field--full">
              <label htmlFor="foto">Foto de Perfil</label>
              <input type="file" id="foto" accept="image/*" onChange={handleImageChange} />
            </div>

            {preview && (
              <div className="reg-field reg-field--full reg-preview-container">
                <label>Vista previa</label>
                <img src={preview} alt="Vista previa" className="reg-preview" />
              </div>
            )}

            {/* Nombre */}
            <div className="reg-field">
              <input
                type="text"
                placeholder="Nombre"
                className={inputClass(nombre ? validateField(nombre, nameRegex) : null)}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            {/* Apellido */}
            <div className="reg-field">
              <input
                type="text"
                placeholder="Apellido"
                className={inputClass(apellido ? validateField(apellido, nameRegex) : null)}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="reg-field">
              <input
                type="email"
                placeholder="Correo"
                className={inputClass(email ? validateField(email, emailRegex) : null)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Teléfono */}
            <div className="reg-field">
              <input
                type="text"
                placeholder="Teléfono"
                className={inputClass(telefono ? telefono.length === 10 : null)}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>

            {/* Dirección */}
            <div className="reg-field">
              <input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            {/* Fecha */}
            <div className="reg-field">
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
              />
            </div>

            {/* Ciudad */}
            <div className="reg-field">
              <input
                type="text"
                placeholder="Ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
              />
            </div>

            {/* Género */}
            <div className="reg-field">
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="" disabled>
                  Seleccione su género
                </option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            {/* Contraseña */}
            <div className="reg-field reg-field--full">
              <input
                type="password"
                placeholder="Contraseña"
                className={inputClass(password ? validateField(password, passwordRegex) : null)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="reg-actions">
            <button type="submit" className="reg-btn reg-btn--primary">
              Registrar
            </button>

            <div className="reg-login-link">
              <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
              </p>
            </div>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default REGISTRO;