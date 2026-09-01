import React from 'react';
import { Trash2, ArrowLeft, Star, ShoppingCart, Check, X, Scale } from 'lucide-react';
import { useCompareContext } from '../context/CompareContext';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompareContext();
  const { addToCart } = useCartContext();
  const { navigateTo } = useNavigationContext();

  if (!compareItems || compareItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-800">
          <Scale className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Product Comparison</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          You haven't added any products to compare yet. Browse the catalog and click "Compare" on any item to evaluate features side-by-side!
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="mt-6 px-6 py-3 bg-brand-800 hover:bg-[#ff5100] text-white font-bold text-sm rounded-xl transition-all shadow-md inline-flex items-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Products</span>
        </button>
      </div>
    );
  }

  // Build key list of specifications across all items
  const allSpecKeys = Array.from(
    new Set(
      compareItems.flatMap((item) => {
        if (!item.specifications) return [];
        if (typeof item.specifications === 'object') {
          return Object.keys(item.specifications);
        }
        return [];
      })
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-brand-700 hover:text-accent flex items-center space-x-1 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center space-x-2">
            <span>Product Comparison</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {compareItems.length} {compareItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </h1>
        </div>

        <button
          onClick={clearCompare}
          className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Comparison</span>
        </button>
      </div>

      {/* Comparison Matrix Table with horizontal scroll on small screens */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70">
              <th className="p-4 w-48 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Features</th>
              {compareItems.map((product) => (
                <th key={product.id} className="p-4 min-w-[200px] align-top">
                  <div className="relative group">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-1 -right-1 p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div
                      onClick={() => navigateTo('product-detail', product)}
                      className="w-24 h-24 mx-auto mb-3 bg-white p-2 rounded-xl border border-gray-100 flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={getProductImage(product.name || product.title, product.image || product.primary_image)}
                        alt={product.name || product.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <h4
                      onClick={() => navigateTo('product-detail', product)}
                      className="text-xs font-bold text-gray-900 hover:text-brand-700 text-center line-clamp-2 cursor-pointer"
                    >
                      {product.name || product.title}
                    </h4>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {/* Price Row */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Price</td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 text-center font-extrabold text-gray-900 text-sm">
                  ₹{Number(product.price || product.base_price || 0).toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Rating</td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <div className="inline-flex items-center space-x-1 font-bold text-gray-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating || product.average_rating || '4.5'}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Category Row */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Category</td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 text-center font-semibold text-gray-600">
                  {product.category || product.category_name || 'General'}
                </td>
              ))}
            </tr>

            {/* Stock Availability Row */}
            <tr>
              <td className="p-4 font-bold text-gray-700 bg-gray-50/30">Availability</td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  {product.stock_quantity !== 0 ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>In Stock</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                      <X className="w-3 h-3 stroke-[3]" />
                      <span>Out of Stock</span>
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Dynamic Technical Specs Rows */}
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="p-4 font-bold text-gray-700 bg-gray-50/30 capitalize">{key.replace('_', ' ')}</td>
                {compareItems.map((product) => {
                  const val = product.specifications?.[key] || product[key] || '-';
                  return (
                    <td key={product.id} className="p-4 text-center text-gray-600 font-medium">
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Add to Cart Actions Row */}
            <tr className="bg-gray-50/50">
              <td className="p-4 font-bold text-gray-700">Action</td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-2 px-3 bg-accent hover:bg-accent-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
