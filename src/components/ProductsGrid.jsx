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

        console.log('[ProductsGrid] Petición a:', fetchUrl)
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
          const estado = (r.estado ?? raw.estado ?? r.status ?? raw.status ?? 'desconocido').toString()
          const fechaCreacion = r.fecha_creacion ?? raw.fecha_creacion ?? r.created_at ?? raw.created_at ?? null

          return {
            id_producto: r.id_producto ?? r.id ?? raw.id_producto ?? null,
            id_tienda: r.id_tienda ?? r.store_id ?? raw.id_tienda ?? null,
            nombre_producto: r.nombre_producto ?? r.name ?? raw.nombre_producto ?? raw.name ?? null,
            descripcion: r.descripcion ?? r.description ?? raw.descripcion ?? raw.description ?? null,
            tamaño: r.tamaño ?? r.tamano ?? r.size ?? raw.tamaño ?? raw.size ?? null,
            precio,
            stock: Number(r.stock ?? r.cantidad ?? raw.stock ?? raw.cantidad ?? 0),
            estado,
            fecha_creacion: fechaCreacion,
            imageUrl: r.imageUrl ?? r.image ?? raw.imageUrl ?? raw.image ?? null,
            raw
          }
        })

        const filtered = onlyAvailable
          ? normalized.filter(p => String(p.estado).toLowerCase() === 'disponible')
          : normalized

        setProducts(filtered)
      } catch (err) {
        if (err && err.name === 'AbortError') {
          console.log('[ProductsGrid] fetch abortado (esperable en StrictMode/dev). Ignorando.')
          return
        }

        console.error('[ProductsGrid] Error al traer productos:', err)
        setError('No se pudieron cargar los productos desde la API. Revisa la consola para más detalles.')
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

  return (
    <div className="products-container">
      <div className="products-header">
        {/* <h1>Tienda</h1> */}
        {/* <p>Listado de productos</p> */}
      </div>

      {loading && <div className="products-loading">Cargando productos...</div>}
      {error && <div className="products-error">{error}</div>}

      <div className="products-grid">
        {products.length === 0 && !loading ? (
          <div className="products-empty">No hay productos para mostrar.</div>
        ) : (
          products.map((product) => (
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
