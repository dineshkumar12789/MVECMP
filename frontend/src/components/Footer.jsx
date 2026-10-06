import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-[#232f3e] text-gray-300 text-xs">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-3 text-center text-xs font-semibold transition-colors border-t border-gray-700"
      >
        Back to top
      </button>

      {/* Main Link Columns */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-white text-sm mb-3">Get to Know Us</h4>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:underline">Careers</a></li>
            <li><a href="#blog" className="hover:underline">Marketplace Blog</a></li>
            <li><a href="#investors" className="hover:underline">About Amazon Multi-Vendor</a></li>
            <li><a href="#sustainability" className="hover:underline">Sustainable Commerce</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Make Money with Us</h4>
          <ul className="space-y-2">
            <li><Link to="/register?role=ADMIN" className="hover:underline text-amber-300 font-medium">Sell on Amazon Marketplace</Link></li>
            <li><a href="#affiliate" className="hover:underline">Become an Affiliate</a></li>
            <li><a href="#advertise" className="hover:underline">Advertise Your Products</a></li>
            <li><a href="#publish" className="hover:underline">Self-Publish with Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Payment Products</h4>
          <ul className="space-y-2">
            <li><a href="#businesscard" className="hover:underline">Amazon Business Card</a></li>
            <li><a href="#points" className="hover:underline">Shop with Points</a></li>
            <li><a href="#reload" className="hover:underline">Reload Your Balance</a></li>
            <li><a href="#currency" className="hover:underline">Amazon Currency Converter</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Let Us Help You</h4>
          <ul className="space-y-2">
            <li><Link to="/profile" className="hover:underline">Your Account & Addresses</Link></li>
            <li><Link to="/orders" className="hover:underline">Your Orders & Tracking</Link></li>
            <li><a href="#shipping" className="hover:underline">Shipping Rates & Policies</a></li>
            <li><a href="#returns" className="hover:underline">Returns & Replacements</a></li>
            <li><a href="#help" className="hover:underline">Help & Contact Us</a></li>
          </ul>
        </div>
      </div>

      {/* Lower Bar with Logo */}
      <div className="border-t border-gray-700 py-6 bg-[#131921]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white tracking-tight">
              amazon<span className="text-[#febd69] font-normal text-xs ml-1">marketplace</span>
            </span>
            <div className="flex items-center gap-1.5 border border-gray-600 rounded px-2.5 py-1 text-[11px] text-gray-300">
              <Globe className="w-3.5 h-3.5" />
              <span>English - USD</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure 256-Bit SSL Encryption • Spring Boot 3 & JWT Protected</span>
          </div>

          <p className="text-[11px] text-gray-400">
            © 2026 Amazon-Style Multi-Vendor Marketplace. Full-Stack Demo.
          </p>
        </div>
      </div>
    </footer>
  );
};
