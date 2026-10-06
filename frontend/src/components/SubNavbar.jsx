import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Zap, Sparkles } from 'lucide-react';
import api from '../api/client';

export const SubNavbar = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        if (res.data?.data) setCategories(res.data.data.slice(0, 6));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-[#232f3e] text-white text-xs font-medium px-4 py-1.5 overflow-x-auto scrollbar-none flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-1 sm:gap-4 max-w-7xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 py-1 px-2 border border-transparent hover:border-white rounded font-bold transition-colors whitespace-nowrap"
        >
          <Menu className="w-4 h-4" />
          <span>All Departments</span>
        </button>

        <Link
          to="/?deals=true"
          className="py-1 px-2 border border-transparent hover:border-white rounded text-amber-300 font-semibold flex items-center gap-1 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Today's Deals
        </Link>

        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/?categoryId=${c.id}`}
            className="py-1 px-2 border border-transparent hover:border-white rounded text-gray-200 hover:text-white whitespace-nowrap hidden sm:inline-block"
          >
            {c.name}
          </Link>
        ))}

        <Link
          to="/"
          className="py-1 px-2 border border-transparent hover:border-white rounded text-gray-200 hover:text-white whitespace-nowrap hidden md:inline-block"
        >
          Customer Service
        </Link>

        <Link
          to="/"
          className="py-1 px-2 border border-transparent hover:border-white rounded text-gray-200 hover:text-white whitespace-nowrap hidden lg:inline-block"
        >
          Registry & Gift Cards
        </Link>

        <div className="ml-auto flex items-center gap-1 text-amber-400 font-semibold whitespace-nowrap hidden xl:flex">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>Free Express Delivery on Orders over $35</span>
        </div>
      </div>
    </div>
  );
};
