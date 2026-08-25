import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Heart, 
  LayoutGrid, 
  List, 
  Star, 
  ShoppingCart, 
  ArrowRight, 
  Check,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';
import { fetchProducts } from '../services/api';

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
import bannerHeroImg from '../assets/images/new_arrivals_banner_hero.png';
import rakhiBannerImg from '../assets/images/rakhi_banner.jpg';
import rakhiLogoImg from '../assets/images/rakhi_logo.jpg';

const categoriesList = [
  { name: 'All New Arrivals', count: 356 },
  { name: 'Men', count: 124 },
  { name: 'Women', count: 168 },
  { name: 'Kids', count: 42 },
  { name: 'Footwear', count: 85 },
  { name: 'Bags & Accessories', count: 65 },
  { name: 'Watches', count: 28 },
];

const subCategoriesList = [
  { name: 'Mobiles', count: 56 },
  { name: 'Laptops', count: 32 },
  { name: 'Headphones', count: 24 },
  { name: 'Smartwatches', count: 18 },
  { name: 'Cameras', count: 16 },
];

const brandsList = ['Apple', 'Samsung', 'boAt', 'Sony', 'Noise'];

const newArrivalsProducts = [
  {
    id: 'na-1',
    name: 'boAt Rockerz 450',
    category: 'Headphones',
    brand: 'boAt',
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
    category: 'Smartwatches',
    brand: 'Noise',
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
    category: 'Headphones',
    brand: 'Sony',
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
    category: 'Headphones',
    brand: 'JBL',
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
    brand: 'Dell',
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
    category: 'Bags & Accessories',
    brand: 'Safari',
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
    brand: 'Xiaomi',
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
    category: 'Women',
    brand: 'FashionHub',
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
    brand: 'UrbanHome',
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
    category: 'Men',
    brand: 'Roadster',
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
    brand: 'HP',
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
    brand: 'UrbanHome',
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
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();

  const [dbProducts, setDbProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All New Arrivals');
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [priceMax, setPriceMax] = useState(100000);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts({ no_page: 'true' })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => {
            const rawPrice = Number(p.price || p.current_price || 0);
            const origPrice = Number(p.originalPrice || p.original_price || rawPrice * 1.3);
            const titleName = p.name || p.title || 'Product';
            return {
              id: p.id,
              name: titleName,
              category: p.category || p.category_name || 'General',
              brand: p.brand_name || p.brand || 'BuyZo',
              image: getProductImage(titleName, p.image || p.primary_image),
              price: rawPrice,
              originalPrice: Math.round(origPrice),
              discount: p.discount || p.discount_percentage || '15% OFF',
              rating: Number(p.rating || p.average_rating || 4.5),
              reviewsCount: Number(p.reviewsCount || p.review_count || 45),
              isNew: true
            };
          });
          setDbProducts(mapped);
        }
      })
      .catch((err) => {
        console.warn('New arrivals fetch failed:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Banner Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 2;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleToggleWishlist = (product, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const wasWish = isWishlisted(product.id);
    toggleWishlist(product);
    setToastMessage(wasWish ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubCategoryToggle = (catName) => {
    if (selectedSubCategories.includes(catName)) {
      setSelectedSubCategories(selectedSubCategories.filter((c) => c !== catName));
    } else {
      setSelectedSubCategories([...selectedSubCategories, catName]);
    }
  };

  const handleBrandToggle = (brandName) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...dbProducts];

    if (activeCategory !== 'All New Arrivals') {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (selectedSubCategories.length > 0) {
      list = list.filter((p) => selectedSubCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand));
    }

    if (priceMax < 100000) {
      list = list.filter((p) => p.price <= priceMax);
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [dbProducts, activeCategory, selectedSubCategories, selectedBrands, priceMax, sortBy]);

  const filteredBrandsList = brandsList.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="bg-[#f8faf9] min-h-screen py-5 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#08493d] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center space-x-2 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Header */}
      <nav className="max-w-7xl mx-auto flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-5">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#08493d] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">New Arrivals</span>
      </nav>

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT SIDEBAR: Categories & Filters */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-6">
          
          {/* 1. Categories Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3.5">
              Categories
            </h3>
            <div className="space-y-1">
              {categoriesList.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#e2f3ee] text-[#08493d] font-bold shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[11px] ${isActive ? 'text-[#08493d] font-extrabold' : 'text-gray-400 font-normal'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Filter By Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs space-y-6">
            <h3 className="font-extrabold text-sm text-gray-900">
              Filter By
            </h3>

            {/* Price Range Slider */}
            <div className="space-y-2 pb-2 border-b border-gray-100">
              <label className="block text-xs font-bold text-gray-800">
                Price Range
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#08493d] cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold pt-1">
                <span>₹0</span>
                <span className="text-[#08493d] font-extrabold">
                  {priceMax >= 10000 ? '₹10,000+' : `₹${priceMax.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* Category Checkboxes */}
            <div className="space-y-2.5 pb-2 border-b border-gray-100">
              <label className="block text-xs font-bold text-gray-800">
                Category
              </label>
              <div className="space-y-2">
                {subCategoriesList.map((sc) => (
                  <label key={sc.name} className="flex items-center space-x-2.5 text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedSubCategories.includes(sc.name)}
                      onChange={() => handleSubCategoryToggle(sc.name)}
                      className="w-4 h-4 rounded text-[#08493d] focus:ring-[#08493d] border-gray-300 accent-[#08493d] cursor-pointer"
                    />
                    <span className="font-medium">{sc.name} <span className="text-gray-400">({sc.count})</span></span>
                  </label>
                ))}
              </div>
              <button className="text-[11px] font-bold text-[#08493d] hover:underline pt-1 inline-flex items-center cursor-pointer">
                + View More
              </button>
            </div>

            {/* Brand Checkboxes */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-800">
                Brand
              </label>

              {/* Brand Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:border-[#08493d] transition-colors"
                />
              </div>

              {/* Brands Checkboxes List */}
              <div className="space-y-2 pt-1">
                {filteredBrandsList.map((b) => (
                  <label key={b} className="flex items-center space-x-2.5 text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => handleBrandToggle(b)}
                      className="w-4 h-4 rounded text-[#08493d] focus:ring-[#08493d] border-gray-300 accent-[#08493d] cursor-pointer"
                    />
                    <span className="font-medium">{b}</span>
                  </label>
                ))}
              </div>
              <button className="text-[11px] font-bold text-[#08493d] hover:underline pt-1 inline-flex items-center cursor-pointer">
                + View More
              </button>
            </div>

          </div>

        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Hero Banner Carousel (Slide 1: New Arrivals, Slide 2: Raksha Bandhan) */}
          <div className="relative overflow-hidden rounded-3xl shadow-sm group">
            
            {/* Slide Container with Smooth Horizontal Translation */}
            <div
              className="flex transition-transform duration-700 ease-in-out w-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1: New Arrivals Banner */}
              <div className="w-full shrink-0 bg-[#e3f4f0] border border-[#cbe8e2] p-6 sm:p-8 md:p-9 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  {/* Left Banner Text */}
                  <div className="max-w-md text-left space-y-3">
                    <span className="inline-block bg-[#08493d] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs">
                      NEW ARRIVALS
                    </span>

                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      <span className="text-gray-900 block">Fresh Arrivals,</span>
                      <span className="text-[#ff5100] block">Endless Choices</span>
                    </h1>

                    <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
                      Be the first to explore the latest trends and must-have products.
                    </p>

                    <button
                      onClick={() => {
                        const el = document.getElementById('products-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-[#08493d] hover:bg-[#063328] text-white font-bold text-xs px-5 py-2.5 rounded-full inline-flex items-center space-x-2 shadow-md hover:scale-105 transition-all cursor-pointer mt-1"
                    >
                      <span>Explore Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Hero Graphic & Floating Badge */}
                  <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative">
                    {/* Floating Badge */}
                    <div className="hidden sm:flex absolute -top-1 right-2 bg-white/95 backdrop-blur-xs rounded-full p-3 shadow-lg border border-emerald-100 flex-col items-center justify-center z-20 w-24 h-24 text-center">
                      <span className="text-[9px] font-black text-gray-800 tracking-wider uppercase leading-tight">
                        NEW
                      </span>
                      <span className="text-[10px] font-black text-[#ff5100] leading-tight">
                        EVERYDAY!
                      </span>
                      <span className="text-[8px] font-medium text-gray-500 mt-0.5">
                        Grab Yours Now!
                      </span>
                    </div>

                    {/* Hero Illustration Graphic */}
                    <img
                      src={bannerHeroImg}
                      alt="New Arrivals BuyZo"
                      className="w-full max-w-sm sm:max-w-md h-auto object-contain rounded-2xl drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 2: Raksha Bandhan Festive Special Banner */}
              <div className="w-full shrink-0 bg-gradient-to-r from-[#4a0e17] via-[#851829] to-[#c92a3e] text-white p-6 sm:p-8 md:p-9 relative overflow-hidden border border-amber-400/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  {/* Left Text & Rakhi Logo */}
                  <div className="max-w-md space-y-3">
                    <div className="inline-flex items-center space-x-2 bg-amber-400/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-amber-300/30">
                      <img src={rakhiLogoImg} alt="Rakhi Logo" className="w-4 h-4 rounded-full object-contain" />
                      <span>Raksha Bandhan Exclusive Collection</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                      Celebrate Love &amp; Protection with <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100">
                        Handcrafted Rakhi Hampers
                      </span>
                    </h2>

                    <p className="text-amber-100/90 text-xs sm:text-sm font-normal leading-relaxed">
                      Designer silk thread Rakhis, gourmet sweets, dry fruit boxes &amp; personalized gift sets with up to <span className="font-bold text-yellow-300 underline">60% OFF</span> + Same-Day Express Delivery.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          const el = document.getElementById('products-grid');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-[#4a0e17] font-black text-xs px-5 py-2.5 rounded-full inline-flex items-center space-x-2 shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                      >
                        <span>Send Rakhi Gifts</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-bold text-amber-200">✨ Free Roli &amp; Chawal Pack</span>
                    </div>
                  </div>

                  {/* Right Rakhi Banner Graphic */}
                  <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                    <div className="relative group/rakhi">
                      <img
                        src={rakhiBannerImg}
                        alt="Raksha Bandhan Festive Celebration"
                        className="w-full max-w-sm sm:max-w-md h-auto max-h-[220px] object-cover rounded-2xl drop-shadow-2xl border border-amber-300/30 group-hover/rakhi:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute -bottom-2 -left-2 bg-white/95 text-gray-900 px-3 py-1.5 rounded-xl shadow-lg border border-amber-300 text-xs font-bold flex items-center space-x-1.5">
                        <img src={rakhiLogoImg} alt="Rakhi Icon" className="w-4 h-4 object-contain" />
                        <span className="text-[#851829]">Special 60% OFF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Left Navigation Arrow */}
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Right Navigation Arrow */}
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 z-20 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Slide Pagination Dots (Circles) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
              {[...Array(totalSlides)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx
                      ? 'bg-[#ff5100] scale-110 shadow-xs'
                      : 'bg-white/70 hover:bg-white border border-gray-300/40 shadow-2xs'
                  }`}
                />
              ))}
            </div>

          </div>

          {/* Controls Bar: Items count + View Switcher + Sort Dropdown */}
          <div id="products-grid" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">1–{filteredProducts.length}</span> of <span className="font-bold text-gray-800">356</span> products
            </p>

            <div className="flex items-center space-x-3">
              {/* View Mode Switcher */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1 shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-gray-100 text-[#08493d] font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-gray-100 text-[#08493d] font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-semibold text-gray-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Display */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-2xs">
              <p className="text-gray-500 text-sm font-medium">No products match your filter criteria.</p>
              <button
                onClick={() => {
                  setActiveCategory('All New Arrivals');
                  setSelectedSubCategories([]);
                  setSelectedBrands([]);
                  setPriceMax(10000);
                }}
                className="mt-3 bg-[#08493d] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#063328] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* 4 Column Grid - 4 cards per line then next row */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4.5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-[#063328] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top NEW Badge & Wishlist Heart */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="bg-[#08493d] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        NEW
                      </span>
                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className="w-6 h-6 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Add to Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isWishlisted(product)
                              ? 'fill-red-500 text-red-500 stroke-red-500'
                              : 'stroke-[1.8]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Image */}
                    <div 
                      onClick={() => navigateTo('product-detail', product)}
                      className="w-full h-36 sm:h-40 flex items-center justify-center p-2 cursor-pointer overflow-hidden rounded-xl bg-gray-50/50 mb-2"
                    >
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

                    {/* Title */}
                    <h4
                      onClick={() => navigateTo('product-detail', product)}
                      className="text-xs font-bold text-gray-900 group-hover:text-[#08493d] line-clamp-1 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h4>

                    {/* Price Row */}
                    <div className="flex items-baseline space-x-1 mt-1 flex-wrap">
                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through font-normal">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {product.discount && (
                        <span className="text-[10px] font-bold text-[#ff5100]">
                          {product.discount}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-gray-800 font-bold">{product.rating}</span>
                      <span>({product.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#08493d] hover:bg-[#063328] text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors mt-2.5 shadow-2xs cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-[#063328] p-3 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
                >
                  <div className="flex items-center space-x-3.5 w-full sm:w-auto">
                    <div 
                      onClick={() => navigateTo('product-detail', product)}
                      className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                    >
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
                    <div>
                      <span className="inline-block bg-[#08493d] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase mb-1">
                        NEW
                      </span>
                      <h4
                        onClick={() => navigateTo('product-detail', product)}
                        className="text-sm font-bold text-gray-900 group-hover:text-[#08493d] cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-1 mt-0.5 text-xs text-gray-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-gray-800 font-bold">{product.rating}</span>
                        <span>({product.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-base font-extrabold text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center space-x-1 text-xs">
                        {product.originalPrice && (
                          <span className="text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        {product.discount && (
                          <span className="font-bold text-[#ff5100]">
                            {product.discount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWishlisted(product)
                              ? 'fill-red-500 text-red-500 stroke-red-500'
                              : 'stroke-[1.8]'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-[#08493d] hover:bg-[#063328] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
