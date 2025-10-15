// src/components/Store.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cards from "./CardsP";
import defaultImage from "../assets/Imagen_Login.png";
import "./Store.css";

const Store = ({ user }) => {
  const { storeId: routeStoreId } = useParams();
  const [storeId, setStoreId] = useState(routeStoreId || null);
  const [storeInfo, setStoreInfo] = useState(null); // <-- nueva state para nombre/dirección
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edición
  const [editingProduct, setEditingProduct] = useState(null);
  const [editValues, setEditValues] = useState({ nombre_producto: "", precio: 0, tamaño: "", stock: 0 });

  // Agregar producto (modal)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    nombre_producto: "",
    descripcion: "",
    tamaño: "",
    precio: "",
    stock: ""
  });
  const [addFile, setAddFile] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  // fetchProducts
  const fetchProducts = async (currentStoreId) => {
    setLoading(true);
    setError(null);
    try {
      let productsRes = await fetch(`http://localhost:3001/stores/${currentStoreId}/products`);
      if (!productsRes.ok) {
        productsRes = await fetch(`http://localhost:3001/products?storeId=${currentStoreId}`);
      }
      if (!productsRes.ok) {
        const txt = await productsRes.text().catch(()=>null);
        throw new Error(`Error al obtener productos: ${productsRes.status} ${txt ?? productsRes.statusText}`);
      }
      const json = await productsRes.json();
      const arr = json.data || json;
      const normalized = (Array.isArray(arr) ? arr : []).map(p => ({
        id: p.id_producto ?? p.id ?? p.productId ?? Math.random().toString(36).slice(2,9),
        title: p.nombre_producto ?? p.name ?? p.title ?? "Producto",
        category: p.categoria ?? p.category ?? "General",
        price: Number(p.precio ?? p.price ?? 0),
        image: p.imageUrl ?? p.image ?? p.imagen ?? defaultImage,
        badge: p.badge ?? null,
        rating: p.rating ?? 4.5,
        raw: p,
      }));
      setProducts(normalized);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setError("Error cargando productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      let currentStoreId = routeStoreId || storeId;
      let detectedStoreInfo = null;

      if (!currentStoreId) {
        const saved = localStorage.getItem("user");
        if (!saved) { setError("Usuario no autenticado"); setLoading(false); return; }
        const userObj = JSON.parse(saved);
        try {
          // Obtener tiendas del owner para asignar storeId y storeInfo
          const storesRes = await fetch(`http://localhost:3001/stores?ownerId=${userObj.id}`);
          if (!storesRes.ok) {
            const txt = await storesRes.text().catch(()=>null);
            throw new Error(`GET /stores no OK: ${storesRes.status} ${txt ?? storesRes.statusText}`);
          }
          const storesJson = await storesRes.json();
          const storesArray = storesJson.data || storesJson;
          if (Array.isArray(storesArray) && storesArray.length > 0) {
            const first = storesArray[0];
            currentStoreId = first.id_tienda || first.id || first.storeId;
            setStoreId(currentStoreId);

            // Guardamos info disponible (nombre_tienda, direccion) para el header
            detectedStoreInfo = {
              id_tienda: first.id_tienda || first.id || currentStoreId,
              nombre_tienda: first.nombre_tienda ?? first.name ?? first.nombre ?? "Tienda",
              direccion: first.direccion ?? first.address ?? ""
            };
            setStoreInfo(detectedStoreInfo);
          } else {
            setError("No hay tiendas");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error obteniendo tiendas:", err);
          setError("Error al obtener tiendas.");
          setLoading(false);
          return;
        }
      } else {
        // Si ya tenemos storeId (p.ej. por ruta), intentamos obtener info vía /stores?ownerId si user es owner,
        // pero como no hay endpoint GET /stores/:storeId en tu backend actual, mantenemos storeId y fetchProducts.
        // Opcional: si deseas, podemos intentar buscar en /stores?ownerId del user y elegir la que coincida.
        // Por ahora, intentamos solo fetchProducts con el storeId existente.
      }

      await fetchProducts(currentStoreId);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeStoreId]);

  // --- DELETE handler ---
  const handleDelete = async (product) => {
    const ok = window.confirm(`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:3001/products/${product.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        // refrescar lista
        await fetchProducts(storeId);
      } else {
        alert(`No se pudo eliminar: ${json.message || json.error || res.status}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el producto.");
    }
  };

  // --- EDIT: abrir modal con valores ---
  const handleEditOpen = (product) => {
    setEditingProduct(product);
    const raw = product.raw || {};
    setEditValues({
      nombre_producto: raw.nombre_producto ?? product.title,
      precio: raw.precio ?? product.price ?? 0,
      tamaño: raw.tamaño ?? raw.size ?? "",
      stock: raw.stock ?? 0,
    });
  };

  // --- EDIT: enviar PUT ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const payload = {
        nombre_producto: editValues.nombre_producto,
        precio: Number(editValues.precio),
        tamaño: editValues.tamaño,
        stock: Number(editValues.stock),
      };
      const res = await fetch(`http://localhost:3001/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setEditingProduct(null);
        await fetchProducts(storeId);
      } else {
        alert(`No se pudo actualizar: ${json.message || json.error || res.status}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar.");
    }
  };

  // --- ADD product handlers (modal form) ---
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAddFile = (e) => {
    setAddFile(e.target.files[0] || null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // validaciones mínimas
    if (!addForm.nombre_producto || addForm.nombre_producto.trim() === "") {
      return alert("El nombre del producto es obligatorio.");
    }
    if (addForm.precio === "" || isNaN(Number(addForm.precio))) {
      return alert("Precio inválido.");
    }
    setAddLoading(true);
    try {
      const fd = new FormData();
      fd.append("nombre_producto", addForm.nombre_producto.trim());
      fd.append("descripcion", addForm.descripcion?.trim() ?? "");
      fd.append("tamaño", addForm.tamaño?.trim() ?? "");
      fd.append("precio", Number(addForm.precio));
      fd.append("stock", Number(addForm.stock || 0));
      if (addFile) fd.append("imagen", addFile);

      const res = await fetch(`http://localhost:3001/stores/${storeId}/products`, {
        method: "POST",
        body: fd
      });

      // manejar respuesta no-JSON (evitar error Unexpected token '<')
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text().catch(()=>null);
        console.error("RESPUESTA NO JSON:", res.status, text);
        alert("Error del servidor (revisa consola).");
        setAddLoading(false);
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        console.error("Error crear producto:", json);
        alert(json.message || json.error || "Error al crear producto");
      } else {
        // insertar producto nuevo en estado para feedback
        const newProduct = {
          id: json.data.id_producto ?? Math.random().toString(36).slice(2,9),
          title: json.data.nombre_producto ?? addForm.nombre_producto,
          category: "General",
          price: Number(json.data.precio ?? addForm.precio ?? 0),
          image: json.data.imageUrl ?? defaultImage,
          raw: json.data
        };
        setProducts(prev => [newProduct, ...prev]);
        setShowAddModal(false);
        // limpiar form
        setAddForm({ nombre_producto: "", descripcion: "", tamaño: "", precio: "", stock: "" });
        setAddFile(null);
      }
    } catch (err) {
      console.error("Error de red al crear producto:", err);
      alert("Error de red al crear producto.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="store-page">
      <div className="store-header" style={{ maxWidth: 1200, margin: "0 auto 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>{storeInfo?.nombre_tienda ?? "Tienda"}</h1>
          <p>{storeInfo ? `📍 ${storeInfo.direccion}` : "Aquí puedes explorar y comprar nuestros productos."}</p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ padding: "8px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none", cursor: "pointer" }}
          >
            + Agregar producto
          </button>
        </div>
      </div>

      {loading && <p className="muted" style={{ textAlign: "center" }}>Cargando productos...</p>}
      {error && <p className="error" style={{ textAlign: "center" }}>{error}</p>}

      <div className="products-grid" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {products.map((product) => (
          <Cards
            key={product.id}
            product={{
              id: product.id,
              title: product.title,
              category: product.category,
              price: product.price,
              image: product.image,
              badge: product.badge,
              rating: product.rating,
              raw: product.raw
            }}
            onFavorite={() => console.log("fav", product.id)}
            onView={() => console.log("view", product.id)}
            onAddToCart={() => console.log("add", product.id)}
            onEditClick={() => handleEditOpen(product)}
            onDeleteClick={() => handleDelete(product)}
          />
        ))}
      </div>

      {/* Modal de edición simple */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar producto</h3>
            <form onSubmit={handleEditSubmit}>
              <label>Nombre</label>
              <input value={editValues.nombre_producto} onChange={e => setEditValues({...editValues, nombre_producto: e.target.value})} />
              <label>Precio</label>
              <input type="number" value={editValues.precio} onChange={e => setEditValues({...editValues, precio: e.target.value})} />
              <label>Tamaño</label>
              <input value={editValues.tamaño} onChange={e => setEditValues({...editValues, tamaño: e.target.value})} />
              <label>Stock</label>
              <input type="number" value={editValues.stock} onChange={e => setEditValues({...editValues, stock: e.target.value})} />
              <div style={{ marginTop: 12, display:'flex', gap:8 }}>
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setEditingProduct(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Producto */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <h3>Agregar producto</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background:'transparent', border:'none', fontSize:18, cursor:'pointer' }}>✕</button>
            </header>

            <form onSubmit={handleAddSubmit}>
              <label>Nombre *</label>
              <input name="nombre_producto" value={addForm.nombre_producto} onChange={handleAddChange} placeholder="Nombre del producto" />

              <label>Descripción</label>
              <textarea name="descripcion" value={addForm.descripcion} onChange={handleAddChange} placeholder="Descripción breve" />

              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                <div style={{ flex:1 }}>
                  <label>Tamaño</label>
                  <input name="tamaño" value={addForm.tamaño} onChange={handleAddChange} placeholder="Ej: 250 ml / Grande" />
                </div>
                <div style={{ flex:1 }}>
                  <label>Precio *</label>
                  <input name="precio" value={addForm.precio} onChange={handleAddChange} type="number" placeholder="25000" />
                </div>
                <div style={{ width:110 }}>
                  <label>Stock</label>
                  <input name="stock" value={addForm.stock} onChange={handleAddChange} type="number" placeholder="10" />
                </div>
              </div>

              <label style={{ marginTop:8 }}>Imagen (opcional)</label>
              <input type="file" accept="image/*" onChange={handleAddFile} />

              <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
                <button type="submit" disabled={addLoading} style={{ padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer' }}>
                  {addLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding:'8px 12px', borderRadius:8, border:'none', background:'#f3f4f6', cursor:'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
