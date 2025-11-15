import React, { useState } from 'react'
import './ProductCard.css'
import { useCart } from '../context/CartContext'
import ImagenProducto from "../assets/Imagen_producto.png";

const IconHeart = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden>
    <path
      d="M12 21s-7-4.6-9.5-7.2C-0.3 9 4 4 7.5 6.5 9.1 7.8 12 11 12 11s2.9-3.2 4.5-4.5C20 4 24.3 9 21.5 12.8 19 15.4 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconCart = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 6h15l-1.5 9h-11zM6 6L4 2H2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="20" r="1" fill="currentColor" />
    <circle cx="18" cy="20" r="1" fill="currentColor" />
  </svg>
)

const IconEye = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 5C6 5 2 9 2 12s4 7 10 7 10-3 10-7-4-7-10-7zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const IconClose = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Star = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.17L12 18.896 4.664 23.167l1.402-8.17L.132 9.21l8.2-1.192z" />
  </svg>
)

const ProductCard = ({ product = {} }) => {
  const { addToCart } = useCart()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const title = product.nombre_producto ?? product.name ?? 'Producto'
  const desc = product.descripcion ?? product.description ?? ''
  const precioNum = Number(product.precio ?? product.price ?? 0)
  const priceFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precioNum)
  const imageUrl = product.imagen_producto ?? product.ImagenProducto ?? ImagenProducto
  const rating = product.rating ?? 4.5
  const category = product.categoria ?? product.categoria_producto ?? 'General'
  const badge = product.badge ?? product.oferta ?? ''
  const stock = Number(product.stock ?? 0)
  const tamaño = product.tamaño ?? product.tamano ?? product.size ?? 'Estándar'

  const handleAddToCart = () => {
    addToCart({
      id: product.id_producto || product.id || Math.random(),
      name: title,
      price: precioNum,
      image: imageUrl,
    })
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleViewDetails = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <>
      <article className="pcard">
        <div className="pcard-imageWrap">
          <img className="pcard-image" src={imageUrl || '/placeholder.svg'} alt={title} />

          {badge && <span className="pcard-badge">{badge}</span>}

          <div className="pcard-actions">
            <button 
              className="pcard-action-btn pcard-favorite" 
              aria-label="Agregar a favoritos"
              onClick={toggleFavorite}
              title="Agregar a favoritos"
            >
              <IconHeart size={20} filled={isFavorite} />
            </button>
            <button 
              className="pcard-action-btn pcard-view-details" 
              aria-label="Ver detalles"
              onClick={handleViewDetails}
              title="Ver detalles"
            >
              <IconEye size={20} />
            </button>
            <button 
              className="pcard-action-btn pcard-add-to-cart" 
              aria-label="Agregar al carrito"
              onClick={handleAddToCart}
              title="Agregar al carrito"
            >
              <IconCart size={20} />
              <span className="btn-text">Agregar</span>
            </button>
          </div>
        </div>

        <div className="pcard-body">
          <div className="pcard-meta">{category}</div>

          <h3 className="pcard-title">{title}</h3>

          <p className="pcard-desc">{desc}</p>

          <div className="pcard-footer">
            <div className="pcard-rating" title={`${rating} de 5`}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} />
              ))}
              <span className="pcard-ratingValue">{rating}</span>
            </div>
            <div className="pcard-price">{priceFormatted}</div>
          </div>
        </div>
      </article>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Cerrar">
              <IconClose size={28} />
            </button>

            <div className="modal-body">
              <div className="modal-image">
                <img src={imageUrl || '/placeholder.svg'} alt={title} />
                {badge && <span className="modal-badge">{badge}</span>}
              </div>

              <div className="modal-info">
                <div className="modal-meta">{category}</div>
                <h2 className="modal-title">{title}</h2>

                <div className="modal-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} />
                  ))}
                  <span className="modal-ratingValue">{rating} de 5</span>
                </div>

                <p className="modal-description">{desc}</p>

                <div className="modal-details">
                  <div className="detail-item">
                    <span className="detail-label">Tamaño:</span>
                    <span className="detail-value">{tamaño}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Stock disponible:</span>
                    <span className="detail-value">{stock} unidades</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Precio:</span>
                    <span className="detail-value-price">{priceFormatted}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="modal-btn modal-favorite"
                    onClick={toggleFavorite}
                    aria-label="Agregar a favoritos"
                  >
                    <IconHeart size={20} filled={isFavorite} />
                    <span>{isFavorite ? 'Agregado' : 'Favorito'}</span>
                  </button>
                  <button 
                    className="modal-btn modal-add-cart"
                    onClick={handleAddToCart}
                    aria-label="Agregar al carrito"
                  >
                    <IconCart size={20} />
                    <span>Agregar al carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductCard
