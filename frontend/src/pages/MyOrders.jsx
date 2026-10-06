import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  Search, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { Toast } from '../components/Toast';

export const MyOrders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ 
    message: location.state?.orderSuccess ? `Order #${location.state.orderNumber} placed successfully!` : '', 
    type: 'success' 
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      if (res.data?.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load order history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'PLACED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(term) ||
      order.orderItems.some((item) => item.productName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track packages, view receipts, and manage recent purchases</p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search all orders..."
            className="w-full text-xs bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-amber-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-500 mb-6">
            {searchTerm ? 'No orders match your search criteria.' : "You haven't placed any orders yet."}
          </p>
          <Link to="/" className="btn-amazon-primary text-xs font-bold px-6 py-2 inline-flex items-center gap-1.5">
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Order Meta Bar */}
                <div className="bg-gray-50 px-6 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-gray-600">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500">Order Placed</span>
                      <span className="font-semibold text-gray-900">{formattedDate}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500">Total</span>
                      <span className="font-semibold text-gray-900">${Number(order.totalAmount).toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500">Ship To</span>
                      <span className="font-semibold text-gray-900 truncate max-w-[120px] block" title={order.shippingName}>
                        {order.shippingName}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-500">Payment</span>
                      <span className="font-semibold text-gray-900">
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-gray-500">Order #</span>
                    <span className="font-mono text-gray-800 font-semibold">{order.orderNumber}</span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Status Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-600 font-medium">
                        {order.status === 'DELIVERED'
                          ? 'Package was handed to resident'
                          : order.status === 'SHIPPED'
                          ? 'In transit with Amazon Express Carrier'
                          : order.status === 'CANCELLED'
                          ? 'This order has been cancelled'
                          : 'Preparing for dispatch by merchant'}
                      </span>
                    </div>

                    {/* Simple Step Indicator */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${order.status === 'PLACED' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100'}`}>Placed</span>
                      <span>→</span>
                      <span className={`px-2 py-0.5 rounded ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100'}`}>Shipped</span>
                      <span>→</span>
                      <span className={`px-2 py-0.5 rounded ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100'}`}>Delivered</span>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={item.productName}
                            className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-1.5 border border-gray-100"
                          />
                          <div>
                            <Link
                              to={`/product/${item.product?.id || 1}`}
                              className="font-bold text-gray-900 hover:text-amazon-orange text-sm line-clamp-1"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-gray-500 mt-0.5">Quantity: <strong className="text-gray-800">{item.quantity}</strong></p>
                            <p className="text-gray-500">Price: ${Number(item.priceAtPurchase).toFixed(2)} each</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center w-full sm:w-auto">
                          <Link
                            to={`/product/${item.product?.id || 1}`}
                            className="btn-amazon-primary text-xs font-bold py-1.5 px-4 rounded-full text-center flex-1 sm:flex-none"
                          >
                            Buy it again
                          </Link>
                          <Link
                            to={`/product/${item.product?.id || 1}`}
                            className="btn-amazon-neutral text-xs font-semibold py-1.5 px-3 rounded-full text-center flex-1 sm:flex-none"
                          >
                            View item
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address summary */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center text-[11px] text-gray-500">
                    <p>
                      <strong>Delivering to:</strong> {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingPostalCode} • Phone: {order.shippingPhone}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
