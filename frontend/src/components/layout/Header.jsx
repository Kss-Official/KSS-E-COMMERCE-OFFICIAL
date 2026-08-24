import React, { useState, useRef, useEffect } from 'react';
import { User, Heart, ShoppingCart, ChevronDown, Search, ArrowRight, X, LogOut, Package, Shield, LayoutDashboard } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';
import { getCurrentUser, logoutUser, fetchCategories, fetchSearchSuggestions } from '../../services/api';
import logo from '../../assets/logo.png';

// Import product images for search suggestions
import boatRockerzImg from '../../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../../assets/images/jbl_speaker.jpg';
import dellLaptopImg from '../../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../../assets/images/hp_laptop.jpg';
import roadsterShirtImg from '../../assets/images/roadster_shirt.jpg';
import tealBackpackImg from '../../assets/images/teal_backpack.jpg';
import accentChairImg from '../../assets/images/accent_chair.jpg';
import redmiNote13Img from '../../assets/images/redmi_note13.jpg';
import womenDressImg from '../../assets/images/women_dress.jpg';
import loungeChairImg from '../../assets/images/lounge_chair.jpg';

// Catalog dataset for live search autocomplete
const searchProductsCatalog = [
  {
    id: 'search-1',
    name: 'Redmi Note 13 Pro 5G',
    category: 'Mobiles',
    price: 18999,
    originalPrice: 21999,
    image: redmiNote13Img,
    keywords: ['mobile', 'phone', 'redmi', 'xiaomi', 'smartphone', '5g', 'note 13']
  },
  {
    id: 'search-2',
    name: 'boAt Rockerz 450 Wireless Headphones',
    category: 'Electronics',
    price: 1499,
    originalPrice: 2499,
    image: boatRockerzImg,
    keywords: ['headphone', 'headset', 'boat', 'rockerz', 'wireless', 'bluetooth', 'audio', 'earphone']
  },
  {
    id: 'search-3',
    name: 'Noise ColorFit Pro 5 Smartwatch',
    category: 'Electronics',
    price: 2999,
    originalPrice: 4999,
    image: noiseSmartwatchImg,
    keywords: ['watch', 'smartwatch', 'noise', 'colorfit', 'fitness', 'tracker', 'wearable']
  },
  {
    id: 'search-4',
    name: 'Sony WH-CH510 Wireless Headphones',
    category: 'Electronics',
    price: 2499,
    originalPrice: 3990,
    image: sonyHeadphonesImg,
    keywords: ['sony', 'headphone', 'wireless', 'audio', 'bluetooth', 'music']
  },
  {
    id: 'search-5',
    name: 'JBL Flip Essential 2 Bluetooth Speaker',
    category: 'Electronics',
    price: 4499,
    originalPrice: 6999,
    image: jblSpeakerImg,
    keywords: ['jbl', 'speaker', 'bluetooth', 'audio', 'sound', 'flip']
  },
  {
    id: 'search-6',
    name: 'Dell Inspiron 15 Core i5 Laptop',
    category: 'Laptops',
    price: 54990,
    originalPrice: 68000,
    image: dellLaptopImg,
    keywords: ['dell', 'laptop', 'computer', 'inspiron', 'pc', 'notebook', 'i5']
  },
  {
    id: 'search-7',
    name: 'HP 15s Ryzen 5 Slim Laptop',
    category: 'Laptops',
    price: 34990,
    originalPrice: 45999,
    image: hpLaptopImg,
    keywords: ['hp', 'laptop', 'ryzen', 'computer', 'pc', 'notebook']
  },
  {
    id: 'search-8',
    name: 'Women Emerald Green A-Line Dress',
    category: 'Fashion',
    price: 999,
    originalPrice: 1999,
    image: womenDressImg,
    keywords: ['dress', 'women', 'fashion', 'clothing', 'green dress', 'outfit', 'wear']
  },
  {
    id: 'search-9',
    name: "Roadster Men's Cotton Casual Shirt",
    category: 'Fashion',
    price: 999,
    originalPrice: 1999,
    image: roadsterShirtImg,
    keywords: ['shirt', 'casual', 'men', 'roadster', 'fashion', 'top', 'clothes']
  },
  {
    id: 'search-10',
    name: 'Modern Teal Blue Lounge Chair',
    category: 'Home & Kitchen',
    price: 7999,
    originalPrice: 12999,
    image: loungeChairImg,
    keywords: ['chair', 'furniture', 'lounge', 'armchair', 'home', 'sofa', 'teal']
  },
  {
    id: 'search-11',
    name: 'Safari Venture Casual Backpack',
    category: 'Bags & Luggage',
    price: 1299,
    originalPrice: 2199,
    image: tealBackpackImg,
    keywords: ['bag', 'backpack', 'safari', 'travel', 'luggage', 'casual']
  },
  {
    id: 'search-12',
    name: 'Accent Upholstered Armchair',
    category: 'Home & Kitchen',
    price: 6999,
    originalPrice: 9999,
    image: accentChairImg,
    keywords: ['chair', 'furniture', 'accent', 'armchair', 'seating']
  }
];

