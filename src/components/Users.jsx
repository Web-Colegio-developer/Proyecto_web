import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import UserForm from './UserForm';
import './Users.css';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Users = ({ users, setUsers, selectedUser, setSelectedUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredUsers = useMemo(() => {
    if (!users) return []; // Guard clause for when users is not yet available
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return users.filter((user) => {
      const nameMatch = user.nombres && user.nombres.toLowerCase().includes(lowercasedFilter);
      const lastnameMatch = user.apellidos && user.apellidos.toLowerCase().includes(lowercasedFilter);
      const emailMatch = user.correo_electronico && user.correo_electronico.toLowerCase().includes(lowercasedFilter);
      return nameMatch || lastnameMatch || emailMatch;
    });
  }, [users, debouncedSearchTerm]);

  const handleSaveUser = (updatedUser) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((user) => user.id !== userId));
    setSelectedUser(null);
  };

  return (
    <section className="users-section">
      <div className="users-header">
        <h1>Usuarios</h1>
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar usuarios"
          />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="users-grid" role="grid">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              className="user-card-button"
              onClick={() => setSelectedUser(user)}
              aria-label={`Ver perfil de ${user.nombres}`}
              role="gridcell"
            >
              <img src={user.foto} alt={`Avatar de ${user.nombres}`} className="user-avatar_admin" />
              <p className="user-name_admin">{`${user.nombres || ''} ${user.apellidos || ''}`}</p>
              <p className="user-role_admin">{(user.rol || '').toUpperCase()}</p>
            </button>
          ))}
        </div>
      ) : (
        <p className="no-users-found">No se encontraron usuarios.</p>
      )}

      <UserForm
        user={selectedUser}
        onSave={handleSaveUser}
        onCancel={() => setSelectedUser(null)}
        onDelete={handleDeleteUser}
        isVisible={!!selectedUser}
      />
    </section>
  );
};

export default Users;