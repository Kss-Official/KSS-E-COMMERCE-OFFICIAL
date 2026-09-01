import React, { useState } from 'react';
import { Heart, Star, Eye, Scale, BellRing, TrendingDown } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useCompareContext } from '../../context/CompareContext';
import { useNavigationContext } from '../../context/NavigationContext';
import { getProductImage } from '../../utils/productAssets';
import PriceBlock from './PriceBlock';
import CartButton from './CartButton';
import QuickViewModal from './QuickViewModal';
import BackInStockModal from './BackInStockModal';

export default function ProductCard({ product, view = 'grid', badge }) {
  const { toggleWishlist, wishlistItems } = useCartContext();
  const { toggleCompareItem, isInCompare } = useCompareContext();
  const { navigateTo } = useNavigationContext();

  const [showQuickView, setShowQuickView] = useState(false);
  const [showBackInStock, setShowBackInStock] = useState(false);

  const wished = wishlistItems?.some((item) => item.id === product.id);
  const showBadge = badge ?? (product.isNew ? 'NEW' : null);
  const isOutOfStock = product.stock_quantity === 0 || product.is_in_stock === false;

  const priceDrop = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : null;

  const open = () => navigateTo('product-detail', product);

  const handleWishlist = (e) => {
    e?.stopPropagation?.();
    toggleWishlist({ ...product, inStock: true, deliveryDate: 'Delivery by 2-3 Days' });
  };

  const handleCompare = (e) => {
    e?.stopPropagation?.();
    toggleCompareItem(product);
  };

  const handleQuickView = (e) => {
    e?.stopPropagation?.();
    setShowQuickView(true);
  };

  const handleBackInStock = (e) => {
    e?.stopPropagation?.();
    setShowBackInStock(true);
  };

  const imgSrc = getProductImage(product.name || product.title, product.image || product.primary_image);

  return (
    <>
      {showQuickView && <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />}
      {showBackInStock && <BackInStockModal product={product} onClose={() => setShowBackInStock(false)} />}

      {view === 'list' ? (
        <div className="bg-white rounded-2xl border border-gray-200 hover:border-brand-700 p-3 shadow-soft hover:shadow-lift transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group relative">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div onClick={open} className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden relative">
              <img
                src={imgSrc}
                alt={product.name || product.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 mb-1">
                {showBadge && (
                  <span className="bg-brand-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                    {showBadge}
                  </span>
                )}
                {priceDrop > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" />
                    <span>Price Drop</span>
                  </span>
                )}
              </div>
              <h4 onClick={open} className="text-sm font-bold text-ink group-hover:text-brand-700 cursor-pointer transition-colors">
                {product.name}
              </h4>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-gray-800 font-bold">{product.rating || 4.5}</span>
                <span>({product.reviews || product.reviewsCount || 12})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
            <div className="flex flex-col text-left sm:text-right">
              <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="md" />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleQuickView}
                title="Quick View"
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-800 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCompare}
                title={isInCompare(product.id) ? 'Remove from Compare' : 'Add to Compare'}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  isInCompare(product.id)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleWishlist}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <div className="w-28 sm:w-32">
                {isOutOfStock ? (
                  <button
                    onClick={handleBackInStock}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <BellRing className="w-3 h-3" />
                    <span>Notify Me</span>
                  </button>
                ) : (
                  <CartButton product={product} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border border-gray-200 hover:border-brand-700 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group relative min-w-0 w-full overflow-hidden box-border">
          <div className="min-w-0 w-full overflow-hidden">
            <div className="flex items-center justify-between mb-1 min-w-0 w-full">
              <div className="flex items-center gap-1 max-w-[75%]">
                <span className="bg-brand-700 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider truncate">
                  {showBadge || product.discount || 'DEAL'}
                </span>
                {priceDrop > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded-md truncate flex items-center gap-0.5" title={`Price dropped by ₹${priceDrop}`}>
                    <TrendingDown className="w-2.5 h-2.5 shrink-0" />
                    <span>-₹{priceDrop}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleQuickView}
                  title="Quick View"
                  className="w-6 h-6 rounded-full bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-brand-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCompare}
                  title={isInCompare(product.id) ? 'Remove Compare' : 'Add Compare'}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isInCompare(product.id) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-50 text-gray-400 hover:text-emerald-700'
                  }`}
                >
                  <Scale className="w-3 h-3" />
                </button>
                <button
                  onClick={handleWishlist}
                  aria-label="Toggle wishlist"
                  className="w-6 h-6 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                >
                  <Heart className={`w-3 h-3 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            <div onClick={open} className="w-full h-24 sm:h-36 flex items-center justify-center p-1 cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-gray-50/50 mb-1.5 relative group-hover:scale-102 transition-transform">
              <img
                src={imgSrc}
                alt={product.name || product.title}
                className="max-h-full max-w-full object-contain transition-transform duration-300"
              />
            </div>

            <h4 onClick={open} className="text-[11px] sm:text-xs font-bold text-ink group-hover:text-brand-700 line-clamp-2 cursor-pointer transition-colors leading-tight min-w-0">
              {product.name}
            </h4>

            <div className="mt-1 min-w-0 w-full overflow-hidden">
              <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="sm" />
            </div>

            <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] text-gray-500 font-semibold min-w-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-gray-800 font-bold">{product.rating || 4.5}</span>
              <span className="truncate">({product.reviews || product.reviewsCount || 12})</span>
            </div>
          </div>

          {/* Interactive Cart Button or Restock Alert */}
          <div className="mt-1.5 sm:mt-2 w-full min-w-0 overflow-hidden">
            {isOutOfStock ? (
              <button
                onClick={handleBackInStock}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <BellRing className="w-3 h-3" />
                <span>Notify Me 🔔</span>
              </button>
            ) : (
              <CartButton product={product} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
