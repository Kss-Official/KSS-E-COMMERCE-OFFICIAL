import React, { useState } from 'react';
import { Share2, Trash2, Heart, ShoppingBag, Check } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';

export default function WishlistPage() {
  const { wishlistItems, addToCart, removeFromWishlist, clearWishlist } = useCartContext();
  const { navigateTo } = useNavigationContext();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [addedToast, setAddedToast] = useState(null);

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.id));
    }
  };

  const handleAddToCart = (product) => {
    const targetProduct = {
      ...product,
      id: product.productId || product.id,
      productId: product.productId || product.id
    };
    addToCart(targetProduct);
    setAddedToast(`Added "${product.name}" to your cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My BuyZo Wishlist',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setAddedToast('Wishlist link copied to clipboard!');
      setTimeout(() => setAddedToast(null), 3000);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-6 px-4 sm:px-8 md:px-12 lg:px-16 font-sans">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-800 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center space-x-2 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex items-center text-xs text-gray-500 mb-6 space-x-1 font-medium">
        <span 
          onClick={() => navigateTo('home')} 
          className="hover:text-gray-800 cursor-pointer transition-colors"
        >
          Home
        </span>
        <span className="text-gray-400">&gt;</span>
        <span className="text-gray-900 font-semibold">Wishlist</span>
      </div>

      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            My Wishlist ({wishlistItems.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
            Move items to cart and buy your favorite products
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleShare}
              className="flex items-center space-x-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-600" />
              <span>Share</span>
            </button>
            <button 
              onClick={clearWishlist}
              className="flex items-center space-x-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-600" />
              <span>Clear Wishlist</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1b4d3e]">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-gray-500 mb-6">
            Explore our collections and save your favorite products to buy them anytime later.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="bg-accent hover:bg-accent-600 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      ) : (
        /* Wishlist Table Container */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-cream border-b border-gray-200 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-accent focus:ring-[#ff5100] w-4 h-4 cursor-pointer accent-[#ff5100]"
                    />
                  </th>
                  <th className="py-3.5 px-4">PRODUCT</th>
                  <th className="py-3.5 px-6">PRICE</th>
                  <th className="py-3.5 px-6">STOCK STATUS</th>
                  <th className="py-3.5 px-6 text-right sm:text-center">ACTIONS</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {wishlistItems.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* Checkbox Column */}
                    <td className="py-4 px-4 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="rounded border-gray-300 text-accent focus:ring-[#ff5100] w-4 h-4 cursor-pointer accent-[#ff5100]"
                      />
                    </td>

                    {/* Product Details Column */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getProductImage(item.name, item.image)}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 
                            onClick={() => navigateTo('product-detail', item)}
                            className="text-sm font-bold text-gray-900 group-hover:text-[#1b4d3e] cursor-pointer transition-colors"
                          >
                            {item.name}
                          </h3>
                          {item.specs && (
                            <p className="text-xs text-gray-500 mt-0.5 font-normal">
                              {item.specs}
                            </p>
                          )}
                          {item.category && (
                            <span className="inline-block mt-1 bg-[#dcfce7] text-[#15803d] text-[11px] font-semibold px-2.5 py-0.5 rounded-md w-fit">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="py-4 px-6 align-middle whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through font-normal">
                              ₹{item.originalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-xs font-bold text-accent">
                              {item.discount}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Stock Status Column */}
                    <td className="py-4 px-6 align-middle whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          <span>In Stock</span>
                        </div>
                        <span className="text-xs text-gray-500 font-normal mt-0.5">
                          {item.deliveryDate || 'Delivery by 24 May'}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6 align-middle whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2.5">
                        {/* Remove Heart Button */}
                        <button
                          onClick={() => removeFromWishlist(item.productId || item.id)}
                          title="Remove from wishlist"
                          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-gray-400 text-gray-400 hover:fill-red-500 hover:text-red-500" />
                        </button>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="bg-accent hover:bg-accent-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


