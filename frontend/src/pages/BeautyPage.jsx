import StripBanner from '../features/festive/components/StripBanner';
import React, { useState, useMemo } from 'react';
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
  Crown,
  Droplets,
  Flower2,
  Sparkle
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import assets
import beautyCategorySvg from '../assets/category/categoryBeauty.svg';
import fashionCategorySvg from '../assets/category/categoryFashion.svg';

// Import realistic high-res product photos
import beautyHeroBannerImg from '../assets/images/beauty_hero_banner.png';
import beautyNiacinamideSerumImg from '../assets/images/beauty_niacinamide_serum.jpg';
import beautyMatteLipstickImg from '../assets/images/beauty_matte_lipstick.jpg';
import beautySunscreenGelImg from '../assets/images/beauty_sunscreen_gel.png';
import beautyArganHairSerumImg from '../assets/images/beauty_argan_hair_serum.jpg';
import beautyOudPerfumeImg from '../assets/images/beauty_oud_perfume.jpg';
import beautyCcCreamImg from '../assets/images/beauty_cc_cream.png';
import beautyOnionHairOilImg from '../assets/images/beauty_onion_hair_oil.png';
import beautyVitaminCFacewashImg from '../assets/images/beauty_vitamin_c_facewash.png';
import beautyMascaraImg from '../assets/images/beauty_mascara.jpg';
import beautyCeramideCreamImg from '../assets/images/beauty_ceramide_cream.png';
import beautyCherryBodywashImg from '../assets/images/beauty_cherry_bodywash.png';
import beautyRosewaterMistImg from '../assets/images/beauty_rosewater_mist.jpg';

const beautyCategories = [
  { id: 'All', name: 'All Beauty', icon: beautyCategorySvg, count: 160 },
  { id: 'Skincare', name: 'Skincare & Serums', icon: beautyCategorySvg, count: 58 },
  { id: 'Makeup', name: 'Makeup & Cosmetics', icon: fashionCategorySvg, count: 44 },
  { id: 'Haircare', name: 'Haircare & Oils', icon: beautyCategorySvg, count: 32 },
  { id: 'Fragrances', name: 'Fragrances & Mists', icon: beautyCategorySvg, count: 18 },
  { id: 'Bath & Body', name: 'Bath & Body Care', icon: beautyCategorySvg, count: 24 }
];

