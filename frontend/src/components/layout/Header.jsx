import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  Search,
  ArrowRight,
  X,
  LayoutGrid,
  Smartphone,
  Headphones,
  Sparkles,
  Laptop,
  Home,
  ShoppingBag,
  Check,
  Zap,
  Wallet,
  Package,
  LayoutDashboard,
  Shield,
  LogOut
} from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';
import { getCurrentUser, logoutUser, fetchCurrentUserApi, fetchCategories, fetchSearchSuggestions, fetchProducts, fetchUserWalletApi } from '../../services/api';
import WalletModal from '../WalletModal';
import { getProductImage } from '../../utils/productAssets';
import { ROLES, normalizeRole } from '../../utils/roles';
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

// Category options for custom search dropdown
const searchCategoryOptions = [
  {
    id: 'all',
    label: 'All Categories',
    value: 'All Categories',
    shortLabel: 'All Categories',
    subtitle: 'Search across all products',
    icon: LayoutGrid,
    iconBg: 'bg-brand-100 text-brand-700',
    count: '1.2k+'
  },
  {
    id: 'mobiles',
    label: 'Mobiles',
    value: 'Mobiles',
    shortLabel: 'Mobiles',
    subtitle: '5G Phones & accessories',
    icon: Smartphone,
    iconBg: 'bg-blue-100 text-blue-700',
    count: '320+'
  },
  {
    id: 'electronics',
    label: 'Electronics',
    value: 'Electronics',
    shortLabel: 'Electronics',
    subtitle: 'Audio, wearables & gadgets',
    icon: Headphones,
    iconBg: 'bg-purple-100 text-purple-700',
    count: '450+'
  },
  {
    id: 'fashion',
    label: 'Fashion',
    value: 'Fashion',
    shortLabel: 'Fashion',
    subtitle: 'Men, women & trend fashion',
    icon: Sparkles,
    iconBg: 'bg-pink-100 text-pink-700',
    count: '890+'
  },
  {
    id: 'laptops',
    label: 'Laptops',
    value: 'Laptops',
    shortLabel: 'Laptops',
    subtitle: 'Ultrabooks, gaming & work',
    icon: Laptop,
    iconBg: 'bg-indigo-100 text-indigo-700',
    count: '140+'
  },
  {
    id: 'home',
    label: 'Home & Kitchen',
    value: 'Home & Kitchen',
    shortLabel: 'Home & Kitchen',
    subtitle: 'Furniture, decor & living',
    icon: Home,
    iconBg: 'bg-amber-100 text-amber-700',
    count: '280+'
  },
  {
    id: 'beauty',
    label: 'Beauty',
    value: 'Beauty',
    shortLabel: 'Beauty',
    subtitle: 'Personal care & wellness',
    icon: ShoppingBag,
    iconBg: 'bg-rose-100 text-rose-700',
    count: '210+'
  }
];

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
    keywords: ['chair', 'furniture', 'teal', 'lounge', 'living']
  },
  {
    id: 'search-11',
    name: 'Safari Casual Daypack Teal Backpack',
    category: 'Bags & Luggage',
    price: 1199,
    originalPrice: 2499,
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
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const userFirstName = currentUser?.first_name || currentUser?.profile?.first_name || (currentUser?.name ? currentUser.name.split(' ')[0] : '') || (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const userName = currentUser?.name || currentUser?.profile?.full_name || [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email?.split('@')[0] || 'Customer';

  // Listen to auth changes dynamically
  useEffect(() => {
    const handleAuthChange = () => {
      const u = getCurrentUser();
      setCurrentUser(u);
    };

    window.addEventListener('buyzo_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Refresh user profile from backend on mount
    fetchCurrentUserApi().then((fresh) => {
      if (fresh) setCurrentUser(fresh);
    }).catch(() => {});

    return () => {
      window.removeEventListener('buyzo_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setWalletBalance(0);
      return;
    }

    fetchUserWalletApi().then((wallet) => {
      setWalletBalance(Number(wallet?.wallet_balance ?? wallet?.balance ?? 0));
    });
  }, [currentUser]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    navigateTo('home');
  };

  // Search & Category state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCatDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [liveCatalog, setLiveCatalog] = useState(searchProductsCatalog);

  useEffect(() => {
    fetchProducts({ no_page: 'true' }).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(p => ({
          id: p.id,
          name: p.title,
          category: p.category_name || p.category || 'Catalog',
          price: parseFloat(p.price || p.regular_price || 0),
          originalPrice: parseFloat(p.regular_price || p.price || 0),
          image: getProductImage(p.title, p.primary_image || p.image),
          keywords: [p.title, p.category_name || '', p.brand_name || ''].join(' ').toLowerCase().split(' ')
        }));
        setLiveCatalog(mapped);
      }
    });
  }, []);

  // Filter products based on search query and category
  const searchSuggestions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return liveCatalog.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Categories' ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const nameMatch = product.name.toLowerCase().includes(query);
      const categoryMatch = product.category.toLowerCase().includes(query);
      const keywordMatch = product.keywords.some((k) => k.toLowerCase().includes(query));

      return matchesCategory && (nameMatch || categoryMatch || keywordMatch);
    });
  }, [searchQuery, selectedCategory, liveCatalog]);

  const handleCategorySelect = (val) => {
    setSelectedCategory(val);
    setIsCatDropdownOpen(false);
  };

  const handleCategoryNavigate = (val) => {
    setIsCatDropdownOpen(false);
    if (val === 'Electronics') {
      navigateTo('electronics');
    } else if (val === 'Fashion') {
      navigateTo('fashion');
    } else if (val === 'Beauty') {
      navigateTo('beauty');
    } else if (val === 'Home & Kitchen') {
      navigateTo('home-kitchen');
    } else if (val === 'Beauty') {
      navigateTo('beauty');
    } else if (val === 'Mobiles') {
      navigateTo('shop');
    } else {
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

  const activeCategoryObj =
    searchCategoryOptions.find((c) => c.value === selectedCategory) || searchCategoryOptions[0];
  const ActiveIcon = activeCategoryObj.icon;

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-y-2 shadow-xs relative z-40">
      {/* Brand Logo */}
      <div onClick={() => navigateTo('home')} className="flex flex-col items-start cursor-pointer group select-none">
        <img src={logo} alt="BuyZo Logo" className="h-8 sm:h-9 w-auto object-contain" />
        <span className="text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 leading-none">
          <span className="text-brand-700">Shop More,</span> <span className="text-accent">Save More</span>
        </span>
      </div>

      {/* Interactive Search Bar Container */}
      <div ref={searchRef} className="order-3 w-full sm:order-none sm:flex-1 sm:max-w-2xl sm:mx-8 relative z-30">
        <form onSubmit={handleSearchSubmit} className="flex border border-gray-300 rounded-xl bg-white shadow-xs focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all relative">
          {/* Custom Category Dropdown Trigger */}
          <div className="relative shrink-0" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsCatDropdownOpen(!isCatDropdownOpen);
                if (isDropdownOpen) setIsDropdownOpen(false);
              }}
              className="h-full flex items-center space-x-1.5 px-2.5 sm:px-4 py-2.5 bg-gray-50 hover:bg-brand-50/50 text-gray-800 font-bold text-xs sm:text-sm border-r border-gray-200 transition-colors cursor-pointer select-none rounded-l-xl group"
              title="Filter by Department / Category"
            >
              <ActiveIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-700 shrink-0" />
              <span className="max-w-[75px] sm:max-w-[110px] truncate text-left font-bold text-gray-800 group-hover:text-brand-700">
                {activeCategoryObj.shortLabel}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${
                  isCatDropdownOpen ? 'rotate-180 text-accent' : 'group-hover:text-gray-800'
                }`}
              />
            </button>

            {/* Custom Modern Dropdown Menu */}
            {isCatDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10">
                {/* Dropdown Header */}
                <div className="p-3 bg-gradient-to-r from-[#063328] to-[#0a4d3c] text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LayoutGrid className="w-4 h-4 text-emerald-300" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Search Departments</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {searchCategoryOptions.length} Options
                  </span>
                </div>

                {/* Categories List */}
                <div className="p-2 max-h-80 overflow-y-auto space-y-1 divide-y divide-gray-50/80">
                  {searchCategoryOptions.map((cat) => {
                    const isSelected = selectedCategory === cat.value;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.value)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-50 text-brand-700 font-bold border border-brand-100/60 shadow-xs'
                            : 'hover:bg-gray-50/80 text-gray-700 hover:text-gray-900 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-2xs ${cat.iconBg}`}
                          >
                            <Icon className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`text-xs truncate ${
                                  isSelected ? 'font-extrabold text-brand-700' : 'font-bold text-gray-800'
                                }`}
                              >
                                {cat.label}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                ({cat.count})
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                              {cat.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-xs ml-2">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Dropdown Footer */}
                <div className="p-2.5 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center space-x-1 font-medium">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    <span>Instant filter</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryNavigate(selectedCategory)}
                    className="text-brand-700 hover:text-accent font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>Browse {selectedCategory === 'All Categories' ? 'Shop' : selectedCategory}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
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
            className="bg-accent hover:bg-accent-600 text-white px-4 sm:px-7 text-sm font-bold tracking-wide transition-colors shrink-0 flex items-center justify-center cursor-pointer rounded-r-xl"
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
                    className="p-3 hover:bg-brand-50/60 flex items-center justify-between cursor-pointer transition-colors group"
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
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-semibold bg-brand-100 text-emerald-800 px-2 py-0.5 rounded-full">
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
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Icons & Account */}
      <div className="flex items-center space-x-3 sm:space-x-8 shrink-0">
        {/* User Account */}
        <div ref={userMenuRef} className="relative">
          <div
            onClick={() => {
              if (currentUser) {
                setIsUserMenuOpen((prev) => !prev);
              } else {
                navigateTo('login');
              }
            }}
            className="flex items-center space-x-2.5 cursor-pointer group select-none"
            title={currentUser ? `Signed in as ${userName}` : 'Click to Login'}
          >
            <div className="p-1 rounded-full text-brand-700 group-hover:bg-brand-50 transition-colors">
              <User className="w-7 h-7 stroke-[1.8]" />
            </div>
            {currentUser ? (
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[12px] text-gray-500 font-normal leading-tight">
                  Hello, {userFirstName || 'there'}
                </span>
                <div className="flex items-center space-x-0.5 text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-700 transition-colors">
                  <span className="max-w-[120px] truncate">{userName}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-700 stroke-[2.2] ml-0.5 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[12px] text-gray-500 font-normal leading-tight">Welcome Guest</span>
                <div className="flex items-center space-x-0.5 text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-700 transition-colors">
                  <span>Login / Account</span>
                  <ChevronDown className="w-4 h-4 text-gray-700 stroke-[2.2] ml-0.5" />
                </div>
              </div>
            )}
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
                    setIsWalletOpen(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>BuyZo Wallet (₹{Number(walletBalance).toFixed(2)})</span>
                </button>

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

                {normalizeRole(currentUser.role) === ROLES.ADMIN && (
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

                {[ROLES.ADMIN, ROLES.WAREHOUSE].includes(normalizeRole(currentUser.role)) && (
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

                {[ROLES.ADMIN, ROLES.DELIVERY_AGENT].includes(normalizeRole(currentUser.role)) && (
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
          <div className="relative flex items-center justify-center p-1 rounded-full text-brand-700 group-hover:bg-brand-50 transition-colors">
            <Heart className="w-6.5 h-6.5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-2 bg-accent-500 text-white text-[10px] font-extrabold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
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
          <div className="relative flex items-center justify-center p-1 rounded-full text-brand-700 group-hover:bg-brand-50 transition-colors">
            <ShoppingCart className="w-6.5 h-6.5 stroke-[1.8]" />
            <span className="absolute -top-1 -right-2 bg-accent-500 text-white text-[10px] font-extrabold rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
              {cartCount}
            </span>
          </div>
          <span className="text-[12px] font-semibold text-gray-800 leading-none mt-0.5 group-hover:text-[#f95700] transition-colors">
            Cart
          </span>
        </div>
      </div>
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </header>
  );
}