export default function Header() {
  const context = useCartContext();
  const navContext = useNavigationContext();
  const navigateTo = navContext?.navigateTo || (() => {});
  const cartCount = context?.cartCount ?? (context?.cartItems ? context.cartItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0) : 0);
  const wishlistCount = context?.wishlistCount ?? (context?.wishlistItems ? context.wishlistItems.length : 0);

  // Search & Navigation State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState(['All Categories', 'Mobiles', 'Electronics', 'Fashion', 'Laptops', 'Home & Kitchen', 'Beauty']);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Sync auth state
  useEffect(() => {
    const handleAuthChange = () => setCurrentUser(getCurrentUser());
    window.addEventListener('buyzo_auth_change', handleAuthChange);
    return () => window.removeEventListener('buyzo_auth_change', handleAuthChange);
  }, []);

  // Fetch categories dynamically
  useEffect(() => {
    fetchCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(['All Categories', ...cats.map(c => c.name)]);
      }
    });
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search query and category
  const searchSuggestions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchProductsCatalog.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Categories' ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const nameMatch = product.name.toLowerCase().includes(query);
      const categoryMatch = product.category.toLowerCase().includes(query);
      const keywordMatch = product.keywords.some((k) => k.toLowerCase().includes(query));

      return matchesCategory && (nameMatch || categoryMatch || keywordMatch);
    });
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val === 'Electronics') {
      navigateTo('electronics');
    } else if (val === 'Fashion') {
      navigateTo('fashion');
    } else if (val === 'Beauty') {
      navigateTo('beauty');
    } else if (val === 'Home & Kitchen') {
      navigateTo('home-kitchen');
    } else if (val === 'Mobiles') {
      navigateTo('shop');
    }
  };

  const handleSelectProduct = (product) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    navigateTo('product-detail', product);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      navigateTo('shop');
    }
  };

  const handleUserClick = () => {
    if (!currentUser) {
      navigateTo('login');
    } else {
      setIsUserMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsUserMenuOpen(false);
    navigateTo('home');
  };

  const userName = currentUser?.profile?.first_name 
    ? `${currentUser.profile.first_name} ${currentUser.profile.last_name || ''}`.trim()
    : currentUser?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-y-2 shadow-xs relative z-40">
      {/* Brand Logo */}
      <div onClick={() => navigateTo('home')} className="flex items-center space-x-3 cursor-pointer">
        <img src={logo} alt="BuyZo Logo" className="h-10 w-auto object-contain max-h-12" />
        <span className="text-xs text-gray-500 hidden sm:inline font-medium">Shop More, Save More</span>
      </div>

      {/* Interactive Search Bar Container */}
      <div ref={searchRef} className="order-3 w-full sm:order-none sm:flex-1 sm:max-w-2xl sm:mx-8 relative">
        <form onSubmit={handleSearchSubmit} className="flex border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs focus-within:border-[#ff5100] focus-within:ring-1 focus-within:ring-[#ff5100] transition-all">
          {/* Category Dropdown */}
          <div className="relative flex items-center px-2 sm:px-4 py-2 bg-white border-r border-gray-200 cursor-pointer shrink-0">
            <select
              value={selectedCategory}
              onChange={handleCategorySelect}
              className="appearance-none bg-transparent pr-5 text-xs sm:text-sm font-bold text-gray-800 outline-none cursor-pointer z-10"
            >
              {categoriesList.map((catName) => (
                <option key={catName} value={catName}>{catName}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#1b4d3e] stroke-[2.5] absolute right-3 pointer-events-none" />
          </div>

          {/* Input Field */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search for products, brands and more..."
              className="w-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none bg-white pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="bg-[#ff5100] hover:bg-[#e64900] text-white px-4 sm:px-7 text-sm font-bold tracking-wide transition-colors shrink-0 flex items-center justify-center cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Live Autocomplete Suggestions Dropdown */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Matching Products & Suggestions</span>
              <span>{searchSuggestions.length} found</span>
            </div>

            {searchSuggestions.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-800">No matching products found</p>
                <p className="text-xs text-gray-400 mt-1">Try searching for "boat", "redmi", "dress", "laptop", "chair", or "phone"</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchSuggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="p-3 hover:bg-emerald-50/60 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0 bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1b4d3e] transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                          <span className="text-xs text-gray-400 font-normal">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-gray-900 block">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through block">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff5100] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Icons & Account */}
      <div className="flex items-center space-x-3 sm:space-x-8 shrink-0 relative">
        {/* User Account */}
        <div ref={userMenuRef} className="relative">
          <div
            onClick={handleUserClick}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title={currentUser ? `Logged in as ${userName}` : "Click to Login"}
          >
            <div className="p-1 rounded-full text-[#1b4d3e] group-hover:bg-emerald-50 transition-colors">
              <User className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[12px] text-gray-500 font-normal leading-tight">
                {currentUser ? `Welcome ${currentUser.profile?.first_name || userName}` : 'Welcome Guest'}
              </span>
              <div className="flex items-center space-x-0.5 text-sm font-bold text-gray-900 leading-tight group-hover:text-[#1b4d3e] transition-colors">
                <span>{currentUser ? (currentUser.role === 'ADMIN' ? 'Admin Panel' : 'My Account') : 'Login / Account'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-700 stroke-[2.2] ml-0.5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>

          {/* User Account Dropdown Menu */}
          {currentUser && isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
                <p className="text-xs font-bold text-gray-900 leading-tight">{userName}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{currentUser.email || currentUser.phone}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  {currentUser.role || 'Customer'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo('orders');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50/70 hover:text-[#0d5c46] flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigateTo('wishlist');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50/70 hover:text-[#0d5c46] flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-gray-400" />
                  <span>My Wishlist</span>
                </button>

                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigateTo('admin');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-500" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                {(currentUser.role === 'ADMIN' || currentUser.role === 'WAREHOUSE_STAFF') && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigateTo('warehouse');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>Warehouse Portal</span>
                  </button>
                )}

                {(currentUser.role === 'ADMIN' || currentUser.role === 'DELIVERY_AGENT') && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigateTo('delivery-agent');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-cyan-700 hover:bg-cyan-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-cyan-500" />
                    <span>Delivery Portal</span>
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist */}
        <div 
          onClick={() => navigateTo('wishlist')}
          className="flex flex-col items-center cursor-pointer group relative px-1"
        >
          <div className="relative flex items-center justify-center p-1 rounded-full text-[#1b4d3e] group-hover:bg-emerald-50 transition-colors">
            <Heart className="w-6.5 h-6.5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-2 bg-[#f95700] text-white text-[10px] font-extrabold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
              {wishlistCount}
            </span>
          </div>
          <span className="text-[12px] font-semibold text-gray-800 leading-none mt-0.5 group-hover:text-[#f95700] transition-colors">
            Wishlist
          </span>
        </div>

        {/* Cart */}
        <div
          onClick={() => navigateTo('cart')}
          className="flex flex-col items-center cursor-pointer group relative px-1"
        >
          <div className="relative flex items-center justify-center p-1 rounded-full text-[#1b4d3e] group-hover:bg-emerald-50 transition-colors">
            <ShoppingCart className="w-6.5 h-6.5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-2 bg-[#f95700] text-white text-[10px] font-extrabold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount}
            </span>
          </div>
          <span className="text-[12px] font-semibold text-gray-800 leading-none mt-0.5 group-hover:text-[#f95700] transition-colors">
            Cart
          </span>
        </div>
      </div>
    </header>
  );
}
