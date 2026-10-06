import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Tags, 
  Store, 
  ShoppingBag, 
  Users, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  ChevronRight
} from 'lucide-react';
import api from '../../api/client';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, categories, vendors, orders, users
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  // 1. OVERVIEW DATA
  const [overviewStats, setOverviewStats] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // 2. PRODUCTS DATA & MODAL
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productKeyword, setProductKeyword] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stockQuantity: '',
    imageUrl: '',
    categoryId: '',
    vendorId: '',
    isActive: true
  });

  // 3. CATEGORIES DATA & MODAL
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    iconUrl: ''
  });

  // 4. VENDORS DATA & MODAL
  const [vendors, setVendors] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
    logoUrl: '',
    isActive: true
  });

  // 5. ORDERS DATA
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);

  // 6. USERS DATA
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userLoading, setUserLoading] = useState(false);

  // Fetch helpers
  const loadOverview = async () => {
    setOverviewLoading(true);
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.data) setOverviewStats(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load overview statistics', 'error');
    } finally {
      setOverviewLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', productPage);
      params.set('size', 8);
      if (productKeyword) params.set('keyword', productKeyword);
      const res = await api.get(`/admin/products?${params.toString()}`);
      if (res.data?.data) {
        setProducts(res.data.data.content || []);
        setProductTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch products', 'error');
    } finally {
      setProductLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoryLoading(true);
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.data) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch categories', 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const loadVendors = async () => {
    setVendorLoading(true);
    try {
      const res = await api.get('/admin/vendors');
      if (res.data?.data) setVendors(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch vendors', 'error');
    } finally {
      setVendorLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrderLoading(true);
    try {
      const res = await api.get(`/admin/orders?page=${orderPage}&size=8`);
      if (res.data?.data) {
        setOrders(res.data.data.content || []);
        setOrderTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch orders', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const loadUsers = async () => {
    setUserLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${userPage}&size=8`);
      if (res.data?.data) {
        setUsers(res.data.data.content || []);
        setUserTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch users', 'error');
    } finally {
      setUserLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadOverview();
    loadCategories();
    loadVendors();
  }, []);

  // Tab switch effect
  useEffect(() => {
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'vendors') loadVendors();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, productPage, orderPage, userPage]);

  // PRODUCT ACTIONS
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discountPrice: product.discountPrice || '',
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl || '',
        categoryId: product.category?.id || '',
        vendorId: product.vendor?.id || '',
        isActive: product.isActive
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stockQuantity: '',
        imageUrl: '',
        categoryId: categories[0]?.id || '',
        vendorId: vendors[0]?.id || '',
        isActive: true
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
        stockQuantity: Number(productForm.stockQuantity),
        imageUrl: productForm.imageUrl,
        categoryId: Number(productForm.categoryId),
        vendorId: Number(productForm.vendorId),
        isActive: Boolean(productForm.isActive)
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await api.post('/admin/products', payload);
        showToast('Product created successfully', 'success');
      }
      setIsProductModalOpen(false);
      loadProducts();
      loadOverview();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast('Product removed', 'info');
      loadProducts();
      loadOverview();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  // CATEGORY ACTIONS
  const openCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        description: cat.description || '',
        iconUrl: cat.iconUrl || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', iconUrl: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, categoryForm);
        showToast('Category updated', 'success');
      } else {
        await api.post('/admin/categories', categoryForm);
        showToast('Category created', 'success');
      }
      setIsCategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? Ensure no products are linked.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      showToast('Category removed', 'info');
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category (it may contain products)', 'error');
    }
  };

  // VENDOR ACTIONS
  const openVendorModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm({
        name: vendor.name,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone || '',
        description: vendor.description || '',
        logoUrl: vendor.logoUrl || '',
        isActive: vendor.isActive
      });
    } else {
      setEditingVendor(null);
      setVendorForm({
        name: '',
        contactEmail: '',
        contactPhone: '',
        description: '',
        logoUrl: '',
        isActive: true
      });
    }
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await api.put(`/admin/vendors/${editingVendor.id}`, vendorForm);
        showToast('Vendor updated', 'success');
      } else {
        await api.post('/admin/vendors', vendorForm);
        showToast('Vendor registered', 'success');
      }
      setIsVendorModalOpen(false);
      loadVendors();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save vendor', 'error');
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Delete vendor? Ensure no products are linked.')) return;
    try {
      await api.delete(`/admin/vendors/${id}`);
      showToast('Vendor deleted', 'info');
      loadVendors();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete vendor with products', 'error');
    }
  };

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      loadOrders();
      loadOverview();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  // USER ACTIONS
  const handleToggleBlockUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-block`);
      showToast(res.data?.message || 'User status changed', 'success');
      loadUsers();
      loadOverview();
    } catch (err) {
      showToast('Failed to toggle block status', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Admin Top Banner */}
      <div className="bg-[#131921] border-b border-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-lg text-gray-950 font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Amazon Marketplace <span className="text-amber-400 font-medium text-xs bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">Admin Portal</span>
              </h1>
              <p className="text-xs text-gray-400">Complete multi-vendor catalog, orders, and merchant management</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-lg border border-gray-800 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'overview' ? 'bg-[#febd69] text-gray-950 shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'products' ? 'bg-[#febd69] text-gray-950 shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Products
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'categories' ? 'bg-[#febd69] text-gray-950 shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Tags className="w-3.5 h-3.5" /> Categories
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'vendors' ? 'bg-[#febd69] text-gray-950 shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Vendors
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'orders' ? 'bg-[#febd69] text-gray-950 shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'users' ? 'bg-[#febd69] text-gray-950 shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Users
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* =================================================== */}
        {/* TAB 1: OVERVIEW METRICS */}
        {/* =================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {overviewStats ? (
              <>
                {/* 4 Primary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Gross Revenue</span>
                      <p className="text-2xl font-black text-gray-900 mt-1">
                        ${Number(overviewStats.totalRevenue || 0).toFixed(2)}
                      </p>
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Lifetime total
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Total Orders</span>
                      <p className="text-2xl font-black text-gray-900 mt-1">{overviewStats.totalOrders}</p>
                      <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 mt-1">
                        Active fulfillment
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Active Products</span>
                      <p className="text-2xl font-black text-gray-900 mt-1">{overviewStats.totalProducts}</p>
                      <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                        Across {overviewStats.totalVendors} vendors
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Registered Users</span>
                      <p className="text-2xl font-black text-gray-900 mt-1">{overviewStats.totalUsers}</p>
                      <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1 mt-1">
                        Verified accounts
                      </span>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Orders by Status Pills */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Order Status Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <span className="text-xs font-bold text-amber-800">PLACED</span>
                      <p className="text-2xl font-black text-amber-900 mt-1">
                        {overviewStats.ordersByStatus?.PLACED || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <span className="text-xs font-bold text-blue-800">SHIPPED</span>
                      <p className="text-2xl font-black text-blue-900 mt-1">
                        {overviewStats.ordersByStatus?.SHIPPED || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-xs font-bold text-emerald-800">DELIVERED</span>
                      <p className="text-2xl font-black text-emerald-900 mt-1">
                        {overviewStats.ordersByStatus?.DELIVERED || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-center">
                      <span className="text-xs font-bold text-rose-800">CANCELLED</span>
                      <p className="text-2xl font-black text-rose-900 mt-1">
                        {overviewStats.ordersByStatus?.CANCELLED || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">Recent Marketplace Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amazon-blue hover:underline font-bold flex items-center gap-1"
                    >
                      View All Orders <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-3">Order Number</th>
                          <th className="px-6 py-3">Recipient</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Payment</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(overviewStats.recentOrders || []).map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3.5 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                            <td className="px-6 py-3.5 text-gray-700">{o.shippingName}</td>
                            <td className="px-6 py-3.5 font-bold text-gray-900">${Number(o.totalAmount).toFixed(2)}</td>
                            <td className="px-6 py-3.5 text-gray-600">{o.paymentMethod}</td>
                            <td className="px-6 py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 2: PRODUCTS CRUD */}
        {/* =================================================== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Products Catalog Management</h2>
                <p className="text-xs text-gray-500">Create, modify, and monitor stock for all items</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={productKeyword}
                    onChange={(e) => setProductKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                    placeholder="Search products..."
                    className="text-xs border border-gray-300 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-amber-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={() => openProductModal()}
                  className="btn-amazon-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto text-xs border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded border p-0.5"
                        />
                        <span className="font-semibold text-gray-900 line-clamp-1 max-w-xs">{p.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{p.category?.name}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{p.vendor?.name}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ${Number(p.discountPrice || p.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${p.stockQuantity > 5 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openProductModal(p)}
                          className="p-1 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {productTotalPages > 1 && (
              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                  disabled={productPage === 0}
                  className="px-3 py-1 border rounded bg-white disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="self-center font-semibold text-gray-600">
                  Page {productPage + 1} of {productTotalPages}
                </span>
                <button
                  onClick={() => setProductPage((p) => Math.min(productTotalPages - 1, p + 1))}
                  disabled={productPage >= productTotalPages - 1}
                  className="px-3 py-1 border rounded bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 3: CATEGORIES CRUD */}
        {/* =================================================== */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Categories Management</h2>
                <p className="text-xs text-gray-500">Organize store departments and product taxonomy</p>
              </div>
              <button
                onClick={() => openCategoryModal()}
                className="btn-amazon-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="overflow-x-auto text-xs border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Banner / Icon</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-sm truncate">{c.description || 'No description'}</td>
                      <td className="px-4 py-3">
                        {c.iconUrl ? (
                          <img src={c.iconUrl} alt={c.name} className="w-8 h-8 object-cover rounded border" />
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openCategoryModal(c)}
                          className="p-1 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 4: VENDORS CRUD */}
        {/* =================================================== */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Vendors & Stores Management</h2>
                <p className="text-xs text-gray-500">Manage independent merchants selling on the marketplace</p>
              </div>
              <button
                onClick={() => openVendorModal()}
                className="btn-amazon-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Vendor
              </button>
            </div>

            <div className="overflow-x-auto text-xs border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Vendor / Store</th>
                    <th className="px-4 py-3">Contact Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={v.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                          alt={v.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <span className="font-bold text-gray-900">{v.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{v.contactEmail}</td>
                      <td className="px-4 py-3 text-gray-600">{v.contactPhone || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">★ {v.rating}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {v.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openVendorModal(v)}
                          className="p-1 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(v.id)}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 5: ORDERS MANAGEMENT */}
        {/* =================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Orders Fulfillment Center</h2>
              <p className="text-xs text-gray-500">Monitor and update lifecycle statuses for customer orders</p>
            </div>

            <div className="overflow-x-auto text-xs border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Order Number</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800 block">{o.shippingName}</span>
                        <span className="text-[10px] text-gray-400 block">{o.shippingCity}, {o.shippingState}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {o.orderItems?.length || 0} items
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">${Number(o.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-700 block">{o.paymentMethod}</span>
                        <span className="text-[10px] text-gray-400">{o.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-gray-100 border border-gray-300 rounded p-1 text-xs font-semibold outline-none cursor-pointer"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orderTotalPages > 1 && (
              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  onClick={() => setOrderPage((p) => Math.max(0, p - 1))}
                  disabled={orderPage === 0}
                  className="px-3 py-1 border rounded bg-white disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="self-center font-semibold text-gray-600">
                  Page {orderPage + 1} of {orderTotalPages}
                </span>
                <button
                  onClick={() => setOrderPage((p) => Math.min(orderTotalPages - 1, p + 1))}
                  disabled={orderPage >= orderTotalPages - 1}
                  className="px-3 py-1 border rounded bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 6: USERS MANAGEMENT */}
        {/* =================================================== */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-gray-900">User Access & Security Control</h2>
              <p className="text-xs text-gray-500">View registered customers and administrators; manage access permissions</p>
            </div>

            <div className="overflow-x-auto text-xs border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">User Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.blocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleBlockUser(u.id)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            u.blocked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300'
                          }`}
                        >
                          {u.blocked ? 'Unblock User' : 'Block User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* =================================================== */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* =================================================== */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Product Title</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Standard Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Discount Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={productForm.discountPrice}
                onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Inventory Stock</label>
              <input
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Department Category</label>
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500 bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Merchant / Vendor</label>
              <select
                value={productForm.vendorId}
                onChange={(e) => setProductForm({ ...productForm, vendorId: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500 bg-white"
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pActive"
              checked={productForm.isActive}
              onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
              className="rounded text-amazon-orange focus:ring-amazon-orange"
            />
            <label htmlFor="pActive" className="text-gray-700 font-semibold cursor-pointer">
              Product is active and visible in catalog
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="btn-amazon-neutral text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-amazon-primary text-xs font-bold px-6 py-2"
            >
              {editingProduct ? 'Save Updates' : 'Publish Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* =================================================== */}
      {/* CATEGORY MODAL */}
      {/* =================================================== */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={categoryForm.iconUrl}
              onChange={(e) => setCategoryForm({ ...categoryForm, iconUrl: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="btn-amazon-neutral text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-amazon-primary text-xs font-bold px-6 py-2"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* =================================================== */}
      {/* VENDOR MODAL */}
      {/* =================================================== */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
      >
        <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Vendor / Store Name</label>
            <input
              type="text"
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={vendorForm.contactEmail}
                onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={vendorForm.contactPhone}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Store Description</label>
            <textarea
              rows={2}
              value={vendorForm.description}
              onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Logo / Banner URL</label>
            <input
              type="url"
              value={vendorForm.logoUrl}
              onChange={(e) => setVendorForm({ ...vendorForm, logoUrl: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsVendorModalOpen(false)}
              className="btn-amazon-neutral text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-amazon-primary text-xs font-bold px-6 py-2"
            >
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
