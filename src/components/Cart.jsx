import React from 'react';
import { useCart } from '../context/CartContext';
import { X } from 'lucide-react';
import {useNavigate } from "react-router-dom";
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, isCartOpen, toggleCart } = useCart();
  const Navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={toggleCart}></div>
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito</h2>
          <button onClick={toggleCart} className="close-cart-btn">
            <X size={24} />
          </button>
        </div>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>
                    {item.quantity} x ${item.price.toLocaleString('es-CO')}
                  </p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="remove-item-btn">
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <button className="checkout-btn" onClick={() => Navigate("/InterfazComprar")}>Finalizar Compra</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
