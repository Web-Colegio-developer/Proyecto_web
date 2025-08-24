import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserProfile.css';
import logo from '/public/logo.webp';

export default function PerfilUsuario({ user }) {
  const [formData, setFormData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user.email) {
        setError("No se ha proporcionado un correo electrónico de usuario.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/profile/${user.email}`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos del perfil');
        }
        const result = await response.json();
        if (result.success) {
          setFormData(result.data);
          setEditedData(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!user || !user.email) {
      setError("No se puede guardar el perfil sin un correo electrónico de usuario.");
      return;
    }

    const dataToSave = { ...editedData };

    // Validación de campos vacíos
    const requiredFields = ['nombres', 'apellidos', 'fecha_nacimiento', 'direccion', 'telefono', 'genero', 'correo_electronico'];
    for (const field of requiredFields) {
      if (!dataToSave[field] || String(dataToSave[field]).trim() === '') {
        toast.error(`El campo '${field}' no puede estar en blanco.`);
        return;
      }
    }

    if (dataToSave.fecha_nacimiento) {
      const date = new Date(dataToSave.fecha_nacimiento);
      dataToSave.fecha_nacimiento = date.toISOString().split('T')[0];
    }

    try {
      const response = await fetch(`http://localhost:3001/profile/${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los cambios del perfil');
      }

      const result = await response.json();
      if (result.success) {
        setFormData(editedData);
        toast.success("Perfil actualizado con éxito!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDiscardChanges = () => {
    setEditedData(formData);
  };

  if (loading) {
    return <div className="text-center p-6">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Error: {error}</div>;
  }

  if (!formData) {
    return <div className="text-center p-6">No se encontraron datos del perfil.</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="w-full max-w-5xl mx-auto">
        <div className="profile-header text-center">
          <h2 className="text-2xl font-bold">Perfil</h2>
          <p className="text-gray-500">Aquí tienes todos tus datos de perfil</p>
        </div>
        <div className="profile-content">
          {/* Columna Izquierda (Perfil) */}
          <div className="flex-grow flex-shrink-0 md:w-2/5 user-profile-card">
            <div className="profile-avatar-section">
              <h3 className="profile-name">{editedData.nombres} {editedData.apellidos}</h3>
              <p className="profile-role">{editedData.rol}</p>
              <div className="avatar-image-wrapper">
                <img
                  src={editedData.foto || logo}
                  alt="avatar"
                  className="avatar-image"
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha (Bio & Detalles) */}
          <div className="flex-grow flex-shrink-0 md:w-3/5 user-profile-card">
            <div className="profile-header">
              <h3 className="text-xl font-bold">Bio & Detalles</h3>
            </div>
            <div className="profile-details-grid">
              <div className="detail-item">
                <label>Nombres</label>
                <input type="text" name="nombres" value={editedData.nombres} onChange={handleChange} />
              </div>
              <div className="detail-item">
                <label>Apellidos</label>
                <input type="text" name="apellidos" value={editedData.apellidos} onChange={handleChange} />
              </div>
              <div className="detail-item">
                <label>Fecha Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={new Date(editedData.fecha_nacimiento).toISOString().split('T')[0]} onChange={handleChange} />
              </div>
              <div className="detail-item">
                <label>Dirección</label>
                <input type="text" name="direccion" value={editedData.direccion} onChange={handleChange} />
              </div>
              <div className="detail-item">
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={editedData.telefono} onChange={handleChange} pattern="[0-9]*" />
              </div>
              <div className="detail-item">
                <label>Género</label>
                <select name="genero" value={editedData.genero} onChange={handleChange}>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="detail-item">
                <label>Correo</label>
                <input type="email" name="correo_electronico" value={editedData.correo_electronico} onChange={handleChange} readOnly />
              </div>
              <div className="detail-item">
                <label>Contraseña</label>
                <input type="password" name="passwords" placeholder="************" onChange={handleChange} />
              </div>
            </div>
            <div className="profile-actions">
              <button onClick={handleSaveChanges} className="bg-orange-700 text-white px-6 py-2 rounded-lg shadow-md hover:bg-orange-800">
                Guardar Cambios
              </button>
              <button onClick={handleDiscardChanges} className="border border-orange-700 text-orange-700 px-6 py-2 rounded-lg shadow-md hover:bg-orange-100">
                Descartar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    <ToastContainer />
    </div>
  );
}