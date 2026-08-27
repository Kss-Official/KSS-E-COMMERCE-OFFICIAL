import StripBanner from '../features/festive/components/StripBanner';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  LayoutGrid,
  List,
  ChevronRight,
  Star,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Armchair,
  UtensilsCrossed,
  Lamp,
  Bed,
  Home,
  CookingPot,
  Blender
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { fetchProducts } from '../services/api';
import { getProductImage } from '../utils/productAssets';
import CartButton from '../components/ui/CartButton';

// Import assets
import homeKitchenBannerHeroImg from '../assets/images/home_kitchen_banner_hero.png';
import accentChairImg from '../assets/images/accent_chair.jpg';
import loungeChairImg from '../assets/images/lounge_chair.jpg';
import cookwareSetImg from '../assets/images/hk_cookware_set.jpg';
import pendantLampImg from '../assets/images/hk_pendant_lamp.jpg';
import airFryerImg from '../assets/images/hk_air_fryer.jpg';
import cottonBedsheetImg from '../assets/images/hk_cotton_bedsheet.png';
import pressureCookerImg from '../assets/images/hk_pressure_cooker.jpg';
import casseroleSetImg from '../assets/images/hk_casserole_set.png';
import memoryPillowImg from '../assets/images/hk_memory_pillow.jpg';
import mixerGrinderImg from '../assets/images/hk_mixer_grinder.jpg';
import ceramicDinnerSetImg from '../assets/images/hk_ceramic_dinner_set.png';
import wallShelvesImg from '../assets/images/hk_wall_shelves.png';

// Category SVGs
import homeCategorySvg from '../assets/category/CategoryHome & kitchen.svg';
import chairsCategorySvg from '../assets/category/categoryChairs.svg';

const homeCategories = [
  { id: 'All', name: 'All Home & Kitchen', icon: homeCategorySvg, count: 210 },
  { id: 'Furniture', name: 'Living & Bedroom Furniture', icon: chairsCategorySvg, count: 64 },
  { id: 'Cookware', name: 'Cookware & Kitchenware', icon: homeCategorySvg, count: 52 },
  { id: 'Home Decor', name: 'Decor & Lighting', icon: homeCategorySvg, count: 38 },
  { id: 'Bedding', name: 'Bedding & Furnishings', icon: homeCategorySvg, count: 32 },
  { id: 'Appliances', name: 'Kitchen Appliances', icon: homeCategorySvg, count: 24 }
];

