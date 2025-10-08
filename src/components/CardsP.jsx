// src/components/CardsP.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Heart, Maximize2, ShoppingCart, Star } from "lucide-react";
import "./Cardsp.css";

const Card = ({ product = {}, onFavorite, onView, onAddToCart, onEditClick, onDeleteClick }) => {
  const {
    id = "1",
    title = "Producto",
    category = "General",
    price = 0,
    image,
    badge = null,
    rating = 4.5,
  } = product;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú si click fuera
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const priceFormatted =
    typeof price === "number"
      ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(price)
      : price;

  return (
    <article className="product-card">
      <div className="product-media">
        {badge && <span className="product-badge">{badge}</span>}
        <img src={image} alt={title} className="product-image" />

        {/* acciones flotantes (favorito, ver, carrito) */}
        <div className="product-actions">
          <button className="action-btn" aria-label="Favorito" onClick={() => onFavorite && onFavorite(id)}>
            <Heart />
          </button>
          <button className="action-btn" aria-label="Ver" onClick={() => onView && onView(id)}>
            <Maximize2 />
          </button>
          <button className="action-btn add-to-cart" aria-label="Agregar al carrito" onClick={() => onAddToCart && onAddToCart(id)}>
            <ShoppingCart />
          </button>
        </div>

        {/* botón de menú (tres puntos) */}
        <div className="card-menu-trigger" ref={menuRef}>
          <button className="menu-trigger-btn" onClick={() => setMenuOpen(prev => !prev)} aria-label="Más opciones">
            ⋮
          </button>

          {menuOpen && (
            <div className="card-menu">
              <button
                className="card-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  onEditClick && onEditClick(product);
                }}
              >
                Actualizar
              </button>
              <button
                className="card-menu-item destructive"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteClick && onDeleteClick(product);
                }}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="product-body">
        <p className="product-category">{category}</p>
        <h3 className="product-title">{title}</h3>
        <div className="product-row">
          <div className="product-price">{priceFormatted}</div>
          <div className="product-rating">
            <Star />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

Card.propTypes = {
  product: PropTypes.object,
  onFavorite: PropTypes.func,
  onView: PropTypes.func,
  onAddToCart: PropTypes.func,
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
};

export default Card;
