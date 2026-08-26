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
import { getProductImage } from '../utils/productAssets';
import {
  fetchProductDetail,
  fetchProductReviews,
  submitProductReview,
  getCurrentUser
} from '../services/api';

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

const EMPTY_REVIEWS = {
  average_rating: 0,
  review_count: 0,
  rating_breakdown: {},
  reviews: []
};

export default function ProductDetailPage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCartContext();
  const { selectedProduct, navigateTo } = useNavigationContext();

  // The card that was clicked carries only list-level fields. The full row —
  // description, specifications, gallery, variants, related products — is
  // fetched from MySQL and layered on top.
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [reviewData, setReviewData] = useState(EMPTY_REVIEWS);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const product = detail || selectedProduct || defaultProduct;
  const productKey = selectedProduct?.slug || selectedProduct?.id || null;

  const [mainImage, setMainImage] = useState(product?.image || boatRockerzImg);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedToast, setAddedToast] = useState(null);

  const notify = (message) => {
    setAddedToast(message);
    setTimeout(() => setAddedToast(null), 3000);
  };

  // Sync state whenever a new product is clicked & loaded
  useEffect(() => {
    if (selectedProduct) {
      setMainImage(selectedProduct.image || boatRockerzImg);
      setQuantity(1);
      setActiveTab('description');
      setDetail(null);
      setShowReviewForm(false);
      setReviewData(EMPTY_REVIEWS);
    }
  }, [selectedProduct]);

  // Pull the authoritative row + its reviews.
  useEffect(() => {
    if (!productKey) return;
    let cancelled = false;

    (async () => {
      setIsLoadingDetail(true);
      const [full, reviews] = await Promise.all([
        fetchProductDetail(productKey),
        fetchProductReviews(productKey)
      ]);
      if (cancelled) return;

      if (full) {
        setDetail(full);
        setMainImage(full.image || full.primary_image || selectedProduct?.image || boatRockerzImg);
      }
      setReviewData(reviews || EMPTY_REVIEWS);
      setIsLoadingDetail(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [productKey]);

  // Build gallery thumbnails on the left (only if distinct multiple images exist)
  const primaryImg =
    product?.image || product?.primary_image || getProductImage(product?.name) || boatRockerzImg;
  const rawList =
    Array.isArray(product?.galleryThumbnails) && product.galleryThumbnails.length > 0
      ? product.galleryThumbnails
      : Array.isArray(product?.gallery) && product.gallery.length > 0
        ? product.gallery
        : Array.isArray(product?.images) && product.images.length > 0
          // The detail serializer returns ProductImage objects, list views return strings.
          ? product.images.map((img) => (typeof img === 'string' ? img : img?.image))
          : [primaryImg];
  const galleryThumbnails = Array.from(new Set(rawList.filter(Boolean)));

  const categoryName = product.category_name || product.category || 'Electronics';
  const targetCategoryPage = categoryPageMap[categoryName] || 'shop';

  // Live stock, so the stepper cannot exceed what the warehouse actually holds.
  const stockQuantity = Number(product.stock_quantity ?? 0);
  const hasStockInfo = product.stock_quantity !== undefined && product.stock_quantity !== null;
  const isInStock = hasStockInfo ? stockQuantity > 0 : product.is_in_stock !== false;
  const isLowStock = hasStockInfo && stockQuantity > 0 && stockQuantity <= 10;
  const maxQuantity = hasStockInfo && stockQuantity > 0 ? Math.min(stockQuantity, 10) : 10;

  const averageRating =
    Number(reviewData.average_rating) ||
    Number(product.rating ?? product.average_rating ?? 0) ||
    4.5;
  const reviewCount =
    Number(reviewData.review_count) ||
    Number(product.reviewsCount ?? product.review_count ?? 0);

  // Percentage width for each of the five rating bars.
  const breakdownTotal =
    Object.values(reviewData.rating_breakdown || {}).reduce((sum, n) => sum + Number(n || 0), 0) || 0;
  const ratingRows = [5, 4, 3, 2, 1].map((star) => {
    const count = Number(reviewData.rating_breakdown?.[String(star)] || 0);
    return {
      star,
      count,
      percent: breakdownTotal ? Math.round((count / breakdownTotal) * 100) : 0
    };
  });

  const specEntries = Object.entries(product.specifications || {}).filter(
    ([, value]) => value !== null && value !== undefined && String(value).trim() !== ''
  );

  const relatedProducts = Array.isArray(product.related_products)
    ? product.related_products.slice(0, 6)
    : [];

  const handleAddToCart = () => {
    if (!isInStock) {
      notify('This product is currently out of stock.');
      return;
    }
    addToCart({ ...product, quantity });
    notify(`Added ${quantity} x "${product.name}" to your cart!`);
  };

  const handleBuyNow = () => {
    if (!isInStock) {
      notify('This product is currently out of stock.');
      return;
    }
    addToCart({ ...product, quantity });
    navigateTo('checkout');
  };

  const handleToggleWishlist = () => {
    const wasWishlisted = isWishlisted(product.id);
    toggleWishlist(product);
    notify(
      wasWishlisted
        ? `Removed "${product.name}" from wishlist`
        : `Added "${product.name}" to wishlist`
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!getCurrentUser()) {
      notify('Please sign in to write a review.');
      navigateTo('login');
      return;
    }
    if (!reviewForm.comment.trim()) {
      notify('Please write a short review before submitting.');
      return;
    }

    setIsSubmittingReview(true);
    const res = await submitProductReview(productKey || product.id, reviewForm);
    setIsSubmittingReview(false);

    if (res?.status === 'success') {
      const fresh = await fetchProductReviews(productKey || product.id);
      setReviewData(fresh || EMPTY_REVIEWS);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      notify('Thanks! Your review is live.');
    } else {
      notify(res?.message || 'Could not submit your review. Please try again.');
    }
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
          {/* Thumbnail rail — one button per distinct gallery image */}
          <div className="flex sm:flex-col gap-2.5 shrink-0 overflow-x-auto sm:overflow-visible">
            {galleryThumbnails.map((thumb, index) => (
              <button
                key={`${thumb}-${index}`}
                onClick={() => setMainImage(thumb)}
                className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl border p-1.5 bg-white flex items-center justify-center transition-all overflow-hidden cursor-pointer shadow-xs group ${
                  mainImage === thumb
                    ? 'border-[#08493d] ring-2 ring-[#08493d]/30'
                    : 'border-gray-200 hover:border-[#08493d]/60'
                }`}
                title="Product thumbnail preview"
              >
                <img
                  src={thumb}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </button>
            ))}
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
                  isWishlisted(product.id)
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
          {(product.brand_name || typeof product.brand === 'string') && (
            <span className="inline-block bg-brand-50 text-brand-700 font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-brand-100">
              {product.brand_name || product.brand}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Rating & Sold Info */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 text-xs font-semibold text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 fill-current ${
                      i < Math.round(averageRating)
                        ? 'text-amber-400'
                        : 'text-gray-300 fill-none'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-800 font-bold ml-1">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('reviews')}
              className="text-gray-400 hover:text-brand-700 hover:underline cursor-pointer"
            >
              ({reviewCount} Reviews)
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 font-medium">
              {product.soldCount || '500+'} sold
            </span>
            <span className="text-gray-300">|</span>
            {/* Live stock state straight from the warehouse count */}
            {!isInStock ? (
              <span className="rounded-md bg-red-50 px-2 py-0.5 font-bold text-red-600 border border-red-100">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-700 border border-amber-100">
                Only {stockQuantity} left
              </span>
            ) : (
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-100">
                In Stock
              </span>
            )}
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
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={quantity >= maxQuantity ? 'Maximum available quantity reached' : 'Increase quantity'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="py-3 px-6 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={!isInStock}
              className="py-3 px-6 bg-accent hover:bg-accent-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100"
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
            Reviews ({reviewCount})
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
                  <span className="w-36 text-gray-400 font-semibold shrink-0">Product Name</span>
                  <span className="text-gray-900 font-bold">{product.name}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold shrink-0">Brand</span>
                  <span className="text-gray-900 font-bold">
                    {product.brand_name || (product.name ? product.name.split(' ')[0] : 'BuyZo')}
                  </span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold shrink-0">Category</span>
                  <span className="text-gray-900 font-bold">{categoryName}</span>
                </div>
                {product.sku && (
                  <div className="flex py-2 border-b border-gray-100">
                    <span className="w-36 text-gray-400 font-semibold shrink-0">SKU</span>
                    <span className="text-gray-900 font-bold">{product.sku}</span>
                  </div>
                )}

                {/* Per-product specs stored as JSON on the catalogue row */}
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex py-2 border-b border-gray-100">
                    <span className="w-36 text-gray-400 font-semibold shrink-0">{key}</span>
                    <span className="text-gray-900 font-bold">{String(value)}</span>
                  </div>
                ))}

                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-36 text-gray-400 font-semibold shrink-0">Availability</span>
                  {isInStock ? (
                    <span className="text-emerald-700 font-bold">
                      In Stock{hasStockInfo ? ` (${stockQuantity} units)` : ''} &mdash; Ships in 24 hours
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  )}
                </div>
                <div className="flex py-2">
                  <span className="w-36 text-gray-400 font-semibold shrink-0">Warranty</span>
                  <span className="text-gray-900 font-bold">1 Year Manufacturer Warranty</span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3 text-xs">
                {isLoadingDetail && reviewData.reviews.length === 0 && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 animate-pulse"
                      >
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                        <div className="h-3 w-1/5 rounded bg-gray-200" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                )}

                {!isLoadingDetail && reviewData.reviews.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center">
                    <p className="text-sm font-bold text-gray-900">No reviews yet</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Be the first to review {product.name}.
                    </p>
                  </div>
                )}

                {/* Real reviews from the database, newest first */}
                {reviewData.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-gray-900 truncate">
                          {review.user_name || 'BuyZo Customer'}
                        </span>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 shrink-0">
                            <Check className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-[11px] shrink-0">
                        {review.formatted_date}
                      </span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 fill-current ${
                            i < Number(review.rating) ? 'text-amber-400' : 'text-gray-300 fill-none'
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <p className="font-bold text-gray-800">{review.title}</p>
                    )}
                    <p className="text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Rating Breakdown Bar (5 cols) — aggregates from apps.reviews */}
          <div className="lg:col-span-5 bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-gray-900">
                {averageRating ? averageRating.toFixed(1) : '—'}
              </span>
              <div className="flex text-amber-400 justify-center my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 fill-current ${
                      i < Math.floor(averageRating)
                        ? 'text-amber-400'
                        : 'text-gray-300 fill-none'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-gray-500">
                {reviewCount} {reviewCount === 1 ? 'rating' : 'ratings'}
              </p>
            </div>

            {/* Progress Bars */}
            <div className="w-full space-y-1.5 text-xs font-semibold text-gray-600">
              {ratingRows.map(({ star, count, percent }) => (
                <div className="flex items-center space-x-2" key={star}>
                  <span className="w-6">{star} ★</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        star >= 4 ? 'bg-brand-700' : star === 3 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percent}%` }}
                      title={`${count} ${count === 1 ? 'review' : 'reviews'}`}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-gray-400">
                    {percent}%
                  </span>
                </div>
              ))}
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => {
                setActiveTab('reviews');
                setShowReviewForm((open) => !open);
              }}
              className="w-full py-2.5 bg-white border border-brand-700 text-brand-700 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {showReviewForm ? 'Close Review Form' : 'Write a Review'}
            </button>

            {/* Inline review composer — posts to /api/reviews/product/<slug>/ */}
            {showReviewForm && (
              <div className="w-full space-y-3 rounded-xl border border-gray-200 bg-white p-4 animate-fade-in-up">
                <div>
                  <p className="mb-1.5 text-xs font-bold text-gray-700">Your Rating</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((form) => ({ ...form, rating: star }))}
                        aria-label={`Rate ${star} out of 5`}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewForm.rating
                              ? 'fill-current text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((form) => ({ ...form, title: e.target.value }))}
                  placeholder="Sum it up in a line"
                  maxLength={200}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-brand-700"
                />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((form) => ({ ...form, comment: e.target.value }))}
                  placeholder="What did you like or dislike about this product?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-brand-700"
                />
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full rounded-xl bg-brand-700 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products — resolved server-side from the same category */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">You May Also Like</h2>
              <p className="text-xs font-medium text-gray-500">
                Handpicked from {categoryName}
              </p>
            </div>
            <button
              onClick={() => navigateTo('shop')}
              className="text-xs font-bold text-brand-700 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {relatedProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo('product-detail', item)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-shadow hover:shadow-md cursor-pointer"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={item.image || getProductImage(item.name || item.title)}
                    alt={item.name || item.title}
                    className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="line-clamp-2 text-xs font-bold text-gray-800">
                    {item.name || item.title}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                    {Number(item.rating || item.average_rating || 0).toFixed(1)}
                  </div>
                  <PriceBlock
                    price={item.price}
                    originalPrice={item.originalPrice}
                    discount={item.discount}
                    size="sm"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Add-to-Cart Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div>
          <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="md" />
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="bg-accent hover:bg-accent-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
