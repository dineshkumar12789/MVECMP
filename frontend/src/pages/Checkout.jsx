import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';
import api from '../api/client';

export const Checkout = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Address form fields
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState('+1-800-555-0100');
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace');
  const [shippingCity, setShippingCity] = useState('Springfield');
  const [shippingState, setShippingState] = useState('Oregon');
  const [shippingPostalCode, setShippingPostalCode] = useState('97477');
  const [saveAddress, setSaveAddress] = useState(true);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or MOCK_ONLINE
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  // Load user saved addresses
  useEffect(() => {
    if (user) {
      api.get('/user/addresses')
        .then(res => {
          const list = res.data?.data || [];
          setSavedAddresses(list);
          if (list.length > 0) {
            const def = list.find(a => a.isDefault) || list[0];
            setSelectedAddressId(def.id);
            setShippingName(def.fullName);
            setShippingPhone(def.phoneNumber);
            setShippingAddress(def.streetAddress);
            setShippingCity(def.city);
            setShippingState(def.state);
            setShippingPostalCode(def.postalCode);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  // When user selects a saved address radio
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShippingName(addr.fullName);
    setShippingPhone(addr.phoneNumber);
    setShippingAddress(addr.streetAddress);
    setShippingCity(addr.city);
    setShippingState(addr.state);
    setShippingPostalCode(addr.postalCode);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPostalCode) {
      showToast('Please fill in all shipping address fields', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/cart');
      return;
    }

    try {
      setPlacingOrder(true);
      const payload = {
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPostalCode,
        paymentMethod,
        saveAddress: selectedAddressId === 'new' ? saveAddress : false
      };

      const res = await api.post('/orders', payload);
      if (res.data?.success) {
        await clearCart();
        navigate('/orders', { 
          state: { 
            orderSuccess: true, 
            orderNumber: res.data.data.orderNumber 
          } 
        });
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Checkout Header */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-8">
        <Link to="/" className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight text-gray-900">
            amazon<span className="text-[#febd69] font-normal text-sm ml-0.5">checkout</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>SSL 256-Bit Secure Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-gray-950 text-xs font-black flex items-center justify-center">1</span>
              <span>Delivery Address</span>
            </h2>

            {/* Saved addresses selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-xs font-bold text-gray-700">Select from saved addresses:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3.5 rounded-lg border cursor-pointer text-xs transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 font-medium'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-bold text-gray-900">
                        <span>{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Default</span>
                        )}
                      </div>
                      <p className="text-gray-600">{addr.streetAddress}</p>
                      <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-gray-500 mt-1">Phone: {addr.phoneNumber}</p>
                    </div>
                  ))}

                  <div
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-3.5 rounded-lg border border-dashed cursor-pointer text-xs flex items-center justify-center gap-1.5 font-bold text-amazon-blue hover:bg-gray-50 transition-all ${
                      selectedAddressId === 'new' ? 'border-amber-500 bg-amber-50/50' : 'border-gray-300'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter a new delivery address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Form */}
            {(savedAddresses.length === 0 || selectedAddressId === 'new') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500"
                    placeholder="Recipient's Name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500"
                    placeholder="Mobile for delivery updates"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="rounded text-amazon-orange focus:ring-amazon-orange cursor-pointer"
                  />
                  <label htmlFor="saveAddress" className="text-gray-700 cursor-pointer">
                    Save this address to your address book for future orders
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-gray-950 text-xs font-black flex items-center justify-center">2</span>
              <span>Payment Method</span>
            </h2>

            <div className="space-y-3 text-xs">
              {/* Cash on delivery option */}
              <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-0.5 text-amazon-orange focus:ring-amazon-orange"
                />
                <div>
                  <span className="font-bold text-gray-900 block text-sm">Cash on Delivery (COD)</span>
                  <p className="text-gray-500 mt-0.5">Pay in cash or UPI scan upon receiving your parcel at your doorstep.</p>
                </div>
              </label>

              {/* Mock Online Card Payment */}
              <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                paymentMethod === 'MOCK_ONLINE' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'MOCK_ONLINE'}
                  onChange={() => setPaymentMethod('MOCK_ONLINE')}
                  className="mt-0.5 text-amazon-orange focus:ring-amazon-orange"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">Credit / Debit Card (Mock Online Payment)</span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 mt-0.5">Instant simulated payment clearance (Visa, Mastercard, Amex).</p>

                  {paymentMethod === 'MOCK_ONLINE' && (
                    <div className="mt-4 pt-3 border-t border-amber-200 grid grid-cols-2 gap-3 max-w-sm">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full border border-gray-300 rounded p-2 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Expires</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full border border-gray-300 rounded p-2 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Security Code (CVV)</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full border border-gray-300 rounded p-2 text-xs bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Review Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-gray-950 text-xs font-black flex items-center justify-center">3</span>
              <span>Review Items & Delivery</span>
            </h2>

            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={item.product.name}
                      className="w-12 h-12 object-contain bg-gray-50 rounded p-1 border"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${((item.product.discountPrice ? item.product.discountPrice : item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary & Place Order Box (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 sticky top-24">
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full btn-amazon-primary text-sm font-bold py-3.5 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {placingOrder ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
                <span>Securing your order...</span>
              </div>
            ) : (
              <span>Place Your Order</span>
            )}
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-tight">
            By placing your order, you agree to Amazon's privacy notice and conditions of use.
          </p>

          <div className="border-t pt-4 space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 text-sm">Order Summary</h3>
            <div className="flex justify-between text-gray-600">
              <span>Items:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping & handling:</span>
              <span className="text-emerald-700 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated tax:</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-base font-extrabold text-rose-700">
              <span>Order Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 border-t text-[11px] text-gray-500 space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
              <Truck className="w-3.5 h-3.5 text-amazon-blue" />
              <span>Guaranteed Delivery within 2-3 Business Days</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Vendor A-to-Z Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
