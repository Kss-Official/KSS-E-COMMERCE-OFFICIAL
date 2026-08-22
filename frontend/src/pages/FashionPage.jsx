import React, { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  ArrowRight,
  Check,
  Search,
  Sparkles,
  Tag,
  RotateCcw,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import assets
import fashionHeroImg from '../assets/images/fashion_hero.jpg';
import roadsterShirtImg from '../assets/images/roadster_shirt.jpg';

// Import SVG category assets
import fashionSvg from '../assets/category/categoryFashion.svg';
import shoesSvg from '../assets/category/categoryShoes.svg';
import bagsSvg from '../assets/category/categoryBags & luddages.svg';

const initialFashionProducts = [
  {
    id: 'fash-1',
    name: 'Roadster Men Checked Casual Shirt',
    image: roadsterShirtImg,
    price: 899,
    originalPrice: 1499,
    discount: '40% OFF',
    rating: 4.3,
    gender: 'Men',
    category: 'Top Wear',
    brand: 'Roadster'
  },
  {
    id: 'fash-2',
    name: 'Biba Women Floral Printed Kurta',
    image: roadsterShirtImg,
    price: 1299,
    originalPrice: 1999,
    discount: '35% OFF',
    rating: 4.5,
    gender: 'Women',
    category: 'Ethnic Wear',
    brand: 'Biba'
  },
  {
    id: 'fash-3',
    name: 'U.S. Polo Assn. Men Polo T-Shirt',
    image: roadsterShirtImg,
    price: 749,
    originalPrice: 1499,
    discount: '50% OFF',
    rating: 4.2,
    gender: 'Men',
    category: 'Top Wear',
    brand: 'U.S. Polo Assn.'
  },
  {
    id: 'fash-4',
    name: 'ONLY Women Fit & Flare Dress',
    image: roadsterShirtImg,
    price: 1399,
    originalPrice: 1999,
    discount: '30% OFF',
    rating: 4.4,
    gender: 'Women',
    category: 'Dresses',
    brand: 'ONLY'
  },
  {
    id: 'fash-5',
    name: 'Puma Men Running Shoes',
    image: roadsterShirtImg,
    price: 2999,
    originalPrice: 3999,
    discount: '25% OFF',
    rating: 4.3,
    gender: 'Men',
    category: 'Footwear',
    brand: 'Puma'
  },
  {
    id: 'fash-6',
    name: 'Lavie Women Solid Handbag',
    image: roadsterShirtImg,
    price: 1199,
    originalPrice: 1499,
    discount: '20% OFF',
    rating: 4.1,
    gender: 'Women',
    category: 'Bags',
    brand: 'Lavie'
  }
];

const subCategoryQuick = [
  { name: 'Men', count: '124 Items', svg: fashionSvg },
  { name: 'Women', count: '168 Items', svg: fashionSvg },
  { name: 'Kids', count: '42 Items', svg: fashionSvg },
  { name: 'Footwear', count: '86 Items', svg: shoesSvg },
  { name: 'Bags', count: '65 Items', svg: bagsSvg },
  { name: 'Watches', count: '28 Items', svg: fashionSvg }
];

const sideCategories = [
  { name: 'All Fashion', count: 356 },
  { name: 'Men', count: 124 },
  { name: 'Women', count: 168 },
  { name: 'Kids', count: 42 },
  { name: 'Footwear', count: 86 },
  { name: 'Bags & Accessories', count: 65 },
  { name: 'Watches', count: 28 }
];

export default function FashionPage() {
  const { addToCart, addToWishlist } = useCartContext();
  const { navigateTo } = useNavigationContext();

  const [selectedCategory, setSelectedCategory] = useState('All Fashion');
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [brandSearch, setBrandSearch] = useState('');
  const [addedToast, setAddedToast] = useState(null);
  const [wishlistActive, setWishlistActive] = useState({});

  const handleGenderChange = (gender) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleToggleWishlist = (e, product) => {
    e.stopPropagation();
    addToWishlist(product);
    setWishlistActive((prev) => ({ ...prev, [product.id]: !prev[product.id] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-[#0d5c46] text-white px-5 py-3 rounded-lg shadow-xl font-medium text-sm z-50 flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-5">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#0d5c46] transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">Fashion</span>
      </nav>

      {/* Page Title & Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fashion</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Trendy styles for every you. Explore the latest in fashion.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4 self-end sm:self-auto">
          <span className="text-xs font-medium text-gray-500">
            Showing 1-{initialFashionProducts.length} of 356 products
          </span>
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1 bg-white shadow-xs">
            <button className="p-1.5 rounded bg-emerald-50 text-[#0d5c46] border border-emerald-200">
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button className="p-1.5 rounded text-gray-500 hover:text-gray-800">
              <List className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
            <span>Sort By:</span>
            <select className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none font-bold text-gray-800 cursor-pointer">
              <option>Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar (3 cols) + Main Content (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Categories Card */}
          <div className="bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Categories
            </h3>
            <ul className="space-y-1.5 text-xs font-medium text-gray-700">
              {sideCategories.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setSelectedCategory(c.name)}
                    className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategory === c.name
                        ? 'bg-[#0d5c46] text-white font-bold'
                        : 'hover:bg-gray-200/60'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={
                        selectedCategory === c.name
                          ? 'text-emerald-200 font-semibold'
                          : 'text-gray-400 font-normal'
                      }
                    >
                      {c.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filter By Box */}
          <div className="bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-5">
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-2">
              Filter By
            </h3>

            {/* Gender Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Gender</h4>
              <div className="space-y-1.5 text-xs font-medium text-gray-700">
                {[
                  { label: 'Men', count: 124 },
                  { label: 'Women', count: 168 },
                  { label: 'Kids', count: 42 },
                  { label: 'Unisex', count: 22 }
                ].map((g) => (
                  <label key={g.label} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(g.label)}
                      onChange={() => handleGenderChange(g.label)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0d5c46] focus:ring-[#0d5c46]"
                    />
                    <span>
                      {g.label} <span className="text-gray-400 font-normal">({g.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-900 mb-2">
                <span>Category</span>
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="space-y-1.5 text-xs font-medium text-gray-700">
                {['Top Wear', 'Bottom Wear', 'Dresses', 'Ethnic Wear', 'Inner Wear'].map((cat) => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0d5c46]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
              <button className="text-[11px] text-[#0d5c46] font-bold mt-1.5 hover:underline">
                + View More
              </button>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Price Range</h4>
              <div className="flex justify-between text-[11px] text-gray-500 font-medium mb-1.5">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}+</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0d5c46] cursor-pointer"
              />
            </div>

            {/* Discount */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Discount</h4>
              <div className="space-y-1.5 text-xs font-medium text-gray-700">
                {[
                  { label: '10% and above', count: 98 },
                  { label: '20% and above', count: 76 },
                  { label: '30% and above', count: 48 },
                  { label: '50% and above', count: 22 }
                ].map((d) => (
                  <label key={d.label} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-[#0d5c46]" />
                    <span>
                      {d.label} <span className="text-gray-400 font-normal">({d.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Size</h4>
              <div className="flex flex-wrap gap-1.5">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      selectedSizes.includes(sz)
                        ? 'bg-[#0d5c46] text-white border-[#0d5c46]'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <button className="text-[11px] text-[#0d5c46] font-bold mt-2 hover:underline">
                + View More
              </button>
            </div>

            {/* Brand */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">Brand</h4>
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Search brand"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 bg-white border border-gray-300 rounded-md text-[11px] text-gray-800 placeholder-gray-400 outline-none"
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-medium text-gray-700">
                {['Nike', 'Puma', 'U.S. Polo Assn.', 'Adidas', "Levi's"].map((br) => (
                  <label key={br} className="flex items-center space-x-1.5 cursor-pointer">
                    <input type="checkbox" className="w-3 h-3 rounded border-gray-300 text-[#0d5c46]" />
                    <span className="truncate">{br}</span>
                  </label>
                ))}
              </div>
              <button className="text-[11px] text-[#0d5c46] font-bold mt-2 hover:underline">
                + View More
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Fashion Hero Banner */}
          <div className="bg-gradient-to-r from-teal-50/70 via-[#e4f3ef] to-emerald-50/60 rounded-3xl p-8 border border-gray-200/70 flex flex-col md:flex-row items-center justify-between shadow-2xs relative overflow-hidden gap-6">
            <div className="max-w-md space-y-2 z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                Stay Ahead in <br />
                Style &amp; <span className="text-[#ff5100]">Comfort</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium pt-1">
                Discover the latest trends in fashion. <br />
                Limited time offers!
              </p>
              <div className="pt-3">
                <button
                  onClick={() => navigateTo('deals')}
                  className="py-2.5 px-6 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative w-full md:w-1/2 flex justify-center md:justify-end items-center">
              <img
                src={fashionHeroImg}
                alt="Fashion Models"
                className="w-full max-w-lg h-auto object-contain rounded-2xl drop-shadow-xs"
              />
            </div>
          </div>

          {/* Sub-Categories Quick Selector Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {subCategoryQuick.map((sc) => (
              <div
                key={sc.name}
                onClick={() => setSelectedCategory(sc.name)}
                className="bg-white border border-gray-200/90 rounded-2xl p-3 flex items-center space-x-3 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-emerald-50/50 rounded-xl flex items-center justify-center p-1.5 shrink-0 border border-emerald-100/60">
                  <img src={sc.svg} alt={sc.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#0d5c46] transition-colors">
                    {sc.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">{sc.count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Products Grid (6 Cols) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {initialFashionProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigateTo('product-detail', product)}
                className="bg-white border border-gray-200/90 rounded-2xl p-3 flex flex-col justify-between hover:shadow-lg transition-all duration-200 relative group cursor-pointer"
              >
                {/* Discount Tag Top-Left */}
                <div className="bg-[#ff5100] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-br-lg rounded-tl-xl absolute top-0 left-0 z-10 shadow-2xs">
                  {product.discount}
                </div>

                {/* Wishlist Heart Icon Top-Right */}
                <button
                  onClick={(e) => handleToggleWishlist(e, product)}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 backdrop-blur-xs border border-gray-100 hover:bg-emerald-50 transition-colors shadow-2xs"
                  title="Add to Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      wishlistActive[product.id]
                        ? 'fill-red-500 text-red-500'
                        : 'text-[#0d5c46] hover:text-red-500'
                    }`}
                  />
                </button>

                {/* Image Container */}
                <div className="h-40 w-full bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden mt-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div className="mt-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs leading-tight hover:text-[#0d5c46] transition-colors cursor-pointer line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price Block */}
                    <div className="flex items-baseline space-x-1.5 mt-1.5">
                      <span className="text-xs font-black text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Rating Row */}
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 fill-current ${
                              i < Math.floor(product.rating)
                                ? 'text-amber-400'
                                : 'text-gray-200 fill-none'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500">
                        ({product.rating})
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full mt-2 py-1.5 px-2 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all active:scale-[0.98] flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="w-3 h-3 stroke-[2.2]" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Products Button */}
          <div className="mt-8 text-center">
            <button className="py-2.5 px-6 bg-white border border-gray-300 hover:border-[#0d5c46] hover:text-[#0d5c46] text-gray-800 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1">
              <span>Load More Products</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>

      {/* Value Proposition Banner */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="flex items-center space-x-3 sm:pr-3 py-2 sm:py-0">
            <Sparkles className="w-6 h-6 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Trendy Collections</h4>
              <p className="text-[10px] text-gray-500 font-medium">Stay ahead with latest styles</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:px-3 py-2 sm:py-0">
            <Tag className="w-6 h-6 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Best Prices</h4>
              <p className="text-[10px] text-gray-500 font-medium">Top brands at best prices</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:px-3 py-2 sm:py-0">
            <RotateCcw className="w-6 h-6 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Easy Returns</h4>
              <p className="text-[10px] text-gray-500 font-medium">7 days easy return policy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:px-3 py-2 sm:py-0">
            <ShieldCheck className="w-6 h-6 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-xs">Secure Payments</h4>
              <p className="text-[10px] text-gray-500 font-medium">100% secure &amp; trusted</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:pl-3 py-2 sm:py-0">
            <Headphones className="w-6 h-6 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-xs">24/7 Support</h4>
              <p className="text-[10px] text-gray-500 font-medium">We're here to help you</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
