import React, { useState } from 'react';
import {
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Lock,
  Minus,
  Plus,
  Check,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import images
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';

const defaultProduct = {
  id: 'elec-1',
  name: 'boAt Rockerz 450',
  image: boatRockerzImg,
  price: 1499,
  originalPrice: 3999,
  discount: '56% OFF',
  rating: 4.5,
  reviewsCount: 256,
  soldCount: '1000+',
  brand: 'boAt',
  category: 'Headphones',
  description:
    'Experience superior sound quality with boAt Rockerz 450. Enjoy powerful bass, comfy fit and long battery life.',
  features: [
    '40mm Drivers',
    'Up to 15 Hours Playback',
    'Soft Cushioned Earcups',
    'Bluetooth v5.0'
  ],
  colors: [
    { name: 'Teal Green', hex: '#0f766e' },
    { name: 'Royal Blue', hex: '#2563eb' },
    { name: 'Silver Gray', hex: '#9ca3af' },
    { name: 'Matte Black', hex: '#1f2937' }
  ]
};

export default function ProductDetailPage() {
  const { addToCart, addToWishlist } = useCartContext();
  const { selectedProduct, navigateTo } = useNavigationContext();

  const product = selectedProduct || defaultProduct;

  const [mainImage, setMainImage] = useState(product.image || boatRockerzImg);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0]?.name || 'Teal Green'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToast, setAddedToast] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const galleryThumbnails = [
    product.image || boatRockerzImg,
    noiseSmartwatchImg,
    sonyHeadphonesImg
  ];

  const handleAddToCart = () => {
    addToCart({ ...product, selectedColor, quantity });
    setAddedToast(`Added ${quantity} x "${product.name}" to your cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, selectedColor, quantity });
    navigateTo('checkout');
  };

  const handleToggleWishlist = () => {
    addToWishlist(product);
    setIsWishlisted((prev) => !prev);
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
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-6">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#0d5c46] transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <button
          onClick={() => navigateTo('electronics')}
          className="hover:text-[#0d5c46] transition-colors"
        >
          Electronics
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <button
          onClick={() => navigateTo('electronics')}
          className="hover:text-[#0d5c46] transition-colors"
        >
          {product.category || 'Headphones'}
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">{product.name}</span>
      </nav>

      {/* Main Product Section: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-6 flex gap-4">
          {/* Vertical Thumbnails */}
          <div className="flex flex-col space-y-3 shrink-0">
            {galleryThumbnails.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 rounded-xl border p-1 bg-white flex items-center justify-center transition-all overflow-hidden ${
                  mainImage === img
                    ? 'border-[#0d5c46] ring-2 ring-[#0d5c46]/30 shadow-xs'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className="max-h-full max-w-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* Featured Image */}
          <div className="flex-1 bg-white border border-gray-200/90 rounded-2xl p-8 flex items-center justify-center relative min-h-[380px] shadow-2xs group">
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-[340px] max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {/* Heart Wishlist overlay button */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-4 right-4 p-2 rounded-full bg-white border border-gray-200 shadow-xs hover:bg-emerald-50 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Details (7 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {product.name}
          </h1>

          {/* Rating & Sold Info */}
          <div className="flex items-center space-x-3 text-xs font-semibold text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 fill-current ${
                      i < Math.floor(product.rating || 4.5)
                        ? 'text-amber-400'
                        : 'text-gray-300 fill-none'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-800 font-bold ml-1">
                {product.rating || 4.5}
              </span>
            </div>
            <span className="text-gray-400">
              ({product.reviewsCount || 256} Reviews)
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 font-medium">
              {product.soldCount || '1000+'} sold
            </span>
          </div>

          {/* Pricing Block */}
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through font-medium">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount && (
                <span className="text-base font-extrabold text-[#ff5100]">
                  {product.discount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Inclusive of all taxes
            </p>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Color:{' '}
              <span className="font-semibold text-gray-600">
                {selectedColor}
              </span>
            </label>
            <div className="flex items-center space-x-3">
              {(product.colors || defaultProduct.colors).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full transition-all border-2 ${
                    selectedColor === c.name
                      ? 'ring-2 ring-[#0d5c46] ring-offset-2 scale-110 border-white'
                      : 'border-transparent hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Offers Container */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-900">Offers</h4>
            <div className="flex items-start space-x-2 text-xs text-gray-700 font-medium">
              <span className="text-amber-600 font-bold">✔ Bank Offer</span>
              <span>10% Instant Discount on SBI Cards</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-gray-700 font-medium">
              <span className="text-amber-600 font-bold">✔ Partner Offer</span>
              <span>Get extra 5% off on orders above ₹1999</span>
            </div>
          </div>

          {/* Quantity & Add to Cart / Buy Now Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-gray-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 bg-[#ff5100] hover:bg-[#e64900] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] min-w-[140px]"
            >
              Add to Cart
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 px-6 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] min-w-[140px]"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Value Badges Banner Row */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 mb-10 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="flex items-center space-x-3.5 sm:pr-4 py-2 sm:py-0">
            <Truck className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Delivery</h4>
              <p className="text-xs text-gray-500 font-medium">Get it by 22 May</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 sm:px-6 py-2 sm:py-0">
            <RotateCcw className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Returns</h4>
              <p className="text-xs text-gray-500 font-medium">7 Days Easy Returns</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 sm:px-6 py-2 sm:py-0">
            <ShieldCheck className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Warranty</h4>
              <p className="text-xs text-gray-500 font-medium">1 Year Warranty</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 sm:pl-6 py-2 sm:py-0">
            <Lock className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Secure</h4>
              <p className="text-xs text-gray-500 font-medium">100% Secure Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description | Specifications | Reviews */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
        {/* Tab Headers */}
        <div className="flex items-center space-x-6 border-b border-gray-200 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`font-bold text-sm transition-colors pb-3 -mb-3 ${
              activeTab === 'description'
                ? 'text-[#0d5c46] border-b-2 border-[#0d5c46]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`font-bold text-sm transition-colors pb-3 -mb-3 ${
              activeTab === 'specifications'
                ? 'text-[#0d5c46] border-b-2 border-[#0d5c46]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-bold text-sm transition-colors pb-3 -mb-3 ${
              activeTab === 'reviews'
                ? 'text-[#0d5c46] border-b-2 border-[#0d5c46]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Reviews ({product.reviewsCount || 256})
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Description Column */}
          <div className="lg:col-span-7 space-y-4">
            {activeTab === 'description' && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed font-normal">
                  {product.description || defaultProduct.description}
                </p>
                <ul className="space-y-2 text-xs font-semibold text-gray-800">
                  {(product.features || defaultProduct.features).map(
                    (feat, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-[#0d5c46] rounded-full shrink-0" />
                        <span>{feat}</span>
                      </li>
                    )
                  )}
                </ul>
              </>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="flex py-1.5 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Brand</span>
                  <span className="text-gray-900 font-bold">{product.brand || 'boAt'}</span>
                </div>
                <div className="flex py-1.5 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Category</span>
                  <span className="text-gray-900 font-bold">{product.category || 'Headphones'}</span>
                </div>
                <div className="flex py-1.5 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Connectivity</span>
                  <span className="text-gray-900 font-bold">Bluetooth v5.0</span>
                </div>
                <div className="flex py-1.5 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Battery Life</span>
                  <span className="text-gray-900 font-bold">Up to 15 Hours</span>
                </div>
                <div className="flex py-1.5">
                  <span className="w-36 text-gray-400 font-semibold">Warranty</span>
                  <span className="text-gray-900 font-bold">1 Year Brand Warranty</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3 text-xs">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Rahul Sharma</span>
                    <span className="text-gray-400 text-[11px]">2 days ago</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 font-medium">Amazing sound quality and bass for this price tag!</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Rating Breakdown Bar (5 cols) */}
          <div className="lg:col-span-5 bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-gray-900">
                {product.rating || 4.5}
              </span>
              <div className="flex text-amber-400 justify-center my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 fill-current ${
                      i < Math.floor(product.rating || 4.5)
                        ? 'text-amber-400'
                        : 'text-gray-300 fill-none'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="w-full space-y-1.5 text-xs font-semibold text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-6">5 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0d5c46] h-full w-[70%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  70%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">4 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0d5c46] h-full w-[20%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  20%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">3 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[7%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  7%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">2 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[2%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  2%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">1 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[1%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  1%
                </span>
              </div>
            </div>

            {/* Write a Review Button */}
            <button className="w-full py-2.5 bg-white border border-[#0d5c46] text-[#0d5c46] hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors">
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
