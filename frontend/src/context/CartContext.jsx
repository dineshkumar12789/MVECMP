import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      setTotalAmount(0);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.data) {
        setCartItems(res.data.data.items || []);
        setTotalAmount(res.data.data.totalAmount || 0);
        setTotalCount(res.data.data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      throw new Error('Please sign in to add products to your cart.');
    }

    const res = await api.post('/cart/items', { productId, quantity });
    await fetchCart();
    return res.data;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!token) return;
    const res = await api.put(`/cart/items/${cartItemId}?quantity=${quantity}`);
    await fetchCart();
    return res.data;
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;
    const res = await api.delete(`/cart/items/${cartItemId}`);
    await fetchCart();
    return res.data;
  };

  const clearCart = async () => {
    if (!token) return;
    await api.delete('/cart');
    setCartItems([]);
    setTotalAmount(0);
    setTotalCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        totalCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
