import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Bookmark,
  Sparkles,
  Gift,
  Truck,
  ArrowRight,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';
import { getProductImage } from '../../utils/productAssets';

export default function MiniCartDrawerModal() {
  const {
    cartItems,
    cartCount,
    isMiniCartOpen,
    closeMiniCart,
    updateQuantity,
    removeFromCart,
    saveForLater,
    isGiftWrapping,
    setIsGiftWrapping,
    giftMessage,
    setGiftMessage,
    giftWrapFee
  } = useCartContext();

  const { navigateTo } = useNavigationContext();

  // Price lock / Cart expiry countdown timer (15 mins)
  const [expirySecs, setExpirySecs] = useState(899); // 14m 59s

  useEffect(() => {
    if (!isMiniCartOpen) return;
    const timer = setInterval(() => {
      setExpirySecs((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(timer);
  }, [isMiniCartOpen]);

  const formatExpiry = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isMiniCartOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * (Number(item.quantity) || 1),
    0
  );
  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const totalPayable = subtotal + giftWrapFee;

  const handleCheckout = () => {
    closeMiniCart();
    navigateTo('checkout');
  };

  const handleViewFullCart = () => {
    closeMiniCart();
    navigateTo('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeMiniCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between relative border-l border-gray-200">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Your Shopping Cart</h3>
                <p className="text-xs text-gray-500 font-semibold">{cartCount} Item(s) selected</p>
              </div>
            </div>

            <button
              onClick={closeMiniCart}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Expiry & Price Lock Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-amber-900">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span>Prices & stock reserved for:</span>
            </div>
            <span className="bg-amber-200/80 px-2 py-0.5 rounded-md font-mono text-amber-950 font-black">
              {formatExpiry(expirySecs)}
            </span>
          </div>

          {/* Free Shipping Progress Bar & Prompt */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#063328] to-emerald-900 text-white px-5 py-3 border-b border-emerald-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-300 font-black">🎉 FREE Express Delivery Unlocked!</span>
                ) : (
                  <span>Add <strong className="text-amber-300">₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong className="text-emerald-300">FREE Delivery!</strong></span>
                )}
              </span>
              <span className="text-[10px] text-emerald-300 font-black">{progressPercent}%</span>
            </div>

            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-gray-500 space-y-3">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-brand-700">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Your Cart is Currently Empty</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Browse products and add items to your cart to enjoy exclusive discounts.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex items-center space-x-3.5">
                  <img
                    src={getProductImage(item.name, item.image)}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-gray-50 rounded-xl p-1.5 border border-gray-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-xs font-black text-gray-900">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => saveForLater(item.id)}
                          className="p-1 text-teal-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title="Save for Later"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Gift Wrapping & Message Card */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-2.5">
                <label className="flex items-center space-x-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiftWrapping}
                    onChange={(e) => setIsGiftWrapping(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-700 border-gray-300 focus:ring-brand-700 cursor-pointer"
                  />
                  <Gift className="w-4 h-4 text-pink-600" />
                  <span>Add Premium Gift Wrapping (+₹49) 🎁</span>
                </label>

                {isGiftWrapping && (
                  <input
                    type="text"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Write a custom gift greeting message..."
                    className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-pink-500"
                  />
                )}
              </div>
            )}

            {/* Guaranteed Delivery ETA Badge */}
            {cartItems.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs font-bold text-emerald-900">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Guaranteed Delivery:</span>
                </div>
                <span className="text-emerald-800 font-extrabold">Thursday, Sep 3</span>
              </div>
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-white space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {isGiftWrapping && (
                  <div className="flex justify-between font-bold text-pink-700">
                    <span>Gift Wrap:</span>
                    <span>+₹49</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-1.5">
                  <span>Total Amount:</span>
                  <span className="text-brand-900">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleViewFullCart}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-2xl transition-colors cursor-pointer text-center"
              >
                View & Edit Full Cart
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
