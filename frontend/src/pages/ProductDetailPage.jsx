import React, { useState, useEffect } from 'react';
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
  Heart,
  ShoppingCart
} from 'lucide-react';
import PriceBlock from '../components/ui/PriceBlock';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import default fallback images
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';

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
  ]
};

const categoryPageMap = {
  'Mobiles': 'electronics',
  'Electronics': 'electronics',
  'Audio': 'electronics',
  'Wearables': 'electronics',
  'Laptops': 'electronics',
  'Headphones': 'electronics',
  'Smartphones': 'electronics',
  'Fashion': 'fashion',
  'Menswear': 'fashion',
  'Womenswear': 'fashion',
  'Ethnic': 'fashion',
  'Footwear': 'fashion',
  'Beauty': 'beauty',
  'Skincare': 'beauty',
  'Haircare': 'beauty',
  'Makeup': 'beauty',
  'Fragrance': 'beauty',
  'Home & Kitchen': 'home-kitchen',
  'Cookware': 'home-kitchen',
  'Kitchen Appliances': 'home-kitchen',
  'Home Decor': 'home-kitchen',
  'Bedding': 'home-kitchen',
};

export default function ProductDetailPage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { selectedProduct, navigateTo } = useNavigationContext();

  const product = selectedProduct || defaultProduct;

  const [mainImage, setMainImage] = useState(product?.image || boatRockerzImg);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToast, setAddedToast] = useState(null);

  // Sync state whenever a new product is clicked & loaded
  useEffect(() => {
    if (selectedProduct) {
      setMainImage(selectedProduct.image || boatRockerzImg);
      setQuantity(1);
      setActiveTab('description');
    }
  }, [selectedProduct]);

  // Build gallery thumbnails on the left (only if distinct multiple images exist)
  const primaryImg = product?.image || boatRockerzImg;
  const rawList = Array.isArray(product?.gallery) && product.gallery.length > 0
    ? product.gallery
    : Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [primaryImg];
  const galleryThumbnails = Array.from(new Set(rawList.filter(Boolean)));

  const categoryName = product.category || 'Electronics';
  const targetCategoryPage = categoryPageMap[categoryName] || 'shop';

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setAddedToast(`Added ${quantity} x "${product.name}" to your cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity });
    navigateTo('checkout');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    setAddedToast(activeWish ? `Removed "${product.name}" from wishlist` : `Added "${product.name}" to wishlist`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const productFeatures = Array.isArray(product.features) && product.features.length > 0
    ? product.features
    : [
        '100% Genuine & Brand Authentic Product',
        '7-Day Hassle-Free Replacement Policy',
        'Free Express Delivery On Orders Above ₹499',
        'Secure Packaging with Tamper-Proof Seal'
      ];

  const productDescription = product.description || `Experience superior quality and premium satisfaction with the all-new ${product.name}. Carefully crafted for durability, optimum performance, and maximum everyday value.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 bg-brand-700 text-white px-5 py-3 rounded-xl shadow-2xl font-medium text-sm z-50 flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-6 flex-wrap">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-brand-700 transition-colors cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <button
          onClick={() => navigateTo(targetCategoryPage)}
          className="hover:text-brand-700 transition-colors cursor-pointer capitalize"
        >
          {categoryName}
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Section: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
        {/* Left Gallery (6 cols) */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4">
          {/* Single Small Thumbnail on Left */}
          <div className="flex sm:flex-col gap-2.5 shrink-0 overflow-x-auto sm:overflow-visible">
            <button
              onClick={() => setMainImage(primaryImg)}
              className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl border border-[#08493d] ring-2 ring-[#08493d]/30 p-1.5 bg-white flex items-center justify-center transition-all overflow-hidden cursor-pointer shadow-xs group"
              title="Product thumbnail preview"
            >
              <img
                src={primaryImg}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
              />
            </button>
          </div>

          {/* Featured Main Image */}
          <div className="flex-1 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 flex items-center justify-center relative min-h-[360px] sm:min-h-[420px] shadow-2xs group">
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-[340px] sm:max-h-[380px] max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {/* Heart Wishlist overlay button */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200 shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  activeWish
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Details (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Brand Tag */}
          {product.brand && (
            <span className="inline-block bg-brand-50 text-brand-700 font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-brand-100">
              {product.brand}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
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
              {product.soldCount || '500+'} sold
            </span>
          </div>

          {/* Pricing Block */}
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through font-medium">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              {product.discount && (
                <span className="text-base font-extrabold text-accent">
                  {product.discount}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Inclusive of all taxes
            </p>
          </div>

          {/* Offers Container */}
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-900">Available Offers</h4>
            <div className="flex items-start space-x-2 text-xs text-gray-700 font-medium">
              <span className="text-accent font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Bank Offer</span>
              <span>10% Instant Discount on SBI and HDFC Cards</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-gray-700 font-medium">
              <span className="text-accent font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Partner Offer</span>
              <span>Get extra ₹100 off on orders above ₹999</span>
            </div>
          </div>

          {/* Quantity & Add to Cart / Buy Now Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="py-3 px-6 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="py-3 px-6 bg-accent hover:bg-accent-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>Buy Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Guarantees Row */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
            <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100">
              <Truck className="w-5 h-5 text-brand-700 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">Free Delivery</span>
              <span className="text-[10px] text-gray-500">Above ₹499</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100">
              <RotateCcw className="w-5 h-5 text-brand-700 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">7 Days Return</span>
              <span className="text-[10px] text-gray-500">Hassle Free</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-brand-700 mb-1" />
              <span className="text-[11px] font-bold text-gray-800">100% Genuine</span>
              <span className="text-[10px] text-gray-500">Verified Seller</span>
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
            className={`font-bold text-sm transition-colors pb-3 -mb-3 cursor-pointer ${
              activeTab === 'description'
                ? 'text-brand-700 border-b-2 border-brand-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`font-bold text-sm transition-colors pb-3 -mb-3 cursor-pointer ${
              activeTab === 'specifications'
                ? 'text-brand-700 border-b-2 border-brand-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-bold text-sm transition-colors pb-3 -mb-3 cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-brand-700 border-b-2 border-brand-700'
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
                  {productDescription}
                </p>
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                    Key Highlights
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-800">
                    {productFeatures.map((feat, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-brand-700 rounded-full shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Product Name</span>
                  <span className="text-gray-900 font-bold">{product.name}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Brand</span>
                  <span className="text-gray-900 font-bold">{product.brand || (product.name ? product.name.split(' ')[0] : 'BuyZo')}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Category</span>
                  <span className="text-gray-900 font-bold">{categoryName}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold">Availability</span>
                  <span className="text-emerald-700 font-bold">In Stock (Ships in 24 hours)</span>
                </div>
                <div className="flex py-2">
                  <span className="w-36 text-gray-400 font-semibold">Warranty</span>
                  <span className="text-gray-900 font-bold">1 Year Manufacturer Warranty</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3 text-xs">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Verified Buyer</span>
                    <span className="text-gray-400 text-[11px]">2 days ago</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 font-medium">
                    Excellent product quality and very fast shipping! Exactly as shown in the picture.
                  </p>
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
                  <div className="bg-brand-700 h-full w-[75%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  75%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">4 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-700 h-full w-[18%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  18%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">3 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[5%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  5%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6">2 ★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[1%]" />
                </div>
                <span className="w-8 text-right font-medium text-gray-400">
                  1%
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
            <button className="w-full py-2.5 bg-white border border-brand-700 text-brand-700 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors cursor-pointer">
              Write a Review
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add-to-Cart Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div>
          <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="md" />
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-accent hover:bg-accent-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
