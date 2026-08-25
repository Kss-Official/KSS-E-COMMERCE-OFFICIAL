import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CategorySidebar({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
      <h3 className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-900 bg-brand-50/60 border-b border-gray-100">
        Categories
      </h3>
      <ul className="py-1.5">
        {categories.map((cat) => {
          const active = activeCategory === cat.name || activeCategory === cat.id;
          return (
            <li key={cat.name || cat.id}>
              <button
                onClick={() => onSelectCategory(cat.name || cat.id)}
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
  );
}
