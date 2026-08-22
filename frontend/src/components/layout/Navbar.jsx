import React from 'react';
import { useNavigationContext } from '../../context/NavigationContext';

const categories = [
  'Home', 'Shop', 'Deals', 'New Arrivals', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Contact Us'
];

export default function Navbar() {
  const { currentPage, navigateTo } = useNavigationContext();

  const handleNavClick = (e, cat) => {
    e.preventDefault();
    if (cat === 'Shop') {
      navigateTo('shop');
    } else if (cat === 'Electronics') {
      navigateTo('electronics');
    } else if (cat === 'Home') {
      navigateTo('home');
    } else if (cat === 'Deals') {
      navigateTo('deals');
    } else if (cat === 'Fashion') {
      navigateTo('fashion');
    } else if (cat === 'Contact Us') {
      navigateTo('contact');
    } else if (cat === 'New Arrivals' || cat === 'Home & Kitchen' || cat === 'Beauty') {
      navigateTo('shop');
    }
  };

  return (
    <nav className="w-full bg-[#063328] text-white text-xs font-semibold px-3 sm:px-6 flex items-center gap-0 overflow-x-auto select-none">
      {/* All Categories Button */}
      <button
        onClick={() => navigateTo('shop')}
        className="flex items-center justify-center space-x-2 bg-transparent hover:text-[#ff5100] py-2.5 px-2 sm:px-4 text-white font-bold shrink-0 transition-colors cursor-pointer border-r border-white/10"
      >
        <span className="text-sm font-black">☰</span>
        <span>All Categories</span>
      </button>

      {/* Category Links */}
      {categories.map((cat, index) => {
        const isActive =
          (cat === 'Home' && currentPage === 'home') ||
          (cat === 'Shop' && currentPage === 'shop') ||
          (cat === 'Electronics' && currentPage === 'electronics') ||
          (cat === 'Deals' && currentPage === 'deals') ||
          (cat === 'Fashion' && currentPage === 'fashion') ||
          (cat === 'Contact Us' && currentPage === 'contact');
        return (
          <button
            key={index}
            onClick={(e) => handleNavClick(e, cat)}
            className={`flex-1 whitespace-nowrap text-center px-2 py-2.5 cursor-pointer transition-colors hover:text-[#ff5100] ${isActive
                ? 'text-[#ff5100] border-b-2 border-[#ff5100] font-bold'
                : 'text-white/90'
              }`}
          >
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
