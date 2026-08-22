import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowRight,
  Check
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import assets
import heroDealsImg from '../assets/Deals/Hero.Deals.png';
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import accentChairImg from '../assets/images/accent_chair.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';

const initialDealsProducts = [
  {
    id: 'deal-1',
    name: 'boAt Rockerz 450',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 3999,
    discount: '60% OFF',
    rating: 4.5,
    category: 'Electronics',
    discountRange: '60% - 80%',
    popularity: 99
  },
  {
    id: 'deal-2',
    name: 'Noise ColorFit Pro 5',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    rating: 4.4,
    category: 'Electronics',
    discountRange: '40% - 60%',
    popularity: 95
  },
  {
    id: 'deal-3',
    name: 'HP 15s Laptop',
    image: hpLaptopImg,
    price: 42990,
    originalPrice: 60000,
    discount: '35% OFF',
    rating: 4.3,
    category: 'Electronics',
    discountRange: '20% - 40%',
    popularity: 92
  },
  {
    id: 'deal-4',
    name: 'Home Living Accent Chair',
    image: accentChairImg,
    price: 6499,
    originalPrice: 12999,
    discount: '50% OFF',
    rating: 4.6,
    category: 'Home & Kitchen',
    discountRange: '40% - 60%',
    popularity: 96
  },
  {
    id: 'deal-5',
    name: 'Safari Seek 45L Backpack',
    image: tealBackpackImg,
    price: 1649,
    originalPrice: 2999,
    discount: '45% OFF',
    rating: 4.4,
    category: 'Fashion',
    discountRange: '40% - 60%',
    popularity: 91
  },
  {
    id: 'deal-6',
    name: 'Bella Vita Luxury Perfume',
    image: boatRockerzImg,
    price: 699,
    originalPrice: 999,
    discount: '30% OFF',
    rating: 4.2,
    category: 'Beauty',
    discountRange: '20% - 40%',
    popularity: 88
  }
];

const dealTabs = [
  'All Deals',
  'Deal of the Day',
  'Top Discounts',
  'Combo Offers',
  'Bank Offers'
];

const sideCategories = [
  { name: 'All Deals', count: 320 },
  { name: 'Electronics', count: 128 },
  { name: 'Fashion', count: 96 },
  { name: 'Home & Kitchen', count: 54 },
  { name: 'Beauty', count: 28 },
  { name: 'Sports & Fitness', count: 14 }
];

const sideDiscountRanges = [
  { label: '10% - 20%', count: 86 },
  { label: '20% - 40%', count: 124 },
  { label: '40% - 60%', count: 78 },
  { label: '60% - 80%', count: 28 },
  { label: '80% & above', count: 6 }
];

