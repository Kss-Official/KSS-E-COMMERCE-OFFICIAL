import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

// Import the exact cropped artwork
import rakhiCollectionImg from '../../assets/new_arrivals/rakhi_collection.jpg';
import shararaSetsImg from '../../assets/new_arrivals/sharara_sets.jpg';
import ethnicJuttisImg from '../../assets/new_arrivals/ethnic_juttis.jpg';
import kidsEthnicSetsImg from '../../assets/new_arrivals/kids_ethnic_sets.jpg';
import templeJewelleryImg from '../../assets/new_arrivals/temple_jewellery.jpg';

const CURATED_CARDS = [
  {
    id: 'na-1',
    title: 'Rakhi Collection',
    subtitle: 'Festive Faves',
    priceText: 'From ₹699',
    priceColor: '#ff680d',
    buttonColor: '#0d6efd',
    image: rakhiCollectionImg,
    targetPage: 'fashion'
  },
  {
    id: 'na-2',
    title: 'Sharara Sets',
    subtitle: 'Elegant & Timeless',
    priceText: 'Min 20% Off',
    priceColor: '#0d6efd',
    buttonColor: '#0d6efd',
    image: shararaSetsImg,
    targetPage: 'fashion',

  },
  {
    id: 'na-3',
    title: 'Ethnic Juttis',
    subtitle: 'Crafted to Perfection',
    priceText: 'Under ₹999',
    priceColor: '#ff680d',
    buttonColor: '#ff680d',
    image: ethnicJuttisImg,
    targetPage: 'fashion'
  },
  {
    id: 'na-4',
    title: "Kids' Ethnic Sets",
    subtitle: 'Cute. Comfortable. Colorful.',
    priceText: 'Under ₹599',
    priceColor: '#0d6efd',
    buttonColor: '#0d6efd',
    image: kidsEthnicSetsImg,
    targetPage: 'fashion'
  },
  {
    id: 'na-5',
    title: 'Temple Jewellery',
    subtitle: 'Tradition in Every Detail',
    priceText: 'Under ₹1,499',
    priceColor: '#ff680d',
    buttonColor: '#0d6efd',
    image: templeJewelleryImg,
    targetPage: 'fashion'
  }
];

export default function NewArrivalsCuratedCards() {
  const { navigateTo } = useNavigationContext();

  return (
    <section className="w-full max-w-7xl mx-auto">
      {/* Background Container with subtle sky-blue gradient */}
      <div className="bg-gradient-to-b from-[#eaf4ff] via-[#f3f8ff] to-[#ffffff] rounded-3xl p-5 sm:p-7 md:p-5 border border-sky-100/90 shadow-xs">

        {/* 5-Card Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4.5 items-stretch">
          {CURATED_CARDS.map((card) => {
            return (
              <div
                key={card.id}
                onClick={() => navigateTo(card.targetPage)}
                className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm hover:shadow-xl border border-gray-100/90 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group cursor-pointer overflow-hidden"
              >
                {/* Clean Artwork Container */}
                <div className="w-full overflow-hidden rounded-2xl bg-gray-50/50 flex items-center justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-auto object-cover rounded-2xl group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Card Information */}
                <div className="mt-3 space-y-1 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#102a45] leading-snug group-hover:text-brand-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Price & Action Arrow Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                    <span
                      className="text-xs sm:text-sm font-black"
                      style={{ color: card.priceColor }}
                    >
                      {card.priceText}
                    </span>

                    <button
                      aria-label={`View ${card.title}`}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: card.buttonColor }}
                    >
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
