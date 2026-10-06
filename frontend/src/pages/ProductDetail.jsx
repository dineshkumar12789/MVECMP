import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  Store, 
  ChevronRight,
  CheckCircle2,
  Lock,
  Heart
} from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { Toast } from '../components/Toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(res => {
        if (res.data?.data) setProduct(res.data.data);
      })
      .catch(err => {
        console.error(err);
        showToast('Product not found or unavailable', 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <Link to="/" className="btn-amazon-primary text-xs font-bold px-6 py-2">
          Back to Homepage
        </Link>
      </div>
    );
  }

  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const effectivePrice = discountPrice !== null ? discountPrice : price;
  const discountPercent = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      showToast(`Added ${quantity} item(s) to your cart!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to add item', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to process Buy Now', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-amazon-orange">Home</Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <Link to={`/?categoryId=${product.category.id}`} className="hover:text-amazon-orange">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-sm">{product.name}</span>
        </nav>

        {/* Product Details Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Image Showcase (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center overflow-hidden relative group">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-[#cc0c39] text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              Roll over image to zoom in
            </p>
          </div>

          {/* Column 2: Center Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
                {product.name}
              </h1>

              {/* Vendor Attribution */}
              {product.vendor && (
                <div className="flex items-center gap-1.5 text-xs text-amazon-blue hover:text-amazon-orange cursor-pointer mb-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>Visit the {product.vendor.name} Store</span>
                </div>
              )}

              {/* Star Rating */}
              <div className="flex items-center gap-3 border-b pb-3">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
                <span className="text-gray-300">|</span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase Guarantee
                </span>
              </div>
            </div>

            {/* Price Details */}
            <div className="space-y-1 border-b pb-4">
              <div className="flex items-baseline gap-2">
                {discountPercent > 0 && (
                  <span className="text-2xl font-light text-[#cc0c39]">
                    -{discountPercent}%
                  </span>
                )}
                <div className="flex items-start">
                  <span className="text-sm font-semibold mt-1">$</span>
                  <span className="text-3xl font-extrabold text-gray-900">{Math.floor(effectivePrice)}</span>
                  <span className="text-sm font-semibold mt-1">{(effectivePrice % 1).toFixed(2).substring(2)}</span>
                </div>
              </div>

              {discountPrice && (
                <p className="text-xs text-gray-500">
                  Typical price: <span className="line-through">${price.toFixed(2)}</span>
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <span className="inline-flex items-center text-xs font-black text-amazon-blue">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-500 mr-0.5" /> Prime
                </span>
                <span className="text-xs text-gray-600">One-Day Delivery & Free Returns</span>
              </div>
            </div>

            {/* Description Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900">About this item</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description || 'High quality product curated by verified marketplace merchants.'}
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t text-center text-[11px] text-gray-600">
                <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                  <Truck className="w-5 h-5 text-amazon-blue mb-1" />
                  <span>Amazon Delivered</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                  <RotateCcw className="w-5 h-5 text-amazon-blue mb-1" />
                  <span>30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                  <ShieldCheck className="w-5 h-5 text-amazon-blue mb-1" />
                  <span>Secure Transaction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Buy Box (3 cols) */}
          <div className="md:col-span-3">
            <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm space-y-4 sticky top-24">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  ${effectivePrice.toFixed(2)}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  FREE delivery <span className="font-bold text-gray-800">Tomorrow, 2 PM - 6 PM</span>
                </p>
                <p className="text-xs text-amazon-blue mt-0.5">
                  Deliver to {user?.name || 'your registered address'}
                </p>
              </div>

              {/* Stock Status */}
              <div>
                {product.stockQuantity > 5 ? (
                  <span className="text-base font-bold text-emerald-700 block">In Stock</span>
                ) : product.stockQuantity > 0 ? (
                  <span className="text-sm font-bold text-rose-600 block">
                    Only {product.stockQuantity} left in stock - order soon.
                  </span>
                ) : (
                  <span className="text-base font-bold text-rose-600 block">Currently Unavailable</span>
                )}
              </div>

              {/* Quantity Select */}
              {product.stockQuantity > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="qty" className="text-xs font-semibold text-gray-700">Quantity:</label>
                  <select
                    id="qty"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1 text-xs font-medium outline-none cursor-pointer"
                  >
                    {[...Array(Math.min(10, product.stockQuantity))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stockQuantity === 0}
                  className="w-full btn-amazon-primary text-xs font-bold py-2.5 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={adding || product.stockQuantity === 0}
                  className="w-full btn-amazon-secondary text-xs font-bold py-2.5 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-gray-900" />
                  Buy Now
                </button>
              </div>

              {/* Seller details */}
              <div className="text-[11px] space-y-1 pt-3 border-t text-gray-500">
                <div className="flex justify-between">
                  <span>Ships from</span>
                  <span className="text-gray-900 font-medium">Amazon Fulfillment</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by</span>
                  <span className="text-amazon-blue font-medium hover:underline cursor-pointer">
                    {product.vendor?.name || 'Verified Merchant'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Returns</span>
                  <span className="text-gray-900">Eligible for 30-day return</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-gray-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-gray-500" /> Payment
                  </span>
                  <span>Secure transaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