export default function DealsPage() {
  const { addToCart, addToWishlist } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const [activeTab, setActiveTab] = useState('All Deals');
  const [selectedCategory, setSelectedCategory] = useState('All Deals');
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('popularity');
  const [addedToast, setAddedToast] = useState(null);
  const [wishlistActive, setWishlistActive] = useState({});

  // Countdown timer state (12 hrs, 45 mins, 30 secs)
  const [timeLeft, setTimeLeft] = useState({ hrs: 12, mins: 45, secs: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDiscountChange = (label) => {
    setSelectedDiscounts((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleToggleWishlist = (e, product) => {
    e.stopPropagation();
    addToWishlist(product);
    setWishlistActive((prev) => ({ ...prev, [product.id]: !prev[product.id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-[#0d5c46] text-white px-5 py-3 rounded-lg shadow-xl font-medium text-sm z-50 flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-5">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#0d5c46] transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">Deals</span>
      </nav>

      {/* Page Title & Countdown Timer Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Deals of the Day
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Top deals. Exciting offers. Limited time only!
          </p>
        </div>

        {/* Countdown Timer Boxes */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <span className="text-xs font-bold text-gray-700">Offer ends in:</span>
          <div className="flex items-center space-x-1.5">
            <div className="bg-white border border-gray-200/90 rounded-lg px-2.5 py-1 text-center shadow-2xs">
              <span className="text-sm font-black text-gray-900 block leading-none">
                {String(timeLeft.hrs).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-400 font-semibold block uppercase mt-0.5">
                Hrs
              </span>
            </div>
            <span className="font-bold text-gray-400 text-sm">:</span>
            <div className="bg-white border border-gray-200/90 rounded-lg px-2.5 py-1 text-center shadow-2xs">
              <span className="text-sm font-black text-gray-900 block leading-none">
                {String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-400 font-semibold block uppercase mt-0.5">
                Mins
              </span>
            </div>
            <span className="font-bold text-gray-400 text-sm">:</span>
            <div className="bg-white border border-gray-200/90 rounded-lg px-2.5 py-1 text-center shadow-2xs">
              <span className="text-sm font-black text-gray-900 block leading-none">
                {String(timeLeft.secs).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-gray-400 font-semibold block uppercase mt-0.5">
                Secs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Hero Banner - Exact Match */}
      <div className="bg-[#f0f7f4] rounded-3xl p-8 sm:p-10 border border-gray-200/80 flex flex-col md:flex-row items-center justify-between shadow-2xs mb-8 overflow-hidden relative gap-6">
        {/* Navigation Arrow Left */}
        <button className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Navigation Arrow Right */}
        <button className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Left Text */}
        <div className="max-w-md space-y-3 z-10 pl-6 sm:pl-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Grab the <span className="text-[#ff5100]">Best Deals</span> <br />
            Before They're Gone!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-normal">
            Shop now and save up to 70%
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('All Deals')}
              className="py-3 px-7 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Hero Graphic: Exact Match using Hero.Deals.png */}
        <div className="relative w-full md:w-1/2 flex justify-center md:justify-end items-center pr-6 sm:pr-8">
          <img
            src={heroDealsImg}
            alt="Best Deals Graphic"
            className="w-full max-w-xl h-auto object-contain rounded-2xl drop-shadow-xs"
          />
        </div>
      </div>

      {/* Horizontal Deal Filter Pills Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {dealTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#0d5c46] text-white shadow-xs'
                  : 'bg-white border border-gray-200/90 text-gray-700 hover:border-[#0d5c46]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4 self-end sm:self-auto shrink-0">
          <span className="text-xs font-medium text-gray-500">
            Showing 1-{initialDealsProducts.length} of 320 products
          </span>
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1 bg-white shadow-xs">
            <button className="p-1.5 rounded bg-emerald-50 text-[#0d5c46] border border-emerald-200">
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button className="p-1.5 rounded text-gray-500 hover:text-gray-800">
              <List className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar (3 cols) + Products Grid (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Categories Card */}
          <div className="bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Categories
            </h3>
            <ul className="space-y-1.5 text-xs font-medium text-gray-700">
              {sideCategories.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setSelectedCategory(c.name)}
                    className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategory === c.name
                        ? 'bg-[#0d5c46] text-white font-bold'
                        : 'hover:bg-gray-200/60'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={
                        selectedCategory === c.name
                          ? 'text-emerald-200 font-semibold'
                          : 'text-gray-400 font-normal'
                      }
                    >
                      {c.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Discount Range Card */}
          <div className="bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Discount Range
            </h3>
            <div className="space-y-2 text-xs font-medium text-gray-700">
              {sideDiscountRanges.map((d) => (
                <label
                  key={d.label}
                  className="flex items-center space-x-2.5 cursor-pointer hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedDiscounts.includes(d.label)}
                    onChange={() => handleDiscountChange(d.label)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#0d5c46] focus:ring-[#0d5c46] cursor-pointer"
                  />
                  <span>
                    {d.label} <span className="text-gray-400 font-normal">({d.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Card */}
          <div className="bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Price Range
            </h3>
            <div className="flex justify-between text-[11px] text-gray-500 font-medium mb-1.5">
              <span>₹0</span>
              <span>₹{maxPrice.toLocaleString('en-IN')}+</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#0d5c46] cursor-pointer"
            />
          </div>

          {/* Sort By Card */}
          <div className="bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Sort By
            </h3>
            <div className="space-y-2 text-xs font-medium text-gray-700">
              {[
                { label: 'Popularity', val: 'popularity' },
                { label: 'Newest First', val: 'newest' },
                { label: 'Price: Low to High', val: 'lowToHigh' },
                { label: 'Price: High to Low', val: 'highToLow' },
                { label: 'Discount: High to Low', val: 'discount' }
              ].map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center space-x-2.5 cursor-pointer hover:text-gray-900"
                >
                  <input
                    type="radio"
                    name="sortByRadio"
                    checked={sortBy === opt.val}
                    onChange={() => setSortBy(opt.val)}
                    className="w-3.5 h-3.5 text-[#0d5c46] focus:ring-[#0d5c46] cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Products Grid Area (9 cols) */}
        <main className="lg:col-span-9">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {initialDealsProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigateTo('product-detail', product)}
                className="bg-white border border-gray-200/90 rounded-2xl p-3 flex flex-col justify-between hover:shadow-lg transition-all duration-200 relative group cursor-pointer"
              >
                {/* Discount Tag Top-Left */}
                <div className="bg-[#ff5100] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-br-lg rounded-tl-xl absolute top-0 left-0 z-10 shadow-2xs">
                  {product.discount}
                </div>

                {/* Wishlist Heart Icon Top-Right */}
                <button
                  onClick={(e) => handleToggleWishlist(e, product)}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 backdrop-blur-xs border border-gray-100 hover:bg-emerald-50 transition-colors shadow-2xs"
                  title="Add to Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      wishlistActive[product.id]
                        ? 'fill-red-500 text-red-500'
                        : 'text-[#0d5c46] hover:text-red-500'
                    }`}
                  />
                </button>

                {/* Image Container */}
                <div className="h-32 w-full bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden mt-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="mt-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs leading-tight hover:text-[#0d5c46] transition-colors cursor-pointer line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Price Block */}
                    <div className="flex items-baseline space-x-1.5 mt-1.5">
                      <span className="text-xs font-black text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Rating Row */}
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 fill-current ${
                              i < Math.floor(product.rating)
                                ? 'text-amber-400'
                                : 'text-gray-200 fill-none'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500">
                        ({product.rating})
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full mt-2 py-1.5 px-2 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="w-3 h-3 stroke-[2.2]" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Deals Button */}
          <div className="mt-8 text-center">
            <button className="py-2.5 px-6 bg-white border border-gray-300 hover:border-[#0d5c46] hover:text-[#0d5c46] text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1">
              <span>Load More Deals</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
