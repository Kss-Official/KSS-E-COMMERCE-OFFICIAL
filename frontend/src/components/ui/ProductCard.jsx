import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';
import PriceBlock from './PriceBlock';

export default function ProductCard({ product, view = 'grid', badge }) {
  const { addToCart, toggleWishlist, wishlistItems } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const wished = wishlistItems?.some((item) => item.id === product.id);
  const showBadge = badge ?? (product.isNew ? 'NEW' : null);

  const open = () => navigateTo('product-detail', product);
  const handleWishlist = (e) => {
    e?.stopPropagation?.();
    toggleWishlist({ ...product, inStock: true, deliveryDate: 'Delivery by 2-3 Days' });
  };

  if (view === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-brand-700 p-3 shadow-soft hover:shadow-lift transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div onClick={open} className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden">
            <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div>
            {showBadge && (
              <span className="inline-block bg-brand-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase mb-1">
                {showBadge}
              </span>
            )}
            <h4 onClick={open} className="text-sm font-bold text-ink group-hover:text-brand-700 cursor-pointer transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-gray-800 font-bold">{product.rating}</span>
              <span>({product.reviews || product.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
          <div className="flex flex-col text-left sm:text-right">
            <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${wished ? 'fill-red-500 text-red-500' : 'stroke-[1.8]'}`} />
            </button>
            <button
              onClick={() => addToCart({ ...product, quantity: 1 })}
              className="bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-brand-700 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group relative">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="bg-brand-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
            {showBadge || product.discount || 'DEAL'}
          </span>
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className="w-7 h-7 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Heart className={`w-3.5 h-3.5 ${wished ? 'fill-red-500 text-red-500' : 'stroke-[1.8]'}`} />
          </button>
        </div>

        <div onClick={open} className="w-full h-36 sm:h-40 flex items-center justify-center p-2 cursor-pointer overflow-hidden rounded-xl bg-gray-50/50 mb-2">
          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>

        <h4 onClick={open} className="text-xs font-bold text-ink group-hover:text-brand-700 line-clamp-2 cursor-pointer transition-colors leading-snug">
          {product.name}
        </h4>

        <div className="mt-1.5">
          <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="sm" />
        </div>

        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-semibold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-gray-800 font-bold">{product.rating}</span>
          <span>({product.reviews || product.reviewsCount})</span>
        </div>
      </div>

      <button
        onClick={() => addToCart({ ...product, quantity: 1 })}
        className="w-full bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2.5 shadow-soft cursor-pointer"
      >
        <ShoppingCart className="w-3 h-3" />
        <span>Add to Cart</span>
      </button>
    </div>
  );
}
