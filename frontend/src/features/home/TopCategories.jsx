import React, { useEffect, useState } from 'react';
import { useNavigationContext } from '../../context/NavigationContext';
import SectionHeader from '../../components/ui/SectionHeader';
import { fetchCategories } from '../../services/api';

// Dedicated transparent vector SVG & PNG cutouts for Category Bubbles
import mobileSvg from '../../assets/category/categoryMobile.svg';
import laptopSvg from '../../assets/category/categoryLaptop.svg';
import electronicsSvg from '../../assets/category/categoryElectronics.svg';
import fashionSvg from '../../assets/category/categoryFashion.svg';
import chairsSvg from '../../assets/category/categoryChairs.svg';
import homeKitchenSvg from '../../assets/category/CategoryHome & kitchen.svg';
import beautySvg from '../../assets/category/categoryBeauty.svg';
import shoesSvg from '../../assets/category/categoryShoes.svg';
import bagsSvg from '../../assets/category/categoryBags & luddages.svg';
import homeKitchenPng from '../../assets/category/home_kitchen.png';
import booksMorePng from '../../assets/category/books_more.png';
import appliancesPng from '../../assets/category/appliances.png';
import sportsFitnessPng from '../../assets/category/sports_fitness.png';

// 100% Unique Category Artwork & Target Pages (Zero Repetitions)
const CATEGORY_MAP = {
  'Mobiles': { img: mobileSvg, page: 'electronics' },
  'Laptops': { img: laptopSvg, page: 'electronics' },
  'Electronics': { img: electronicsSvg, page: 'electronics' },
  'Fashion': { img: fashionSvg, page: 'fashion' },
  'Chairs & Furniture': { img: chairsSvg, page: 'home-kitchen' },
  'Furniture': { img: chairsSvg, page: 'home-kitchen' },
  'Home & Kitchen': { img: homeKitchenPng, page: 'home-kitchen' },
  'Beauty': { img: beautySvg, page: 'beauty' },
  'Footwear': { img: shoesSvg, page: 'fashion' },
  'Bags & Luggage': { img: bagsSvg, page: 'shop' },
  'Sports & Fitness': { img: sportsFitnessPng, page: 'shop' },
  'Appliances': { img: appliancesPng, page: 'home-kitchen' },
  'Books & More': { img: booksMorePng, page: 'shop' },
  'Books': { img: booksMorePng, page: 'shop' },
};

const default12Categories = [
  { name: 'Mobiles', img: mobileSvg, page: 'electronics' },
  { name: 'Laptops', img: laptopSvg, page: 'electronics' },
  { name: 'Electronics', img: electronicsSvg, page: 'electronics' },
  { name: 'Fashion', img: fashionSvg, page: 'fashion' },
  { name: 'Chairs & Furniture', img: chairsSvg, page: 'home-kitchen' },
  { name: 'Home & Kitchen', img: homeKitchenPng, page: 'home-kitchen' },
  { name: 'Beauty', img: beautySvg, page: 'beauty' },
  { name: 'Footwear', img: shoesSvg, page: 'fashion' },
  { name: 'Bags & Luggage', img: bagsSvg, page: 'shop' },
  { name: 'Sports & Fitness', img: sportsFitnessPng, page: 'shop' },
  { name: 'Appliances', img: appliancesPng, page: 'home-kitchen' },
  { name: 'Books & More', img: booksMorePng, page: 'shop' },
];

export default function TopCategories() {
  const { navigateTo } = useNavigationContext();
  const [categories, setCategories] = useState(default12Categories);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const rows = await fetchCategories();
      if (cancelled || !Array.isArray(rows) || rows.length === 0) return;

      const mapped = rows
        .filter((row) => row.is_active !== false)
        .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
        .slice(0, 12)
        .map((row) => {
          const info = CATEGORY_MAP[row.name] || {};
          return {
            name: row.name,
            slug: row.slug,
            img: info.img || mobileSvg,
            page: info.page || 'shop',
            count: row.product_count || 0,
          };
        });

      if (mapped.length > 0) setCategories(mapped);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-4 my-8 sm:mx-6 lg:mx-8">
      <SectionHeader
        kicker="Browse by Category"
        title="Top Categories"
        linkLabel="View All"
        linkPage="shop"
      />

      {/* Grid of 12 Categories arranged in 2 lines of 6 categories each */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-6 lg:gap-x-8 justify-items-center py-2">
        {categories.map((cat, i) => (
          <div
            key={cat.slug || i}
            onClick={() => navigateTo(cat.page, cat.name)}
            className="flex flex-col items-center cursor-pointer select-none group w-full"
          >
            {/* Circular Image Container with Soft Neutral Beige Background */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#F5ECE1] flex items-center justify-center p-2 sm:p-2.5 overflow-hidden shadow-2xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300 relative">
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-contain p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Label Centered Below using exact font & styling */}
            <span className="mt-2.5 text-xs sm:text-sm font-semibold text-[#1e293b] text-center tracking-tight group-hover:text-brand-700 transition-colors leading-tight line-clamp-2">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
