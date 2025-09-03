import { ShoppingCart, Eye, Heart } from "lucide-react";
import "./ProductCard.css";

const ProductCard = ({ product, onAddToCart, onViewDetails, onLike }) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      alert(`Agregado al carrito: ${product.name}`);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      alert(`Ver detalles de: ${product.name}`);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(product);
    } else {
      alert(`Te gusta: ${product.name}`);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || "/placeholder-product.png"} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">${product.price?.toLocaleString("es-CO")}</div>
      </div>

      <div className="product-actions">
        <button className="product-btn product-btn-add" onClick={handleAddToCart}>
          <ShoppingCart size={18} />
          <span>Agregar</span>
        </button>
        
        <button className="product-btn product-btn-details" onClick={handleViewDetails}>
          <Eye size={18} />
          <span>Detalles</span>
        </button>
        
        <button className="product-btn product-btn-like" onClick={handleLike}>
          <Heart size={18} />
          <span>Me gusta</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;