import { Gift, Shirt, Watch, Sparkles, Home } from 'lucide-react';
import rakhiVisualImg from '../../assets/rakhi_hero_visual.png';
import rakhiFullBanner from '../../assets/rakhi_full_banner.png';

export const activeCampaign = 'rakhi';

export const campaigns = {
  rakhi: {
    id: 'rakhi',
    label: 'RAKHI SPECIAL',
    ornament: 'SHUBH RAKSHABANDHAN',
    headline: ['More Love.', 'More Gifts.', 'More Savings.'],
    subtitle:
      'Celebrate the bond of love with special Rakhi deals on fashion & more!',
    cta: { label: 'Shop Rakhi Deals', page: 'deals' },
    badge: 'UP TO 60% OFF',
    palette: {
      bg: 'crimson',
      glow1: 'gold',
      glow2: 'accent',
      accentText: 'gold',
    },
    visual: rakhiVisualImg,
    bannerImage: rakhiFullBanner,
    benefits: [
      { icon: Gift, title: 'Rakhi Gifts', desc: 'For Every Bond' },
      { icon: Shirt, title: 'Fashion', desc: 'For Everyone' },
      { icon: Watch, title: 'Accessories', desc: 'For Every Style' },
    ],
    discount: '60%',
    countdownTo: 'Rakhi Sale Ends In',
  },
  diwali: {
    id: 'diwali',
    label: 'DIWALI DHAMAKA',
    ornament: 'शुभ दीपावली',
    headline: ['Light Up Your', 'Festival of Lights', 'Save Big!'],
    subtitle:
      'Diyas, décor, gifts & electronics — celebrate Diwali with sparkling savings.',
    cta: { label: 'Shop Diwali Deals', page: 'deals' },
    badge: 'FLAT 50% OFF',
    palette: {
      bg: 'night',
      glow1: 'gold',
      glow2: 'amber',
      accentText: 'gold',
    },
    visual: rakhiVisualImg,
    bannerImage: rakhiFullBanner,
    benefits: [
      { icon: Sparkles, title: 'Décor & Diyas', desc: 'Warm Celebrations' },
      { icon: Home, title: 'Home Makeover', desc: 'Festive Refresh' },
      { icon: Gift, title: 'Gifting', desc: 'For Everyone' },
    ],
    discount: '50%',
    countdownTo: 'Diwali Sale Ends In',
  },
};
