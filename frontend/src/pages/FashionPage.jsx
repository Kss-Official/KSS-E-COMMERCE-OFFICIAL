import StripBanner from '../features/festive/components/StripBanner';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  LayoutGrid,
  List,
  ChevronRight,
  Filter,
  ChevronDown,
  Check,
  Star,
  ShoppingBag,
  Sparkles,
  Percent,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { fetchProducts } from '../services/api';
import { getProductImage } from '../utils/productAssets';
import CartButton from '../components/ui/CartButton';

// Import images
import fashionHeroImg from '../assets/images/fashion_hero.png';
import womenDressImg from '../assets/images/women_dress.jpg';
import roadsterShirtImg from '../assets/images/roadster_shirt.jpg';
import usPoloTshirtImg from '../assets/images/us_polo_tshirt.jpg';
import bibaKurtaImg from '../assets/images/biba_kurta.jpg';
import lavieHandbagImg from '../assets/images/lavie_handbag.jpg';
import pumaShoesImg from '../assets/images/puma_shoes.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';
import fashionChinosImg from '../assets/images/fashion_chinos.jpg';
import fashionDenimJacketImg from '../assets/images/fashion_denim_jacket.jpg';
import fashionSilkKurtiImg from '../assets/images/fashion_silk_kurti.jpg';
import fashionStreetSneakersImg from '../assets/images/fashion_street_sneakers.jpg';
import fashionSweatshirtImg from '../assets/images/fashion_sweatshirt.jpg';

// Category SVGs
import fashionCategorySvg from '../assets/category/categoryFashion.svg';
import allFashionCategorySvg from '../assets/category/categoryAllFashion.svg';
import mensWearCategorySvg from '../assets/category/categoryMensWear.svg';
import ethnicWearCategorySvg from '../assets/category/categoryEthnicWear.svg';
import shoesCategorySvg from '../assets/category/categoryShoes.svg';
import bagsCategorySvg from '../assets/category/categoryBags & luddages.svg';
import beautyCategorySvg from '../assets/category/categoryBeauty.svg';

const fashionCategories = [
  { id: 'All', name: 'All Fashion', icon: allFashionCategorySvg, count: 184 },
  { id: "Women's Wear", name: "Women's Wear", icon: fashionCategorySvg, count: 68 },
  { id: "Men's Wear", name: "Men's Wear", icon: mensWearCategorySvg, count: 52 },
  { id: 'Ethnic Wear', name: 'Ethnic Wear', icon: ethnicWearCategorySvg, count: 26 },
  { id: 'Footwear', name: 'Footwear', icon: shoesCategorySvg, count: 34 },
  { id: 'Bags & Luggage', name: 'Bags & Handbags', icon: bagsCategorySvg, count: 18 },
  { id: 'Accessories', name: 'Accessories', icon: beautyCategorySvg, count: 14 }
];

