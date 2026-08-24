import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders above ₹499'
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '7 days return policy'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: '100% secure payments'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Dedicated support'
  }
];

export default function FeatureHighlights() {
  return (
    <div className="mx-3 sm:mx-6 lg:mx-8 -mt-3 sm:-mt-4 md:-mt-5 lg:-mt-6 relative z-20 bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 px-4 sm:px-8 py-4 sm:py-5 shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={`flex items-center space-x-3.5 ${
                i === 0 ? 'sm:pr-6' : i === features.length - 1 ? 'sm:pl-6' : 'sm:px-6'
              } py-2 sm:py-0`}
            >
              <div className="shrink-0 text-[#042d24]">
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm sm:text-[15px] leading-tight tracking-tight">
                  {f.title}
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
