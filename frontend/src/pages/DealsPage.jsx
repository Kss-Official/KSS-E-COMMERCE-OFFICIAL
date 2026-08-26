import CTAPane from '../features/festive/components/CTAPane';
import React, { useState, useEffect } from 'react';
import {
  Tag,
  Flame,
  Star,
  Zap,
  Calendar,
  Percent,
  CreditCard,
  Gift,
  ShieldCheck,
  RotateCcw,
  Check,
  Heart,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  BadgeCheck,
  Lock,
  Shirt,
  Watch
} from 'lucide-react';
import rakhiDealsExactCardImg from '../assets/images/rakhi_deals_exact_card.png';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';
import { fetchProducts } from '../services/api';


export default function DealsPage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { navigateTo } = useNavigationContext();

  // Navigation and Filter states
  const [activeNav, setActiveNav] = useState('Deal of the Day');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  const [discountSlider, setDiscountSlider] = useState(70);
  const [wishlistActive, setWishlistActive] = useState({});
  const [addedToast, setAddedToast] = useState(null);

  // Live deals straight from MySQL (`is_deal_of_day` products).
  const [dealProducts, setDealProducts] = useState([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingDeals(true);
      // Deals first; if the flag has not been applied yet, fall back to the
      // steepest discounts in the catalogue so the page is never empty.
      let rows = await fetchProducts({ is_deal_of_day: 'true', no_page: 'true' });
      if (!rows.length) {
        rows = await fetchProducts({ ordering: '-discount_percentage', no_page: 'true' });
      }
      if (cancelled) return;

      const mapped = rows
        .map((p) => {
          const price = Number(p.price ?? p.current_price ?? p.discount_price ?? 0);
          const originalPrice = Number(p.originalPrice ?? p.base_price ?? price);
          const saved = Math.max(0, originalPrice - price);
          const percent = originalPrice > 0 ? Math.round((saved / originalPrice) * 100) : 0;
          return {
            id: p.id,
            slug: p.slug,
            name: p.name || p.title,
            image: p.image || p.primary_image || getProductImage(p.name || p.title),
            price,
            originalPrice,
            discount: p.discount || `${percent}% OFF`,
            discountPercent: percent,
            saveAmount: saved.toLocaleString('en-IN'),
            saveText: `Save ₹${saved.toLocaleString('en-IN')}`,
            rating: Number(p.rating ?? p.average_rating ?? 0) || 4.2,
            reviews: Number(p.reviews ?? p.review_count ?? 0),
            soldCount: `${Number(p.popularity ?? p.reviews ?? 0)}+ sold`,
            category: p.category || p.category_name || 'Deals',
            subcategory: p.subcategory || p.subcategory_name || '',
            brand: p.brand || p.brand_name || '',
            stock: Number(p.stock_quantity ?? 0),
            inStock: p.is_in_stock !== false
          };
        })
        .sort((a, b) => b.discountPercent - a.discountPercent);

      setDealProducts(mapped);
      setIsLoadingDeals(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    discount: true,
    price: true,
    categories: true
  });

  // Countdown timer for Deal of the Day (08:45:32)
  const [timeLeft, setTimeLeft] = useState({ hrs: 8, mins: 45, secs: 32 });
  // Flash deal timer (02:15:32)
  const [flashTimeLeft, setFlashTimeLeft] = useState({ hrs: 2, mins: 15, secs: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: 8, mins: 45, secs: 32 };
      });
      setFlashTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: 2, mins: 15, secs: 32 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleToggleWishlist = (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const clearAllFilters = () => {
    setSelectedDiscounts([]);
    setSelectedCategories([]);
    setPriceMin(0);
    setPriceMax(10000);
    setDiscountSlider(70);
    setActiveCategory('All');
  };

  // Nav menu items
  const sidebarNavItems = [
    { id: 'Deal of the Day', label: 'Deal of the Day', icon: Flame },
    { id: 'Top Deals', label: 'Top Deals', icon: Star },
    { id: 'Flash Deals', label: 'Flash Deals', icon: Zap },
    { id: 'Weekend Offers', label: 'Weekend Offers', icon: Calendar },
    { id: 'Clearance Sale', label: 'Clearance Sale', icon: Tag },
    { id: 'Bank Offers', label: 'Bank Offers', icon: CreditCard },
    { id: 'Combo Offers', label: 'Combo Offers', icon: Gift }
  ];

  // Discount filter options — counts are computed from the live deal set.
  const discountOptions = [10, 20, 30, 50].map((threshold) => ({
    label: `${threshold}% and above`,
    threshold,
    count: dealProducts.filter((p) => p.discountPercent >= threshold).length
  }));

  // Categories filter options, ordered by how many deals each holds.
  const categoryFilterOptions = Object.entries(
    dealProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Category Tabs
  const categoryTabs = ['All', ...categoryFilterOptions.map((c) => c.label)];

  // Main Deal of the Day Product — the steepest live discount.
  const featuredDeal = dealProducts[0] || null;

  // Everything below the hero card.
  const topDealsProducts = dealProducts.slice(1);

  // Filtered products: category tab + sidebar filters all apply.
  const displayedProducts = topDealsProducts.filter((p) => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
    if (selectedDiscounts.length) {
      const minDiscount = Math.min(
        ...selectedDiscounts.map((label) => parseInt(label, 10) || 0)
      );
      if (p.discountPercent < minDiscount) return false;
    }
    if (p.price < priceMin || p.price > priceMax) return false;
    return true;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-brand-800 text-white px-5 py-3 rounded-xl shadow-2xl font-medium text-sm z-50 flex items-center space-x-3 border border-emerald-500/30 animate-bounce">
          <div className="bg-emerald-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
          <span>{addedToast}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT SIDEBAR (3 COLS) ================= */}
          <aside className="lg:col-span-3 space-y-5">
            
            {/* Top Navigation Menu Card */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100/90">
              {/* Header */}
              <div className="flex items-center space-x-2.5 px-3 py-2 text-brand-800">
                <Tag className="w-5 h-5 fill-[#063328] text-brand-800" />
                <span className="font-extrabold text-base tracking-tight text-gray-900">Deals</span>
              </div>

              {/* Menu Items */}
              <div className="mt-2 space-y-1">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#e4f1ed] text-brand-800 border-l-4 border-brand-800 rounded-l-none pl-3 shadow-xs'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-accent fill-[#ff5100]'
                            : 'text-gray-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100/90 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <span className="font-extrabold text-sm text-gray-900">Filters</span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-brand-700 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Discount Filter Accordion */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('discount')}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer"
                >
                  <span>Discount</span>
                  {openSections.discount ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.discount && (
                  <div className="space-y-2.5 pt-1">
                    {discountOptions.map((opt) => (
                      <label
                        key={opt.label}
                        className="flex items-center justify-between text-xs text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={selectedDiscounts.includes(opt.label)}
                            onChange={() => {
                              setSelectedDiscounts((prev) =>
                                prev.includes(opt.label)
                                  ? prev.filter((d) => d !== opt.label)
                                  : [...prev, opt.label]
                              );
                            }}
                            className="w-3.5 h-3.5 rounded text-brand-800 focus:ring-[#063328] border-gray-300 cursor-pointer"
                          />
                          <span>{opt.label}</span>
                        </div>
                        <span className="text-gray-400 font-medium">({opt.count})</span>
                      </label>
                    ))}

                    {/* Dual Range Bar */}
                    <div className="pt-2">
                      <div className="relative flex items-center my-1.5">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-800 rounded-full w-4/5" />
                        </div>
                        <div className="absolute left-0 w-3.5 h-3.5 bg-brand-800 rounded-full shadow-xs cursor-pointer" />
                        <div className="absolute right-1/5 w-3.5 h-3.5 bg-brand-800 rounded-full shadow-xs cursor-pointer" />
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500 font-bold mt-1">
                        <span>10%</span>
                        <span>70%+</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range Accordion */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer"
                >
                  <span>Price Range</span>
                  {openSections.price ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.price && (
                  <div className="space-y-3 pt-1">
                    {/* Track */}
                    <div className="relative flex items-center my-1.5">
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-800 rounded-full w-full" />
                      </div>
                      <div className="absolute left-0 w-3.5 h-3.5 bg-brand-800 rounded-full shadow-xs cursor-pointer" />
                      <div className="absolute right-0 w-3.5 h-3.5 bg-brand-800 rounded-full shadow-xs cursor-pointer" />
                    </div>

                    {/* Inputs */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-semibold">
                        ₹ {priceMin}
                      </div>
                      <span className="text-gray-400 font-bold">-</span>
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-semibold">
                        ₹ {priceMax}+
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Accordion */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer"
                >
                  <span>Categories</span>
                  {openSections.categories ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {openSections.categories && (
                  <div className="space-y-2.5 pt-1">
                    {categoryFilterOptions.map((cat) => (
                      <label
                        key={cat.label}
                        className="flex items-center justify-between text-xs text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.label)}
                            onChange={() => {
                              setSelectedCategories((prev) =>
                                prev.includes(cat.label)
                                  ? prev.filter((c) => c !== cat.label)
                                  : [...prev, cat.label]
                              );
                            }}
                            className="w-3.5 h-3.5 rounded text-brand-800 focus:ring-[#063328] border-gray-300 cursor-pointer"
                          />
                          <span>{cat.label}</span>
                        </div>
                        <span className="text-gray-400 font-medium">({cat.count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ================= RIGHT MAIN AREA (9 COLS) ================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Row: Deal of the Day Card + Rakhi Special Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Deal of the Day Card (6 cols) */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100/90 shadow-xs flex flex-col justify-between">
                {/* Header with Title and Countdown */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    Deal of the Day
                  </h2>
                  
                  {/* Ends In Countdown Badge */}
                  <div className="flex items-center space-x-2 bg-[#fff2ea] px-3 py-1.5 rounded-xl border border-orange-100">
                    <span className="text-xs font-bold text-accent">Ends in</span>
                    <div className="flex items-center space-x-1 font-black text-white text-xs">
                      <span className="bg-accent px-1.5 py-0.5 rounded-md leading-tight">
                        {String(timeLeft.hrs).padStart(2, '0')}
                      </span>
                      <span className="text-accent font-black">:</span>
                      <span className="bg-accent px-1.5 py-0.5 rounded-md leading-tight">
                        {String(timeLeft.mins).padStart(2, '0')}
                      </span>
                      <span className="text-accent font-black">:</span>
                      <span className="bg-accent px-1.5 py-0.5 rounded-md leading-tight">
                        {String(timeLeft.secs).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content: Image Left, Details Right */}
                {featuredDeal ? (
                <div className="grid grid-cols-12 gap-5 items-center mt-4">
                  {/* Product Image in Container */}
                  <div className="col-span-5 bg-white border border-gray-100 rounded-2xl p-3 flex items-center justify-center h-44 shadow-2xs">
                    <img
                      src={featuredDeal.image}
                      alt={featuredDeal.name}
                      className="max-h-36 max-w-full object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="col-span-7 space-y-2">
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {featuredDeal.name}
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center space-x-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 fill-current ${
                              i < 4 ? 'text-amber-400' : 'text-gray-200 fill-none'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">({featuredDeal.rating})</span>
                      <span className="text-xs text-gray-400">{featuredDeal.soldCount}</span>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-baseline space-x-2 pt-0.5">
                      <span className="text-lg font-black text-gray-900">
                        ₹{featuredDeal.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{featuredDeal.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-extrabold text-accent">
                        {featuredDeal.discount}
                      </span>
                    </div>

                    {/* Save Amount */}
                    <div className="text-xs text-gray-500 font-medium">
                      Save ₹{featuredDeal.saveAmount}
                    </div>

                    {/* View Deal Button */}
                    <button
                      onClick={() => navigateTo('product-detail', featuredDeal)}
                      className="mt-2 w-full py-2.5 bg-accent hover:bg-[#e04700] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-orange-500/25 transition-all cursor-pointer"
                    >
                      View Deal
                    </button>
                  </div>
                </div>
                ) : (
                  /* Loading skeleton in the same card geometry */
                  <div className="grid grid-cols-12 gap-5 items-center mt-4 animate-pulse">
                    <div className="col-span-5 h-44 rounded-2xl bg-gray-100 border border-gray-100" />
                    <div className="col-span-7 space-y-3">
                      <div className="h-4 w-4/5 rounded bg-gray-100" />
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                      <div className="h-5 w-2/3 rounded bg-gray-100" />
                      <div className="h-9 w-full rounded-xl bg-gray-100" />
                    </div>
                  </div>
                )}
              </div>

              {/* Rakhi Promo Banner (Exact Design 100% Matching Uploaded Asset) */}
              <div
                onClick={() => setActiveCategory('Fashion')}
                className="lg:col-span-6 rounded-3xl overflow-hidden shadow-md border border-emerald-500/20 group relative cursor-pointer flex items-center justify-center bg-[#042820] transition-all hover:shadow-xl"
              >
                <img
                  src={rakhiDealsExactCardImg}
                  alt="Rakhi Special - More Love. More Gifts. More Savings."
                  className="w-full h-full object-cover object-center select-none transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

            </div>

            {/* Top Deals Section */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  Top Deals
                  {!isLoadingDeals && displayedProducts.length > 0 && (
                    <span className="ml-2 align-middle text-xs font-bold text-gray-400">
                      {displayedProducts.length} live offers
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="text-xs font-bold text-brand-800 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>View All Deals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none select-none">
                {categoryTabs.map((tab) => {
                  const isActive = activeCategory === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveCategory(tab)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-800 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Product Cards Grid (live from MySQL) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {isLoadingDeals &&
                  [...Array(10)].map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="bg-white rounded-2xl border border-gray-200 p-3 shadow-xs animate-pulse"
                    >
                      <div className="h-4 w-14 rounded-md bg-gray-100" />
                      <div className="mt-2 h-28 sm:h-32 w-full rounded-xl bg-gray-100" />
                      <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                      <div className="mt-1.5 h-3 w-2/3 rounded bg-gray-100" />
                      <div className="mt-2.5 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                {displayedProducts.map((product) => {
                  const inWish = isWishlisted(product);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="bg-white rounded-2xl border border-gray-200 hover:border-brand-700 p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group cursor-pointer"
                    >
                      {/* Top Badges: Discount on Left, Wishlist on Right */}
                      <div className="flex items-center justify-between mb-1 relative z-10">
                        <span className="bg-accent text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                          {product.discount}
                        </span>

                        <button
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className="p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-gray-50 transition-colors"
                          title="Save to Wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              inWish ? 'fill-rose-500 text-rose-500 stroke-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Image Container */}
                      <div className="h-28 sm:h-32 w-full flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={getProductImage(product.name || product.title, product.image || product.primary_image)}
                          alt={product.name || product.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProductImage(product.name || product.title, '');
                          }}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Info */}
                      <div className="mt-2 space-y-1">
                        <h3 className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 min-h-[32px]">
                          {product.name}
                        </h3>

                        {/* Price Line */}
                        <div className="flex items-baseline space-x-1.5 pt-0.5">
                          <span className="text-xs font-black text-gray-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Savings in Orange */}
                        <div className="text-[11px] font-bold text-accent">
                          {product.saveText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state — filters excluded every live deal */}
              {!isLoadingDeals && displayedProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e4f1ed] text-brand-800">
                    <Tag className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">No deals match these filters</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Try widening the price range or clearing the discount filter.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 rounded-xl bg-brand-800 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-brand-700 cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Banners Row (Flash Deals + Weekend Bonanza) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              
              {/* Flash Deals Card */}
              <div className="bg-[#e4f1ed] rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-emerald-900/10 shadow-xs">
                {/* Left Icon + Text */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-brand-800 shadow-xs">
                    <Zap className="w-5 h-5 fill-[#063328]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900">Flash Deals</h3>
                    <p className="text-[11px] sm:text-xs text-gray-600">Limited time offers on top products</p>
                  </div>
                </div>

                {/* Right Timer + Arrow */}
                <div className="flex items-center space-x-3">
                  {/* Timer Pills */}
                  <div className="flex items-center space-x-1 text-xs font-bold text-white">
                    <span className="bg-brand-800 px-1.5 py-1 rounded">
                      {String(flashTimeLeft.hrs).padStart(2, '0')}
                    </span>
                    <span className="text-brand-800 font-bold">:</span>
                    <span className="bg-brand-800 px-1.5 py-1 rounded">
                      {String(flashTimeLeft.mins).padStart(2, '0')}
                    </span>
                    <span className="text-brand-800 font-bold">:</span>
                    <span className="bg-brand-800 px-1.5 py-1 rounded">
                      {String(flashTimeLeft.secs).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Arrow Button */}
                  <button
                    onClick={() => setActiveCategory('Electronics')}
                    className="w-8 h-8 rounded-full bg-white text-brand-800 flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Weekend Bonanza Card */}
              <div className="bg-[#fff1e8] rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-orange-200/50 shadow-xs">
                {/* Left Icon + Text */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-accent shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900">Weekend Bonanza</h3>
                    <p className="text-[11px] sm:text-xs text-gray-600">Exciting offers for the weekend</p>
                  </div>
                </div>

                {/* Right CTA + Arrow */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-900">View Offers</span>
                  <button
                    onClick={() => setActiveCategory('Fashion')}
                    className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>

          </main>

        </div>
      </div>
    </div>
  );
}



