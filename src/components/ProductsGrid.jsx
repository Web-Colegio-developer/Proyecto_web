import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import './ProductsGrid.css'

const normalizeApiBase = (base) => {
  if (!base) return ''
  return base.endsWith('/') ? base.slice(0, -1) : base
}

const IconFilter = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 4h18v4H3V4zm2 6h14v3H5v-3zm4 5h6v3H9v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
  </svg>
)

const IconClose = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ProductsGrid = ({ apiBase = '', storeId = null, onlyAvailable = true }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  /* Agregados todos los estados para filtros mejorados */
  const [maxPrice, setMaxPrice] = useState(200000)
  const [selectedStars, setSelectedStars] = useState(null)
  const [selectedcategoria, setSelectedcategoria] = useState(null)
  const [availableFilter, setAvailableFilter] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    categoria: false,
    precio: false,
    opiniones: false,
    disponibilidad: false
  })

  /* Función para limpiar todos los filtros */
  const clearAllFilters = () => {
    setMaxPrice(200000)
    setSelectedStars(null)
    setSelectedcategoria(null)
    setAvailableFilter(true)
  }

  /* Función para alternar secciones de filtros */
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  /* Obtener total de filtros activos */
  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedcategoria) count++
    if (maxPrice < 200000) count++
    if (selectedStars) count++
    if (!availableFilter) count++
    return count
  }

  /* Filtrado mejorado en el frontend */
  const applyFilters = (list) => {
    return list
      .filter(p => p.precio <= maxPrice)
      .filter(p => !selectedStars || (p.raw?.stars ?? p.stars ?? 0) === selectedStars)
      .filter(p => !selectedcategoria || (p.raw?.categoria ?? p.categoria) === selectedcategoria)
  }

  useEffect(() => {
    const controller = new AbortController()
    const safeBase = normalizeApiBase(apiBase)
    const fetchUrl = storeId
      ? `${safeBase}/stores/${encodeURIComponent(storeId)}/products`
      : `${safeBase}/products`

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(fetchUrl, { signal: controller.signal })
        console.log('[ProductsGrid] status:', res.status, 'ok:', res.ok)

        if (!res.ok) {
          const txt = await res.text().catch(() => '<no response text>')
          throw new Error(`HTTP ${res.status} - ${txt}`)
        }

        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const txt = await res.text().catch(() => '<no response text>')
          throw new Error(
            `Respuesta no es JSON (content-type: ${contentType}). Contenido (truncado): ${txt.slice(0, 500)}`
          )
        }

        const json = await res.json()
        const rows = Array.isArray(json) ? json : (json.data ?? [])

        const normalized = (rows || []).map(r => {
          console.log('[ProductsGrid] Producto crudo:', r)
          const raw = r.raw ?? r
          const precioRaw = r.precio ?? r.price ?? raw.precio ?? raw.price ?? 0
          const precio = typeof precioRaw === 'string' ? parseFloat(precioRaw) || 0 : Number(precioRaw || 0)
          const fechaCreacion = r.fecha_creacion ?? raw.fecha_creacion ?? r.created_at ?? raw.created_at ?? null
          const categoria = r.categoria ?? raw.categoria ?? null

          return {
            id_producto: r.id_producto ?? r.id ?? raw.id_producto ?? null,
            id_tienda: r.id_tienda ?? r.store_id ?? raw.id_tienda ?? null,
            nombre_producto: r.nombre_producto ?? r.name ?? raw.nombre_producto ?? raw.name ?? null,
            descripcion: r.descripcion ?? r.description ?? raw.descripcion ?? raw.description ?? null,
            tamaño: r.tamaño ?? r.tamano ?? r.size ?? raw.tamaño ?? raw.size ?? null,
            precio,
            stock: Number(r.stock ?? r.cantidad ?? raw.stock ?? raw.cantidad ?? 0),
            fecha_creacion: fechaCreacion,
            imageUrl: r.imageUrl ?? r.image ?? raw.imageUrl ?? raw.image ?? null,
            stars: r.stars ?? raw.stars ?? null,
            categoria: r.categoria ?? raw.categoria ?? null,
            raw
          }
        })

        const filtered = onlyAvailable
          ? normalized.filter(p => Number(p.stock ?? 0) > 0)
          : normalized

        setProducts(filtered)
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return
        }

        console.error('[ProductsGrid] Error al traer productos:', err)
        setError('No se pudieron cargar los productos desde la API.')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
    return () => {
      controller.abort()
    }
  }, [apiBase, storeId, onlyAvailable])

  const filteredProducts = applyFilters(products)
  const activeFilters = getActiveFiltersCount()

  return (
    <div className="products-container">
      <div className={`filters-sidebar ${showMobileFilters ? 'show' : ''}`}>
        <div className="filters-header">
          <h3>Filtros</h3>
          {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
          <button 
            className="close-filters-mobile"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Cerrar filtros"
          >
            <IconClose size={20} />
          </button>
        </div>

        <div className="filter-section">
          <button 
            className="filter-section-title"
            onClick={() => toggleSection('categoria')}
          >
            <h4>Categoría</h4>
            <span className={`expand-icon ${expandedSections.categoria ? 'open' : ''}`}>›</span>
          </button>
          {expandedSections.categoria && (
            <div className="filter-content">
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria(null)} checked={!selectedcategoria} />
                Todas
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Bebidas")} checked={selectedcategoria === "Bebidas"} />
                Bebidas
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Lácteos")} checked={selectedcategoria === "Lácteos"} />
                Lácteos
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Vegetales")} checked={selectedcategoria === "Vegetales"} />
                Vegetales
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Frutas")} checked={selectedcategoria === "Frutas"} />
                Frutas
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("dulces")} checked={selectedcategoria === "dulces"} />
                Dulces
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Postres")} checked={selectedcategoria === "Postres"} />
                Postres
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Comida típica")} checked={selectedcategoria === "Comida típica"} />
                Comida típica
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Comida rápida")} checked={selectedcategoria === "Comida rápida"} />
                Comida rápida
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Comida Mar")} checked={selectedcategoria === "Comida Mar"} />
                Comida Mar
              </label>
              <label>
                <input type="radio" name="cat" onChange={() => setSelectedcategoria("Frutos Secos")} checked={selectedcategoria === "Frutos Secos"} />
                Frutos Secos
              </label>
            </div>
          )}
        </div>

        <div className="filter-section">
          <button 
            className="filter-section-title"
            onClick={() => toggleSection('precio')}
          >
            <h4>Precio máximo</h4>
            <span className={`expand-icon ${expandedSections.precio ? 'open' : ''}`}>›</span>
          </button>
          {expandedSections.precio && (
            <div className="filter-content">
              <input
                type="range"
                min="0"
                max="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <p className="price-display">${new Intl.NumberFormat("es-CO").format(maxPrice)}</p>
            </div>
          )}
        </div>

        <div className="filter-section">
          <button 
            className="filter-section-title"
            onClick={() => toggleSection('opiniones')}
          >
            <h4>Opiniones</h4>
            <span className={`expand-icon ${expandedSections.opiniones ? 'open' : ''}`}>›</span>
          </button>
          {expandedSections.opiniones && (
            <div className="filter-content">
              <label>
                <input
                  type="radio"
                  name="stars"
                  onChange={() => setSelectedStars(null)}
                  checked={!selectedStars}
                />
                Todas
              </label>
              {[5, 4, 3, 2, 1].map(s => (
                <label key={s}>
                  <input
                    type="radio"
                    name="stars"
                    onChange={() => setSelectedStars(s)}
                    checked={selectedStars === s}
                  />
                  {'⭐'.repeat(s)}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="filter-section">
          <button 
            className="filter-section-title"
            onClick={() => toggleSection('disponibilidad')}
          >
            <h4>Disponibilidad</h4>
            <span className={`expand-icon ${expandedSections.disponibilidad ? 'open' : ''}`}>›</span>
          </button>
          {expandedSections.disponibilidad && (
            <div className="filter-content">
              <label>
                <input
                  type="checkbox"
                  checked={availableFilter}
                  onChange={(e) => setAvailableFilter(e.target.checked)}
                />
                Solo disponibles
              </label>
            </div>
          )}
        </div>

        {activeFilters > 0 && (
          <button className="btn-clear-filters" onClick={clearAllFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      <button 
        className="btn-filters-mobile"
        onClick={() => setShowMobileFilters(true)}
      >
        <IconFilter size={20} />
        <span>Filtros</span>
        {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
      </button>

      {showMobileFilters && (
        <div 
          className="filters-overlay"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Grid de productos */}
      {loading && <div className="products-loading">Cargando productos...</div>}
      {error && <div className="products-error">{error}</div>}

      <div className="products-grid">
        {filteredProducts.length === 0 && !loading ? (
          <div className="products-empty">No hay productos para mostrar.</div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id_producto ?? product.nombre_producto ?? Math.random()}
              product={product}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ProductsGrid
