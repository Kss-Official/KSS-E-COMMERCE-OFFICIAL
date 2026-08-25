import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

export default function Breadcrumb({ items }) {
  const { navigateTo } = useNavigationContext();
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        if (i === 0) {
          return (
            <span key={i} className="flex items-center gap-1.5">
              <button
                onClick={() => (item.page ? navigateTo(item.page) : item.onClick?.())}
                className="hover:text-brand-700 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            </span>
          );
        }
        return (
          <span key={i} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-ink font-bold">{item.label}</span>
            ) : (
              <button
                onClick={() => (item.page ? navigateTo(item.page) : item.onClick?.())}
                className="hover:text-brand-700 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          </span>
        );
      })}
    </nav>
  );
}
