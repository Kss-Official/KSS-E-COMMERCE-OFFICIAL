import StripBanner from '../features/festive/components/StripBanner';
import React, { useState, useMemo, useEffect } from 'react';
import { Heart, LayoutGrid, List, ChevronRight, Star, ChevronDown, Check } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { fetchProducts } from '../services/api';
import { getProductImage } from '../utils/productAssets';

// Import images
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';
import dellLaptopImg from '../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import appleIphone15Img from '../assets/images/apple_iphone15.jpg';
import samsungS23Img from '../assets/images/samsung_s23.png';
import boatAirdopesImg from '../assets/images/boat_airdopes.png';
import sonySoundbarImg from '../assets/images/sony_soundbar.png';
import jblWaveTwsImg from '../assets/images/jbl_wave_tws.png';
import appleMacbookImg from '../assets/images/apple_macbook.png';

const initialProducts = [
  {
    id: 'elec-1',
    name: 'boAt Rockerz 450',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 3999,
    discount: '56% OFF',
    rating: 4.5,
    reviews: 1240,
    brand: 'boAt',
    category: 'Headphones',
    popularity: 98
  },
  {
    id: 'elec-2',
    name: 'Noise ColorFit Pro 5',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    rating: 4.3,
    reviews: 890,
    brand: 'Noise',
    category: 'Smartwatches',
    popularity: 92
  },
  {
    id: 'elec-3',
    name: 'Sony WH-CH510',
    image: sonyHeadphonesImg,
    price: 2499,
    originalPrice: 3999,
    discount: '37% OFF',
    rating: 4.4,
    reviews: 1540,
    brand: 'Sony',
    category: 'Headphones',
    popularity: 95
  },
  {
    id: 'elec-4',
    name: 'JBL Flip Essential 2',
    image: jblSpeakerImg,
    price: 4499,
    originalPrice: 6999,
    discount: '35% OFF',
    rating: 4.5,
    reviews: 2100,
    brand: 'JBL',
    category: 'Speakers',
    popularity: 90
  },
  {
    id: 'elec-5',
    name: 'Dell Inspiron 15',
    image: dellLaptopImg,
    price: 54990,
    originalPrice: 65990,
    discount: '17% OFF',
    rating: 4.3,
    reviews: 430,
    brand: 'Dell',
    category: 'Laptops',
    popularity: 88
  },
  {
    id: 'elec-6',
    name: 'HP 15s Laptop',
    image: hpLaptopImg,
    price: 42990,
    originalPrice: 55000,
    discount: '22% OFF',
    rating: 4.3,
    reviews: 620,
    brand: 'HP',
    category: 'Laptops',
    popularity: 89
  },
  {
    id: 'elec-7',
    name: 'Samsung Galaxy S23 5G',
    image: samsungS23Img,
    price: 64999,
    originalPrice: 89999,
    discount: '27% OFF',
    rating: 4.6,
    reviews: 3400,
    brand: 'Samsung',
    category: 'Mobiles',
    popularity: 99
  },
  {
    id: 'elec-8',
    name: 'Apple iPhone 15 (128 GB)',
    image: appleIphone15Img,
    price: 71990,
    originalPrice: 79900,
    discount: '10% OFF',
    rating: 4.7,
    reviews: 5120,
    brand: 'Apple',
    category: 'Mobiles',
    popularity: 100
  },
  {
    id: 'elec-9',
    name: 'boAt Airdopes 141',
    image: boatAirdopesImg,
    price: 1299,
    originalPrice: 4490,
    discount: '71% OFF',
    rating: 4.2,
    reviews: 8900,
    brand: 'boAt',
    category: 'Headphones',
    popularity: 94
  },
  {
    id: 'elec-10',
    name: 'Sony HT-S20R Soundbar',
    image: sonySoundbarImg,
    price: 17990,
    originalPrice: 23990,
    discount: '25% OFF',
    rating: 4.5,
    reviews: 1120,
    brand: 'Sony',
    category: 'Speakers',
    popularity: 87
  },
  {
    id: 'elec-11',
    name: 'JBL Wave 200 TWS',
    image: jblWaveTwsImg,
    price: 2799,
    originalPrice: 5999,
    discount: '53% OFF',
    rating: 4.1,
    reviews: 780,
    brand: 'JBL',
    category: 'Headphones',
    popularity: 83
  },
  {
    id: 'elec-12',
    name: 'Apple MacBook Air M2',
    image: appleMacbookImg,
    price: 92900,
    originalPrice: 114900,
    discount: '19% OFF',
    rating: 4.8,
    reviews: 1950,
    brand: 'Apple',
    category: 'Laptops',
    popularity: 97
  }
];

const categoryList = [
  'Mobiles',
  'Laptops',
  'Headphones',
  'Smartwatches',
  'Cameras',
  'Speakers',
  'Accessories'
];

