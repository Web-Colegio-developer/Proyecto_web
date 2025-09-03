import { useState } from "react";
import ProductCard from "./ProductCard";
import "./ProductsGrid.css";

// Mock data for products - in a real app this would come from an API
const mockProducts = [
  {
    id: 1,
    name: "Cuaderno Universitario",
    description: "Cuaderno de 100 hojas, cuadriculado, ideal para tomar apuntes",
    price: 8500,
    image: "/cuaderno.jpg"
  },
  {
    id: 2,
    name: "Bolígrafo Azul",
    description: "Bolígrafo de tinta azul, punta fina, escritura suave",
    price: 2500,
    image: "/boligrafo.jpg"
  },
  {
    id: 3,
    name: "Lápiz HB",
    description: "Lápiz de grafito HB, ideal para dibujo y escritura",
    price: 1500,
    image: "/lapiz.jpg"
  },
  {
    id: 4,
    name: "Borrador",
    description: "Borrador blanco, no deja residuos, borrado limpio",
    price: 1200,
    image: "/borrador.jpg"
  },
  {
    id: 5,
    name: "Regla 30cm",
    description: "Regla transparente de 30cm con medidas en centímetros",
    price: 3000,
    image: "/regla.jpg"
  },
  {
    id: 6,
    name: "Resaltador Amarillo",
    description: "Resaltador fluorescente amarillo, tinta de larga duración",
    price: 4500,
    image: "/resaltador.jpg"
  },
  {
    id: 7,
    name: "Calculadora Básica",
    description: "Calculadora básica para operaciones matemáticas simples",
    price: 15000,
    image: "/calculadora.jpg"
  },
  {
    id: 8,
    name: "Compás Escolar",
    description: "Compás para geometría, con lápiz incluido",
    price: 12000,
    image: "/compas.jpg"
  }
];

const ProductsGrid = () => {
  const [products] = useState(mockProducts);

  const handleAddToCart = (product) => {
    // In a real app, this would add to a cart state or send to backend
    alert(`¡${product.name} agregado al carrito!`);
  };

  const handleViewDetails = (product) => {
    // In a real app, this would navigate to a product detail page
    alert(`Mostrando detalles de: ${product.name}\n\nPrecio: $${product.price?.toLocaleString("es-CO")}\nDescripción: ${product.description}`);
  };

  const handleLike = (product) => {
    // In a real app, this would save to user preferences or backend
    alert(`¡Te gusta ${product.name}! ❤️`);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Tienda del Colegio</h1>
        <p>Encuentra todos los útiles escolares que necesitas</p>
      </div>
      
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsGrid;