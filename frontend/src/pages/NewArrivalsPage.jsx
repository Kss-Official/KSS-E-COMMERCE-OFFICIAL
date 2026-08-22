import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  Star, 
  ShoppingCart, 
  ArrowRight, 
  Check 
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import product images
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';
import dellLaptopImg from '../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import roadsterShirtImg from '../assets/images/roadster_shirt.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';
import accentChairImg from '../assets/images/accent_chair.jpg';
import redmiNote13Img from '../assets/images/redmi_note13.jpg';
import womenDressImg from '../assets/images/women_dress.jpg';
import loungeChairImg from '../assets/images/lounge_chair.jpg';

// Banner Hero Image
import bannerHeroImg from '../assets/images/new_arrivals_banner_hero.jpg';

const newArrivalsProducts = [
  {
    id: 'na-1',
    name: 'boAt Rockerz 450',
    category: 'Electronics',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 2499,
    discount: '40% OFF',
    rating: 4.5,
    reviewsCount: 456,
    isNew: true
  },
  {
    id: 'na-2',
    name: 'Noise ColorFit Pro 5',
    category: 'Electronics',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    rating: 4.6,
    reviewsCount: 320,
    isNew: true
  },
  {
    id: 'na-3',
    name: 'Sony WH-CH510',
    category: 'Electronics',
    image: sonyHeadphonesImg,
    price: 2499,
    originalPrice: 3990,
    discount: '37% OFF',
    rating: 4.4,
    reviewsCount: 278,
    isNew: true
  },
  {
    id: 'na-4',
    name: 'JBL Flip Essential 2',
    category: 'Electronics',
    image: jblSpeakerImg,
    price: 4499,
    originalPrice: 6999,
    discount: '35% OFF',
    rating: 4.5,
    reviewsCount: 189,
    isNew: true
  },
  {
    id: 'na-5',
    name: 'Dell Inspiron 15',
    category: 'Laptops',
    image: dellLaptopImg,
    price: 54990,
    originalPrice: 68000,
    discount: '19% OFF',
    rating: 4.3,
    reviewsCount: 167,
    isNew: true
  },
  {
    id: 'na-6',
    name: 'Safari Venture Backpack',
    category: 'Bags & Luggage',
    image: tealBackpackImg,
    price: 1299,
    originalPrice: 2199,
    discount: '41% OFF',
    rating: 4.4,
    reviewsCount: 215,
    isNew: true
  },
  {
    id: 'na-7',
    name: 'Redmi Note 13 Pro 5G',
    category: 'Mobiles',
    image: redmiNote13Img,
    price: 18999,
    originalPrice: 21999,
    discount: '14% OFF',
    rating: 4.6,
    reviewsCount: 512,
    isNew: true
  },
  {
    id: 'na-8',
    name: 'Women A-Line Dress',
    category: 'Fashion',
    image: womenDressImg,
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    rating: 4.3,
    reviewsCount: 184,
    isNew: true
  },
  {
    id: 'na-9',
    name: 'Modern Lounge Chair',
    category: 'Home & Kitchen',
    image: loungeChairImg,
    price: 7999,
    originalPrice: 12999,
    discount: '38% OFF',
    rating: 4.7,
    reviewsCount: 94,
    isNew: true
  },
  {
    id: 'na-10',
    name: "Roadster Men's Casual Shirt",
    category: 'Fashion',
    image: roadsterShirtImg,
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    rating: 4.2,
    reviewsCount: 143,
    isNew: true
  },
  {
    id: 'na-11',
    name: 'HP 15s Ryzen 5 Laptop',
    category: 'Laptops',
    image: hpLaptopImg,
    price: 34990,
    originalPrice: 45999,
    discount: '24% OFF',
    rating: 4.4,
    reviewsCount: 389,
    isNew: true
  },
  {
    id: 'na-12',
    name: 'Accent Lounge Armchair',
    category: 'Home & Kitchen',
    image: accentChairImg,
    price: 6999,
    originalPrice: 9999,
    discount: '30% OFF',
    rating: 4.6,
    reviewsCount: 128,
    isNew: true
  }
];

