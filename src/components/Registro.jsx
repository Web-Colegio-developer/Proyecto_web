import { useState } from "react";
import COVER_IMAGE from "../assets/Imagen_Login.png";
import "./Registro.css";
import { Link, useNavigate } from "react-router-dom";

const REGISTRO = ({ onRegister }) => {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // Campos básicos
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");

  // Opciones tipo chip
  const [gender, setGender] = useState("");

  // Mensajes
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !email || !telefono || !direccion || !fechaNacimiento || !ciudad || !password) {
      setError("Por favor complete todos los campos.");
      return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("email", email);
    formData.append("telefono", telefono);
    formData.append("direccion", direccion);
    formData.append("fechaNacimiento", fechaNacimiento);
    formData.append("ciudad", ciudad);
    formData.append("gender", gender);
    formData.append("password", password);
    formData.append("rol", "estudiante"); // por default
    if (document.getElementById("foto").files[0]) {
      formData.append("foto", document.getElementById("foto").files[0]);
    }

    fetch("http://localhost:3001/register", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          setError(res.message);
        } else {
          setMsg("¡Registro exitoso! Redirigiendo al login...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      })
      .catch((err) => {
        setError("Error en la conexión al servidor: " + err.message);
      });
  };

  return (
    <div className="reg-root">
      <div className="reg-container">
        <img src={COVER_IMAGE} alt="Imagen de registro" className="reg-image" />

        <form className="reg-form" onSubmit={handleSubmit}>
          <h1 className="reg-title">Registro</h1>

          {error && <p className="error">{error}</p>}
          {msg && <p className="success">{msg}</p>}

          <div className="reg-grid">
            {/* Foto */}
            <div className="reg-field reg-field--full">
              <label htmlFor="foto">Foto de Perfil</label>
              <input type="file" id="foto" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* Foto Preview */}
            {preview && (
              <div className="reg-field reg-field--full reg-preview-container">
                <label>Vista previa</label>
                <img src={preview} alt="Vista previa" className="reg-preview" />
              </div>
            )}

            {/* Nombre y Apellido */}
            <div className="reg-field">
              <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="reg-field">
              <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            </div>

            {/* Correo y Teléfono */}
            <div className="reg-field">
              <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="reg-field">
              <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>

            {/* Dirección y Fecha */}
            <div className="reg-field">
              <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>

            <div className="reg-field">
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </div>

            {/* Ciudad y Género */}
            <div className="reg-field">
              <input type="text" placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            </div>

            <div className="reg-field">
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="reg-input">
                <option value="" disabled>Seleccione su género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            {/* Contraseña */}
            <div className="reg-field reg-field--full">
              <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="reg-actions">
            <div className="reg-row">
              <label className="reg-agree">
                <input type="checkbox" /> Acepta Términos y Condiciones
              </label>
              <a className="reg-forgot" href="#">¿Olvidó su Contraseña?</a>
            </div>

            <button type="submit" className="reg-btn reg-btn--primary">Registrar</button>

            <div className="reg-login-link">
              <p>¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default REGISTRO;
