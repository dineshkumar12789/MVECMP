import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  MapPin,
  User,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/client';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        if (res.data?.data) setCategories(res.data.data);
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('keyword', searchTerm.trim());
    if (selectedCategory) params.set('categoryId', selectedCategory);
    navigate(`/?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#131921] text-white">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 md:gap-6">
        {/* 1. Logo */}
        <Link to="/" className="flex items-center gap-1 py-1 px-2 border border-transparent hover:border-white rounded transition-colors flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center">
              amazon<span className="text-[#febd69] font-normal text-sm ml-0.5">marketplace</span>
            </span>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#febd69] to-transparent rounded-full -mt-0.5"></div>
          </div>
        </Link>

        {/* 2. Deliver To Address Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 py-1 px-2 border border-transparent hover:border-white rounded cursor-pointer transition-colors flex-shrink-0">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div className="text-xs leading-tight">
            <span className="text-gray-400 block">Deliver to {user?.name ? user.name.split(' ')[0] : 'Guest'}</span>
            <span className="font-bold text-white block">Select Address</span>
          </div>
        </div>

        {/* 3. Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center min-w-[220px] max-w-3xl h-10">
          <div className="relative flex-1 flex rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#f90]">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 text-gray-800 text-xs px-2.5 py-2 border-r border-gray-300 outline-none cursor-pointer hover:bg-gray-200 transition-colors hidden sm:block max-w-[130px]"
            >
              <option value="">All Departments</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Keyword Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Amazon Marketplace..."
              className="flex-1 bg-white text-gray-900 text-sm px-3 py-2 outline-none w-full"
            />

            {/* Search Submit Button */}
            <button
              type="submit"
              className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 px-4 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* 4. Right navigation items */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {/* Admin Dashboard Pill if user is ADMIN */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-1 py-1.5 px-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 rounded text-amber-300 text-xs font-bold transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-[#febd69]" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Account & Lists Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <div className="py-1 px-2 border border-transparent hover:border-white rounded cursor-pointer transition-colors flex items-center gap-1">
              <div className="text-xs leading-tight text-left">
                <span className="text-gray-300 block">
                  {user ? `Hello, ${user.name.split(' ')[0]}` : 'Hello, sign in'}
                </span>
                <span className="font-bold text-white flex items-center gap-0.5">
                  Account & Lists <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 top-full pt-1 z-50 w-64 animate-fade-in">
                <div className="bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 p-4 text-sm">
                  {!user ? (
                    <div className="text-center pb-3 border-b border-gray-200">
                      <Link
                        to="/login"
                        onClick={() => setShowAccountMenu(false)}
                        className="btn-amazon-primary block text-center py-2 text-xs font-bold w-full mb-2"
                      >
                        Sign in
                      </Link>
                      <p className="text-xs text-gray-600">
                        New customer?{' '}
                        <Link
                          to="/register"
                          onClick={() => setShowAccountMenu(false)}
                          className="text-amazon-blue hover:underline font-semibold"
                        >
                          Start here.
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div className="pb-3 border-b border-gray-200 mb-2">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-gray-100 text-gray-700">
                        Role: {user.role}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 py-1">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-amber-50 text-amber-800 font-semibold text-xs"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-gray-800 text-xs"
                    >
                      <Package className="w-4 h-4 text-gray-500" />
                      Your Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-gray-800 text-xs"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      Your Profile & Addresses
                    </Link>
                  </div>

                  {user && (
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Returns & Orders shortcut */}
          <Link
            to="/orders"
            className="hidden md:block py-1 px-2 border border-transparent hover:border-white rounded transition-colors text-xs text-left leading-tight"
          >
            <span className="text-gray-300 block">Returns</span>
            <span className="font-bold text-white block">& Orders</span>
          </Link>

          {/* Cart Icon & Counter */}
          <Link
            to="/cart"
            className="py-1 px-2.5 border border-transparent hover:border-white rounded transition-colors flex items-center gap-1.5 relative"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7 text-white" />
              <span className="absolute -top-1.5 -right-2 bg-[#f08804] text-gray-900 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#131921]">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            </div>
            <span className="font-bold text-sm hidden sm:inline text-white mt-2">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
