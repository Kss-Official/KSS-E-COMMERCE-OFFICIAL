import CTAPane from '../features/festive/components/CTAPane';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  LayoutGrid,
  List,
  ChevronRight,
  Star,
  ShoppingBag,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Award,
  Filter,
  Crown
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';
import { fetchProducts } from '../services/api';
import CartButton from '../components/ui/CartButton';

// Import assets
import bestSellersHeroImg from '../assets/images/bestsellers_hero.png';
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import redmiNote13Img from '../assets/images/redmi_note13.jpg';
import womenDressImg from '../assets/images/women_dress.jpg';
import bibaKurtaImg from '../assets/images/biba_kurta.jpg';
import dellLaptopImg from '../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import pumaShoesImg from '../assets/images/puma_shoes.jpg';
import lavieHandbagImg from '../assets/images/lavie_handbag.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';
import fashionDenimJacketImg from '../assets/images/fashion_denim_jacket.jpg';
import fashionStreetSneakersImg from '../assets/images/fashion_street_sneakers.jpg';

// Category SVGs
import mobileCategorySvg from '../assets/category/categoryMobile.svg';
import laptopCategorySvg from '../assets/category/categoryLaptop.svg';
import electronicsCategorySvg from '../assets/category/categoryElectronics.svg';
import fashionCategorySvg from '../assets/category/categoryFashion.svg';
import homeCategorySvg from '../assets/category/CategoryHome & kitchen.svg';
import beautyCategorySvg from '../assets/category/categoryBeauty.svg';
import shoesCategorySvg from '../assets/category/categoryShoes.svg';
import bagsCategorySvg from '../assets/category/categoryBags & luddages.svg';

const bestSellerCategories = [
  { id: 'All', name: 'All Best Sellers', icon: electronicsCategorySvg, count: 140 },
  { id: 'Electronics', name: 'Electronics & Audio', icon: electronicsCategorySvg, count: 42 },
  { id: 'Mobiles', name: 'Mobiles & Tabs', icon: mobileCategorySvg, count: 35 },
  { id: 'Fashion', name: 'Fashion & Apparel', icon: fashionCategorySvg, count: 38 },
  { id: 'Laptops', name: 'Laptops & Computers', icon: laptopCategorySvg, count: 24 },
  { id: 'Footwear', name: 'Footwear & Shoes', icon: shoesCategorySvg, count: 28 },
  { id: 'Bags', name: 'Bags & Handbags', icon: bagsCategorySvg, count: 19 }
];

