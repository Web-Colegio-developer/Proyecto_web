import { useState, useEffect } from "react"
import "./UserStores.css"
import { UilStore } from "@iconscout/react-unicons"
import Store from "./Store"

const UserStores = ({ user }) => {
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStores()
  }, [user])

  const fetchStores = async () => {
    if (!user || !user.id) {
      setError("Usuario no válido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3001/stores?ownerId=${user.id}`)
      const data = await response.json()
      if (data.success) {
        setStores(data.data)
      } else {
        setError("No se pudieron cargar las tiendas")
      }
    } catch (err) {
      console.error("Error fetching stores:", err)
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleStoreClick = (store) => {
    setSelectedStore(store)
  }

  const handleBackToStores = () => {
    setSelectedStore(null)
  }

  if (loading && stores.length === 0 && stores.length === "") {
    return (
      <div className="user-stores-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando tiendas...</p>
        </div>
      </div>
    )
  }

  if (error && stores.length === 0) {
    return (
      <div className="user-stores-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchStores} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="user-stores-container">
      {!selectedStore ? (
        <>
          <div className="stores-header">
            <div className="header-content">
              <h1 className="stores-title">Mis Tiendas</h1>
              <p className="stores-subtitle">Gestiona y visualiza todas tus tiendas</p>
            </div>
            <div className="stores-stats">
              <div className="stat-card">
                <UilStore size="24" />
                <div className="stat-info">
                  <span className="stat-value">{stores.length}</span>
                  <span className="stat-label">Tiendas</span>
                </div>
              </div>
            </div>
          </div>

          {stores.length === 0 ? (
            <div className="empty-state">
              <UilStore size="64" className="empty-icon" />
              <h3>No tienes tiendas asignadas</h3>
              <p>Contacte con un administrador para que le asigne su tienda</p>
            </div>
          ) : (
            <div className="stores-grid">
              {stores.map((store) => (
                <div key={store.id_tienda} className="store-card" onClick={() => handleStoreClick(store)}>
                  <div className="store-card-header">
                    <div className="store-icon">
                      <UilStore size="32" />
                    </div>
                  </div>
                  <div className="store-card-body">
                    <h3 className="store-name">{store.nombre_tienda}</h3>
                    <p className="store-address">{store.direccion}</p>
                  </div>
                  <div className="store-card-footer">
                    <button className="view-store-button">
                      Ver productos
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M6 12L10 8L6 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <Store selectedStore={selectedStore} user={user} onBack={handleBackToStores} />
      )}
    </div>
  )
}

export default UserStores