import React from 'react';
import { useNavigationContext } from '../../context/NavigationContext';
import SectionHeader from '../../components/ui/SectionHeader';
import mobileSvg from '../../assets/category/categoryMobile.svg';
import electronicsSvg from '../../assets/category/categoryElectronics.svg';
import fashionSvg from '../../assets/category/categoryFashion.svg';
import chairsSvg from '../../assets/category/categoryChairs.svg';
import beautySvg from '../../assets/category/categoryBeauty.svg';
import shoesSvg from '../../assets/category/categoryShoes.svg';

const categories = [
  { name: 'Mobiles', svg: mobileSvg, page: 'electronics' },
  { name: 'Electronics', svg: electronicsSvg, page: 'electronics' },
  { name: 'Fashion', svg: fashionSvg, page: 'fashion' },
  { name: 'Home & Furniture', svg: chairsSvg, page: 'home-kitchen' },
  { name: 'Beauty', svg: beautySvg, page: 'beauty' },
  { name: 'Footwear', svg: shoesSvg, page: 'shop' },
];

export default function TopCategories() {
  const { navigateTo } = useNavigationContext();

  return (
    <section className="mx-4 my-8 sm:mx-6 lg:mx-8">
      <SectionHeader
        kicker="Browse by Category"
        title="Top Categories"
        linkLabel="View All"
        linkPage="shop"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            onClick={() => navigateTo(cat.page)}
            className="bg-white border border-transparent rounded-2xl p-4 flex flex-col items-center hover:border-brand-500 hover:shadow-lift cursor-pointer transition-all duration-200 active:scale-95 group shadow-soft"
          >
            <div className="w-20 h-20 bg-brand-50 rounded-2xl mb-3 flex items-center justify-center p-2.5 overflow-hidden border border-brand-100 group-hover:scale-105 transition-transform duration-300">
              <img src={cat.svg} alt={cat.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-ink text-center group-hover:text-brand-700 transition-colors leading-tight">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