const initialBeautyProducts = [
  {
    id: 'beauty-1',
    name: '10% Niacinamide & Zinc Clarifying Face Serum (30ml)',
    brand: 'Minimalist',
    category: 'Skincare',
    image: beautyNiacinamideSerumImg,
    price: 599,
    originalPrice: 799,
    discount: '25% OFF',
    rating: 4.8,
    reviews: 4200,
    badge: 'Bestseller',
    volume: '30 ml',
    skinType: 'All Skin Types',
    popularity: 99,
    description: 'Nourishing oil-free daily serum formulated with pure fermented Niacinamide to diminish spots and balance sebum.'
  },
  {
    id: 'beauty-2',
    name: 'Matte Liquid Velvet Long-Wear Lipstick (5.5ml)',
    brand: 'Maybelline',
    category: 'Makeup',
    image: beautyMatteLipstickImg,
    price: 649,
    originalPrice: 999,
    discount: '35% OFF',
    rating: 4.7,
    reviews: 6800,
    badge: '16Hr Stay',
    volume: '5.5 ml',
    skinType: 'Smudge-Proof',
    popularity: 98,
    description: 'Transfer-proof pigmented liquid matte formula infused with arrowroot for non-drying lightweight all-day wear.'
  },
  {
    id: 'beauty-3',
    name: 'Hyaluronic Water-Gel Ultralight Sunscreen SPF 50+ PA++++',
    brand: 'Plum',
    category: 'Skincare',
    image: beautySunscreenGelImg,
    price: 499,
    originalPrice: 750,
    discount: '33% OFF',
    rating: 4.6,
    reviews: 3100,
    badge: 'Zero White Cast',
    volume: '50 g',
    skinType: 'Oily & Normal',
    popularity: 95,
    description: 'Ultra-lightweight invisible broad-spectrum gel sunscreen loaded with hyaluronic acid and niacinamide.'
  },
  {
    id: 'beauty-4',
    name: 'Moroccan Argan Oil Hair Recovery Serum & Heat Protectant',
    brand: "L'Oréal Paris",
    category: 'Haircare',
    image: beautyArganHairSerumImg,
    price: 799,
    originalPrice: 1299,
    discount: '38% OFF',
    rating: 4.7,
    reviews: 5400,
    badge: 'Salon Finish',
    volume: '100 ml',
    skinType: 'Frizz-Control',
    popularity: 96,
    description: 'Precious blend of Moroccan Argan oil that instantly smoothens split ends and provides 230°C thermal protection.'
  },
  {
    id: 'beauty-5',
    name: 'Luxury Oud & French Amber Eau De Parfum (100ml)',
    brand: 'Forest Essentials',
    category: 'Fragrances',
    image: beautyOudPerfumeImg,
    price: 2499,
    originalPrice: 4500,
    discount: '44% OFF',
    rating: 4.9,
    reviews: 1280,
    badge: 'Luxury Blend',
    volume: '100 ml',
    skinType: 'Long-Lasting',
    popularity: 97,
    description: 'Enchanting artisanal fragrance combining royal smoked agarwood, sweet vanilla bean, and velvet amber notes.'
  },
  {
    id: 'beauty-6',
    name: '9 to 5 Complexion Care CC Cream SPF 30 (30g)',
    brand: 'Lakmé',
    category: 'Makeup',
    image: beautyCcCreamImg,
    price: 349,
    originalPrice: 499,
    discount: '30% OFF',
    rating: 4.5,
    reviews: 8200,
    badge: 'Daily Essential',
    volume: '30 g',
    skinType: 'Natural Glow',
    popularity: 94,
    description: 'Dual-action makeup and skincare cream that conceals blemishes while moisturizing and protecting against UV rays.'
  },
  {
    id: 'beauty-7',
    name: 'Onion Scalp Oil with Redensyl for Hair Growth (150ml)',
    brand: 'Mamaearth',
    category: 'Haircare',
    image: beautyOnionHairOilImg,
    price: 449,
    originalPrice: 699,
    discount: '36% OFF',
    rating: 4.4,
    reviews: 9100,
    badge: 'Toxin Free',
    volume: '150 ml',
    skinType: 'All Hair Types',
    popularity: 93,
    description: 'Non-sticky natural cold-pressed oil enriched with sulphur, Redensyl, and almond oil to strengthen hair roots.'
  },
  {
    id: 'beauty-8',
    name: 'Vitamin C Brightening Foaming Face Wash with Brush (150ml)',
    brand: 'Plum',
    category: 'Skincare',
    image: beautyVitaminCFacewashImg,
    price: 399,
    originalPrice: 599,
    discount: '33% OFF',
    rating: 4.5,
    reviews: 3700,
    badge: 'Clean Beauty',
    volume: '150 ml',
    skinType: 'Brightening',
    popularity: 91,
    description: 'Gentle exfoliating facial cleanser infused with Kakadu plum vitamin C to remove dirt and boost radiant skin glow.'
  },
  {
    id: 'beauty-9',
    name: 'Volumizing Waterproof Panoramic Mascara',
    brand: "L'Oréal Paris",
    category: 'Makeup',
    image: beautyMascaraImg,
    price: 899,
    originalPrice: 1299,
    discount: '31% OFF',
    rating: 4.6,
    reviews: 4300,
    badge: 'Drama Lash',
    volume: '9.4 ml',
    skinType: 'Waterproof',
    popularity: 92,
    description: 'Multi-level bristle wand that fans lashes corner-to-corner for maximum volume without clumping.'
  },
  {
    id: 'beauty-10',
    name: 'Ceramides Deep Hydration Moisturizing Cream (100g)',
    brand: 'Minimalist',
    category: 'Skincare',
    image: beautyCeramideCreamImg,
    price: 549,
    originalPrice: 799,
    discount: '31% OFF',
    rating: 4.8,
    reviews: 2800,
    badge: 'Skin Barrier Repair',
    volume: '100 g',
    skinType: 'Dry & Sensitive',
    popularity: 94,
    description: 'Restorative barrier repair cream infused with 0.3% pure ceramides, madecassoside and hyaluronic acid.'
  },
  {
    id: 'beauty-11',
    name: 'Japanese Cherry Blossom Relaxing Body Wash (250ml)',
    brand: 'Nykaa',
    category: 'Bath & Body',
    image: beautyCherryBodywashImg,
    price: 375,
    originalPrice: 550,
    discount: '32% OFF',
    rating: 4.6,
    reviews: 1900,
    badge: 'Aromatherapy',
    volume: '250 ml',
    skinType: 'Hydrating',
    popularity: 89,
    description: 'Luxe foaming shower gel enriched with aloe vera and cherry blossom extract for supple, fragrant skin.'
  },
  {
    id: 'beauty-12',
    name: 'Rosewater & Cardamom Pure Ayurvedic Face Mist (200ml)',
    brand: 'Forest Essentials',
    category: 'Fragrances',
    image: beautyRosewaterMistImg,
    price: 1350,
    originalPrice: 1850,
    discount: '27% OFF',
    rating: 4.8,
    reviews: 950,
    badge: 'Pure Steam Distilled',
    volume: '200 ml',
    skinType: 'Hydrating Toner',
    popularity: 90,
    description: 'Handcrafted floral water sourced from Kannauj roses to tone pores, rehydrate and revitalize skin instantly.'
  }
];

