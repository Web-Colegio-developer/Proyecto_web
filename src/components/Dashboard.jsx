import { useState, useEffect, useMemo } from "react"
import "./Dashboard.css"

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const Dashboard = () => {
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users
        const usersResponse = await fetch("http://localhost:3001/users")
        const usersData = await usersResponse.json()
        setUsers(usersData)

        // Fetch stores - you can add ownerId query param if needed
        const storesResponse = await fetch("http://localhost:3001/stores?ownerId=1")
        const storesResult = await storesResponse.json()
        setStores(storesResult.success ? storesResult.data : [])

        // Fetch products
        const productsResponse = await fetch("http://localhost:3001/products")
        const productsResult = await productsResponse.json()
        setProducts(productsResult.success ? productsResult.data : [])

        setLoading(false)
      } catch (err) {
        console.error("[v0] Error fetching dashboard data:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = useMemo(
    () => ({
      totalStores: stores.length || 0,
      totalUsers: users.length || 0,
      totalProducts: products.length || 0,
      totalSales: 45, // Keep static for now - add sales endpoint later
    }),
    [users.length, stores.length, products.length],
  )

  const storesData = useMemo(() => {
    if (stores.length > 0) {
      return stores.map((store) => ({
        id: store.id_tienda,
        name: store.nombre_tienda,
        date: new Date().toLocaleDateString("es-ES"),
        status: "disponible",
        icon: "🏪",
      }))
    }
    // Fallback data if no stores
    return [
      { id: 1, name: "Juguetes", date: "12/02/25", status: "disponible", icon: "🧸" },
      { id: 2, name: "Artesanías", date: "08/01/25", status: "disponible", icon: "🎨" },
      { id: 3, name: "Comida", date: "12/04/25", status: "disponible", icon: "🍔" },
      { id: 4, name: "Postres", date: "20/08/25", status: "no disponible", icon: "🍰" },
    ]
  }, [stores])

  const [userVisits] = useState([
    { day: "Lun", visits: 850 },
    { day: "Mar", visits: 920 },
    { day: "Mié", visits: 1050 },
    { day: "Jue", visits: 1150 },
    { day: "Vie", visits: 980 },
    { day: "Sáb", visits: 890 },
  ])

  const maxVisits = Math.max(...userVisits.map((v) => v.visits))

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <p>Error al cargar los datos: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Inicio</h1>
        <p className="dashboard-subtitle"></p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>{stats.totalStores}</h3>
            <p>Tiendas</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Usuarios</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Productos</p>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.totalSales}</h3>
            <p>Ventas Hoy</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Stores Section */}
        <div className="dashboard-section stores-section">
          <div className="section-header">
            <h2>Tiendas</h2>
            <span className="section-badge">{stats.totalStores}</span>
          </div>

          <div className="stores-list">
            {storesData.map((store) => (
              <div key={store.id} className="store-item">
                <div className="store-info">
                  <span className="store-icon">{store.icon}</span>
                  <div className="store-details">
                    <h4>{store.name}</h4>
                    <span className="store-date">{store.date}</span>
                  </div>
                </div>
                <span
                  className={`store-status ${store.status === "disponible" ? "status-available" : "status-unavailable"}`}
                >
                  {store.status === "disponible" ? "Disponible" : "No disponible"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Visits Section */}
        <div className="dashboard-section visits-section">
          <div className="section-header">
            <h2>Usuarios</h2>
            <span className="section-badge">{stats.totalUsers}</span>
          </div>

          <div className="visits-content">
            <h3 className="visits-title">Vistas de usuarios</h3>

            <div className="chart-container">
              <div className="chart-y-axis">
                <span>1200</span>
                <span>900</span>
                <span>600</span>
                <span>300</span>
                <span>0</span>
              </div>

              <div className="chart-bars">
                {userVisits.map((data, index) => (
                  <div key={index} className="bar-wrapper">
                    <div className="bar-container">
                      <div className="bar" style={{ height: `${(data.visits / maxVisits) * 100}%` }}>
                        <span className="bar-value">{data.visits}</span>
                      </div>
                    </div>
                    <span className="bar-label">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-section activity-section">
        <div className="section-header">
          <h2>Actividad Reciente</h2>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon activity-icon-success">✓</div>
            <div className="activity-content">
              <p className="activity-text">
                Nueva venta registrada en <strong>Juguetes</strong>
              </p>
              <span className="activity-time">Hace 5 minutos</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon activity-icon-info">👤</div>
            <div className="activity-content">
              <p className="activity-text">Nuevo usuario registrado</p>
              <span className="activity-time">Hace 15 minutos</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon activity-icon-warning">📦</div>
            <div className="activity-content">
              <p className="activity-text">
                Stock bajo en <strong>Postres</strong>
              </p>
              <span className="activity-time">Hace 1 hora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
