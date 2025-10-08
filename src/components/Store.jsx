// src/components/Store.jsx  (actualiza con estas funciones)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cards from "./CardsP";
import defaultImage from "../assets/Imagen_Login.png";
import "./Store.css";

const Store = ({ user }) => {
  // ... mantén tu código de estado y fetch products ...
  const { storeId: routeStoreId } = useParams();
  const [storeId, setStoreId] = useState(routeStoreId || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para edición modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editValues, setEditValues] = useState({ nombre_producto: "", precio: 0, tamaño: "", stock: 0 });

  // fetchProducts (igual que antes) -> deberías tener una función que carga productos
  const fetchProducts = async (currentStoreId) => {
    setLoading(true);
    try {
      // ... usa la lógica que ya tenías para obtener products ...
      let productsRes = await fetch(`http://localhost:3001/stores/${currentStoreId}/products`);
      if (!productsRes.ok) productsRes = await fetch(`http://localhost:3001/products?storeId=${currentStoreId}`);
      const json = await productsRes.json();
      const arr = json.data || json;
      const normalized = (Array.isArray(arr) ? arr : []).map(p => ({
        id: p.id_producto ?? p.id ?? p.productId ?? Math.random().toString(36).slice(2,9),
        title: p.nombre_producto ?? p.name ?? p.title ?? "Producto",
        category: p.categoria ?? p.category ?? "General",
        price: Number(p.precio ?? p.price ?? 0),
        image: p.imageUrl ?? p.image ?? p.imagen ?? defaultImage,
        raw: p,
      }));
      setProducts(normalized);
    } catch (err) {
      console.error(err);
      setError("Error cargando productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // ... lógica para obtener currentStoreId similar a la que ya tenías...
      let currentStoreId = routeStoreId || storeId;
      if (!currentStoreId) {
        const saved = localStorage.getItem("user");
        if (!saved) { setError("Usuario no autenticado"); setLoading(false); return; }
        const userObj = JSON.parse(saved);
        const storesRes = await fetch(`http://localhost:3001/stores?ownerId=${userObj.id}`);
        const storesJson = await storesRes.json();
        const storesArray = storesJson.data || storesJson;
        if (Array.isArray(storesArray) && storesArray.length > 0) {
          currentStoreId = storesArray[0].id_tienda || storesArray[0].id || storesArray[0].storeId;
          setStoreId(currentStoreId);
        } else { setError("No hay tiendas"); setLoading(false); return; }
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
    // inicializar editValues con datos reales (usa raw para nombres reales)
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

  return (
    <div className="store-page">
      <div className="store-header">
        <div>
          <h1>Tienda</h1>
          <p>Aquí puedes explorar y comprar nuestros productos.</p>
        </div>
      </div>

      {loading && <p className="muted">Cargando productos...</p>}
      {error && <p className="error">{error}</p>}

      <div className="products-grid">
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
    </div>
  );
};

export default Store;