const bestSellerProducts = [
  {
    id: 'bs-1',
    rank: 1,
    name: 'boAt Rockerz 450 Wireless Bluetooth On-Ear Headphone',
    brand: 'boAt',
    category: 'Electronics',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 3999,
    discount: '62% OFF',
    rating: 4.8,
    reviews: 14820,
    soldCount: '45k+ bought this month',
    badge: '#1 BEST SELLER',
    badgeColor: 'bg-amber-500',
    popularity: 100,
    description: 'High definition audio with up to 15 hours battery backup and plush ear cushions.'
  },
  {
    id: 'bs-2',
    rank: 2,
    name: 'Redmi Note 13 Pro 5G (8GB RAM, 128GB Storage)',
    brand: 'Xiaomi',
    category: 'Mobiles',
    image: redmiNote13Img,
    price: 18999,
    originalPrice: 24999,
    discount: '24% OFF',
    rating: 4.7,
    reviews: 9400,
    soldCount: '30k+ bought this month',
    badge: '#2 BEST SELLER',
    badgeColor: 'bg-amber-500',
    popularity: 98,
    description: '200MP OIS camera with 120Hz curved AMOLED display and 67W Turbo Charge.'
  },
  {
    id: 'bs-3',
    rank: 3,
    name: "Women's Floral Fit & Flare Casual Summer Dress",
    brand: 'Zara',
    category: 'Fashion',
    image: womenDressImg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    rating: 4.6,
    reviews: 5820,
    soldCount: '18k+ bought this month',
    badge: '#3 BEST SELLER',
    badgeColor: 'bg-amber-500',
    popularity: 96,
    description: 'Flowy A-line breathable cotton silhouette with elegant sweetheart neckline.'
  },
  {
    id: 'bs-4',
    rank: 4,
    name: 'Noise ColorFit Pro 5 Smartwatch with 1.85" HD Display',
    brand: 'Noise',
    category: 'Electronics',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    rating: 4.6,
    reviews: 7300,
    soldCount: '22k+ bought this month',
    badge: 'TOP RATED',
    badgeColor: 'bg-emerald-600',
    popularity: 95,
    description: 'Bluetooth calling, 100+ sports modes, stainless steel crown and 7-day battery.'
  },
  {
    id: 'bs-5',
    rank: 5,
    name: 'HP 15s 12th Gen Intel Core i5 Thin & Light Laptop',
    brand: 'HP',
    category: 'Laptops',
    image: hpLaptopImg,
    price: 44990,
    originalPrice: 58900,
    discount: '23% OFF',
    rating: 4.5,
    reviews: 3200,
    soldCount: '8k+ bought this month',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-accent',
    popularity: 93,
    description: '16GB DDR4, 512GB NVMe SSD, 15.6 inch FHD anti-glare micro-edge display.'
  },
  {
    id: 'bs-6',
    rank: 6,
    name: "Women's Printed Anarkali Kurta Set with Dupatta",
    brand: 'Biba',
    category: 'Fashion',
    image: bibaKurtaImg,
    price: 2499,
    originalPrice: 4999,
    discount: '50% OFF',
    rating: 4.7,
    reviews: 4100,
    soldCount: '12k+ bought this month',
    badge: 'FESTIVE HIT',
    badgeColor: 'bg-rose-600',
    popularity: 94,
    description: 'Handcrafted gold foil print royal Anarkali with silk blend finish.'
  },
  {
    id: 'bs-7',
    rank: 7,
    name: 'Unisex Flyer Flex Training & Gym Running Shoes',
    brand: 'Puma',
    category: 'Footwear',
    image: pumaShoesImg,
    price: 2799,
    originalPrice: 4999,
    discount: '44% OFF',
    rating: 4.6,
    reviews: 6900,
    soldCount: '15k+ bought this month',
    badge: 'TOP PICK',
    badgeColor: 'bg-emerald-600',
    popularity: 92,
    description: 'SoftFoam+ cushioning with rugged traction outsole for supreme athletic comfort.'
  },
  {
    id: 'bs-8',
    rank: 8,
    name: "Women's Structured Handbag with Detachable Sling",
    brand: 'Lavie',
    category: 'Bags',
    image: lavieHandbagImg,
    price: 1899,
    originalPrice: 3990,
    discount: '52% OFF',
    rating: 4.5,
    reviews: 2900,
    soldCount: '11k+ bought this month',
    badge: 'TRENDING',
    badgeColor: 'bg-purple-600',
    popularity: 90,
    description: 'Premium textured faux-leather bag with dual handles and secure zip compartments.'
  },
  {
    id: 'bs-9',
    rank: 9,
    name: "Men's Classic Stonewashed Heavy Denim Jacket",
    brand: "Levi's",
    category: 'Fashion',
    image: fashionDenimJacketImg,
    price: 3499,
    originalPrice: 6499,
    discount: '46% OFF',
    rating: 4.8,
    reviews: 5200,
    soldCount: '9k+ bought this month',
    badge: 'ICONIC',
    badgeColor: 'bg-blue-600',
    popularity: 91,
    description: 'Authentic 100% durable cotton denim with vintage wash and button flap pockets.'
  },
  {
    id: 'bs-10',
    rank: 10,
    name: 'Dell Inspiron 15 Core i5 16GB RAM Laptop',
    brand: 'Dell',
    category: 'Laptops',
    image: dellLaptopImg,
    price: 54990,
    originalPrice: 68000,
    discount: '19% OFF',
    rating: 4.6,
    reviews: 2400,
    soldCount: '6k+ bought this month',
    badge: 'PRO PERFORMANCE',
    badgeColor: 'bg-indigo-600',
    popularity: 89,
    description: 'Intel Core i5-1235U, 16GB RAM, 512GB SSD, Windows 11 + MS Office 2021.'
  },
  {
    id: 'bs-11',
    rank: 11,
    name: 'Casual Streetwear Chunky Sole Sneakers',
    brand: 'Puma',
    category: 'Footwear',
    image: fashionStreetSneakersImg,
    price: 3299,
    originalPrice: 5999,
    discount: '45% OFF',
    rating: 4.6,
    reviews: 3100,
    soldCount: '7.5k+ bought this month',
    badge: 'HOT TREND',
    badgeColor: 'bg-accent',
    popularity: 88,
    description: 'Retro chunky street sneaker built with soft cushioned sole and durable leather panels.'
  },
  {
    id: 'bs-12',
    rank: 12,
    name: 'Urban Ergonomic Everyday Laptop Backpack 28L',
    brand: 'Wildcraft',
    category: 'Bags',
    image: tealBackpackImg,
    price: 1299,
    originalPrice: 2499,
    discount: '48% OFF',
    rating: 4.4,
    reviews: 4800,
    soldCount: '14k+ bought this month',
    badge: 'VALUE PICK',
    badgeColor: 'bg-teal-600',
    popularity: 87,
    description: 'Triple compartment water-resistant nylon backpack with padded back airflow mesh.'
  }
];