export default function ElectronicsPage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const [productsList, setProductsList] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [addedToast, setAddedToast] = useState(null);

  const brandList = useMemo(() => {
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
        const elecData = data.filter(p => ['Electronics', 'Mobiles', 'Laptops', 'Headphones', 'Smartwatches', 'Speakers'].includes(p.category));
        if (elecData.length > 0) {
          const uniqueItems = [];
          const seenImages = new Set();
          for (const item of elecData) {
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
          setProductsList(uniqueItems.length > 0 ? uniqueItems : initialProducts);
        }
      }
    });
  }, []);

  // Toggle brand selection
  const handleBrandChange = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        if (selectedCategory && p.category !== selectedCategory) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (p.price > maxPrice) return false;
        if (selectedRating > 0 && p.rating < selectedRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'lowToHigh') return a.price - b.price;
        if (sortBy === 'highToLow') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.popularity || 90) - (a.popularity || 90);
      });
  }, [productsList, selectedCategory, selectedBrands, maxPrice, selectedRating, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleToggleWishlist = (product) => {
    const wasWish = isWishlisted(product.id);
    toggleWishlist(product);
    setAddedToast(wasWish ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 font-sans text-gray-800 relative">

      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-brand-700 text-white px-5 py-3 rounded-lg shadow-xl font-medium text-sm z-50 flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-4">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-brand-700 transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">Electronics</span>
      </nav>

      {/* Page Title & Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Electronics</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Showing 1-{filteredProducts.length} of 120 products
          </p>
        </div>

        {/* Sorting & Layout Toggle Controls */}
        <div className="flex items-center space-x-4 self-end sm:self-auto">
          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-gray-700">Sort By</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-800 outline-none cursor-pointer focus:border-brand-700 shadow-xs"
              >
                <option value="popularity">Popularity</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Grid & List Icons */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1 bg-white shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-50 text-brand-700 border border-emerald-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-50 text-brand-700 border border-emerald-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Categories Card */}
          <div className="bg-cream border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Categories
            </h3>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              {categoryList.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() =>
                      setSelectedCategory((prev) => (prev === cat ? null : cat))
                    }
                    className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-brand-700 text-white font-bold'
                        : 'hover:bg-gray-200/60 hover:text-gray-900'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filters Card */}
          <div className="bg-cream border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
              Filters
            </h3>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-800 mb-2">
                <span>Price Range</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 font-medium mb-1.5">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0d5c46] cursor-pointer"
              />
            </div>

            {/* Brand */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2.5">Brand</h4>
              <div className="space-y-2 text-xs font-medium text-gray-700">
                {brandList.map((b) => (
                  <label
                    key={b.name}
                    className="flex items-center space-x-2.5 cursor-pointer hover:text-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.name)}
                      onChange={() => handleBrandChange(b.name)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-brand-700 focus:ring-[#0d5c46] cursor-pointer"
                    />
                    <span>
                      {b.name} <span className="text-gray-400 font-normal">({b.count})</span>
                    </span>
                  </label>
                ))}
              </div>
              <button className="text-xs text-brand-700 font-bold mt-2 hover:underline inline-flex items-center">
                More <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2.5">Rating</h4>
              <div className="space-y-1.5">
                {[5, 4, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRating((prev) => (prev === r ? 0 : r))}
                    className={`flex items-center space-x-1.5 text-xs w-full py-1 px-2 rounded-md transition-colors ${
                      selectedRating === r
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                        : 'hover:bg-gray-200/50 text-gray-700'
                    }`}
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 fill-current ${
                            idx < r ? 'text-amber-400' : 'text-gray-300 fill-none'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-[11px] text-gray-600">&amp; up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters button */}
            {(selectedCategory || selectedBrands.length > 0 || maxPrice < 100000 || selectedRating > 0) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrands([]);
                  setMaxPrice(100000);
                  setSelectedRating(0);
                }}
                className="w-full py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
              <p className="text-lg font-bold text-gray-700">No products match your filters.</p>
              <p className="text-xs mt-1">Try adjusting your price range or brand filters.</p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigateTo('product-detail', product)}
                  className={`bg-white border border-gray-200/90 hover:border-brand-700 rounded-2xl p-4 flex cursor-pointer ${
                    viewMode === 'grid'
                      ? 'flex-col justify-between'
                      : 'flex-row items-center space-x-6'
                  } hover:shadow-lg transition-all duration-200 relative group`}
                >
                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(product);
                    }}
                    className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-gray-100 hover:bg-emerald-50 transition-colors shadow-2xs"
                    title="Add to Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isWishlisted(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-brand-700 hover:text-red-500'
                      }`}
                    />
                  </button>

                  {/* Image Container */}
                  <div
                    className={`${
                      viewMode === 'grid'
                        ? 'h-48 w-full'
                        : 'h-32 w-32 shrink-0'
                    } bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden`}
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

                  {/* Product Details */}
                  <div className={viewMode === 'grid' ? 'mt-3 flex-1 flex flex-col justify-between' : 'flex-1'}>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug hover:text-brand-700 transition-colors cursor-pointer line-clamp-1">
                        {product.name}
                      </h3>

                      {/* Pricing Block */}
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        {product.discount && (
                          <span className="text-xs font-bold text-accent">
                            {product.discount}
                          </span>
                        )}
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center space-x-1.5 mt-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 fill-current ${
                                i < Math.floor(product.rating)
                                  ? 'text-amber-400'
                                  : 'text-gray-200 fill-none'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          ({product.rating})
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full mt-3 py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5"
                    >
                      <span>Add to Cart</span>
                    </button>
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



