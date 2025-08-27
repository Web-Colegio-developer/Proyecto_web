import React, { useState, useEffect } from 'react';
import '../styles/users.css';

const UserForm = ({ user, onSave, onCancel, onDelete, isVisible }) => {
  const [formData, setFormData] = useState(user || {});

  useEffect(() => {
    // Update form data when user changes or when the form becomes visible
    if (isVisible && user) {
      setFormData(user);
    } else if (!isVisible) {
      // Optional: clear form data when panel is hidden
      setFormData({});
    }
  }, [user, isVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombres || !formData.correo_electronico) {
      alert('El nombre y el correo electrónico son obligatorios.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
        alert('Por favor, introduce un correo electrónico válido.');
        return;
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      onDelete(user.id);
    }
  };

  // Prevent form from closing when clicking inside the panel
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
                <label>Estado</label>
                <select name="estado" value={formData.estado || 'activo'} onChange={handleChange}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
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
