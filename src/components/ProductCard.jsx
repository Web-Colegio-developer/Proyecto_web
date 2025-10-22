import React from "react";
import "./ProductCard.css";
import ImagenProducto from "../assets/imagen_producto.png"; // tu imagen estática

/* Íconos SVG inline */
const IconHeart = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 21s-7-4.6-9.5-7.2C-0.3 9 4 4 7.5 6.5 9.1 7.8 12 11 12 11s2.9-3.2 4.5-4.5C20 4 24.3 9 21.5 12.8 19 15.4 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconExpand = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 9V5h4M19 15v4h-4M5 15v4h4M19 9V5h-4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCart = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 6h15l-1.5 9h-11zM6 6L4 2H2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="20" r="1" fill="currentColor" />
    <circle cx="18" cy="20" r="1" fill="currentColor" />
  </svg>
);

const Star = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.17L12 18.896 4.664 23.167l1.402-8.17L.132 9.21l8.2-1.192z" />
  </svg>
);

const ProductCard = ({ product = {} }) => {
  const title = product.nombre_producto ?? product.name ?? "Producto";
  const desc = product.descripcion ?? product.description ?? "";
  const precioNum = Number(product.precio ?? product.price ?? 0);
  const priceFormatted = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(precioNum);

  const rating = product.rating ?? 4.5;
  const category = product.categoria ?? product.categoria_producto ?? "General";
  const badge = product.badge ?? product.oferta ?? "";

  return (
    <article className="pcard">
      <div className="pcard-imageWrap">
        {/* ✅ Imagen fija importada */}
        <img className="pcard-image" src={ImagenProducto} alt={title} />

        {badge && <span className="pcard-badge">{badge}</span>}

        <div className="pcard-icons">
          <button className="pcard-iconBtn" aria-label="Like"><IconHeart /></button>
          <button className="pcard-iconBtn" aria-label="Expand"><IconExpand /></button>
          <button className="pcard-iconBtn" aria-label="Add to cart"><IconCart /></button>
        </div>
      </div>

      <div className="pcard-body">
        <div className="pcard-meta">{category}</div>

        <div className="pcard-titleRow">
          <h3 className="pcard-title">{title}</h3>

          <div className="pcard-rating" title={`${rating} de 5`}>
            <Star />
            <span className="pcard-ratingValue">{rating}</span>
          </div>
        </div>

        <p className="pcard-desc">{desc}</p>

        <div className="pcard-price">{priceFormatted}</div>
      </div>
    </article>
  );
};

export default ProductCard;
