import React from 'react';
import { useNavigationContext } from '../../context/NavigationContext';

// Import exact SVG category assets
import mobileSvg from '../../assets/category/categoryMobile.svg';
import electronicsSvg from '../../assets/category/categoryElectronics.svg';
import fashionSvg from '../../assets/category/categoryFashion.svg';
import chairsSvg from '../../assets/category/categoryChairs.svg';
import beautySvg from '../../assets/category/categoryBeauty.svg';
import shoesSvg from '../../assets/category/categoryShoes.svg';

const categories = [
  { name: 'Mobiles', svg: mobileSvg },
  { name: 'Electronics', svg: electronicsSvg },
  { name: 'Fashion', svg: fashionSvg },
  { name: 'Home & Furniture', svg: chairsSvg },
  { name: 'Beauty', svg: beautySvg },
  { name: 'Footwear', svg: shoesSvg }
];

export default function TopCategories() {
  const { navigateTo } = useNavigationContext();

  const handleCategoryClick = (catName) => {
    navigateTo('electronics');
  };

  return (
    <section className="mx-4 my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Top Categories</h2>
        <button
          onClick={() => navigateTo('electronics')}
          className="text-[#ff5100] font-bold text-sm hover:underline cursor-pointer flex items-center space-x-1"
        >
          <span>View All</span>
          <span>&gt;</span>
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            onClick={() => handleCategoryClick(cat.name)}
            className="bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col items-center hover:shadow-lg cursor-pointer transition-all duration-200 active:scale-95 group"
          >
            <div className="w-20 h-20 bg-emerald-50/40 rounded-2xl mb-3 flex items-center justify-center p-2.5 overflow-hidden border border-emerald-100/60 shadow-2xs group-hover:scale-105 transition-transform duration-300">
              <img
                src={cat.svg}
                alt={cat.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs font-bold text-gray-800 text-center group-hover:text-[#0d5c46] transition-colors leading-tight">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
