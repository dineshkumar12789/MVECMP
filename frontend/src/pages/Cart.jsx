import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const Cart = () => {
  const { cartItems, totalAmount, totalCount, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [isGift, setIsGift] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#f08804]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Amazon Cart is empty</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your shopping cart is waiting. Give it purpose — fill it with electronics, clothing, books, and more from verified marketplace vendors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-amazon-primary text-xs font-bold px-8 py-2.5">
              Explore Today's Deals
            </Link>
            {!user && (
              <Link to="/login" className="btn-amazon-neutral text-xs font-bold px-6 py-2.5">
                Sign In to Your Account
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 35;
  const qualifiesForFreeShipping = totalAmount >= freeShippingThreshold;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          
          {/* Free Shipping Alert Bar */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              {qualifiesForFreeShipping ? (
                <span>
                  <strong className="font-bold">Part of your order qualifies for FREE Delivery.</strong> Choose this option at checkout.
                </span>
              ) : (
                <span>
                  Add <strong className="font-bold">${(freeShippingThreshold - totalAmount).toFixed(2)}</strong> of eligible items to get <strong>FREE Express Delivery</strong>.
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center border-b pb-2 text-xs text-gray-500">
            <span>Items ({totalCount})</span>
            <span>Price</span>
          </div>

          {/* List of items */}
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => {
              const product = item.product;
              const unitPrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
              const subtotal = unitPrice * item.quantity;

              return (
                <div key={item.id} className="py-5 flex flex-col sm:flex-row gap-4 justify-between">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex gap-4">
                    <Link to={`/product/${product.id}`} className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-center">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </Link>

                    <div className="space-y-1">
                      <Link
                        to={`/product/${product.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-amazon-orange line-clamp-2"
                      >
                        {product.name}
                      </Link>

                      {product.vendor && (
                        <p className="text-[11px] text-gray-500">
                          Sold by: <span className="text-amazon-blue">{product.vendor.name}</span>
                        </p>
                      )}

                      <div className="text-[11px] font-semibold text-emerald-700">
                        In Stock ({product.stockQuantity} available)
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-amazon-blue font-bold">
                        <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>Prime eligible</span>
                      </div>

                      {/* Quantity Stepper & Delete */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-50">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= product.stockQuantity}
                            className="p-1 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-gray-300">|</span>

                        <button
                          onClick={() => {
                            removeFromCart(item.id);
                            showToast('Item removed from cart', 'info');
                          }}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Unit & Subtotal Price */}
                  <div className="text-right sm:self-start">
                    <span className="text-base font-bold text-gray-900 block">
                      ${subtotal.toFixed(2)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[11px] text-gray-500 block">
                        (${unitPrice.toFixed(2)} each)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subtotal Footer */}
          <div className="border-t pt-4 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="text-xs text-gray-500 hover:text-rose-600 hover:underline"
            >
              Clear entire cart
            </button>
            <div className="text-right">
              <span className="text-sm text-gray-600">Subtotal ({totalCount} items): </span>
              <span className="text-lg font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 sticky top-24">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-gray-700">Subtotal ({totalCount} items):</span>
              <span className="text-2xl font-extrabold text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-500">Shipping & taxes calculated at checkout.</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="gift"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
              className="rounded text-amazon-orange focus:ring-amazon-orange cursor-pointer"
            />
            <label htmlFor="gift" className="text-xs text-gray-700 cursor-pointer">
              This order contains a gift (include gift receipt)
            </label>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full btn-amazon-primary text-xs font-bold py-3 flex items-center justify-center gap-2 shadow-md"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 border-t space-y-2 text-[11px] text-gray-500">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Amazon A-to-Z Safe Guarantee</span>
            </div>
            <p>Every purchase from marketplace vendors is protected by Amazon 100% money back guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