export default function NewArrivalsPage() {
  const { navigateTo } = useNavigationContext();
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useCartContext();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high' | 'rating'
  const [toastMessage, setToastMessage] = useState(null);

  const isWishlisted = (id) => {
    return wishlistItems?.some((item) => item.id === id);
  };

  const handleToggleWishlist = (product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      setToastMessage(`Removed "${product.name}" from wishlist`);
    } else {
      addToWishlist(product);
      setToastMessage(`Saved "${product.name}" to wishlist`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sortedProducts = useMemo(() => {
    const list = [...newArrivalsProducts];
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [sortBy]);

  return (
    <div className="bg-[#f8faf9] min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#064e3b] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center space-x-2 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Container */}
      <div className="bg-[#e6f4f1] rounded-3xl border border-[#cbe8e2] p-6 sm:p-10 md:p-12 relative overflow-hidden mb-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          {/* Left Text Content */}
          <div className="max-w-xl text-left">
            <span className="inline-block bg-[#064e3b] text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
              NEW ARRIVALS
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              <span className="text-[#064e3b] block">Fresh Arrivals,</span>
              <span className="text-[#f95700] block">Endless Choices</span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base mt-3 mb-6 font-normal max-w-md">
              Be the first to explore the latest trends and must-have products.
            </p>

            <button
              onClick={() => {
                const el = document.getElementById('new-arrivals-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#064e3b] hover:bg-[#043e2f] text-white font-bold text-sm px-6 py-3 rounded-full inline-flex items-center space-x-2 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Hero Graphics */}
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative">
            
            {/* Floating Circle Badge */}
            <div className="hidden lg:flex absolute top-2 right-4 bg-white/95 backdrop-blur-xs rounded-full p-4 shadow-xl border border-emerald-100 flex-col items-center justify-center z-20 w-28 h-28 text-center animate-pulse">
              <span className="text-[10px] font-black text-gray-800 tracking-wider uppercase leading-tight">
                NEW
              </span>
              <span className="text-[11px] font-black text-[#f95700] leading-tight mt-0.5">
                EVERYDAY!
              </span>
              <span className="text-[9px] font-medium text-gray-500 mt-0.5">
                Grab Yours Now!
              </span>
            </div>

            {/* Main Graphic Illustration */}
            <img
              src={bannerHeroImg}
              alt="New Arrivals BuyZo"
              className="w-full max-w-lg md:max-w-xl h-auto object-contain rounded-2xl drop-shadow-2xl hover:scale-102 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div id="new-arrivals-grid" className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pt-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-800">1–12</span> of <span className="font-bold text-gray-800">356</span> products
        </p>

        <div className="flex items-center space-x-4">
          {/* View Switcher */}
          <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-[#064e3b] font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-[#064e3b] font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-2xs">
            <span className="text-xs font-semibold text-gray-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                {/* Top Badge & Heart Action */}
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#064e3b] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    NEW
                  </span>
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className="w-7 h-7 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'stroke-[1.8]'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Thumbnail */}
                <div 
                  onClick={() => navigateTo('product-detail', product)}
                  className="w-full h-36 flex items-center justify-center p-2 cursor-pointer overflow-hidden rounded-xl bg-gray-50/50 mb-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Title */}
                <h3
                  onClick={() => navigateTo('product-detail', product)}
                  className="text-xs font-bold text-gray-900 group-hover:text-[#064e3b] line-clamp-1 cursor-pointer transition-colors"
                >
                  {product.name}
                </h3>

                {/* Price Row */}
                <div className="flex items-baseline space-x-1.5 mt-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-gray-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[11px] text-gray-400 line-through font-normal">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {product.discount && (
                    <span className="text-[11px] font-bold text-[#f95700]">
                      {product.discount}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mt-1 text-[11px] text-gray-500 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-gray-800 font-bold">{product.rating}</span>
                  <span>({product.reviewsCount})</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-[#064e3b] hover:bg-[#043e2f] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors mt-3 shadow-2xs cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div 
                  onClick={() => navigateTo('product-detail', product)}
                  className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="inline-block bg-[#064e3b] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase mb-1">
                    NEW
                  </span>
                  <h3
                    onClick={() => navigateTo('product-detail', product)}
                    className="text-base font-bold text-gray-900 group-hover:text-[#064e3b] cursor-pointer transition-colors"
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-gray-800 font-bold">{product.rating}</span>
                    <span>({product.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex flex-col text-left sm:text-right">
                  <span className="text-lg font-extrabold text-gray-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs">
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {product.discount && (
                      <span className="font-bold text-[#f95700]">
                        {product.discount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'stroke-[1.8]'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#064e3b] hover:bg-[#043e2f] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
