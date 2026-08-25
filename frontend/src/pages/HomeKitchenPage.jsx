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

// Import assets
import heroChairImg from '../assets/HeroHomeChair.png';
import heroLampImg from '../assets/HeroHomeLamp.png';
import accentChairImg from '../assets/images/accent_chair.jpg';
import loungeChairImg from '../assets/images/lounge_chair.jpg';

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
    image: homeCategorySvg,
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
    image: heroLampImg,
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
    image: homeCategorySvg,
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
    image: homeCategorySvg,
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
    image: homeCategorySvg,
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
    image: homeCategorySvg,
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
    image: homeCategorySvg,
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
    image: homeCategorySvg,
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
    image: homeCategorySvg,
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
    image: heroChairImg,
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
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const isProductInWishlist = (id) => isWishlisted(id);

  const [productsList, setProductsList] = useState(initialHomeProducts);
  const [activeCategory, setActiveCategory] = useState('All');
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
    fetchProducts({ no_page: 'true' }).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const homeData = data.filter(p => ['Home & Kitchen', 'Chairs & Furniture', 'Appliances'].includes(p.category));
        if (homeData.length > 0) {
          const uniqueItems = [];
          const seenImages = new Set();
          for (const item of homeData) {
            const resolvedImg = getProductImage(item.name || item.title, item.image || item.primary_image);
            const imgName = resolvedImg ? String(resolvedImg).split('/').pop().split('?')[0] : (item.name || item.title);
            if (imgName && !seenImages.has(imgName)) {
              seenImages.add(imgName);
              uniqueItems.push({
                ...item,
                name: item.name || item.title,
                image: resolvedImg
              });
            }
          }
          setProductsList(uniqueItems.length > 0 ? uniqueItems : initialHomeProducts);
        }
      }
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
        <div className="fixed bottom-6 right-6 bg-[#063328] text-white px-5 py-3.5 rounded-xl shadow-2xl font-medium text-sm z-50 flex items-center space-x-3 border border-emerald-500/30 animate-bounce">
          <div className="bg-emerald-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#04241c] via-[#063328] to-[#0c5946] text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-[#ff5100]/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-8">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-300 border border-white/10">
                <Home className="w-3.5 h-3.5 text-[#ff5100]" />
                <span>Home &amp; Kitchen Renovation Fest</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Transform Your Living Space with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-white">
                  BuyZo Home &amp; Kitchen
                </span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl font-normal leading-relaxed">
                Explore designer furniture, induction cookware, smart kitchen appliances, luxury bedding, and modern lighting with up to <span className="text-white font-bold underline decoration-[#ff5100]">60% OFF</span>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center space-x-2 text-xs text-emerald-100/90 bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free Expert Assembly</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-emerald-100/90 bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/5">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Doorstep Fragile Care</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-emerald-100/90 bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/5 col-span-2 sm:col-span-1">
                  <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10-Day Easy Exchange</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-sm group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5100]/20 to-emerald-500/20 rounded-3xl filter blur-xl transform group-hover:scale-105 transition-all"></div>
                <img
                  src={heroChairImg}
                  alt="Modern Home Furniture"
                  className="relative z-10 w-full h-auto max-h-[300px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-md text-gray-900 px-3.5 py-2 rounded-xl shadow-lg border border-white/40 z-20 flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-[#ff5100] animate-pulse" />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-500">Living Room Hit</div>
                    <div className="text-xs font-black text-[#063328]">Up to 60% OFF Decor</div>
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
            <Armchair className="w-5 h-5 text-[#ff5100]" />
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
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#063328] text-white border-[#063328] shadow-md shadow-[#063328]/20 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-[#063328] border-gray-200 shadow-sm'
                }`}
              >
                <img src={cat.icon} alt={cat.name} className="w-4 h-4 object-contain" />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-emerald-200' : 'bg-gray-100 text-gray-500'
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
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ff5100]" />
                <span className="font-bold text-sm text-gray-900">Filters</span>
              </div>
              {(selectedBrands.length > 0 || minRating > 0 || activeCategory !== 'All' || maxPrice < 15000) && (
                <button onClick={clearAllFilters} className="text-xs font-semibold text-[#ff5100] hover:underline cursor-pointer">
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
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked ? 'bg-[#063328] border-[#063328] text-white' : 'border-gray-300 bg-white'
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
                <span className="text-[#063328] font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#063328] cursor-pointer"
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
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        minRating === rt ? 'bg-[#ff5100] border-[#ff5100] text-white' : 'border-gray-300 bg-white'
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
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-[#063328] shadow-xs' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'list' ? 'bg-white text-[#063328] shadow-xs' : 'text-gray-400 hover:text-gray-600'
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
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#063328] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                    >
                      <div className="relative bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                        <div className="absolute top-3 left-3 z-10 bg-[#ff5100] text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {product.discount}
                        </div>

                        {product.badge && (
                          <div className="absolute top-3 right-12 z-10 bg-[#063328] text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                            {product.badge}
                          </div>
                        )}

                        <button
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                            inWish
                              ? 'bg-rose-50 text-rose-500 border border-rose-200'
                              : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white border border-gray-200/50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500 stroke-rose-500' : ''}`} />
                        </button>

                        <img
                          src={getProductImage(product.name || product.title, product.image || product.primary_image)}
                          alt={product.name || product.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProductImage(product.name || product.title, '');
                          }}
                          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                            <span className="uppercase tracking-wider text-emerald-700 font-bold">{product.brand}</span>
                            <span>{product.category}</span>
                          </div>

                          <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#063328] transition-colors leading-snug">
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

                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="p-2.5 bg-[#063328] hover:bg-[#ff5100] text-white rounded-xl shadow-sm transition-all duration-200 cursor-pointer group-hover:shadow-md transform active:scale-95"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
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
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#063328] hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-5 cursor-pointer relative"
                    >
                      <div className="relative w-full sm:w-44 h-44 shrink-0 bg-gray-50 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{product.brand}</span>
                          <button
                            onClick={(e) => handleToggleWishlist(product, e)}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                              inWish ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500 stroke-rose-500' : ''}`} />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#063328] transition-colors">
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

                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="px-5 py-2.5 bg-[#063328] hover:bg-[#ff5100] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
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
