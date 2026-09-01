import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, Check, ShoppingBag, ArrowRight, Sparkles, AlertTriangle, Bookmark, BookmarkCheck, Gift, Clock, Truck } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';
import { fetchProducts, fetchAvailableCoupons, getCurrentUser } from '../services/api';
import CouponModal from '../components/ui/CouponModal';
import RecentlyViewedBar from '../components/ui/RecentlyViewedBar';

export default function CartPage() {
  const {
    cartItems,
    savedForLater,
    updateQuantity,
    removeFromCart,
    addToCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
    isGiftWrapping,
    setIsGiftWrapping,
    giftMessage,
    setGiftMessage,
    giftWrapFee
  } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const [checkoutToast, setCheckoutToast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [topCoupon, setTopCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // "You may also like" and the coupon hint both come from MySQL.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [rows, coupons] = await Promise.all([
        fetchProducts({ is_featured: 'true', no_page: 'true' }),
        fetchAvailableCoupons()
      ]);
      if (cancelled) return;

      if (Array.isArray(rows) && rows.length > 0) {
        const inCart = new Set(cartItems.map((item) => String(item.id)));
        setRecommendations(
          rows
            .filter((p) => !inCart.has(String(p.id)))
            .slice(0, 4)
            .map((p) => ({
              ...p,
              name: p.name || p.title,
              image: p.image || p.primary_image || getProductImage(p.name || p.title),
              price: Number(p.price ?? p.current_price ?? 0),
              originalPrice: Number(p.originalPrice ?? p.base_price ?? 0)
            }))
        );
      }

      if (Array.isArray(coupons) && coupons.length > 0) {
        // Show the single most generous live offer.
        const best = [...coupons].sort(
          (a, b) => (b.max_discount_amount || b.discount_value) - (a.max_discount_amount || a.discount_value)
        )[0];
        setTopCoupon(best);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalOriginalPrice = cartItems.reduce((acc, item) => {
    const orig = item.originalPrice || item.price * 1.5;
    return acc + orig * item.quantity;
  }, 0);

  const finalTotalAmount = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const totalDiscount = totalOriginalPrice - finalTotalAmount;

  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.is_percentage
      ? Math.min(
          Math.round((finalTotalAmount * Number(appliedCoupon.discount_value || 0)) / 100),
          Number(appliedCoupon.max_discount_amount || 9999)
        )
      : Number(appliedCoupon.discount_value || 0)
    : 0;

  const netPayableTotal = Math.max(0, finalTotalAmount - couponDiscountAmount + giftWrapFee);
  const grandTotalSavings = totalDiscount + couponDiscountAmount;

  const handleApplyCouponCode = (codeStr) => {
    const trimmed = (codeStr || '').trim().toUpperCase();
    if (!trimmed) return;

    const validCoupons = [
      { code: 'BUYZO100', title: 'FLAT ₹100 OFF', min_order_amount: 500, discount_value: 100, is_percentage: false },
      { code: 'WELCOME15', title: '15% Instant Discount', min_order_amount: 299, discount_value: 15, is_percentage: true },
      { code: 'FREESHIP', title: 'FREE Shipping', min_order_amount: 199, discount_value: 49, is_percentage: false },
      { code: 'MEGA250', title: 'FLAT ₹250 OFF', min_order_amount: 1499, discount_value: 250, is_percentage: false }
    ];

    const matched = validCoupons.find((c) => c.code === trimmed);

    if (matched) {
      if (finalTotalAmount < matched.min_order_amount) {
        setCheckoutToast(`Order minimum ₹${matched.min_order_amount} required for ${matched.code}`);
        setTimeout(() => setCheckoutToast(null), 3000);
        return;
      }
      setAppliedCoupon(matched);
      setCheckoutToast(`🎉 Coupon ${matched.code} applied successfully!`);
      setTimeout(() => setCheckoutToast(null), 3000);
    } else {
      const customCoupon = { code: trimmed, title: `${trimmed} Promo Code`, discount_value: 10, is_percentage: true, min_order_amount: 0 };
      setAppliedCoupon(customCoupon);
      setCheckoutToast(`🎉 Promo code ${trimmed} applied!`);
      setTimeout(() => setCheckoutToast(null), 3000);
    }
  };

  // Warehouse stock decides the quantity ceiling for each line.
  const stockCapFor = (item) => {
    const stock = Number(item.stock_quantity ?? item.stock ?? 0);
    return stock > 0 ? Math.min(stock, 10) : 10;
  };

  const handleCheckout = () => {
    const user = getCurrentUser();
    if (!user) {
      sessionStorage.setItem('buyzo_post_login_redirect', 'checkout');
      navigateTo('login');
      return;
    }
    navigateTo('checkout');
  };

  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'saved'

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {checkoutToast && (
        <div className="fixed bottom-6 right-6 bg-brand-700 text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center space-x-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{checkoutToast}</span>
        </div>
      )}

      {/* Page Header & Interactive Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          My Shopping Bag
        </h1>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cart'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Active Cart ({cartItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-teal-700" />
            <span>Saved for Later ({savedForLater.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* Saved for Later View */
        <div className="space-y-6">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-teal-700" />
                  <span>Saved for Later Items ({savedForLater.length})</span>
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Items saved here are stored safely and will not be charged until moved back to cart.
                </p>
              </div>
              {savedForLater.length > 0 && (
                <button
                  onClick={() => {
                    savedForLater.forEach((item) => moveToCart(item.id));
                  }}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-brand-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Move All to Cart
                </button>
              )}
            </div>

            {savedForLater.length === 0 ? (
              <div className="py-12 text-center text-gray-500 space-y-2">
                <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No Saved Items</p>
                <p className="text-xs text-gray-400">Click "Save Later" on any cart item to keep it saved for your next purchase.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {savedForLater.map((savedItem) => (
                  <div key={savedItem.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getProductImage(savedItem.name, savedItem.image)}
                        alt={savedItem.name}
                        className="w-18 h-18 object-contain bg-gray-50 rounded-xl p-2 border border-gray-200 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{savedItem.name}</h3>
                        <div className="flex items-baseline space-x-2 mt-1">
                          <span className="text-sm font-black text-gray-900">₹{Number(savedItem.price).toLocaleString('en-IN')}</span>
                          {savedItem.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{Number(savedItem.originalPrice).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          moveToCart(savedItem.id);
                          setActiveTab('cart');
                        }}
                        className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeFromSaved(savedItem.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty Cart View */
        <div className="space-y-8">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-10 text-center shadow-2xs max-w-lg mx-auto my-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-700">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Active Cart is Empty</h2>
            <p className="text-xs text-gray-500 mt-2 mb-6">
              {savedForLater.length > 0
                ? `You have ${savedForLater.length} saved item(s) in your "Saved for Later" list.`
                : "Looks like you haven't added anything to your cart yet."}
            </p>
            <div className="flex items-center justify-center gap-3">
              {savedForLater.length > 0 && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className="py-2.5 px-6 bg-emerald-50 hover:bg-emerald-100 text-brand-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  View Saved Items ({savedForLater.length})
                </button>
              )}
              <button
                onClick={() => navigateTo('electronics')}
                className="py-2.5 px-6 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer"
              >
                <span>Explore Electronics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {savedForLater.length > 0 && (
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4.5 h-4.5 text-teal-700" />
                  <span>Saved for Later ({savedForLater.length})</span>
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {savedForLater.map((savedItem) => (
                  <div key={savedItem.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={getProductImage(savedItem.name, savedItem.image)}
                        alt={savedItem.name}
                        className="w-14 h-14 object-contain bg-gray-50 rounded-xl p-1 border border-gray-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{savedItem.name}</h4>
                        <span className="text-xs font-black text-gray-900">₹{Number(savedItem.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => moveToCart(savedItem.id)}
                      className="px-3.5 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Move to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Cart Grid Layout: Items List (Left) + Order Summary (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free Shipping Progress Bar */}
            <div className="bg-gradient-to-r from-emerald-900 via-[#063328] to-emerald-950 text-white rounded-2xl p-4 shadow-md border border-emerald-700/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400 fill-amber-300" />
                  <span>
                    {finalTotalAmount >= 499 ? (
                      <span className="text-emerald-300 font-extrabold">
                        🎉 Congratulations! You unlocked FREE Express Delivery!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-amber-300">₹{(499 - finalTotalAmount).toLocaleString('en-IN')}</strong> more to unlock <strong className="text-emerald-300">FREE Express Delivery!</strong>
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-300">
                  {Math.min(100, Math.round((finalTotalAmount / 499) * 100))}%
                </span>
              </div>
              
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.min(100, Math.round((finalTotalAmount / 499) * 100))}%` }}
                />
              </div>
            </div>

            {/* Cart Items Box */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}`}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Left: Product Thumbnail & Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-gray-200/80 rounded-xl p-2 flex items-center justify-center shrink-0">
                        <img
                          src={getProductImage(item.name, item.image)}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3
                          onClick={() => navigateTo('product-detail', item)}
                          className="font-bold text-gray-900 text-sm sm:text-base hover:text-brand-700 cursor-pointer transition-colors"
                        >
                          {item.name}
                        </h3>
                        {item.selectedColor && (
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            Color: <span className="text-gray-600 font-semibold">{item.selectedColor}</span>
                          </p>
                        )}
                        {/* Live stock signal straight off the catalogue row */}
                        {Number(item.stock_quantity ?? item.stock ?? 0) > 0 &&
                          Number(item.stock_quantity ?? item.stock) <= 10 && (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <AlertTriangle className="w-3 h-3" />
                              Only {Number(item.stock_quantity ?? item.stock)} left in stock
                            </p>
                          )}
                        {item.is_in_stock === false && (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            Out of stock — remove to continue
                          </p>
                        )}
                        {/* Price Display */}
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-base font-extrabold text-gray-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-xs font-bold text-accent">
                              {item.discount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper & Trash Remove */}
                    <div className="flex items-center space-x-4 self-end sm:self-center">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= stockCapFor(item)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:cursor-not-allowed disabled:text-gray-300"
                          title={
                            item.quantity >= stockCapFor(item)
                              ? `Maximum ${stockCapFor(item)} per order`
                              : 'Increase Quantity'
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Save for Later Button */}
                      <button
                        onClick={() => saveForLater(item.id)}
                        className="p-2 text-teal-700 hover:text-teal-900 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer flex items-center space-x-1"
                        title="Save for Later"
                      >
                        <Bookmark className="w-4 h-4 stroke-[2]" />
                        <span className="hidden sm:inline text-xs font-semibold">Save Later</span>
                      </button>

                      {/* Trash Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved for Later Section */}
            {savedForLater && savedForLater.length > 0 && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4.5 h-4.5 text-teal-700" />
                    <span>Saved for Later ({savedForLater.length})</span>
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">Items kept here won't be charged at checkout</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {savedForLater.map((savedItem) => (
                    <div key={savedItem.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={getProductImage(savedItem.name, savedItem.image)}
                          alt={savedItem.name}
                          className="w-16 h-16 object-contain bg-gray-50 rounded-xl p-1.5 border border-gray-200 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{savedItem.name}</h4>
                          <span className="text-xs font-black text-gray-900">₹{Number(savedItem.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveToCart(savedItem.id)}
                          className="px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromSaved(savedItem.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove from Saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* You May Also Like Section */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4">You may also like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => navigateTo('product-detail', rec)}
                      className="bg-white border border-gray-200/90 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 mb-2">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-900 text-center line-clamp-1 group-hover:text-brand-700">
                        {rec.name}
                      </span>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-xs font-extrabold text-gray-900">
                          ₹{rec.price.toLocaleString('en-IN')}
                        </span>
                        {rec.originalPrice > rec.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{rec.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Price Details (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-4 sticky top-6">
              {/* Live Coupon Hint */}
              <div
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-gold/10 border border-gold/30 hover:border-gold/60 rounded-xl px-3.5 py-3 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold shrink-0" />
                  <p className="text-xs font-semibold text-brand-800">
                    {topCoupon ? (
                      <span>Use <span className="font-black text-accent">{topCoupon.code}</span> for instant savings!</span>
                    ) : (
                      <span>View & Apply Available Store Coupons</span>
                    )}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-accent group-hover:underline shrink-0">View All</span>
              </div>

              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Price Details
              </h2>

              <div className="space-y-3 text-xs font-medium text-gray-700">
                <div className="flex justify-between items-center">
                  <span>Price ({totalItemsCount} items)</span>
                  <span className="font-bold text-gray-900">
                    ₹{totalOriginalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount</span>
                  <span className="font-bold text-brand-700">
                    -₹{totalDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <span className="font-extrabold text-brand-700">FREE</span>
                </div>
              </div>

              {/* Total Amount Divider */}
              <div className="border-t border-dashed border-gray-200 pt-3 my-2 flex justify-between items-center text-gray-900">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-xl font-black">
                  ₹{netPayableTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Savings Banner */}
              {grandTotalSavings > 0 && (
                <div className="bg-emerald-50/80 border border-emerald-200/70 text-brand-700 text-xs font-bold rounded-xl p-3 text-center">
                  You saved ₹{grandTotalSavings.toLocaleString('en-IN')} on this order
                </div>
              )}

              {/* Store Coupon Box (Placed Directly Above Proceed to Checkout) */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2 my-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-extrabold text-amber-950">
                    <Sparkles className="w-4 h-4 text-accent fill-amber-300 shrink-0" />
                    <span>Have a Coupon / Promo Code?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(true)}
                    className="text-[11px] font-extrabold text-accent hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {!appliedCoupon ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApplyCouponCode(couponCodeInput);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter Coupon Code (e.g. WELCOME15)"
                      className="flex-1 bg-white border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-100/90 border border-emerald-300 text-emerald-950 px-3 py-2 rounded-xl text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> Applied! (-₹{couponDiscountAmount.toLocaleString('en-IN')})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCodeInput('');
                      }}
                      className="text-red-600 hover:text-red-800 hover:underline text-[11px] font-extrabold cursor-pointer ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-accent hover:bg-accent-600 text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer mt-2"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping Button */}
              <button
                onClick={() => navigateTo('electronics')}
                className="w-full py-3 bg-white border border-brand-700 text-brand-700 hover:bg-emerald-50 font-bold text-sm rounded-xl transition-all cursor-pointer mt-2"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recently Viewed Bar */}
      <RecentlyViewedBar />

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        cartTotal={finalTotalAmount}
        onApplyCoupon={(coupon) => {
          setAppliedCoupon(coupon);
          setCouponCodeInput(coupon.code);
          setCheckoutToast(`Applied Coupon ${coupon.code}! Saved discount on order.`);
          setTimeout(() => setCheckoutToast(null), 4000);
        }}
      />
    </div>
  );
}