const initialFashionProducts = [
  {
    id: 'fash-1',
    name: "Women's Floral Fit & Flare Summer Dress",
    brand: 'Zara',
    category: "Women's Wear",
    image: womenDressImg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    rating: 4.6,
    reviews: 840,
    badge: 'Trending',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Emerald Green', 'Floral Mint', 'Navy'],
    isBestseller: true,
    popularity: 98,
    description: 'Breezy botanical print A-line dress crafted from breathable modal cotton.'
  },
  {
    id: 'fash-2',
    name: "Men's Regular Fit Casual Oxford Shirt",
    brand: 'Roadster',
    category: "Men's Wear",
    image: roadsterShirtImg,
    price: 899,
    originalPrice: 1999,
    discount: '55% OFF',
    rating: 4.4,
    reviews: 1250,
    badge: 'Hot Deal',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Olive Green', 'Classic Navy', 'White'],
    isBestseller: true,
    popularity: 95,
    description: 'Pure cotton washed oxford button-down shirt designed for all-day comfort.'
  },
  {
    id: 'fash-3',
    name: "Men's Solid Slim Fit Polo T-Shirt",
    brand: 'U.S. Polo Assn.',
    category: "Men's Wear",
    image: usPoloTshirtImg,
    price: 1199,
    originalPrice: 2499,
    discount: '52% OFF',
    rating: 4.5,
    reviews: 960,
    badge: 'Popular',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Mustard Gold', 'Charcoal', 'Maroon'],
    isBestseller: false,
    popularity: 92,
    description: 'Signature pique cotton polo shirt featuring iconic embroidered crest.'
  },
  {
    id: 'fash-4',
    name: "Women's Printed Anarkali Kurta Set with Dupatta",
    brand: 'Biba',
    category: 'Ethnic Wear',
    image: bibaKurtaImg,
    price: 2499,
    originalPrice: 4999,
    discount: '50% OFF',
    rating: 4.7,
    reviews: 620,
    badge: 'Festive Pick',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Deep Teal', 'Ruby Red', 'Golden Mustard'],
    isBestseller: true,
    popularity: 97,
    description: 'Handcrafted gold foil print Anarkali kurta accompanied by matching trousers and dupatta.'
  },
  {
    id: 'fash-5',
    name: "Women's Structured Structured Satchel Handbag",
    brand: 'Lavie',
    category: 'Bags & Luggage',
    image: lavieHandbagImg,
    price: 1899,
    originalPrice: 3990,
    discount: '52% OFF',
    rating: 4.5,
    reviews: 430,
    badge: 'Bestseller',
    sizes: ['Free Size'],
    colors: ['Dusty Rose', 'Midnight Black', 'Tan Brown'],
    isBestseller: true,
    popularity: 94,
    description: 'Premium faux-leather structured handbag with multi-compartment storage and detachable sling strap.'
  },
  {
    id: 'fash-6',
    name: "Unisex Flyer Flex Running & Training Shoes",
    brand: 'Puma',
    category: 'Footwear',
    image: pumaShoesImg,
    price: 2799,
    originalPrice: 4999,
    discount: '44% OFF',
    rating: 4.6,
    reviews: 1890,
    badge: 'Top Rated',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: ['Core Black', 'Steel Grey', 'Electric Blue'],
    isBestseller: true,
    popularity: 99,
    description: 'Ultra-lightweight mesh upper cushioned with SoftFoam+ comfort insole for responsive workouts.'
  },
  {
    id: 'fash-7',
    name: 'Urban Ergonomic Everyday Laptop Backpack 28L',
    brand: 'Wildcraft',
    category: 'Bags & Luggage',
    image: tealBackpackImg,
    price: 1299,
    originalPrice: 2499,
    discount: '48% OFF',
    rating: 4.3,
    reviews: 780,
    badge: 'Durable',
    sizes: ['28 Litres'],
    colors: ['Teal Cyan', 'Stealth Black', 'Navy'],
    isBestseller: false,
    popularity: 88,
    description: 'Water-repellent heavy duty polyester backpack with dedicated 15.6 inch padded laptop compartment.'
  },
  {
    id: 'fash-8',
    name: "Women's Elegant High-Rise Straight Fit Chinos",
    brand: 'H&M',
    category: "Women's Wear",
    image: fashionChinosImg,
    price: 1399,
    originalPrice: 2299,
    discount: '39% OFF',
    rating: 4.4,
    reviews: 510,
    badge: 'New Style',
    sizes: ['26', '28', '30', '32', '34'],
    colors: ['Beige', 'Olive', 'Charcoal'],
    isBestseller: false,
    popularity: 89,
    description: 'Clean silhouette high-waisted cotton twill trousers tailored with stretch flexibility.'
  },
  {
    id: 'fash-9',
    name: "Men's Classic Stonewashed Denim Jacket",
    brand: "Levi's",
    category: "Men's Wear",
    image: fashionDenimJacketImg,
    price: 3499,
    originalPrice: 6499,
    discount: '46% OFF',
    rating: 4.8,
    reviews: 1420,
    badge: 'Iconic',
    sizes: ['M', 'L', 'XL'],
    colors: ['Medium Vintage Wash', 'Deep Indigo'],
    isBestseller: true,
    popularity: 96,
    description: 'Original trucker fit authentic heavyweight denim jacket with button flap chest pockets.'
  },
  {
    id: 'fash-10',
    name: "Women's Embellished Silk Blend Kurti",
    brand: 'Biba',
    category: 'Ethnic Wear',
    image: fashionSilkKurtiImg,
    price: 1799,
    originalPrice: 3599,
    discount: '50% OFF',
    rating: 4.5,
    reviews: 380,
    badge: 'Festive',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Maroon Gold', 'Teal Green'],
    isBestseller: false,
    popularity: 87,
    description: 'Lustrous silk blend straight kurti detailed with intricate zari thread embroidery.'
  },
  {
    id: 'fash-11',
    name: 'Casual Streetwear Chunky Sole Sneakers',
    brand: 'Puma',
    category: 'Footwear',
    image: fashionStreetSneakersImg,
    price: 3299,
    originalPrice: 5999,
    discount: '45% OFF',
    rating: 4.5,
    reviews: 670,
    badge: 'Hot Trend',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: ['Chalk White', 'Mono Black'],
    isBestseller: false,
    popularity: 91,
    description: 'Retro chunky street trainer built with premium synthetic leather and rugged gum rubber outsole.'
  },
  {
    id: 'fash-12',
    name: "Men's Crewneck Organic Cotton Minimal Sweatshirt",
    brand: 'Zara',
    category: "Men's Wear",
    image: fashionSweatshirtImg,
    price: 1990,
    originalPrice: 2990,
    discount: '33% OFF',
    rating: 4.4,
    reviews: 310,
    badge: 'Cozy',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Oatmeal Melange', 'Forest Green', 'Black'],
    isBestseller: false,
    popularity: 86,
    description: 'Plush brushed fleece interior crafted from 100% sustainably sourced organic cotton.'
  }
];

