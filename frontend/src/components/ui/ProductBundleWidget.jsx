import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { getProductImage } from '../../utils/productAssets';

export default function ProductBundleWidget({ currentProduct }) {
  const { addToCart } = useCartContext();
  const [isAdded, setIsAdded] = useState(false);

  if (!currentProduct) return null;

  // Mock bundled companion items
  const companion1 = {
    id: `${currentProduct.id}-bundle-1`,
    name: 'Tamper-Proof Glass Screen Guard / Cover',
    price: 399,
    originalPrice: 999,
    image: getProductImage('Screen Guard', '')
  };

  const companion2 = {
    id: `${currentProduct.id}-bundle-2`,
    name: 'Extended 1-Year Damage Protection Warranty',
    price: 299,
    originalPrice: 799,
    image: getProductImage('Warranty', '')
  };

  const bundleTotal = Number(currentProduct.price || 0) + companion1.price + companion2.price;
  const bundleOriginalTotal = Number(currentProduct.originalPrice || currentProduct.price * 1.3) + companion1.originalPrice + companion2.originalPrice;
  const bundleSavings = bundleOriginalTotal - bundleTotal;

  const handleAddBundle = () => {
    addToCart(currentProduct);
    addToCart(companion1);
    addToCart(companion2);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 4000);
  };

  return (
    <div className="w-full my-6 bg-gradient-to-r from-emerald-950 via-[#063328] to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/40">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-800/60">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-300 animate-pulse" />
          <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
            Frequently Bought Together (Save 15% Extra!)
          </h3>
        </div>
        <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300/30 uppercase">
          Bundle Deal
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Bundle Items Showcase */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
          {/* Main Item */}
          <div className="shrink-0 w-24 sm:w-28 bg-white/10 rounded-2xl p-2.5 border border-white/15 text-center">
            <div className="w-full h-16 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden mb-1.5">
              <img src={getProductImage(currentProduct.name, currentProduct.image)} alt={currentProduct.name} className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-[10px] font-bold text-white line-clamp-1 block">{currentProduct.name}</span>
            <span className="text-[11px] font-extrabold text-amber-300 mt-0.5 block">₹{Number(currentProduct.price).toLocaleString('en-IN')}</span>
          </div>

          <Plus className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />

          {/* Companion 1 */}
          <div className="shrink-0 w-24 sm:w-28 bg-white/10 rounded-2xl p-2.5 border border-white/15 text-center">
            <div className="w-full h-16 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden mb-1.5">
              <img src={companion1.image} alt={companion1.name} className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-[10px] font-bold text-white line-clamp-1 block">{companion1.name}</span>
            <span className="text-[11px] font-extrabold text-amber-300 mt-0.5 block">₹{companion1.price}</span>
          </div>

          <Plus className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />

          {/* Companion 2 */}
          <div className="shrink-0 w-24 sm:w-28 bg-white/10 rounded-2xl p-2.5 border border-white/15 text-center">
            <div className="w-full h-16 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden mb-1.5">
              <img src={companion2.image} alt={companion2.name} className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-[10px] font-bold text-white line-clamp-1 block">{companion2.name}</span>
            <span className="text-[11px] font-extrabold text-amber-300 mt-0.5 block">₹{companion2.price}</span>
          </div>
        </div>

        {/* Bundle Action CTA Box */}
        <div className="w-full md:w-56 bg-white/10 border border-white/15 rounded-2xl p-4 text-center shrink-0 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Bundle Price (3 Items)</span>
            <div className="flex items-baseline justify-center space-x-2 mt-0.5">
              <span className="text-xl font-black text-white">₹{bundleTotal.toLocaleString('en-IN')}</span>
              <span className="text-xs text-gray-400 line-through">₹{Math.round(bundleOriginalTotal).toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-300 block mt-0.5">
              Save ₹{Math.round(bundleSavings).toLocaleString('en-IN')} Extra!
            </span>
          </div>

          <button
            onClick={handleAddBundle}
            className={`w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer ${
              isAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-white stroke-[3]" />
                <span>All 3 Items Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add All 3 Items to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
