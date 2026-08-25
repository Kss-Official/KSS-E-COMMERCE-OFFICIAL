import heroHomePageImg from '../../assets/HerohomePage - Copy.png';
import heroHomePage2Img from '../../assets/HerohomePage2.png';
import heroHomePage3Img from '../../assets/HerohomePage3.png';
import { activeCampaign, campaigns } from './campaigns';

const camp = campaigns[activeCampaign];

const slides = [
  {
    id: 1,
    image: heroHomePageImg,
    alt: 'Discover, Shop, Save More - BuyZo',
    bgColor: 'brand-800',
    isDarkTheme: true,
    title: (
      <>
        Discover.<br />Shop. Save More.
      </>
    ),
    subtitle: (
      <>
        Top brands, best prices &amp;<br />
        exclusive offers on every purchase.
      </>
    ),
    titleColor: 'text-white',
    subtitleColor: 'text-white/95',
    primaryBtn: { label: 'Shop Now', page: 'electronics', className: 'bg-accent hover:bg-accent-600 text-white font-bold shadow-md' },
    secondaryBtn: { label: 'Explore Offers', page: 'deals', className: 'bg-white/20 hover:bg-white/30 text-white font-bold backdrop-blur-sm' },
  },
  {
    id: 2,
    image: heroHomePage2Img,
    alt: 'Everyday Gear & Accessories - BuyZo',
    bgColor: 'brand-100',
    isDarkTheme: false,
    title: (
      <>
        Everyday Gear.<br />Smart &amp; Modern.
      </>
    ),
    subtitle: (
      <>
        Premium backpacks, smart audio &amp;<br />
        active essentials for your lifestyle.
      </>
    ),
    titleColor: 'text-brand-900',
    subtitleColor: 'text-gray-600',
    primaryBtn: { label: 'Shop Collection', page: 'fashion', className: 'bg-accent hover:bg-accent-600 text-white font-bold shadow-md' },
    secondaryBtn: { label: 'Explore Offers', page: 'deals', className: 'bg-brand-900/10 hover:bg-brand-900/20 text-brand-900 font-bold backdrop-blur-sm' },
  },
  {
    id: 3,
    image: heroHomePage3Img,
    alt: 'Streetwear & Trending Fashion - BuyZo',
    bgColor: 'brand-50',
    isDarkTheme: false,
    title: (
      <>
        Style Redefined.<br />Fresh &amp; Iconic.
      </>
    ),
    subtitle: (
      <>
        Trending hoodies, signature kicks &amp;<br />
        streetwear essentials at unbeatable prices.
      </>
    ),
    titleColor: 'text-brand-900',
    subtitleColor: 'text-gray-600',
    primaryBtn: { label: 'Shop Fashion', page: 'fashion', className: 'bg-accent hover:bg-accent-600 text-white font-bold shadow-md' },
    secondaryBtn: { label: 'Explore Offers', page: 'deals', className: 'bg-brand-900/10 hover:bg-brand-900/20 text-brand-900 font-bold backdrop-blur-sm' },
  },
  {
    id: 4,
    alt: `${camp.label} - ${camp.ornament}`,
    bgColor: camp.palette.bg,
    isDarkTheme: true,
    isCampaign: true,
    campaign: camp,
  },
];

export default slides;
