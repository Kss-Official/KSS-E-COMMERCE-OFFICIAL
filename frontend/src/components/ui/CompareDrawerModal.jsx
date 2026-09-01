import React from 'react';
import { X, Scale, Star, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCompareContext } from '../../context/CompareContext';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';

export default function CompareDrawerModal() {
  const { compareItems, isCompareOpen, setIsCompareOpen, removeFromCompare, clearCompare } = useCompareContext();
  const { addToCart } = useCartContext();
  const { navigateTo } = useNavigationContext();

  if (!isCompareOpen || compareItems.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ring-1 ring-black/10">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#063328] to-[#0a4d3c] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <Scale className="w-5 h-5 text-emerald-300" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Product Comparison ({compareItems.length}/4)
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearCompare}
                className="text-xs font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Comparison Drawer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Grid Comparison Row */}
          <div className="p-4 overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 min-w-[600px]">
              {compareItems.map((item) => {
                const discount = item.discount || (item.originalPrice ? `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF` : null);
                return (
                  <div
                    key={item.id}
                    className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between group hover:border-emerald-600 transition-colors"
                  >
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove from compare"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="w-full h-24 bg-white rounded-lg p-2 mb-2 flex items-center justify-center border border-gray-100">
                        <img
                          src={item.image || item.primary_image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                        {item.brand || item.category || 'BuyZo'}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1 mt-0.5">{item.name}</h4>
                      
                      {/* Price & Rating */}
                      <div className="mt-1.5 flex items-baseline space-x-1.5">
                        <span className="text-sm font-black text-gray-900">₹{Number(item.price).toLocaleString('en-IN')}</span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">₹{Number(item.originalPrice).toLocaleString('en-IN')}</span>
                        )}
                        {discount && (
                          <span className="text-[10px] font-extrabold text-emerald-600 ml-auto">{discount}</span>
                        )}
                      </div>

                      {/* Specs snippet */}
                      <div className="mt-2 pt-2 border-t border-gray-200/80 space-y-1 text-[11px]">
                        <div className="flex justify-between text-gray-600">
                          <span className="text-gray-400 font-medium">Rating:</span>
                          <span className="font-bold text-amber-600 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                            {item.rating || 4.5}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span className="text-gray-400 font-medium">Stock:</span>
                          <span className="font-bold text-emerald-700">In Stock</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="mt-3 w-full py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer action */}
          <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              Comparing specs, pricing, and ratings side-by-side
            </span>
            <button
              onClick={() => {
                setIsCompareOpen(false);
                navigateTo('compare');
              }}
              className="font-bold text-brand-800 hover:text-brand-900 cursor-pointer flex items-center gap-1"
            >
              <span>Full Comparison Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
