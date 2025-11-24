import React, { useState, useEffect } from 'react';
// import '../styles/users.css';
import './UserForm.css';


const backendURL = import.meta.env.VITE_BACKEND_URL 
                   || (window.location.hostname === "localhost" 
                       ? "http://localhost:3001" 
                       : "https://proyecto-web-6xzt.onrender.com");

const UserForm = ({ user, onSave, onCancel, onDelete, isVisible }) => {
  const [formData, setFormData] = useState(user || {});

  useEffect(() => {
    if (isVisible && user) {
      setFormData(user);
    } else if (!isVisible) {
      setFormData({});
    }
  }, [user, isVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombres || !formData.correo_electronico) {
      alert('El nombre y el correo electrónico son obligatorios.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
        alert('Por favor, introduce un correo electrónico válido.');
        return;
    }
    
    try {
      const response = await fetch(`${backendURL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave(formData);
      } else {
        alert('Error al guardar los cambios.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de red al guardar los cambios.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`${backendURL}/users/${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onDelete(user.id);
        } else {
          alert('Error al eliminar el usuario.');
        }
      } catch (error) {
        console.error('Error de red:', error);
        alert('Error de red al eliminar el usuario.');
      }
    }
  };

  const handlePanelClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className={`user-form-overlay ${isVisible ? 'visible' : ''}`} onClick={onCancel}></div>
      <div className={`user-form-panel ${isVisible ? 'visible' : ''}`} onClick={handlePanelClick}>
        {formData && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="user-form-header">
              <h2>Editar Usuario</h2>
              <button type="button" className="close-btn" onClick={onCancel}>&times;</button>
            </div>

            <div className="user-form-content">
              {formData.foto && (
                  <img src={formData.foto} alt="Vista previa del perfil" className="profile-image-preview" />
              )}
              <div className="form-group">
                <label>URL de la Imagen de Perfil</label>
                <input type="text" name="foto" value={formData.foto || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Nombres</label>
                <input type="text" name="nombres" value={formData.nombres || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input type="text" name="apellidos" value={formData.apellidos || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="correo_electronico" value={formData.correo_electronico || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select name="rol" value={formData.rol || 'estudiante'} onChange={handleChange}>
                  <option value="estudiante">Estudiante</option>
                  <option value="administrador">Admin</option>
                  <option value="profesor">Profesor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monedas</label>
                <input type="number" name="saldo" value={formData.saldo || 0} onChange={handleChange} />
              </div>
            </div>

            <div className="user-form-footer">
              <button type="submit" className="btn-save">Guardar Cambios</button>
              <button type="button" className="btn-delete" onClick={handleDelete}>Eliminar</button>
              <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default UserForm;