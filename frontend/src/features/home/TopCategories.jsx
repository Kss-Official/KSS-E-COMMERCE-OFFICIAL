import React, { useEffect, useState } from 'react';
import { useNavigationContext } from '../../context/NavigationContext';
import SectionHeader from '../../components/ui/SectionHeader';
import { fetchCategories } from '../../services/api';
import mobileSvg from '../../assets/category/categoryMobile.svg';
import electronicsSvg from '../../assets/category/categoryElectronics.svg';
import fashionSvg from '../../assets/category/categoryFashion.svg';
import chairsSvg from '../../assets/category/categoryChairs.svg';
import beautySvg from '../../assets/category/categoryBeauty.svg';
import shoesSvg from '../../assets/category/categoryShoes.svg';

// Local artwork + destination page keyed by the category name stored in MySQL.
const CATEGORY_ART = {
  'Mobiles': { svg: mobileSvg, page: 'electronics' },
  'Laptops': { svg: electronicsSvg, page: 'electronics' },
  'Electronics': { svg: electronicsSvg, page: 'electronics' },
  'Fashion': { svg: fashionSvg, page: 'fashion' },
  'Footwear': { svg: shoesSvg, page: 'fashion' },
  'Bags & Luggage': { svg: shoesSvg, page: 'shop' },
  'Beauty': { svg: beautySvg, page: 'beauty' },
  'Home & Kitchen': { svg: chairsSvg, page: 'home-kitchen' },
  'Furniture': { svg: chairsSvg, page: 'home-kitchen' },
  'Appliances': { svg: electronicsSvg, page: 'home-kitchen' },
  'Sports & Fitness': { svg: shoesSvg, page: 'shop' },
  'Books': { svg: electronicsSvg, page: 'shop' },
};

// Shown until the API answers, and kept as the fallback if it ever fails.
const fallbackCategories = [
  { name: 'Mobiles', svg: mobileSvg, page: 'electronics' },
  { name: 'Electronics', svg: electronicsSvg, page: 'electronics' },
  { name: 'Fashion', svg: fashionSvg, page: 'fashion' },
  { name: 'Home & Furniture', svg: chairsSvg, page: 'home-kitchen' },
  { name: 'Beauty', svg: beautySvg, page: 'beauty' },
  { name: 'Footwear', svg: shoesSvg, page: 'shop' },
];

export default function TopCategories() {
  const { navigateTo } = useNavigationContext();
  const [categories, setCategories] = useState(fallbackCategories);

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
          const art = CATEGORY_ART[row.name] || {};
          return {
            name: row.name,
            slug: row.slug,
            // Prefer the artwork bundled with the app; the media URL is the fallback.
            svg: art.svg || row.svg || row.image,
            page: art.page || 'shop',
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <div
            key={cat.slug || i}
            onClick={() => navigateTo(cat.page, cat.name)}
            className="bg-white border border-transparent rounded-2xl p-4 flex flex-col items-center hover:border-brand-500 hover:shadow-lift cursor-pointer transition-all duration-200 active:scale-95 group shadow-soft"
          >
            <div className="w-20 h-20 bg-brand-50 rounded-2xl mb-3 flex items-center justify-center p-2.5 overflow-hidden border border-brand-100 group-hover:scale-105 transition-transform duration-300">
              <img src={cat.svg} alt={cat.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-ink text-center group-hover:text-brand-700 transition-colors leading-tight">
              {cat.name}
            </span>
            {cat.count > 0 && (
              <span className="mt-1 text-[10px] font-semibold text-gray-400">
                {cat.count} items
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
