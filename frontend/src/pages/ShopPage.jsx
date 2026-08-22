import React, { useState, useMemo } from 'react';
import {
  Heart,
  LayoutGrid,
  List,
  ChevronRight,
  Filter,
  ChevronDown,
  Check,
  ShieldCheck,
  RotateCcw,
  Tag,
  Award
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import assets
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';
import dellLaptopImg from '../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import roadsterShirtImg from '../assets/images/roadster_shirt.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';
import accentChairImg from '../assets/images/accent_chair.jpg';

// Category SVGs
import mobileCategorySvg from '../assets/category/categoryMobile.svg';
import laptopCategorySvg from '../assets/category/categoryLaptop.svg';
import electronicsCategorySvg from '../assets/category/categoryElectronics.svg';
import fashionCategorySvg from '../assets/category/categoryFashion.svg';
import homeCategorySvg from '../assets/category/CategoryHome & kitchen.svg';
import beautyCategorySvg from '../assets/category/categoryBeauty.svg';
import shoesCategorySvg from '../assets/category/categoryShoes.svg';
import bagsCategorySvg from '../assets/category/categoryBags & luddages.svg';

// Hero illustration
import shopBannerHeroImg from '../assets/images/shop_banner_hero.jpg';

const categoriesList = [
  { id: 'Mobiles', name: 'Mobiles', icon: mobileCategorySvg },
  { id: 'Laptops', name: 'Laptops', icon: laptopCategorySvg },
  { id: 'Electronics', name: 'Electronics', icon: electronicsCategorySvg },
  { id: 'Fashion', name: 'Fashion', icon: fashionCategorySvg },
  { id: 'Home & Kitchen', name: 'Home & Kitchen', icon: homeCategorySvg },
  { id: 'Beauty', name: 'Beauty', icon: beautyCategorySvg },
  { id: 'Footwear', name: 'Footwear', icon: shoesCategorySvg },
  { id: 'Bags & Luggage', name: 'Bags & Luggage', icon: bagsCategorySvg }
];

const initialShopProducts = [
  {
    id: 'shop-1',
    name: 'Redmi Note 13 Pro',
    category: 'Mobiles',
    image: mobileCategorySvg,
    price: 16999,
    originalPrice: 21999,
    discount: '23% OFF',
    rating: 4.5,
    popularity: 99
  },
  {
    id: 'shop-2',
    name: 'HP 15s Laptop',
    category: 'Laptops',
    image: hpLaptopImg,
    price: 34990,
    originalPrice: 45999,
    discount: '24% OFF',
    rating: 4.4,
    popularity: 96
  },
  {
    id: 'shop-3',
    name: 'boAt Rockerz 450',
    category: 'Electronics',
    image: boatRockerzImg,
    price: 1399,
    originalPrice: 2499,
    discount: '44% OFF',
    rating: 4.6,
    popularity: 98
  },
  {
    id: 'shop-4',
    name: "Women's Dress",
    category: 'Fashion',
    image: fashionCategorySvg,
    price: 799,
    originalPrice: 1299,
    discount: '38% OFF',
    rating: 4.3,
    popularity: 91
  },
  {
    id: 'shop-5',
    name: 'Modern Sofa Chair',
    category: 'Home & Kitchen',
    image: accentChairImg,
    price: 6999,
    originalPrice: 9999,
    discount: '30% OFF',
    rating: 4.7,
    popularity: 94
  },
  {
    id: 'shop-6',
    name: 'Skincare Combo',
    category: 'Beauty',
    image: beautyCategorySvg,
    price: 899,
    originalPrice: 1499,
    discount: '40% OFF',
    rating: 4.5,
    popularity: 93
  },
  {
    id: 'shop-7',
    name: 'Sports Running Shoes',
    category: 'Footwear',
    image: shoesCategorySvg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    rating: 4.4,
    popularity: 88
  },
  {
    id: 'shop-8',
    name: 'Teal Casual Backpack',
    category: 'Bags & Luggage',
    image: tealBackpackImg,
    price: 1199,
    originalPrice: 2499,
    discount: '52% OFF',
    rating: 4.5,
    popularity: 90
  },
  {
    id: 'shop-9',
    name: "Men's Analog Watch",
    category: 'Fashion',
    image: noiseSmartwatchImg,
    price: 2199,
    originalPrice: 3999,
    discount: '45% OFF',
    rating: 4.3,
    popularity: 87
  },
  {
    id: 'shop-10',
    name: 'Indoor Potted Plant',
    category: 'Home & Kitchen',
    image: homeCategorySvg,
    price: 499,
    originalPrice: 899,
    discount: '44% OFF',
    rating: 4.6,
    popularity: 85
  },
  {
    id: 'shop-11',
    name: 'Digital Air Fryer 4.2L',
    category: 'Home & Kitchen',
    image: homeCategorySvg,
    price: 4499,
    originalPrice: 7999,
    discount: '43% OFF',
    rating: 4.5,
    popularity: 89
  },
  {
    id: 'shop-12',
    name: 'Stainless Electric Kettle',
    category: 'Home & Kitchen',
    image: homeCategorySvg,
    price: 999,
    originalPrice: 1899,
    discount: '47% OFF',
    rating: 4.4,
    popularity: 92
  },
  {
    id: 'shop-13',
    name: 'Sony WH-CH510 Headphones',
    category: 'Electronics',
    image: sonyHeadphonesImg,
    price: 2499,
    originalPrice: 3999,
    discount: '37% OFF',
    rating: 4.5,
    popularity: 95
  },
  {
    id: 'shop-14',
    name: 'Dell Inspiron 15',
    category: 'Laptops',
    image: dellLaptopImg,
    price: 54990,
    originalPrice: 65990,
    discount: '17% OFF',
    rating: 4.3,
    popularity: 86
  },
  {
    id: 'shop-15',
    name: 'JBL Flip Essential 2',
    category: 'Electronics',
    image: jblSpeakerImg,
    price: 4499,
    originalPrice: 6999,
    discount: '35% OFF',
    rating: 4.6,
    popularity: 91
  },
  {
    id: 'shop-16',
    name: 'Cotton Casual Shirt',
    category: 'Fashion',
    image: roadsterShirtImg,
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    rating: 4.2,
    popularity: 84
  }
];

export default function ShopPage() {
  const { navigateTo } = useNavigationContext();
  const { toggleWishlist, wishlistItems, addToCart } = useCartContext();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('popularity');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...initialShopProducts];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === 'popularity') {
      result.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, sortBy]);

  const isWishlisted = (id) => {
    return wishlistItems?.some((item) => item.id === id);
  };

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen pb-16">


      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar - Categories */}
          <aside className="w-full lg:w-64 bg-white rounded-2xl p-5 shadow-xs border border-gray-100 shrink-0">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">Categories</h2>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs font-bold text-[#ff5100] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#063328] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#063328]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>All Products</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedCategory === 'All' ? 'text-white' : 'text-gray-400'}`} />
              </button>

              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#063328] text-white shadow-xs font-bold'
                        : 'text-gray-700 hover:bg-emerald-50/60 hover:text-[#063328]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className={`w-5 h-5 object-contain ${isActive ? 'brightness-200' : 'opacity-80'}`}
                      />
                      <span>{cat.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#ff5100]' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Area - Header Controls + Product Grid */}
          <main className="flex-1 w-full">
            {/* Header Control Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
              {/* Left View Switcher & Counter */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#063328] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-[#063328] shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Showing <span className="font-bold text-gray-900">1-{filteredProducts.length}</span> of{' '}
                  <span className="font-bold text-gray-900">2560 products</span>
                </span>
              </div>

              {/* Right Sort & Filter Buttons */}
              <div className="flex items-center space-x-3 ml-auto">
                {/* Sort Dropdown */}
                <div className="relative flex items-center">
                  <span className="text-xs font-semibold text-gray-500 mr-2 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 pr-8 cursor-pointer outline-none focus:border-[#063328]"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 pointer-events-none" />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
                  className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>Filter</span>
                  <Filter className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Items Display */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
                <p className="text-gray-500 text-base font-medium">No products found in this category.</p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 bg-[#063328] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#084839] transition-colors"
                >
                  View All Products
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredProducts.map((product) => {
                  const activeWish = isWishlisted(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="bg-white rounded-2xl border border-gray-100 p-3 relative flex flex-col justify-between hover:shadow-md transition-all duration-200 group cursor-pointer"
                    >
                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-all ${
                          activeWish
                            ? 'bg-rose-50 text-rose-500 shadow-xs'
                            : 'bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${activeWish ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                      </button>

                      {/* Product Image */}
                      <div className="w-full h-32 sm:h-36 flex items-center justify-center mb-3 bg-gray-50/50 rounded-xl overflow-hidden p-2 group-hover:bg-gray-50 transition-colors">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Details */}
                      <div>
                        {/* Category Name */}
                        <span className="text-[11px] font-semibold text-gray-400 block mb-0.5 leading-tight">
                          {product.category}
                        </span>

                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate mb-1.5 leading-tight group-hover:text-[#063328] transition-colors">
                          {product.name}
                        </h3>

                        {/* Price Block */}
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                          <span className="text-xs sm:text-sm font-black text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {product.discount && (
                            <span className="text-[10px] sm:text-xs font-bold text-[#ff5100]">
                              {product.discount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const activeWish = isWishlisted(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400">{product.category}</span>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#063328]">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm sm:text-base font-black text-gray-900">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            {product.discount && (
                              <span className="text-xs font-bold text-[#ff5100]">
                                {product.discount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className="p-2 rounded-full border border-gray-200 hover:bg-rose-50 hover:border-rose-200 text-gray-400 hover:text-rose-500"
                        >
                          <Heart className={`w-5 h-5 ${activeWish ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="bg-[#063328] hover:bg-[#084839] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
