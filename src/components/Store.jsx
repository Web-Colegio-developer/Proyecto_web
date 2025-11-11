import { useEffect, useState } from "react"
import "./Store.css"
import {
  UilEdit,
  UilTrash,
  UilPlus,
  UilTimes,
  UilBox,
  UilImage,
  UilArrowLeft,
  UilExclamationTriangle,
} from "@iconscout/react-unicons"

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Si ya es una URL completa, retornar tal cual
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Si es una ruta local del backend
  if (imageUrl.includes("backend\\uploads") || imageUrl.includes("backend/uploads")) {
    // Determinar backend URL según entorno
    const backendURL = import.meta.env.VITE_BACKEND_URL 
                        || (window.location.hostname === "localhost" 
                            ? "http://localhost:3001" 
                            : "https://proyecto-web-gufr.onrender.com");

    // Normalizar la ruta
    const cleanPath = imageUrl.replace(/\\/g, "/").replace("backend/", "");
    return `${backendURL}/${cleanPath}`;
  }

  return null;
};


const Store = ({ selectedStore, user, onBack }) => {

  const backendURL = import.meta.env.VITE_BACKEND_URL 
                      || (window.location.hostname === "localhost" 
                          ? "http://localhost:3001" 
                          : "https://proyecto-web-gufr.onrender.com");


  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [deleteModal, setDeleteModal] = useState({ show: false, product: null })

  const [editingProduct, setEditingProduct] = useState(null)
  const [editValues, setEditValues] = useState({
    nombre_producto: "",
    precio: 0,
    tamaño: "",
    stock: 0,
    descripcion: "",
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    nombre_producto: "",
    descripcion: "",
    tamaño: "",
    precio: "",
    stock: "",
  })
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    if (selectedStore?.id_tienda) {
      fetchProducts(selectedStore.id_tienda)
    }
  }, [selectedStore?.id_tienda])

  const fetchProducts = async (storeId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${backendURL}/stores/${storeId}/products`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
      } else {
        setError("No se pudieron cargar los productos")
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (product) => {
    setDeleteModal({ show: true, product })
  }

  const handleDeleteConfirm = async () => {
    const product = deleteModal.product
    if (!product) return

    try {
      const res = await fetch(`${backendURL}/products/${product.id_producto}`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (res.ok) {
        setDeleteModal({ show: false, product: null })
        await fetchProducts(selectedStore.id_tienda)
      } else {
        alert(`No se pudo eliminar: ${json.message || json.error || res.status}`)
      }
    } catch (err) {
      console.error(err)
      alert("Error al eliminar el producto.")
    }
  }

  const handleEditOpen = (product) => {
    setEditingProduct(product)
    setEditValues({
      nombre_producto: product.nombre_producto,
      precio: product.precio,
      tamaño: product.tamaño || "",
      stock: product.stock || 0,
      descripcion: product.descripcion || "",
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const payload = {
        nombre_producto: editValues.nombre_producto,
        precio: Number(editValues.precio),
        tamaño: editValues.tamaño,
        stock: Number(editValues.stock),
        descripcion: editValues.descripcion,
      }

      const res = await fetch(`${backendURL}/products/${editingProduct.id_producto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (res.ok) {
        setEditingProduct(null)
        await fetchProducts(selectedStore.id_tienda)
      } else {
        alert(`No se pudo actualizar: ${json.message || json.error || res.status}`)
      }
    } catch (err) {
      console.error(err)
      alert("Error al actualizar.")
    }
  }

  const handleAddChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()

    if (!addForm.nombre_producto || addForm.nombre_producto.trim() === "") {
      return alert("El nombre del producto es obligatorio.")
    }
    if (addForm.precio === "" || isNaN(Number(addForm.precio))) {
      return alert("Precio inválido.")
    }

    setAddLoading(true)
    try {
      const payload = {
        nombre_producto: addForm.nombre_producto.trim(),
        descripcion: addForm.descripcion?.trim() || "",
        tamaño: addForm.tamaño?.trim() || "",
        precio: Number(addForm.precio),
        stock: Number(addForm.stock || 0),
      }

      const res = await fetch(`${backendURL}/stores/${selectedStore.id_tienda}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const ct = res.headers.get("content-type") || ""
      if (!ct.includes("application/json")) {
        const text = await res.text().catch(() => null)
        console.error("RESPUESTA NO JSON:", res.status, text)
        alert("Error del servidor (revisa consola).")
        setAddLoading(false)
        return
      }

      const json = await res.json()

      if (!res.ok) {
        console.error("Error crear producto:", json)
        alert(json.message || json.error || "Error al crear producto")
      } else {
        setShowAddModal(false)
        setAddForm({ nombre_producto: "", descripcion: "", tamaño: "", precio: "", stock: "" })
        await fetchProducts(selectedStore.id_tienda)
      }
    } catch (err) {
      console.error("Error de red al crear producto:", err)
      alert("Error de red al crear producto.")
    } finally {
      setAddLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="store-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="store-wrapper">
      <div className="store-hero">
        <button onClick={onBack} className="back-button">
          <UilArrowLeft size="20" />
          Volver a tiendas
        </button>
        <div className="store-hero-content">
          <h1 className="store-hero-title">{selectedStore?.nombre_tienda || "Mi Tienda"}</h1>
          <p className="store-hero-subtitle">📍 {selectedStore?.direccion || "Gestiona tu inventario"}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="hero-add-button">
          <UilPlus size="22" />
          Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon-wrapper">
            <UilBox size="80" className="empty-icon" />
          </div>
          <h2 className="empty-title">No hay productos aún</h2>
          <p className="empty-description">Comienza agregando tu primer producto para empezar a vender</p>
          <button onClick={() => setShowAddModal(true)} className="empty-cta-button">
            <UilPlus size="20" />
            Agregar primer producto
          </button>
        </div>
      ) : (
        <div className="products-container">
          <div className="products-header">
            <h2 className="products-title">Inventario</h2>
            <span className="products-count">{products.length} productos</span>
          </div>
          <div className="products-grid-modern">
            {products.map((product) => {
              const imageUrl = getImageUrl(product.imageUrl)

              return (
                <div key={product.id_producto} className="product-card-modern">
                  <div className="product-image-wrapper">
                    {imageUrl ? (
                      <img src={imageUrl || "/placeholder.svg"} alt={product.nombre_producto} className="product-img" />
                    ) : (
                      <div className="product-img-placeholder">
                        <UilImage size="40" />
                      </div>
                    )}
                    <div className="product-overlay">
                      <button onClick={() => handleEditOpen(product)} className="overlay-btn edit-btn" title="Editar">
                        <UilEdit size="18" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="overlay-btn delete-btn"
                        title="Eliminar"
                      >
                        <UilTrash size="18" />
                      </button>
                    </div>
                  </div>

                  <div className="product-content">
                    <h3 className="product-title">{product.nombre_producto}</h3>
                    {product.descripcion && <p className="product-desc">{product.descripcion}</p>}

                    <div className="product-meta">
                      {product.tamaño && (
                        <div className="meta-item">
                          <span className="meta-label">Tamaño</span>
                          <span className="meta-value">{product.tamaño}</span>
                        </div>
                      )}
                      <div className="meta-item">
                        <span className="meta-label">Stock</span>
                        <span className="meta-value">{product.stock || 0} unidades</span>
                      </div>
                    </div>

                    <div className="product-bottom">
                      <span className="product-price-modern">${Number(product.precio).toLocaleString()}</span>
                      <span
                        className={`stock-indicator ${
                          product.stock > 10 ? "stock-high" : product.stock > 0 ? "stock-medium" : "stock-low"
                        }`}
                      >
                        {product.stock > 10 ? "✓ Disponible" : product.stock > 0 ? "⚠ Poco stock" : "✕ Agotado"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ show: false, product: null })}>
          <div className="modal-container delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <UilExclamationTriangle size="48" />
            </div>
            <h3 className="delete-modal-title">¿Eliminar producto?</h3>
            <p className="delete-modal-message">
              Estás a punto de eliminar <strong>"{deleteModal.product?.nombre_producto}"</strong>. Esta acción no se
              puede deshacer y el producto será eliminado permanentemente de tu inventario.
            </p>
            <div className="delete-modal-footer">
              <button onClick={handleDeleteConfirm} className="btn-danger">
                Sí, eliminar
              </button>
              <button onClick={() => setDeleteModal({ show: false, product: null })} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-heading">Editar Producto</h3>
              <button onClick={() => setEditingProduct(null)} className="modal-close">
                <UilTimes size="24" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="input-group">
                <label className="input-label">Nombre del producto *</label>
                <input
                  className="input-field"
                  value={editValues.nombre_producto}
                  onChange={(e) => setEditValues({ ...editValues, nombre_producto: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea
                  className="input-field textarea-field"
                  value={editValues.descripcion}
                  onChange={(e) => setEditValues({ ...editValues, descripcion: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Precio *</label>
                  <input
                    className="input-field"
                    type="number"
                    value={editValues.precio}
                    onChange={(e) => setEditValues({ ...editValues, precio: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Stock</label>
                  <input
                    className="input-field"
                    type="number"
                    value={editValues.stock}
                    onChange={(e) => setEditValues({ ...editValues, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Tamaño</label>
                <input
                  className="input-field"
                  value={editValues.tamaño}
                  onChange={(e) => setEditValues({ ...editValues, tamaño: e.target.value })}
                  placeholder="Ej: 250ml, Grande, XL"
                />
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  Guardar cambios
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3 className="modal-heading">Agregar Nuevo Producto</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                <UilTimes size="24" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="input-group">
                <label className="input-label">Nombre del producto *</label>
                <input
                  className="input-field"
                  name="nombre_producto"
                  value={addForm.nombre_producto}
                  onChange={handleAddChange}
                  placeholder="Ej: Café Latte"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea
                  className="input-field textarea-field"
                  name="descripcion"
                  value={addForm.descripcion}
                  onChange={handleAddChange}
                  placeholder="Describe tu producto..."
                  rows="3"
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Precio *</label>
                  <input
                    className="input-field"
                    name="precio"
                    value={addForm.precio}
                    onChange={handleAddChange}
                    type="number"
                    placeholder="25000"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Stock inicial</label>
                  <input
                    className="input-field"
                    name="stock"
                    value={addForm.stock}
                    onChange={handleAddChange}
                    type="number"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Tamaño</label>
                <input
                  className="input-field"
                  name="tamaño"
                  value={addForm.tamaño}
                  onChange={handleAddChange}
                  placeholder="Ej: 250ml, Grande, XL"
                />
              </div>

              <div className="modal-footer">
                <button type="submit" disabled={addLoading} className="btn-primary">
                  {addLoading ? "Guardando..." : "Agregar producto"}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Store