const sizeFilters = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export default function FashionPage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const isProductInWishlist = (id) => isWishlisted(id);

  const [productsList, setProductsList] = useState(initialFashionProducts);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [toastMessage, setToastMessage] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const brandFilters = useMemo(() => {
    const counts = {};
    productsList.forEach((p) => {
      const b = p.brand || p.brand_name;
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [productsList]);

  useEffect(() => {
    fetchProducts({ no_page: 'true' }).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const fashionCategories = ['fashion', 'footwear', 'bags', 'luggage', 'women', 'men', 'ethnic', 'clothing', 'shirt', 'kurta', 'dress', 'shoe', 'sneaker'];
        const fashionData = data.filter(p => {
          const cat = String(p.category || p.category_name || '').toLowerCase();
          return fashionCategories.some(c => cat.includes(c));
        });
        const itemsToUse = fashionData.length > 0 ? fashionData : data;
        const mapped = itemsToUse.map((item) => ({
          ...item,
          name: item.name || item.title,
          category: item.category || item.category_name || 'Fashion',
          brand: item.brand || item.brand_name || 'BuyZo',
          image: getProductImage(item.name || item.title, item.image || item.primary_image),
          price: Number(item.price || item.current_price || item.base_price || 0),
          originalPrice: Number(item.originalPrice || item.original_price || item.base_price || (item.price * 1.3)),
          rating: Number(item.rating || item.average_rating || 4.5),
          reviews: Number(item.reviews || item.review_count || 120),
          popularity: Number(item.popularity || item.review_count || 90),
          sizes: item.sizes || ['S', 'M', 'L', 'XL']
        }));
        setProductsList(mapped);
      }
    });
  }, []);

  // Toggle brand
  const handleToggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Toggle size
  const handleToggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        if (activeCategory !== 'All' && p.category !== activeCategory) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (selectedSizes.length > 0 && (!p.sizes || !p.sizes.some((sz) => selectedSizes.includes(sz)))) return false;
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
  }, [productsList, activeCategory, selectedBrands, selectedSizes, maxPrice, minRating, sortBy]);

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      selectedColor: product.colors?.[0] || 'Default',
      selectedSize: product.sizes?.[0] || 'M',
      quantity: 1
    });
    setToastMessage(`Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    const wasWish = isWishlisted(product.id);
    toggleWishlist(product);
    setToastMessage(wasWish ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to your wishlist!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProductClick = (product) => {
    navigateTo('product-detail', {
      ...product,
      soldCount: '1.2k+ sold',
      features: [
        '100% Premium Fabric & Finish',
        'Machine Washable & Shrink Resistant',
        'Tailored Modern Ergonomic Fit',
        '7-Day Easy Exchange & Returns Policy'
      ]
    });
  };

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedBrands([]);
    setSelectedSizes([]);
    setMaxPrice(10000);
    setMinRating(0);
    setSortBy('popularity');
  };

  return (
    <div className="bg-white min-h-screen pb-16 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-800 text-white px-5 py-3.5 rounded-xl shadow-2xl font-medium text-sm z-50 flex items-center space-x-3 border border-emerald-500/30 animate-bounce">
          <div className="bg-emerald-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e6f4f0] via-[#edf7f4] to-[#fceee8] text-gray-900 border border-emerald-900/10 shadow-soft">
          {/* Subtle decorative glow elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-glow"></div>
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-6 right-1/4 text-gold/60 animate-sparkle pointer-events-none text-sm">✦</div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-end p-6 sm:p-9 lg:p-10 pb-0 sm:pb-0 lg:pb-0 gap-6">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 pb-6 sm:pb-8 lg:pb-10">
              <div className="inline-flex items-center space-x-2 bg-brand-800/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-brand-800 border border-brand-800/15 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-spin-slow" />
                <span>Summer 2026 Collection — Live Now</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-black tracking-tight leading-[1.12] text-brand-900">
                Redefine Your Everyday Style with <span className="text-accent">BuyZo Fashion</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 max-w-lg font-medium leading-relaxed">
                Discover trending apparel, designer handbags, handcrafted ethnic wear, and comfort footwear with up to <span className="text-brand-900 font-extrabold underline decoration-accent decoration-2">70% OFF</span> top tier global brands.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-0.5 text-xs text-gray-700 font-semibold">
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-xl border border-gray-200/50">
                  <Tag className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Up to 70% Off Deals</span>
                </div>

                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-xl border border-gray-200/50">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>7-Day Easy Returns</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setActiveCategory("Women's Wear");
                    window.scrollTo({ top: 480, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md hover:shadow-orange-500/30 flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Shop Women</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setActiveCategory("Men's Wear");
                    window.scrollTo({ top: 480, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-white hover:bg-brand-50 text-brand-900 text-xs sm:text-sm font-extrabold rounded-xl border border-brand-800/20 transition-all shadow-soft backdrop-blur-md cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Shop Men</span>
                </button>
              </div>
            </div>

            {/* Right Banner Image */}
            <div className="lg:col-span-6 flex justify-center items-end self-end">
              <div className="relative w-full max-w-sm lg:max-w-md group flex flex-col items-center justify-end">
                {/* Ambient glow behind models */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-emerald-400/20 to-gold/20 rounded-full filter blur-2xl transform group-hover:scale-110 transition-all duration-700 pointer-events-none"></div>

                <img
                  src={fashionHeroImg}
                  alt="Fashion trends"
                  className="relative z-10 w-full h-auto max-h-[320px] sm:max-h-[360px] lg:max-h-[380px] object-contain object-bottom drop-shadow-[0_16px_28px_rgba(3,32,26,0.2)] transition-transform duration-500 group-hover:scale-[1.02] translate-y-1 sm:translate-y-2"
                />

                {/* Upgraded Premium Floating Badge */}
                <div className="absolute bottom-3 left-2 sm:bottom-4 sm:left-3 bg-white/95 backdrop-blur-xl text-gray-900 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-lift border border-white/60 z-20 flex items-center space-x-2.5 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                    <Flame className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Bestselling Brand</span>
                      <span className="bg-accent/10 text-accent text-[8px] font-black px-1.5 py-0.2 rounded">TOP RATED</span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-brand-900 tracking-tight">
                      Biba &amp; Zara <span className="text-accent">Flat 50% OFF</span>
                    </div>
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
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-gray-900">Explore Fashion Collections</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Showing {filteredProducts.length} Items</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-3 scrollbar-thin select-none">
          {fashionCategories.map((cat) => {
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

      {/* Main Content Area: Filter Sidebar + Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-gray-200 mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center space-x-2 text-xs font-bold text-brand-800 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span>Filters & Refinements</span>
            {(selectedBrands.length > 0 || selectedSizes.length > 0 || minRating > 0) && (
              <span className="w-2 h-2 rounded-full bg-accent"></span>
            )}
          </button>
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 outline-none cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filter Sidebar */}
          <div
            className={`lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-6 lg:sticky lg:top-6 self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scrollbar-none ${showMobileFilters ? 'block' : 'hidden lg:block'
              }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <span className="font-bold text-sm text-gray-900">Filters</span>
              </div>
              {(selectedBrands.length > 0 || selectedSizes.length > 0 || minRating > 0 || activeCategory !== 'All' || maxPrice < 10000) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Brands</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {brandFilters.map((brand) => {
                  const isChecked = selectedBrands.includes(brand.name);
                  return (
                    <label
                      key={brand.name}
                      onClick={() => handleToggleBrand(brand.name)}
                      className="flex items-center justify-between text-xs text-gray-700 hover:text-black cursor-pointer select-none py-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isChecked
                            ? 'bg-brand-800 border-brand-800 text-white'
                            : 'border-gray-300 bg-white'
                            }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={isChecked ? 'font-bold text-gray-900' : 'font-medium'}>
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">({brand.count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sizes</span>
              <div className="flex flex-wrap gap-2">
                {sizeFilters.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${isSelected
                        ? 'bg-brand-800 text-white border-brand-800'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                        }`}
                    >
                      {sz}
                    </button>
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
                max="10000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #063328 0%, #063328 ${Math.min(100, Math.max(0, ((maxPrice - 500) / (10000 - 500)) * 100))}%, #e2e8f0 ${Math.min(100, Math.max(0, ((maxPrice - 500) / (10000 - 500)) * 100))}%, #e2e8f0 100%)`
                }}
                className="w-full accent-[#063328] h-2 rounded-lg appearance-none cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>₹500</span>
                <span>₹10,000</span>
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
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${minRating === rt
                        ? 'bg-accent border-[#ff5100] text-white'
                        : 'border-gray-300 bg-white'
                        }`}
                    >
                      {minRating === rt && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex items-center space-x-1 text-amber-500 font-semibold">
                      <span>{rt}★ & Above</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Trust Perks */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Authentic Apparel</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Truck className="w-4 h-4 text-gray-500" />
                <span>Free shipping above ₹999</span>
              </div>
            </div>
          </div>

          {/* Product Grid / List Section */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Toolbar */}
            <div className="hidden lg:flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 text-xs text-gray-600 font-medium">
                <span>Showing</span>
                <span className="font-bold text-gray-900">{filteredProducts.length}</span>
                <span>fashion items</span>
                {activeCategory !== 'All' && (
                  <span className="bg-emerald-50 text-brand-800 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-200">
                    Category: {activeCategory}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort dropdown */}
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>

                {/* View toggles */}
                <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'grid'
                      ? 'bg-white text-brand-800 shadow-xs'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'list'
                      ? 'bg-white text-brand-800 shadow-xs'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Container */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-4">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No fashion items match your filter</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting or clearing your filters to view more products from our summer catalog.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-brand-800 text-white text-xs font-bold rounded-xl hover:bg-[#0b4d3c] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => {
                  const inWish = isWishlisted(product);
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                    >
                      {/* Image Container */}
                      <div className="relative bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                        {/* Discount Badge */}
                        <div className="absolute top-3 left-3 z-10 bg-accent text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {product.discount}
                        </div>

                        {/* Top Tag Badge if present */}
                        {product.badge && (
                          <div className="absolute top-3 right-12 z-10 bg-brand-800 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                            {product.badge}
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${inWish
                            ? 'bg-rose-50 text-rose-500 border border-rose-200'
                            : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white border border-gray-200/50'
                            }`}
                          title="Save to Wishlist"
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

                      {/* Product Details */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Brand & Category */}
                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                            <span className="uppercase tracking-wider text-emerald-700 font-bold">{product.brand}</span>
                            <span>{product.category}</span>
                          </div>

                          {/* Product Name */}
                          <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-brand-800 transition-colors leading-snug">
                            {product.name}
                          </h3>

                          {/* Rating & Reviews */}
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-200/60">
                              <span>{product.rating}</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-[11px] text-gray-400">({product.reviews} reviews)</span>
                          </div>

                          {/* Sizes Available */}
                          <div className="flex items-center space-x-1.5 mt-2.5 overflow-hidden">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Sizes:</span>
                            {product.sizes.slice(0, 4).map((sz, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-1.5 py-0.5 rounded"
                              >
                                {sz}
                              </span>
                            ))}
                            {product.sizes.length > 4 && (
                              <span className="text-[10px] text-gray-400">+{product.sizes.length - 4}</span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
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
              /* List View */
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const inWish = isProductInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-5 cursor-pointer relative"
                    >
                      {/* Image */}
                      <div className="relative w-full sm:w-44 h-44 shrink-0 bg-gray-50 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                        <div className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                          {product.discount}
                        </div>
                        <img
                          src={getProductImage(product.name || product.title, product.image || product.primary_image)}
                          alt={product.name || product.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProductImage(product.name || product.title, '');
                          }}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Content */}
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
                          <span className="text-xs text-gray-300">•</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-[11px] text-gray-400">Sizes:</span>
                            <span className="text-xs font-semibold text-gray-700">{product.sizes.join(', ')}</span>
                          </div>
                        </div>

                        {/* Price & Add to Cart button */}
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

      {/* Featured Style Perks Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-brand-800 rounded-2xl shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">100% Genuine Apparel</h4>
              <p className="text-xs text-gray-500 mt-1">
                Directly sourced from certified brand partners and verified designer distributors.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-orange-50 text-accent rounded-2xl shrink-0">
              <RotateCcw className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Hassle-Free 7 Day Returns</h4>
              <p className="text-xs text-gray-500 mt-1">
                Instant doorstep pickup and swift size exchange with zero questions asked.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl shrink-0">
              <Truck className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Free Express Delivery</h4>
              <p className="text-xs text-gray-500 mt-1">
                Complimentary tracked priority shipping on all fashion orders above ₹999.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



