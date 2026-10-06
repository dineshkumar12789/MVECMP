import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Zap } from 'lucide-react';
import { StarRating } from './StarRating';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductCard = ({ product, onToast }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const effectivePrice = discountPrice !== null ? discountPrice : price;
  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (onToast) onToast('Please sign in to add items to your cart', 'info');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      if (onToast) onToast(`Added "${product.name.slice(0, 25)}..." to cart`, 'success');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      if (onToast) onToast(err.response?.data?.message || err.message || 'Failed to add item', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-xl hover:border-gray-300 transition-all duration-200">
      <div>
        {/* Product Image & Badges */}
        <Link to={`/product/${product.id}`} className="block relative overflow-hidden rounded-md bg-gray-50 aspect-square mb-3">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={product.name}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300 p-2"
            loading="lazy"
          />

          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-[#cc0c39] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
              {discountPercent}% off
            </span>
          )}

          {product.vendor && (
            <span className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
              {product.vendor.name}
            </span>
          )}
        </Link>

        {/* Product Title */}
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-amazon-orange transition-colors leading-snug mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        {/* Price Block */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-semibold text-gray-500">$</span>
            <span className="text-2xl font-bold text-gray-900">
              {Math.floor(effectivePrice)}
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {(effectivePrice % 1).toFixed(2).substring(2)}
            </span>

            {discountPrice && (
              <span className="text-xs text-gray-500 line-through ml-1.5">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center text-[11px] font-bold text-amazon-blue">
              <Zap className="w-3 h-3 fill-amber-400 text-amber-500 mr-0.5" /> Prime
            </span>
            <span className="text-[11px] text-gray-600">FREE Next-Day Delivery</span>
          </div>
        </div>

        {/* Stock status */}
        <div className="text-[11px] mb-3">
          {product.stockQuantity > 5 ? (
            <span className="text-emerald-700 font-semibold">In Stock</span>
          ) : product.stockQuantity > 0 ? (
            <span className="text-rose-600 font-bold">Only {product.stockQuantity} left in stock - order soon</span>
          ) : (
            <span className="text-gray-400 font-medium">Currently Unavailable</span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stockQuantity === 0}
          className={`w-full text-xs font-bold py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all duration-150 ${
            added
              ? 'bg-emerald-600 text-white'
              : product.stockQuantity === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 shadow-xs hover:shadow active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added to Cart
            </>
          ) : adding ? (
            <span>Adding...</span>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};