const initialHomeProducts = [
  {
    id: 'hk-1',
    name: 'Modern Ergonomic Velvet Accent Armchair',
    brand: 'UrbanHome',
    category: 'Furniture',
    image: accentChairImg,
    price: 6999,
    originalPrice: 11999,
    discount: '42% OFF',
    rating: 4.8,
    reviews: 1420,
    badge: 'Bestseller',
    material: 'Solid Wood & Velvet',
    color: 'Teal Blue',
    popularity: 99,
    description: 'Plush high-density foam cushioned armchair with solid teak wood legs and ergonomic lumbar support.'
  },
  {
    id: 'hk-2',
    name: 'Contemporary Nordic Lounge Relaxing Recliner Chair',
    brand: 'UrbanHome',
    category: 'Furniture',
    image: loungeChairImg,
    price: 8499,
    originalPrice: 14999,
    discount: '43% OFF',
    rating: 4.7,
    reviews: 980,
    badge: 'Top Rated',
    material: 'Hardwood & Breathable Fabric',
    color: 'Olive Gray',
    popularity: 97,
    description: 'Minimalist Scandinavian lounge chair with reinforced steel frame and removable washable upholstery.'
  },
  {
    id: 'hk-3',
    name: 'Tri-Ply Stainless Steel 5-Piece Induction Cookware Set',
    brand: 'Prestige',
    category: 'Cookware',
    image: cookwareSetImg,
    price: 3499,
    originalPrice: 5999,
    discount: '42% OFF',
    rating: 4.6,
    reviews: 2850,
    badge: 'Induction Ready',
    material: '304 Grade Stainless Steel',
    color: 'Silver Mirror Finish',
    popularity: 95,
    description: 'Heavy gauge 3-ply base for uniform heat distribution without hot spots, includes toughened glass lids.'
  },
  {
    id: 'hk-4',
    name: 'Nordic Minimalist Geometric Pendant Hanging Ceiling Lamp',
    brand: 'Solimo',
    category: 'Home Decor',
    image: pendantLampImg,
    price: 1899,
    originalPrice: 3499,
    discount: '46% OFF',
    rating: 4.5,
    reviews: 1120,
    badge: 'Warm Ambiance',
    material: 'Matte Brass & Aluminum',
    color: 'Gold & Matte Black',
    popularity: 93,
    description: 'Architectural hanging pendant chandelier lamp with adjustable drop cord and E27 warm LED socket.'
  },
  {
    id: 'hk-5',
    name: 'Digital Touch Screen Rapid Air Fryer 4.5L (1400W)',
    brand: 'Philips',
    category: 'Appliances',
    image: airFryerImg,
    price: 5499,
    originalPrice: 8999,
    discount: '39% OFF',
    rating: 4.7,
    reviews: 3600,
    badge: '90% Less Oil',
    material: 'Non-Stick Food Grade Basket',
    color: 'Obsidian Black',
    popularity: 98,
    description: 'Patented rapid air convection technology for crispy guilt-free snacks with 8 digital preset menus.'
  },
  {
    id: 'hk-6',
    name: '100% Pure Egyptian Cotton King Size Bedsheet with 2 Pillow Covers',
    brand: 'Bombay Dyeing',
    category: 'Bedding',
    image: cottonBedsheetImg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    rating: 4.6,
    reviews: 2150,
    badge: '400 Thread Count',
    material: '100% Sateen Weave Cotton',
    color: 'Emerald & Cream Floral',
    popularity: 92,
    description: 'Silky smooth breathable luxury king bedsheet that gets softer with every wash, fade-resistant dyes.'
  },
  {
    id: 'hk-7',
    name: 'Hard Anodized 3L Pressure Cooker with Inner Lid',
    brand: 'Hawkins',
    category: 'Cookware',
    image: pressureCookerImg,
    price: 1799,
    originalPrice: 2499,
    discount: '28% OFF',
    rating: 4.8,
    reviews: 6400,
    badge: 'Safety Certified',
    material: 'Hard Anodized Aluminum',
    color: 'Black Metallic',
    popularity: 96,
    description: 'Heavy duty corrosion-proof pressure cooker engineered with pressure locked safety lid and stay-cool handle.'
  },
  {
    id: 'hk-8',
    name: 'Double-Walled Stainless Steel Insulated Casserole Set (3-Pcs)',
    brand: 'Milton',
    category: 'Cookware',
    image: casseroleSetImg,
    price: 1299,
    originalPrice: 2199,
    discount: '41% OFF',
    rating: 4.5,
    reviews: 3900,
    badge: '6Hr Hot & Fresh',
    material: 'Food Grade Polyurethane & Steel',
    color: 'Emerald Green & Gold',
    popularity: 91,
    description: 'Keeps chapatis, curries, and rice steaming hot for up to 6 hours with integrated twist locking lids.'
  },
  {
    id: 'hk-9',
    name: 'Orthopedic Memory Foam Ergonomic Sleeping Pillow',
    brand: 'Wakefit',
    category: 'Bedding',
    image: memoryPillowImg,
    price: 899,
    originalPrice: 1699,
    discount: '47% OFF',
    rating: 4.6,
    reviews: 5200,
    badge: 'Neck Pain Relief',
    material: 'High Resilience Memory Foam',
    color: 'White & Grey',
    popularity: 94,
    description: 'Contoured orthopedic cervical pillow that aligns spine and cradles pressure points for restorative sleep.'
  },
  {
    id: 'hk-10',
    name: '750W Powerful 3-Jar Mixer Grinder with Copper Motor',
    brand: 'Prestige',
    category: 'Appliances',
    image: mixerGrinderImg,
    price: 2699,
    originalPrice: 4299,
    discount: '37% OFF',
    rating: 4.5,
    reviews: 4100,
    badge: 'Heavy Duty',
    material: 'Stainless Steel Blades & ABS',
    color: 'Teal & White',
    popularity: 93,
    description: '100% heavy copper wound motor with overload protector and specialized wet, dry, and chutney grinding jars.'
  },
  {
    id: 'hk-11',
    name: 'Handcrafted Ceramic Dinner Set 18-Pieces (Microwave Safe)',
    brand: 'Solimo',
    category: 'Cookware',
    image: ceramicDinnerSetImg,
    price: 2199,
    originalPrice: 3999,
    discount: '45% OFF',
    rating: 4.7,
    reviews: 1680,
    badge: 'Hand Glazed',
    material: 'Stoneware Ceramic',
    color: 'Ocean Turquoise',
    popularity: 90,
    description: 'Artisan studio hand-glazed ceramic dinner set for 6 persons, scratch-resistant and dishwasher friendly.'
  },
  {
    id: 'hk-12',
    name: 'Minimalist Wooden Floating Wall Shelves (Set of 3)',
    brand: 'UrbanHome',
    category: 'Home Decor',
    image: wallShelvesImg,
    price: 799,
    originalPrice: 1499,
    discount: '47% OFF',
    rating: 4.4,
    reviews: 1950,
    badge: 'Easy Wall Mount',
    material: 'Engineered Pine Wood',
    color: 'Walnut Brown',
    popularity: 89,
    description: 'Invisible bracket floating wall display shelves for books, indoor succulents, and photo frames.'
  }
];