const beautyBrands = [
  { name: 'Minimalist', count: 28 },
  { name: 'Plum', count: 32 },
  { name: 'Maybelline', count: 24 },
  { name: "L'Oréal Paris", count: 26 },
  { name: 'Lakmé', count: 30 },
  { name: 'Mamaearth', count: 22 },
  { name: 'Forest Essentials', count: 16 },
  { name: 'Nykaa', count: 18 }
];

export default function BeautyPage() {
  const { addToCart, addToWishlist, wishlistItems } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const filteredProducts = useMemo(() => {
    return initialBeautyProducts
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
        if (sortBy === 'discount') return parseInt(b.discount) - parseInt(a.discount);
        return b.popularity - a.popularity;
      });
  }, [activeCategory, selectedBrands, maxPrice, minRating, sortBy]);

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
    addToWishlist({
      id: product.id,
      name: product.name,
      specs: `${product.brand} | ${product.category}`,
      category: 'Beauty',
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      inStock: true,
      deliveryDate: 'Delivery by 2-3 Days'
    });
    setToastMessage(`Saved "${product.name}" to wishlist!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedBrands([]);
    setMaxPrice(5000);
    setMinRating(0);
    setSortBy('popularity');
  };

  const isProductInWishlist = (id) => {
    return wishlistItems?.some((item) => item.id === id);
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

      {/* Hero Banner - Luxury Blush Rose & Cosmetics Gala */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1 sm:pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fdf3f4] via-[#fae8eb] to-[#f6dadf] text-[#221a1c] border border-[#f0ced4] shadow-soft">
          {/* Ambient Rose/Gold Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-6 left-12 text-[#db3f73]/40 text-xs pointer-events-none">✦</div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-5 sm:p-8 lg:p-10 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
              {/* Top Tag Pill */}
              <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#b83358] border border-[#f2cbd4] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#db3f73]" />
                <span>Luxury Skincare &amp; Cosmetics Gala</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold tracking-tight leading-[1.12] text-[#201a1c]">
                Glow Naturally with<br />
                <span className="text-[#db3f73] font-serif font-black">BuyZo</span>{' '}
                <span className="text-[#201a1c] font-serif font-bold">Beauty Essentials</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg font-medium leading-relaxed">
                Discover dermatologist-tested serums, smudge-proof makeup, nourishing haircare, and luxury fragrances with up to{' '}
                <span className="text-[#201a1c] font-bold underline decoration-[#db3f73] decoration-2">50% OFF</span> certified genuine brands.
              </p>

              {/* 3 Luxury Frosted Glass Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center space-x-2.5 text-xs text-[#2c1d22] font-semibold bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#f2cbd4] shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#db3f73]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#db3f73]" />
                  </div>
                  <span className="text-[11px] leading-tight">100% Authentic Products</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-[#2c1d22] font-semibold bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#f2cbd4] shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#db3f73]/10 flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4 text-[#db3f73]" />
                  </div>
                  <span className="text-[11px] leading-tight">Cruelty-Free &amp; Clean</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-[#2c1d22] font-semibold bg-white/80 backdrop-blur-sm rounded-xl p-2.5 border border-[#f2cbd4] shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-[#db3f73]/10 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-[#db3f73]" />
                  </div>
                  <span className="text-[11px] leading-tight">Fast Temperature-Safe Delivery</span>
                </div>
              </div>

              {/* Rose Gradient CTA Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('beauty-departments');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-3 bg-gradient-to-r from-[#ba2d5b] to-[#e45a86] hover:from-[#a3224c] hover:to-[#d04672] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-rose-500/25 flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Shop Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Graphic - Luxury Beauty Products Set */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <div className="relative group/beauty w-full flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-pink-400/10 to-transparent rounded-full blur-2xl pointer-events-none transform group-hover/beauty:scale-105 transition-transform duration-500"></div>

                <img
                  src={beautyHeroBannerImg}
                  alt="Luxury Skincare & Beauty Collection Set"
                  className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto max-h-[320px] sm:max-h-[360px] object-contain drop-shadow-[0_18px_30px_rgba(186,45,91,0.18)] relative z-10 group-hover/beauty:scale-[1.02] transition-transform duration-500 select-none"
                />

                <div className="hidden sm:flex absolute -bottom-1 right-2 sm:right-4 bg-white/95 backdrop-blur-xl text-gray-900 px-3.5 py-2 rounded-2xl shadow-lift border border-[#f0ced4] z-20 items-center space-x-2 select-none hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-[#db3f73] animate-pulse" />
                  <span className="text-xs font-black tracking-tight text-[#221a1c]">Special <span className="text-[#db3f73]">Up to 50% OFF</span></span>
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
            <Sparkle className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">Explore Beauty &amp; Wellness</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Showing {filteredProducts.length} Items</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-3 scrollbar-thin select-none">
          {beautyCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-brand-800 text-white border-brand-800 shadow-md shadow-[#063328]/20 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-brand-800 border-gray-200 shadow-sm'
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

      {/* Main Filter + Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filter Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <span className="font-bold text-sm text-gray-900">Refine Search</span>
              </div>
              {(selectedBrands.length > 0 || minRating > 0 || activeCategory !== 'All' || maxPrice < 5000) && (
                <button onClick={clearAllFilters} className="text-xs font-semibold text-accent hover:underline cursor-pointer">
                  Clear All
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Beauty Brands</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {beautyBrands.map((brand) => {
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
                            isChecked ? 'bg-brand-800 border-brand-800 text-white' : 'border-gray-300 bg-white'
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
                min="200"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#063328] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>₹200</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer Rating</span>
              <div className="space-y-1.5">
                {[4, 3, 2].map((rt) => (
                  <label
                    key={rt}
                    onClick={() => setMinRating(minRating === rt ? 0 : rt)}
                    className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none py-0.5 hover:text-black"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        minRating === rt ? 'bg-accent border-[#ff5100] text-white' : 'border-gray-300 bg-white'
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

          {/* Product Grid (3 cards per row) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-600 font-medium">
                <span>Showing </span>
                <span className="font-bold text-gray-900">{filteredProducts.length}</span>
                <span> beauty items</span>
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
                    <option value="rating">Top Customer Rating</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-brand-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'list' ? 'bg-white text-brand-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Container */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => {
                  const inWish = isProductInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                    >
                      {/* Product Photo */}
                      <div className="relative bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                        <div className="absolute top-3 left-3 z-10 bg-accent text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {product.discount}
                        </div>

                        {product.badge && (
                          <div className="absolute top-3 right-12 z-10 bg-brand-800 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
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
                          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500' : ''}`} />
                        </button>

                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                            <span className="uppercase tracking-wider text-rose-700 font-bold">{product.brand}</span>
                            <span>{product.category}</span>
                          </div>

                          <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-brand-800 transition-colors leading-snug">
                            {product.name}
                          </h3>

                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-200">
                              <span>{product.rating}</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-[11px] text-gray-400">({product.reviews.toLocaleString('en-IN')})</span>
                          </div>

                          <div className="flex items-center space-x-2 mt-2 text-[10px] text-gray-500 font-medium">
                            <span className="bg-gray-100 px-2 py-0.5 rounded">{product.volume}</span>
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">{product.skinType}</span>
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
                            className="p-2.5 bg-brand-800 hover:bg-accent text-white rounded-xl shadow-sm transition-all duration-200 cursor-pointer group-hover:shadow-md transform active:scale-95"
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
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-5 cursor-pointer relative"
                    >
                      <div className="relative w-full sm:w-40 h-40 shrink-0 bg-rose-50/40 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-contain" />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">{product.brand}</span>
                          <button
                            onClick={(e) => handleToggleWishlist(product, e)}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                              inWish ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500' : ''}`} />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-800 transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>

                        <div className="flex items-center space-x-3 pt-1">
                          <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
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
                            className="px-5 py-2.5 bg-brand-800 hover:bg-accent text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
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



