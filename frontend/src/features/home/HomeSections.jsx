import React from 'react';
import { Zap, ShieldCheck, BadgeCheck, Truck, Star, Mail } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import boatRockerzImg from '../../assets/trending_deals/boat_rockerz.png';
import noiseSmartwatchImg from '../../assets/trending_deals/noise_smartwatch.png';
import sonyHeadphonesImg from '../../assets/trending_deals/sony_headphones.png';
import jblSpeakerImg from '../../assets/trending_deals/jbl_speaker.png';

const deals = [
  {
    id: 'elec-1',
    name: 'boAt Rockerz 450',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 2499,
    discount: '40% OFF',
    discountNum: 40,
    rating: 4.4,
    reviewsCount: 3840,
    cardBg: 'linear-gradient(135deg, #dff6f4 0%, #b2e8e4 100%)',
    badgeColor: '#0794a5',
    glowColor: '#a9f1fa',
  },
  {
    id: 'elec-2',
    name: 'Noise ColorFit Pro 5',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    discountNum: 40,
    rating: 4.5,
    reviewsCount: 2910,
    cardBg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    badgeColor: '#5bac39',
    glowColor: '#d7f8a8',
  },
  {
    id: 'elec-3',
    name: 'Sony WH-CH510',
    image: sonyHeadphonesImg,
    price: 2499,
    originalPrice: 3990,
    discount: '37% OFF',
    discountNum: 37,
    rating: 4.6,
    reviewsCount: 4120,
    cardBg: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)',
    badgeColor: '#7052ed',
    glowColor: '#d8cdfc',
  },
  {
    id: 'elec-4',
    name: 'JBL Flip Essential 2',
    image: jblSpeakerImg,
    price: 4499,
    originalPrice: 6999,
    discount: '35% OFF',
    discountNum: 35,
    rating: 4.7,
    reviewsCount: 5280,
    cardBg: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 60%, #ffd54f 100%)',
    badgeColor: '#ff680d',
    glowColor: '#ffe4a1',
  },
];

export function TrendingDealsBand() {
  const { navigateTo } = useNavigationContext();
  return (
    <section className="mx-4 my-10 sm:mx-6 lg:mx-8">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
            <Zap className="w-3.5 h-3.5 fill-orange-500" /> Lightning Deals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">Trending Deals</h2>
          <p className="text-sm text-gray-500 mt-0.5">Grab today's hottest picks before they sell out.</p>
        </div>
        <button
          onClick={() => navigateTo('deals')}
          className="text-sm font-bold text-orange-500 hover:text-orange-600 whitespace-nowrap transition-colors cursor-pointer"
        >
          View All Deals →
        </button>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {deals.map((d) => (
          <div
            key={d.id}
            onClick={() => navigateTo('product-detail', d)}
            className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(26,44,57,0.10)] hover:shadow-[0_14px_30px_rgba(26,44,57,0.16)] transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 hover:-translate-y-1"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Image area — colored gradient bg + floating product */}
            <div
              className="relative w-full flex items-center justify-center overflow-hidden"
              style={{ background: d.cardBg, minHeight: '220px', padding: '22px 18px 16px' }}
            >
              {/* Subtle radial glow behind product */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(ellipse 70% 60% at 50% 60%, ${d.glowColor} 0%, transparent 70%)`,
                }}
              />

              {/* Discount Badge */}
              <div
                className="absolute top-3 right-3 flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 min-w-[46px] shadow-lg z-10"
                style={{ background: d.badgeColor }}
              >
                <span className="text-white font-black text-base leading-none">{d.discountNum}%</span>
                <span className="text-white font-bold text-[10px] leading-tight tracking-widest">OFF</span>
              </div>

              {/* Product Image — multiply blend removes white bg */}
              <img
                src={d.image}
                alt={d.name}
                className="relative z-10 max-h-[185px] w-auto object-contain drop-shadow-[0_12px_10px_rgba(15,23,42,0.14)] group-hover:scale-105 transition-transform duration-300 sm:max-h-[215px]"
              />
            </div>

            {/* Card Body */}
            <div className="p-4 pt-3 sm:p-5 sm:pt-3">
              <h4 className="text-sm font-extrabold text-gray-900 line-clamp-1 mb-2 sm:text-base">{d.name}</h4>

              {/* Price Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black text-gray-900">₹{d.price.toLocaleString('en-IN')}</span>
                <span className="text-sm text-gray-400 line-through">₹{d.originalPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-green-600">{d.discount}</span>
              </div>

              {/* Deal of the Day Button */}
              <button className="mt-4 w-full flex items-center justify-center gap-1.5 bg-[#fff0f2] hover:bg-[#ffe4e8] text-[#f0445d] rounded-full py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
                <Zap className="w-3 h-3 fill-red-500 text-red-500" />
                Deal of the Day
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const brandValues = [
  { icon: Truck, title: 'Superfast Delivery', desc: 'Same-day in metros' },
  { icon: ShieldCheck, title: 'Buyer Protection', desc: '100% genuine products' },
  { icon: BadgeCheck, title: 'Top Brands', desc: 'Authorized sellers only' },
  { icon: Star, title: '4.5+ Avg Rating', desc: 'Loved by 2M+ shoppers' },
];

export function BrandValueBand() {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 my-10">
      <div className="bg-brand-900 rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-64 h-64 bg-gold/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandValues.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 text-gold flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">{v.title}</h4>
                  <p className="text-xs text-white/70 font-medium">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NewsletterBand() {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 my-10">
      <div className="bg-gradient-to-r from-accent to-accent-600 rounded-3xl px-6 sm:px-12 py-8 sm:py-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 items-center justify-center shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight">Get Festival Alerts & Offers</h3>
              <p className="text-sm text-white/85 font-medium">Be first to know about Rakhi, Diwali & mega-sale drops.</p>
            </div>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white text-ink text-sm font-medium outline-none focus:ring-2 focus:ring-white/60"
            />
            <button
              type="submit"
              className="bg-brand-900 hover:bg-brand-800 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