export default function HomeKitchenPage() {
  const { addToCart, addToWishlist, toggleWishlist, isWishlisted, isProductInWishlist, wishlistItems } = useCartContext();
  const { navigateTo, selectedSubCategory } = useNavigationContext();

  const [productsList, setProductsList] = useState(initialHomeProducts);
  const [activeCategory, setActiveCategory] = useState(selectedSubCategory || 'All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');

  const homeBrands = useMemo(() => {
    const counts = {};
    productsList.forEach((p) => {
      const b = p.brand || p.brand_name;
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [productsList]);
  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (selectedSubCategory) {
      setActiveCategory(selectedSubCategory);
    }
  }, [selectedSubCategory]);

  // Pull the live Home & Kitchen catalogue from the backend, falling back to the
  // bundled list if the API is unreachable so the page never renders empty.
  useEffect(() => {
    const homeCategoryNames = [
      'Home & Kitchen', 'Home and Kitchen', 'Home', 'Kitchen', 'Furniture',
      'Cookware', 'Home Decor', 'Appliances', 'Bedding', 'Dining', 'Lighting', 'Storage'
    ];
    fetchProducts({ no_page: 'true' })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const homeData = data.filter((p) => {
          const cat = String(p.category || p.category_name || '');
          return homeCategoryNames.some((c) => c.toLowerCase() === cat.toLowerCase());
        });
        if (homeData.length === 0) return;
        const mapped = homeData.map((p) => {
          const titleName = p.name || p.title || 'Product';
          const price = Number(p.price || p.current_price || p.base_price || 0);
          const originalPrice = Number(p.originalPrice || p.original_price || p.base_price || 0) || Math.round(price * 1.3);
          return {
            ...p,
            name: titleName,
            brand: p.brand || p.brand_name || 'BuyZo',
            category: p.subcategory || p.subcategory_name || p.category || p.category_name || 'All',
            image: getProductImage(titleName, p.image || p.primary_image),
            price,
            originalPrice,
            discount: p.discount || (originalPrice > price ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` : ''),
            rating: Number(p.rating || p.average_rating || 4.2),
            reviews: Number(p.reviews || p.review_count || 0),
            popularity: Number(p.popularity || p.review_count || 90)
          };
        });
        setProductsList(mapped);
      })
      .catch((err) => {
        console.warn('[HomeKitchenPage] Falling back to bundled products:', err);
      });
  }, []);

  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        if (activeCategory !== 'All' && p.category !== activeCategory) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (p.price > maxPrice) return false;
        if (minRating > 0 && p.rating < minRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'lowToHigh') return a.price - b.price;
        if (sortBy === 'highToLow') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') return parseInt(b.discount || 0) - parseInt(a.discount || 0);
        return (b.popularity || 90) - (a.popularity || 90);
      });
  }, [productsList, activeCategory, selectedBrands, maxPrice, minRating, sortBy]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      quantity: 1
    });
    setToastMessage(`Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    const wasWish = isWishlisted(product.id);
    toggleWishlist(product);
    setToastMessage(wasWish ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedBrands([]);
    setMaxPrice(15000);
    setMinRating(0);
    setSortBy('popularity');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-800 text-white px-5 py-3.5 rounded-xl shadow-2xl font-medium text-sm z-50 flex items-center space-x-3 border border-emerald-500/30 animate-bounce">
          <div className="bg-emerald-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner - Warm Luxury Linen Aesthetic */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 sm:pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f7f1e8] via-[#f2e9dc] to-[#e8decb] text-[#1f281e] border border-[#dfd3c0] shadow-soft">
          {/* Ambient Warm Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-5 sm:p-7 lg:p-8 pb-4 sm:pb-6 lg:pb-6 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
              {/* Top Tag Pill */}
              <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#4a5538] border border-[#d6cbba] shadow-2xs">
                <Home className="w-3.5 h-3.5 text-[#54623d]" />
                <span>Home &amp; Kitchen Renovation Fest</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-serif font-bold tracking-tight leading-[1.14] text-[#1a251b]">
                Transform Your<br />
                <span className="text-[#1a251b]">Living Space</span><br />
                <span className="text-sm sm:text-base font-sans font-normal text-gray-500 italic">with </span>
                <span className="text-[#54623d] font-sans font-black">BuyZo</span>{' '}
                <span className="text-[#1a251b] font-sans font-black">Home &amp; Kitchen</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg font-medium leading-relaxed">
                Explore designer furniture, induction cookware, smart kitchen appliances, luxury bedding, and modern lighting with up to{' '}
                <span className="text-[#1a251b] font-bold underline decoration-[#54623d] decoration-2">60% OFF.</span>
              </p>

              {/* 3 Luxury Glass Trust Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center space-x-2 text-xs text-[#2c382a] font-semibold bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#dfd3c0]/80 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#54623d]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#54623d]" />
                  </div>
                  <span className="text-[11px] leading-tight">Free Expert Assembly</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#2c382a] font-semibold bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#dfd3c0]/80 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span className="text-[11px] leading-tight">Doorstep Fragile Care</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#2c382a] font-semibold bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#dfd3c0]/80 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#54623d]/10 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-3.5 h-3.5 text-[#54623d]" />
                  </div>
                  <span className="text-[11px] leading-tight">10-Day Easy Exchange</span>
                </div>
              </div>

              {/* Olive CTA Button */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('hk-departments');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 bg-[#54623d] hover:bg-[#43502f] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Hero Image (Enlarged + Perfectly Positioned) */}
            <div className="lg:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg group/home flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-[#54623d]/15 to-emerald-400/10 rounded-full filter blur-2xl transform group-hover/home:scale-105 transition-all duration-700 pointer-events-none"></div>
                <img
                  src={homeKitchenBannerHeroImg}
                  alt="Modern Home & Kitchen Living and Cookware Collection"
                  className="relative z-10 w-full h-auto max-h-[320px] sm:max-h-[360px] lg:max-h-[390px] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover/home:scale-[1.02]"
                />
                <div className="absolute -bottom-1 -left-1 sm:bottom-1 sm:left-0 bg-white/95 backdrop-blur-xl text-gray-900 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-lift border border-[#dfd3c0] z-20 flex items-center space-x-2.5 select-none transition-all hover:scale-105">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 leading-none">Living &amp; Kitchen Hit</div>
                    <div className="text-xs sm:text-sm font-black text-brand-900 tracking-tight mt-0.5">Up to <span className="text-accent">60% OFF</span> Decor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Armchair className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-gray-900">Explore Home &amp; Kitchen Departments</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Showing {filteredProducts.length} Items</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-3 scrollbar-thin select-none">
          {homeCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${isActive
                  ? 'bg-brand-800 text-white border-brand-800 shadow-md shadow-[#063328]/20 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-brand-800 border-gray-200 shadow-sm'
                  }`}
              >
                <img src={cat.icon} alt={cat.name} className="w-4 h-4 object-contain" />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-emerald-200' : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-6 lg:sticky lg:top-6 self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <span className="font-bold text-sm text-gray-900">Filters</span>
              </div>
              {(selectedBrands.length > 0 || minRating > 0 || activeCategory !== 'All' || maxPrice < 15000) && (
                <button onClick={clearAllFilters} className="text-xs font-semibold text-accent hover:underline cursor-pointer">
                  Clear All
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Brands</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {homeBrands.map((brand) => {
                  const isChecked = selectedBrands.includes(brand.name);
                  return (
                    <label
                      key={brand.name}
                      onClick={() => handleToggleBrand(brand.name)}
                      className="flex items-center justify-between text-xs text-gray-700 hover:text-black cursor-pointer select-none py-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-brand-800 border-brand-800 text-white' : 'border-gray-300 bg-white'
                            }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={isChecked ? 'font-bold text-gray-900' : 'font-medium'}>{brand.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">({brand.count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="uppercase tracking-wider text-gray-500">Max Price</span>
                <span className="text-brand-800 font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #063328 0%, #063328 ${Math.min(100, Math.max(0, ((maxPrice - 500) / (15000 - 500)) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, ((maxPrice - 500) / (15000 - 500)) * 100))}%, #e2e8f0 100%)`
                }}
                className="w-full accent-[#063328] h-2 rounded-lg appearance-none cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>₹500</span>
                <span>₹15,000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Minimum Rating</span>
              <div className="space-y-1.5">
                {[4, 3, 2].map((rt) => (
                  <label
                    key={rt}
                    onClick={() => setMinRating(minRating === rt ? 0 : rt)}
                    className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none py-0.5 hover:text-black"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${minRating === rt ? 'bg-accent border-[#ff5100] text-white' : 'border-gray-300 bg-white'
                        }`}
                    >
                      {minRating === rt && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-amber-500 font-semibold">{rt}★ &amp; Above</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid / List Section */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-600 font-medium">
                <span>Showing </span>
                <span className="font-bold text-gray-900">{filteredProducts.length}</span>
                <span> home &amp; kitchen products</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-pointer"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white text-brand-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white text-brand-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid (3 cards per row) */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => {
                  const inWish = isWishlisted(product);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                    >
                      <div className="relative bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                        <div className="absolute top-3 left-3 z-10 bg-accent text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {product.discount}
                        </div>

                        {product.badge && (
                          <div className="absolute top-3 right-12 z-10 bg-brand-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                            {product.badge}
                          </div>
                        )}

                        <button
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${inWish
                            ? 'bg-rose-50 text-rose-500 border border-rose-200'
                            : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white border border-gray-200/50'
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500 stroke-rose-500' : ''}`} />
                        </button>

                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 rounded-xl"
                        />
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                            <span className="uppercase tracking-wider text-emerald-700 font-bold">{product.brand}</span>
                            <span>{product.category}</span>
                          </div>

                          <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-brand-800 transition-colors leading-snug">
                            {product.name}
                          </h3>

                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-200/60">
                              <span>{product.rating}</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-[11px] text-gray-400">({product.reviews} reviews)</span>
                          </div>

                          <div className="mt-2 text-[10px] text-gray-500 font-medium">
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{product.material}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-base font-black text-gray-900">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600">Free Delivery</span>
                          </div>

                          <div className="w-32">
                            <CartButton product={product} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const inWish = isProductInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-5 cursor-pointer relative"
                    >
                      <div className="relative w-full sm:w-44 h-44 shrink-0 bg-gray-50 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{product.brand}</span>
                          <button
                            onClick={(e) => handleToggleWishlist(product, e)}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${inWish ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-rose-500'
                              }`}
                          >
                            <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500 stroke-rose-500' : ''}`} />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-800 transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>

                        <div className="flex items-center space-x-3 pt-1">
                          <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold border border-emerald-200/60">
                            <span>{product.rating}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </div>
                          <span className="text-xs text-gray-400">({product.reviews} reviews)</span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="text-xs font-bold text-emerald-600">({product.discount})</span>
                          </div>

                          <div className="w-36">
                            <CartButton product={product} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



