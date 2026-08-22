import React from 'react';
import {
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import logo from '../../assets/logo.png';

const linkGroups = [
  {
    title: 'BUYZO',
    links: [
      ['About Us', 'home'],
      ['Contact Us', 'contact'],
      ['Careers', 'contact'],
      ['Become a Seller', 'contact'],
    ],
  },
  {
    title: 'CUSTOMER CARE',
    links: [
      ['Help Center', 'contact'],
      ['Track Order', 'orders'],
      ['Returns & Refunds', 'orders'],
      ['FAQs', 'contact'],
    ],
  },
  {
    title: 'QUICK LINKS',
    links: [
      ['Shop', 'shop'],
      ['Deals', 'deals'],
      ['New Arrivals', 'new-arrivals'],
      ['Electronics', 'electronics'],
      ['Fashion', 'fashion'],
      ['Home & Kitchen', 'shop'],
      ['Beauty', 'shop'],
    ],
  },
  {
    title: 'POLICIES',
    links: [
      ['Privacy Policy', 'contact'],
      ['Terms & Conditions', 'contact'],
      ['Shipping Policy', 'contact'],
      ['Cancellation Policy', 'contact'],
    ],
  },
];

const benefits = [
  [Truck, 'Free Delivery', 'On orders above ₹499'],
  [RotateCcw, 'Easy Returns', '7 days return policy'],
  [ShieldCheck, 'Secure Payments', '100% secure payments'],
  [Headphones, '24/7 Support', 'Dedicated support'],
];

function SocialIcon({ children, className }) {
  return <span className={`flex h-6 w-6 items-center justify-center rounded-full ${className}`}>{children}</span>;
}

export default function Footer() {
  const { navigateTo } = useNavigationContext();

  return (
    <footer className="mt-14 bg-[#003d32] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-12 lg:gap-0">
          <div className="border-b border-white/10 pb-7 md:col-span-3 md:border-b-0 md:border-r md:pr-8">
            <img className="mb-4 h-11 w-auto object-contain object-left" src={logo} alt="BuyZo" />
            <p className="max-w-[190px] text-xs leading-relaxed text-emerald-50/80">
              Your one-stop destination for top brands, best prices &amp; exclusive offers.
            </p>
            <div className="mt-6 space-y-4">
              {benefits.map(([Icon, title, description]) => (
                <div className="flex items-center gap-3" key={title}>
                  <Icon className="h-6 w-6 shrink-0 text-[#00b894]" strokeWidth={1.8} />
                  <div>
                    <p className="text-xs font-bold">{title}</p>
                    <p className="text-[10px] text-emerald-50/70">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-7 md:grid-cols-4 md:px-8">
            {linkGroups.map(({ title, links }) => (
              <div key={title}>
                <h2 className="mb-5 text-[11px] font-extrabold tracking-wide">{title}</h2>
                <ul className="space-y-4">
                  {links.map(([label, page]) => (
                    <li key={label}>
                      <button
                        className="text-left text-xs text-emerald-50/75 transition-colors hover:text-white"
                        onClick={() => navigateTo(page)}
                        type="button"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-7 md:col-span-2 md:border-l md:border-t-0 md:pl-8">
            <h2 className="mb-5 text-[11px] font-extrabold tracking-wide">DOWNLOAD APP</h2>
            <p className="mb-4 text-xs leading-relaxed text-emerald-50/75">Shop on the go with BuyZo App</p>
            <div className="space-y-4">
              <a className="flex h-[63px] w-[167px] items-center gap-2 rounded-[5px] border border-[#5b6665] bg-black px-2.5 text-white transition-transform hover:scale-[1.02]" href="#app">
                <svg className="h-8 w-7 shrink-0" viewBox="0 0 28 32" aria-hidden="true">
                  <path d="M1 1L15 16 1 31V1Z" fill="#22d477" />
                  <path d="M1 1L27 14.5 15 16 1 1Z" fill="#ffdf3f" />
                  <path d="M1 31L27 17.5 15 16 1 31Z" fill="#4cb9f2" />
                  <path d="M27 14.5L27 17.5 15 16 27 14.5Z" fill="#f3574d" />
                </svg>
                <span className="leading-none"><small className="mb-1 block text-[9px] uppercase">Get it on</small><strong className="text-[17px] tracking-tight">Google Play</strong></span>
              </a>
              <a className="flex h-[63px] w-[167px] items-center gap-2 rounded-[5px] border border-[#5b6665] bg-black px-2.5 text-white transition-transform hover:scale-[1.02]" href="#app">
                <svg className="h-9 w-7 shrink-0" viewBox="0 0 28 36" aria-hidden="true">
                  <path d="M19.2 5.2c1.4-1.7 2.4-4 2.1-5.2-2.1.1-4.5 1.4-5.9 3.1-1.3 1.5-2.5 3.8-2.1 5 2.3.2 4.6-1.2 5.9-2.9Zm6.1 13.1c0-4.4 3.6-6.5 3.7-6.6-2.1-3-5.4-3.4-6.5-3.5-2.8-.3-5.5 1.7-6.9 1.7-1.4 0-3.5-1.7-5.8-1.6-3 .1-5.8 1.8-7.3 4.5-3.1 5.4-.8 13.4 2.2 17.8 1.5 2.1 3.3 4.5 5.7 4.4 2.3-.1 3.2-1.5 6.1-1.5 2.8 0 3.7 1.5 6.1 1.4 2.5 0 4-2.1 5.5-4.3 1.7-2.5 2.4-4.9 2.5-5-.1 0-5.3-2-5.3-7.3Z" fill="white" transform="translate(-1 -1) scale(.9)" />
                </svg>
                <span className="leading-none"><small className="mb-1 block text-[9px]">Download on the</small><strong className="text-[17px] tracking-tight">App Store</strong></span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-6 border-t border-white/10 pt-6 text-xs text-emerald-50/80 md:flex-row md:items-center md:justify-between">
          {/* Copyright Text */}
          <p className="text-xs font-medium text-emerald-50/90">
            © 2026 Buyzo. All Rights Reserved.
          </p>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a href="#instagram" title="Instagram" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-xs hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* Facebook */}
            <a href="#facebook" title="Facebook" className="w-8 h-8 rounded-full bg-[#3b5998] flex items-center justify-center shadow-xs hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* X (formerly Twitter) */}
            <a href="#twitter" title="X" className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-xs hover:scale-110 transition-transform">
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a href="#youtube" title="YouTube" className="w-8 h-8 rounded-full bg-[#ff0000] flex items-center justify-center shadow-xs hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          {/* Payment Methods Section */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-white whitespace-nowrap">
              We Accept
            </span>

            <div className="flex items-center space-x-2">
              {/* VISA */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 min-w-[58px] flex items-center justify-center shadow-xs border border-gray-100">
                <span className="text-[#0f2a96] font-black italic text-sm tracking-wider">
                  VISA
                </span>
              </div>

              {/* Mastercard */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 min-w-[58px] flex items-center justify-center shadow-xs border border-gray-100">
                <div className="flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full bg-[#eb001b] inline-block"></span>
                  <span className="w-4 h-4 rounded-full bg-[#ff5f00] inline-block -ml-2 opacity-95"></span>
                </div>
              </div>

              {/* RuPay */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 min-w-[58px] flex items-center justify-center shadow-xs border border-gray-100">
                <div className="flex items-center text-xs font-black tracking-tight text-[#0a2540]">
                  <span>Ru</span>
                  <span className="text-[#008346]">P</span>
                  <span className="text-[#f37021]">ay</span>
                </div>
              </div>

              {/* UPI */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 min-w-[58px] flex items-center justify-center shadow-xs border border-gray-100">
                <div className="flex items-center space-x-1 text-xs font-extrabold text-gray-800 tracking-wider">
                  <span>UPI</span>
                  <div className="flex flex-col space-y-0.5">
                    <span className="w-1.5 h-1 bg-[#008346] rounded-xs"></span>
                    <span className="w-1.5 h-1 bg-[#f37021] rounded-xs"></span>
                  </div>
                </div>
              </div>

              {/* Wallet / Banking */}
              <div className="bg-white rounded-lg px-3 py-1.5 h-8 min-w-[58px] flex items-center justify-center shadow-xs border border-gray-100">
                <div className="w-5 h-3.5 bg-[#1d2b44] rounded-xs relative flex items-center justify-end pr-0.5">
                  <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}