import React, { useState, useEffect } from 'react';
import { History, Star, ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import { getProductImage } from '../../utils/productAssets';

export default function RecentlyViewedBar({ currentProductId = null }) {
  const [recentItems, setRecentItems] = useState([]);
  const { navigateTo } = useNavigationContext();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('buyzo_recently_viewed');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = currentProductId
            ? parsed.filter((item) => String(item.id) !== String(currentProductId))
            : parsed;
          setRecentItems(filtered.slice(0, 8));
        }
      }
    } catch (err) {
      console.error('Failed to load recently viewed products', err);
    }
  }, [currentProductId]);

  if (!recentItems || recentItems.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto my-8 px-2 sm:px-0">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft">
        <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
          <History className="w-5 h-5 text-brand-700" />
          <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
            Recently Viewed by You
          </h3>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-2 no-scrollbar select-none">
          {recentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigateTo('product-detail', item)}
              className="shrink-0 w-36 sm:w-44 bg-gray-50/70 hover:bg-white rounded-2xl p-3 border border-gray-200/80 hover:border-brand-700 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-24 sm:h-28 rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden mb-2">
                  <img
                    src={getProductImage(item.name || item.title, item.image || item.primary_image)}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-brand-700 transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-gray-500 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-gray-800 font-bold">{item.rating || 4.5}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 mt-2">
                <span className="text-xs font-extrabold text-gray-900">
                  ₹{Number(item.price || 0).toLocaleString('en-IN')}
                </span>
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center group-hover:bg-brand-700 group-hover:text-white transition-colors">
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
