import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CategorySidebar({ categories, activeCategory, onSelectCategory }) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <>
      {/* Mobile Horizontal Scrollable Category Pills (< 1024px) */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar flex items-center space-x-2 py-2 mb-2">
        {categories.map((cat) => {
          const catVal = cat.name || cat.id;
          const active = activeCategory === catVal;
          return (
            <button
              key={catVal}
              onClick={() => onSelectCategory(catVal)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                active
                  ? 'bg-brand-800 text-white border-brand-800 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              {cat.count !== undefined && cat.count !== null && (
                <span className={`ml-1.5 text-[10px] ${active ? 'text-emerald-200' : 'text-gray-400'}`}>
                  ({cat.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Card Sidebar (>= 1024px) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <h3 className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-900 bg-brand-50/60 border-b border-gray-100">
          Categories
        </h3>
        <ul className="py-1.5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {categories.map((cat) => {
            const catVal = cat.name || cat.id;
            const active = activeCategory === catVal;
            return (
              <li key={catVal}>
                <button
                  onClick={() => onSelectCategory(catVal)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-brand-700 text-white'
                      : 'text-gray-700 hover:bg-brand-50 hover:text-brand-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  {active ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">{cat.count ?? ''}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

