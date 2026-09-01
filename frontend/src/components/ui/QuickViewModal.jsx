import React, { useState } from 'react';
import { X, Star, ShoppingCart, Zap, Heart, Check, Truck, ShieldCheck, MapPin, Scale } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useCompareContext } from '../../context/CompareContext';
import { useNavigationContext } from '../../context/NavigationContext';
import { checkPincodeServiceability, getSavedPincode } from '../../utils/pincodeService';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted, getItemQuantity } = useCartContext();
  const { toggleCompareItem, isInCompare } = useCompareContext();
  const { navigateTo } = useNavigationContext();

  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(product?.image || product?.primary_image);
  const [pincode, setPincode] = useState(() => getSavedPincode());
  const [pincodeRes, setPincodeRes] = useState(() => checkPincodeServiceability(getSavedPincode()));
  const [toastMsg, setToastMsg] = useState('');

  if (!product) return null;

  const discount = product.discount || (product.originalPrice ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF` : null);
  const gallery = Array.from(new Set([
    product.image || product.primary_image,
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ].filter(Boolean)));

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    setPincodeRes(checkPincodeServiceability(pincode));
  };

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity });
    onClose();
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-[#004d47] transition-colors cursor-pointer z-10"
          title="Close Quick View"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Notification Toast */}
        {toastMsg && (
          <div className="absolute top-4 left-4 z-20 bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg animate-bounce flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-6 items-start">
          {/* Left Gallery (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="w-full h-64 bg-gray-50 rounded-2xl border border-gray-200/80 p-4 flex items-center justify-center relative group">
              <img
                src={selectedImg}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              {discount && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {discount}
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`w-14 h-14 rounded-xl border p-1 bg-white shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                      selectedImg === img ? 'border-emerald-700 ring-2 ring-emerald-700/20' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                {product.brand || product.category || 'BuyZo Store'}
              </span>
              <h2 className="text-lg font-extrabold text-gray-900 leading-snug mt-0.5">
                {product.name}
              </h2>
            </div>

            {/* Price & Rating */}
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-black text-gray-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              <div className="ml-auto flex items-center space-x-1 text-xs font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-gray-800">{product.rating || 4.5}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 font-normal leading-relaxed line-clamp-3">
              {product.description || 'Premium quality product crafted for maximum durability and everyday performance. Includes standard 1 year manufacturer warranty.'}
            </p>

            {/* Pincode Checker */}
            <form onSubmit={handlePincodeCheck} className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter PIN code"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-700"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Check PIN
              </button>
            </form>

            {pincodeRes && (
              <p className={`text-[11px] font-bold ${pincodeRes.isValid ? 'text-emerald-700' : 'text-red-600'}`}>
                {pincodeRes.message}
              </p>
            )}

            {/* Quantity Stepper & CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  addToCart({ ...product, quantity });
                  showNotification(`Added ${quantity} to bag`);
                }}
                className="flex-1 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{getItemQuantity(product) > 0 ? `Added (${getItemQuantity(product)})` : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-xs"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product);
                  showNotification(isWishlisted(product.id) ? 'Removed from Wishlist' : 'Saved to Wishlist');
                }}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted(product.id)
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-red-500' : ''}`} />
              </button>

              <button
                onClick={() => {
                  toggleCompareItem(product);
                  showNotification(isInCompare(product.id) ? 'Removed from Compare' : 'Added to Compare');
                }}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isInCompare(product.id)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title="Add to Compare"
              >
                <Scale className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