export default function BestSellersPage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const isProductInWishlist = (id) => isWishlisted(id);

  const [dbProducts, setDbProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'priceLow' | 'priceHigh' | 'rating'
  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts({ no_page: 'true' })
      .then((data) => {
        const rawList = Array.isArray(data) && data.length > 0 ? data : [];
        
        // Deduplicate database items by ID or full title
        const uniqueItems = [];
        const seen = new Set();
        for (const item of rawList) {
          const itemKey = item.id || String(item.title || item.name || '').trim().toLowerCase();
          if (itemKey && !seen.has(itemKey)) {
            seen.add(itemKey);
            uniqueItems.push(item);
          }
        }

        const mapped = uniqueItems.map((p, idx) => {
          const rawPrice = Number(p.current_price || p.price || p.base_price || 0);
          const origPrice = Number(p.original_price || p.originalPrice || p.base_price || (rawPrice > 0 ? Math.round(rawPrice * 1.25) : 0));
          const titleName = p.title || p.name || 'Product';
          
          let catName = 'General';
          if (typeof p.category === 'object' && p.category?.name) {
            catName = p.category.name;
          } else if (p.category_name) {
            catName = p.category_name;
          } else if (typeof p.category === 'string') {
            catName = p.category;
          }

          const disc = origPrice > rawPrice
            ? `${Math.round(((origPrice - rawPrice) / origPrice) * 100)}% OFF`
            : (p.discount_percentage ? `${Math.round(p.discount_percentage)}% OFF` : '15% OFF');

          const reviewsCount = Number(p.review_count || p.reviews || 0);
          const ratingVal = Number(p.average_rating || p.rating || 4.5).toFixed(1);

          return {
            id: p.id,
            rank: idx + 1,
            name: titleName,
            brand: (typeof p.brand === 'object' && p.brand?.name) ? p.brand.name : (p.brand || 'BuyZo Verified'),
            category: catName,
            image: getProductImage(titleName, p.primary_image || p.image),
            price: rawPrice,
            originalPrice: Math.round(origPrice),
            discount: disc,
            rating: parseFloat(ratingVal),
            reviews: reviewsCount,
            soldCount: reviewsCount > 0 ? `${reviewsCount}+ bought this month` : 'Top Seller',
            badge: idx < 3 ? `#${idx + 1} BEST SELLER` : idx < 7 ? 'TOP RATED' : 'MOST POPULAR',
            badgeColor: idx < 3 ? 'bg-amber-500' : idx < 7 ? 'bg-emerald-600' : 'bg-[#ff5100]',
            popularity: 100 - idx,
            description: p.description || `${titleName} with premium build quality and official brand warranty.`
          };
        });

        setDbProducts(mapped);
      })
      .catch((err) => {
        console.warn('Best sellers fetch failed:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Compute dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: dbProducts.length };
    dbProducts.forEach((p) => {
      const c = (p.category || 'General').toLowerCase();
      bestSellerCategories.forEach(cat => {
        if (cat.id === 'All') return;
        const target = cat.id.toLowerCase();
        if (c.includes(target) || target.includes(c)) {
          counts[cat.id] = (counts[cat.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    return dbProducts
      .filter((p) => {
        if (activeCategory !== 'All') {
          const prodCat = (p.category || '').toLowerCase();
          const activeCat = activeCategory.toLowerCase();
          if (!prodCat.includes(activeCat) && !activeCat.includes(prodCat)) {
            return false;
          }
        }
        if (p.price > maxPrice) return false;
        if (minRating > 0 && p.rating < minRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceLow') return a.price - b.price;
        if (sortBy === 'priceHigh') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.rank - b.rank;
      });
  }, [dbProducts, activeCategory, minRating, maxPrice, sortBy]);

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

      {/* Hero Banner with Warm Ivory/Cream Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fcf7ee] via-[#f7f0e3] to-[#efe4d2] border border-[#e5d8c3] text-[#1c231c] shadow-soft">
          {/* Subtle Warm Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-orange-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center py-8 sm:py-12 lg:py-14 px-6 sm:px-10 lg:px-12 gap-8">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md text-brand-900 border border-[#ddcfba] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Trophy className="w-3.5 h-3.5 text-gold" />
                <span>BuyZo Official Best Sellers 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold tracking-tight leading-[1.12] text-[#1a241b]">
                <span className="text-[#1a241b] block">Most Loved Products,</span>
                <span className="text-accent block font-sans font-black">Ranked by Customer Orders</span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 max-w-xl font-medium leading-relaxed">
                Explore our most popular and highest-rated products across Electronics, Mobiles, Fashion &amp; Appliances, updated hourly based on sales volume.
              </p>

              {/* Highlights pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center space-x-2 text-xs text-[#20291f] bg-white/85 backdrop-blur-sm rounded-xl p-2.5 border border-[#dfd2be] shadow-2xs font-semibold">
                  <Flame className="w-4 h-4 text-accent shrink-0" />
                  <span>100k+ Units Sold</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#20291f] bg-white/85 backdrop-blur-sm rounded-xl p-2.5 border border-[#dfd2be] shadow-2xs font-semibold">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>4.5+ Average Rating</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-[#20291f] bg-white/85 backdrop-blur-sm rounded-xl p-2.5 border border-[#dfd2be] shadow-2xs font-semibold col-span-2 sm:col-span-1">
                  <ShieldCheck className="w-4 h-4 text-brand-800 shrink-0" />
                  <span>100% Verified Quality</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-md group">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-gold/15 to-emerald-500/10 rounded-full filter blur-2xl transform group-hover:scale-105 transition-all duration-700 pointer-events-none"></div>
                <img
                  src={bestSellersHeroImg}
                  alt="Best Sellers Showcase"
                  className="relative z-10 w-full h-auto max-h-[300px] object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Browse Best Sellers by Department</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Showing {filteredProducts.length} Top Items</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-3 scrollbar-thin select-none">
          {bestSellerCategories.map((cat) => {
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
                  {categoryCounts[cat.id] || (cat.id === 'All' ? dbProducts.length : 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm gap-3 mb-6">
          <div className="flex items-center space-x-2 text-xs text-gray-600 font-medium">
            <span>Ranking for:</span>
            <span className="font-bold text-brand-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              {activeCategory === 'All' ? 'All Departments' : activeCategory}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="rank">Sales Rank (#1 first)</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white text-brand-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white text-brand-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                  }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid (4 cards in a row) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => {
              const inWish = isWishlisted(product);
              return (
                <div
                  key={product.id}
                  onClick={() => navigateTo('product-detail', product)}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
                >
                  {/* Image & Badges */}
                  <div className="relative bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                    {/* Rank Badge (#1, #2, #3...) */}
                    <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 bg-brand-800 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md border border-amber-400/30">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>#{product.rank}</span>
                    </div>

                    {/* Top Custom Badge */}
                    <div className={`absolute top-3 right-12 z-10 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs ${product.badgeColor || 'bg-accent'}`}>
                      {product.badge}
                    </div>

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

                  {/* Card Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                        <span className="uppercase tracking-wider text-emerald-700 font-bold">{product.brand}</span>
                        <span>{product.category}</span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-brand-800 transition-colors leading-snug">
                        {product.name}
                      </h3>

                      {/* Sales Count & Rating */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-200">
                          <span>{product.rating}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">{product.soldCount}</span>
                      </div>
                    </div>

                    {/* Price & Add to Cart */}
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
                        <span className="text-[10px] font-bold text-emerald-600">{product.discount}</span>
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
                  onClick={() => navigateTo('product-detail', product)}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-700 hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row items-center gap-5 cursor-pointer relative"
                >
                  <div className="relative w-full sm:w-44 h-44 shrink-0 bg-gray-50 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 bg-brand-800 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>#{product.rank}</span>
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
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">
                        <span>{product.rating}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-xs text-gray-400">({product.reviews.toLocaleString('en-IN')} reviews)</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs font-bold text-emerald-700">{product.soldCount}</span>
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
  );
}



