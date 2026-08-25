import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronRight,
  User,
  ShoppingBag,
  Sparkles,
  Flame,
  Gift,
  Smartphone,
  Scissors,
  Tag,
  Headphones,
  Heart,
  Package,
  Layers,
  HelpCircle,
  TrendingUp,
  Percent,
  Check,
  ArrowRight
} from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

const categories = [
  'Home',
  'Best Sellers',
  'Shop',
  'Deals',
  'New Arrivals',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Contact Us'
];

export default function Navbar() {
  const { currentPage, navigateTo } = useNavigationContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'giftCard' | 'recharge' | 'handloom' | 'buyMoreSaveMore'
  const drawerRef = useRef(null);

  // Close drawer on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setActiveModal(null);
      }
    };
    if (isDrawerOpen || activeModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, activeModal]);

  const handleNavClick = (e, cat) => {
    e.preventDefault();
    if (cat === 'Shop') {
      navigateTo('shop');
    } else if (cat === 'Best Sellers') {
      navigateTo('best-sellers');
    } else if (cat === 'Electronics') {
      navigateTo('electronics');
    } else if (cat === 'Home') {
      navigateTo('home');
    } else if (cat === 'Deals') {
      navigateTo('deals');
    } else if (cat === 'Fashion') {
      navigateTo('fashion');
    } else if (cat === 'Contact Us') {
      navigateTo('contact');
    } else if (cat === 'New Arrivals') {
      navigateTo('new-arrivals');
    } else if (cat === 'Beauty') {
      navigateTo('beauty');
    } else if (cat === 'Home & Kitchen') {
      navigateTo('home-kitchen');
    }
  };

  const handleDrawerItemClick = (action) => {
    setIsDrawerOpen(false);
    if (typeof action === 'string') {
      navigateTo(action);
    } else if (typeof action === 'function') {
      action();
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="w-full bg-brand-800 text-white text-xs font-semibold px-3 sm:px-6 flex items-center gap-0 overflow-x-auto select-none relative z-30 shadow-sm">
        {/* All Categories Trigger Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center justify-center space-x-2 bg-brand-900/60 hover:bg-[#ff5100] py-2.5 px-3 sm:px-4 text-white font-bold shrink-0 transition-all cursor-pointer border-r border-white/10 group active:scale-95"
          title="Open All Categories Menu"
        >
          <span className="text-sm font-black group-hover:rotate-90 transition-transform duration-200">☰</span>
          <span>All Categories</span>
        </button>

        {/* Category Links */}
        {categories.map((cat, index) => {
          const isActive =
            (cat === 'Home' && currentPage === 'home') ||
            (cat === 'Best Sellers' && currentPage === 'best-sellers') ||
            (cat === 'Shop' && currentPage === 'shop') ||
            (cat === 'New Arrivals' && currentPage === 'new-arrivals') ||
            (cat === 'Electronics' && currentPage === 'electronics') ||
            (cat === 'Deals' && currentPage === 'deals') ||
            (cat === 'Fashion' && currentPage === 'fashion') ||
            (cat === 'Beauty' && currentPage === 'beauty') ||
            (cat === 'Home & Kitchen' && currentPage === 'home-kitchen') ||
            (cat === 'Contact Us' && currentPage === 'contact');
          return (
            <button
              key={index}
              onClick={(e) => handleNavClick(e, cat)}
              className={`flex-1 whitespace-nowrap text-center px-2 py-2.5 cursor-pointer transition-colors hover:text-accent ${
                isActive
                  ? 'text-accent border-b-2 border-accent font-bold bg-white/5'
                  : 'text-white/90'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* Backdrop overlay */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* All Categories Sidebar Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-[310px] sm:w-[360px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-brand-800 text-white p-5 flex items-center justify-between shadow-md">
          <div
            onClick={() => handleDrawerItemClick('login')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-[#ff5100] transition-colors">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">Welcome to BuyZo</div>
              <div className="text-sm font-bold flex items-center space-x-1 group-hover:text-amber-300 transition-colors">
                <span>Hello, Sign In</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-gray-800 text-xs select-none scrollbar-thin">
          {/* Section 1: Trending & Top Picks */}
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
              Trending & Highlights
            </div>
            <button
              onClick={() => handleDrawerItemClick('best-sellers')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-bold transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <Flame className="w-4 h-4 text-accent" />
                <span>Best Sellers</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                #1 Ranked
              </span>
            </button>
            <button
              onClick={() => handleDrawerItemClick('deals')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Lightning Deals & Offers</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
            <button
              onClick={() => handleDrawerItemClick('new-arrivals')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>New Arrivals 2026</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
          </div>

          {/* Section 2: Shop by Department / Category */}
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
              Shop by Category
            </div>
            <button
              onClick={() => handleDrawerItemClick('electronics')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <span>Mobiles, Computers & Electronics</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
            <button
              onClick={() => handleDrawerItemClick('fashion')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <span>Men & Women Fashion</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
            <button
              onClick={() => handleDrawerItemClick('home-kitchen')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <span>Home, Kitchen & Furniture</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
            <button
              onClick={() => handleDrawerItemClick('beauty')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <span>Beauty, Health & Personal Care</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
            <button
              onClick={() => handleDrawerItemClick('fashion')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-[#063328] font-semibold transition-all cursor-pointer group"
            >
              <span>Footwear, Bags & Luggage</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#063328]" />
            </button>
          </div>

          {/* Section 3: Programs & Features (Requested Items) */}
          <div className="p-4 space-y-1 bg-gold/10">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
              Programs &amp; Features
            </div>

            {/* Gift Card */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setActiveModal('giftCard');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-xs hover:text-[#063328] font-semibold transition-all cursor-pointer group text-gray-800"
            >
              <div className="flex items-center space-x-2.5">
                <Gift className="w-4 h-4 text-accent" />
                <span>Gift Cards & Vouchers</span>
              </div>
              <span className="text-[10px] bg-orange-100 text-accent font-bold px-2 py-0.5 rounded-full">
                Instant
              </span>
            </button>

            {/* Mobile Recharge */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setActiveModal('recharge');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-xs hover:text-[#063328] font-semibold transition-all cursor-pointer group text-gray-800"
            >
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>Mobile Recharge & Bill Pay</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Cashback
              </span>
            </button>

            {/* Handloom & Handicraft */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setActiveModal('handloom');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-xs hover:text-[#063328] font-semibold transition-all cursor-pointer group text-gray-800"
            >
              <div className="flex items-center space-x-2.5">
                <Scissors className="w-4 h-4 text-amber-700" />
                <span>Handloom & Handicraft</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                Artisan
              </span>
            </button>

            {/* Buy More, Save More */}
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setActiveModal('buyMoreSaveMore');
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-xs font-bold transition-all cursor-pointer group text-gray-900 border border-emerald-500/20 bg-emerald-50/60"
            >
              <div className="flex items-center space-x-2.5">
                <Tag className="w-4 h-4 text-accent" />
                <span className="text-[#063328]">Buy More, <span className="text-accent">Save More</span></span>
              </div>
              <span className="text-[10px] bg-brand-800 text-white font-extrabold px-2 py-0.5 rounded-full">
                Extra 15%
              </span>
            </button>
          </div>

          {/* Section 4: Help & Settings */}
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
              Help & Settings
            </div>
            <button
              onClick={() => handleDrawerItemClick('login')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4 text-gray-500" />
                <span>Your Account</span>
              </div>
            </button>
            <button
              onClick={() => handleDrawerItemClick('orders')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4 text-gray-500" />
                <span>Your Orders & Tracking</span>
              </div>
            </button>
            <button
              onClick={() => handleDrawerItemClick('wishlist')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Heart className="w-4 h-4 text-gray-500" />
                <span>Your Wishlist</span>
              </div>
            </button>
            <button
              onClick={() => handleDrawerItemClick('contact')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 font-bold text-[#063328] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>Customer Services & 24x7 Help</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">BuyZo e-Commerce v2.4 • India</p>
        </div>
      </div>

      {/* Interactive Modal for Programs & Features */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-scale-up">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gift Card Modal */}
            {activeModal === 'giftCard' && (
              <div className="space-y-5 text-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-accent flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#063328]">BuyZo E-Gift Cards</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Send instant personalized shopping vouchers via email or SMS with zero expiry.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {['₹500', '₹1,000', '₹2,500', '₹5,000', '₹10,000', 'Custom'].map((amt) => (
                    <button
                      key={amt}
                      className="p-3 border border-gray-200 rounded-xl text-xs font-bold text-center hover:border-accent hover:bg-orange-50/50 cursor-pointer transition-all"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigateTo('shop');
                  }}
                  className="w-full py-3 bg-brand-800 hover:bg-[#ff5100] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Buy Gift Voucher Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Recharge Modal */}
            {activeModal === 'recharge' && (
              <div className="space-y-5 text-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#063328]">Mobile Recharge & Bill Pay</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Instant prepaid recharge, postpaid & broadband bill payments with flat ₹50 cashback.
                  </p>
                </div>
                <div className="space-y-3 text-xs">
                  <input
                    type="tel"
                    placeholder="Enter 10-digit Mobile Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#063328] font-medium"
                  />
                  <div className="flex gap-2">
                    <select className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 outline-none font-semibold">
                      <option>Jio Prepaid</option>
                      <option>Airtel Prepaid</option>
                      <option>Vi Prepaid</option>
                      <option>BSNL</option>
                    </select>
                    <select className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 outline-none font-semibold">
                      <option>₹299 (28 Days, 1.5GB/day)</option>
                      <option>₹666 (84 Days, 1.5GB/day)</option>
                      <option>₹839 (84 Days, 2GB/day)</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    alert('Recharge payment gateway simulated successfully!');
                  }}
                  className="w-full py-3 bg-[#ff5100] hover:bg-[#e04700] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Proceed to Instant Recharge
                </button>
              </div>
            )}

            {/* Handloom & Handicraft Modal */}
            {activeModal === 'handloom' && (
              <div className="space-y-5 text-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#063328]">Handloom & Handicrafts</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Authentic handmade creations, Khadi cotton, terracotta pottery, and brass decor from certified Indian master artisans.
                  </p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 flex items-center space-x-3">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Artisan to Consumer Fair Trade</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 flex items-center space-x-3">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Silk Mark & Handloom Certified Products</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigateTo('fashion');
                  }}
                  className="w-full py-3 bg-brand-800 hover:bg-[#ff5100] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Explore Artisan Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Buy More Save More Modal */}
            {activeModal === 'buyMoreSaveMore' && (
              <div className="space-y-5 text-gray-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#063328] flex items-center justify-center">
                  <Tag className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#063328]">
                    Buy More, <span className="text-accent">Save More</span> Program
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Unlock tiered volume discounts automatically at checkout across all categories!
                  </p>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#063328]">Buy 2 Items</div>
                      <div className="text-[11px] text-gray-500">Applies across Fashion & Electronics</div>
                    </div>
                    <span className="text-sm font-black text-accent">Extra 10% OFF</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#063328]">Buy 3+ Items</div>
                      <div className="text-[11px] text-gray-500">Applies on whole cart order</div>
                    </div>
                    <span className="text-sm font-black text-accent">Extra 20% OFF</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    navigateTo('deals');
                  }}
                  className="w-full py-3 bg-brand-800 hover:bg-[#ff5100] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Shop Super Saver Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

