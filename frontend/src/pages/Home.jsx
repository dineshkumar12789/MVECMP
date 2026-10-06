import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Tag, 
  PackageSearch,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Toast } from '../components/Toast';
import api from '../api/client';

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Hero carousel slides
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlides = [
    {
      title: "Discover Today's Best Tech & Gadgets",
      subtitle: "Up to 40% off top-tier audio, computing, and smart accessories from verified sellers.",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600",
      cta: "Shop Electronics",
      catId: "1"
    },
    {
      title: "Elevate Your Lifestyle & Wardrobe",
      subtitle: "Curated modern apparel and timeless craft directly from independent designers.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
      cta: "Explore Fashion",
      catId: "2"
    },
    {
      title: "Transform Your Home & Living Space",
      subtitle: "Premium cookware, ergonomic furniture, and cozy minimalist home comforts.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600",
      cta: "Browse Home Goods",
      catId: "3"
    }
  ];

  // Filters state from URL query
  const categoryId = searchParams.get('categoryId') || '';
  const vendorId = searchParams.get('vendorId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const keyword = searchParams.get('keyword') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  // Auto rotate hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Load Categories & Vendors
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data?.data || [])).catch(console.error);
    api.get('/vendors').then(res => setVendors(res.data?.data || [])).catch(console.error);
  }, []);

  // Fetch Products whenever filters or pagination change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId);
        if (vendorId) params.set('vendorId', vendorId);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (keyword) params.set('keyword', keyword);
        params.set('page', page);
        params.set('size', 12);
        params.set('sortBy', sortBy);
        params.set('sortDir', sortDir);

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data?.data) {
          setProducts(res.data.data.content || []);
          setTotalPages(res.data.data.totalPages || 1);
          setTotalElements(res.data.data.totalElements || 0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        showToast('Failed to load products from server', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, vendorId, minPrice, maxPrice, keyword, page, sortBy, sortDir]);

  // Handle Filter Update
  const updateFilter = (key, value) => {
    setPage(0);
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setPage(0);
    setSearchParams(new URLSearchParams());
  };

  const currentCategory = categories.find(c => String(c.id) === String(categoryId));

  return (
    <div className="min-h-screen pb-16">
      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Hero Banner Carousel (Shown primarily on broad home view) */}
      {!keyword && !categoryId && page === 0 && (
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] overflow-hidden bg-gray-900 shadow-md">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#eaeded] via-transparent to-black/30"></div>
              
              <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-center text-white pb-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f08804] text-gray-950 font-bold text-xs uppercase tracking-wider w-max mb-3 shadow">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Marketplace Deal
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black max-w-2xl leading-tight mb-2 drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-gray-200 max-w-xl mb-6 line-clamp-2 drop-shadow">
                  {slide.subtitle}
                </p>
                <div>
                  <button
                    onClick={() => updateFilter('categoryId', slide.catId)}
                    className="btn-amazon-primary font-bold text-sm px-6 py-2.5 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span>{slide.cta}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel navigation arrows */}
          <button
            onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white text-gray-900 p-2 rounded-full transition-colors backdrop-blur-xs"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white text-gray-900 p-2 rounded-full transition-colors backdrop-blur-xs"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`max-w-7xl mx-auto px-4 ${!keyword && !categoryId && page === 0 ? '-mt-24 sm:-mt-32 relative z-20' : 'pt-6'}`}>
        
        {/* Amazon Category Cards Grid (Overlaid on banner) */}
        {!keyword && !categoryId && page === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.id}
                onClick={() => updateFilter('categoryId', cat.id)}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between border border-gray-200 group"
              >
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 group-hover:text-amazon-orange transition-colors">
                    {cat.name}
                  </h3>
                  <div className="overflow-hidden rounded-md aspect-4/3 bg-gray-50 mb-3">
                    <img
                      src={cat.iconUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-amazon-blue group-hover:underline flex items-center gap-1">
                  Shop now <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Search / Category Results Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              {keyword ? (
                <>Results for <span className="text-amazon-orange">"{keyword}"</span></>
              ) : currentCategory ? (
                <>{currentCategory.name}</>
              ) : (
                <>Explore Marketplace Catalog</>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {products.length} of {totalElements} items available from independent vendors
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                updateFilter('sortBy', sb);
                updateFilter('sortDir', sd);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-md px-3 py-1.5 font-medium outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Avg. Customer Review</option>
            </select>

            {(keyword || categoryId || vendorId || minPrice || maxPrice) && (
              <button
                onClick={clearAllFilters}
                className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold px-3 py-1.5 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Layout: Sidebar Filter + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-amazon-blue" /> Filter Catalog
              </span>
              {(categoryId || vendorId || minPrice || maxPrice) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-amazon-blue hover:underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</h4>
              <ul className="space-y-1.5 text-xs">
                <li
                  onClick={() => updateFilter('categoryId', '')}
                  className={`cursor-pointer px-2 py-1 rounded transition-colors ${
                    !categoryId ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </li>
                {categories.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => updateFilter('categoryId', c.id)}
                    className={`cursor-pointer px-2 py-1 rounded transition-colors flex items-center justify-between ${
                      String(categoryId) === String(c.id)
                        ? 'bg-amber-100 text-gray-900 font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Price Range</h4>
              <ul className="space-y-1.5 text-xs">
                <li
                  onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    !minPrice && !maxPrice ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Any Price
                </li>
                <li
                  onClick={() => { updateFilter('minPrice', '0'); updateFilter('maxPrice', '50'); }}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    minPrice === '0' && maxPrice === '50' ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Under $50
                </li>
                <li
                  onClick={() => { updateFilter('minPrice', '50'); updateFilter('maxPrice', '150'); }}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    minPrice === '50' && maxPrice === '150' ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  $50 to $150
                </li>
                <li
                  onClick={() => { updateFilter('minPrice', '150'); updateFilter('maxPrice', '500'); }}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    minPrice === '150' && maxPrice === '500' ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  $150 to $500
                </li>
                <li
                  onClick={() => { updateFilter('minPrice', '500'); updateFilter('maxPrice', ''); }}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    minPrice === '500' && !maxPrice ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  $500 & Above
                </li>
              </ul>
            </div>

            {/* Vendor Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Vendors & Stores</h4>
              <ul className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
                <li
                  onClick={() => updateFilter('vendorId', '')}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    !vendorId ? 'bg-amber-100 text-gray-900 font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Vendors
                </li>
                {vendors.map((v) => (
                  <li
                    key={v.id}
                    onClick={() => updateFilter('vendorId', v.id)}
                    className={`cursor-pointer px-2 py-1 rounded flex items-center justify-between ${
                      String(vendorId) === String(v.id)
                        ? 'bg-amber-100 text-gray-900 font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{v.name}</span>
                    <span className="text-[10px] text-gray-400">★ {v.rating}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse space-y-3">
                    <div className="bg-gray-200 aspect-square rounded-md"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-full"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-sm">
                <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                  Try adjusting your search criteria, removing price filters, or exploring other categories.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="btn-amazon-primary text-xs font-bold px-6 py-2"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onToast={showToast}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 border rounded-md text-xs font-semibold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    
                    <span className="text-xs font-semibold text-gray-700 px-3">
                      Page {page + 1} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 border rounded-md text-xs font-semibold bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
