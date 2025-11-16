import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import './ProductsGrid.css'

const normalizeApiBase = (base) => {
  if (!base) return ''
  return base.endsWith('/') ? base.slice(0, -1) : base
}

const ProductsGrid = ({ apiBase = '', storeId = null, onlyAvailable = true }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ----------------- NUEVOS ESTADOS PARA FILTROS ----------------- */
  const [maxPrice, setMaxPrice] = useState(200000)
  const [selectedStars, setSelectedStars] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [availableFilter, setAvailableFilter] = useState(true)

  /* ----------------- FILTRADO EN EL FRONTEND ----------------- */
  const applyFilters = (list) => {
    return list
      .filter(p => p.precio <= maxPrice)
      .filter(p => !selectedStars || (p.raw?.stars ?? p.stars ?? 0) === selectedStars)
      .filter(p => !selectedCategory || (p.raw?.category ?? p.category) === selectedCategory)
  }

  /* ----------------- TU FETCH ORIGINAL (NO MODIFICADO) ----------------- */
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

        // console.log('[ProductsGrid] Petición a:', fetchUrl)
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
          const raw = r.raw ?? r
          const precioRaw = r.precio ?? r.price ?? raw.precio ?? raw.price ?? 0
          const precio = typeof precioRaw === 'string' ? parseFloat(precioRaw) || 0 : Number(precioRaw || 0)
          //const estado = (r.estado ?? raw.estado ?? r.status ?? raw.status ?? 'desconocido').toString()
          const fechaCreacion = r.fecha_creacion ?? raw.fecha_creacion ?? r.created_at ?? raw.created_at ?? null

          return {
            id_producto: r.id_producto ?? r.id ?? raw.id_producto ?? null,
            id_tienda: r.id_tienda ?? r.store_id ?? raw.id_tienda ?? null,
            nombre_producto: r.nombre_producto ?? r.name ?? raw.nombre_producto ?? raw.name ?? null,
            descripcion: r.descripcion ?? r.description ?? raw.descripcion ?? raw.description ?? null,
            tamaño: r.tamaño ?? r.tamano ?? r.size ?? raw.tamaño ?? raw.size ?? null,
            precio,
            stock: Number(r.stock ?? r.cantidad ?? raw.stock ?? raw.cantidad ?? 0),
            //estado,
            fecha_creacion: fechaCreacion,
            imageUrl: r.imageUrl ?? r.image ?? raw.imageUrl ?? raw.image ?? null,

            /* NUEVOS CAMPOS */
            stars: r.stars ?? raw.stars ?? null,
            category: r.category ?? raw.category ?? null,

            raw
          }
        })

        const filtered = onlyAvailable
          ? normalized.filter(p => Number(p.stock ?? 0)> 0)
          : normalized

        setProducts(filtered)
      } catch (err) {
        if (err && err.name === 'AbortError') {
          // console.log('[ProductsGrid] fetch abortado. Ignorado.')
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


  /* ----------------- APLICAR FILTROS LOCALES ----------------- */
  const filteredProducts = applyFilters(products)

  return (
    <div className="products-container">

      {/* ----------------- NUEVA SECCIÓN DE FILTROS ----------------- */}
      <div className="filters-sidebar">

        <h3>Filtros</h3>

        {/* Categorías */}
        <div className="filter-section">
          <h4>Categoría</h4>
          <label>
            <input type="radio" name="cat" onChange={() => setSelectedCategory("bebidas")} />
            Bebidas
          </label>
          <label>
            <input type="radio" name="cat" onChange={() => setSelectedCategory("postres")} />
            Postres
          </label>
          <label>
            <input type="radio" name="cat" onChange={() => setSelectedCategory("snacks")} />
            Snacks
          </label>
        </div>

        {/* Precio */}
        <div className="filter-section">
          <h4>Precio máximo</h4>

          <input
            type="range"
            min="0"
            max="100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />

          {/* 🔥 AQUÍ EL CAMBIO: FORMATO CON PUNTOS */}
          <p>${new Intl.NumberFormat("es-CO").format(maxPrice)}</p>
        </div>

        {/* Estrellas */}
        <div className="filter-section">
          <h4>Opiniones</h4>
          {[5, 4, 3, 2, 1].map(s => (
            <label key={s}>
              <input
                type="radio"
                name="stars"
                onChange={() => setSelectedStars(s)}
              />
              {'⭐'.repeat(s)}
            </label>
          ))}
        </div>

        {/* Disponibilidad */}
        <div className="filter-section">
          <h4>Disponibilidad</h4>
          <label>
            <input
              type="checkbox"
              checked={availableFilter}
              onChange={(e) => setAvailableFilter(e.target.checked)}
            />
            Solo disponibles
          </label>
        </div>

      </div>

      {/* ---------------- GRID ORIGINAL ---------------- */}
      <div className="products-header"></div>

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
