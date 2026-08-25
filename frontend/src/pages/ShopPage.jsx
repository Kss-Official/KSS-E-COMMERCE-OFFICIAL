import React, { useState, useMemo } from 'react';
import {
  Heart,
  LayoutGrid,
  List,
  ChevronRight,
  Filter,
  ChevronDown,
  Check,
  ShieldCheck,
  RotateCcw,
  Tag,
  Award,
  ShoppingCart,
  Star,
  Sparkles
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import all product image assets
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';
import dellLaptopImg from '../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import appleMacbookImg from '../assets/images/apple_macbook.png';
import roadsterShirtImg from '../assets/images/roadster_shirt.jpg';
import usPoloTshirtImg from '../assets/images/us_polo_tshirt.jpg';
import bibaKurtaImg from '../assets/images/biba_kurta.jpg';
import lavieHandbagImg from '../assets/images/lavie_handbag.jpg';
import pumaShoesImg from '../assets/images/puma_shoes.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';
import accentChairImg from '../assets/images/accent_chair.jpg';
import loungeChairImg from '../assets/images/lounge_chair.jpg';
import redmiNote13Img from '../assets/images/redmi_note13.jpg';
import samsungS24UltraImg from '../assets/images/samsung_s24_ultra.jpg';
import iphone15ProImg from '../assets/images/iphone_15_pro.jpg';
import oneplus12Img from '../assets/images/oneplus_12.jpg';
import pixel8ProImg from '../assets/images/pixel_8_pro.jpg';
import vivoV30ProImg from '../assets/images/vivo_v30_pro.jpg';
import nothingPhone2Img from '../assets/images/nothing_phone_2.jpg';
import boatAirdopesImg from '../assets/images/boat_airdopes.png';
import cameraCanonImg from '../assets/images/camera_canon.jpg';
import goproCamImg from '../assets/images/gopro_action_cam.jpg';
import womenDressImg from '../assets/images/women_dress.jpg';
import fashionChinosImg from '../assets/images/fashion_chinos.jpg';
import fashionDenimJacketImg from '../assets/images/fashion_denim_jacket.jpg';
import fashionSilkKurtiImg from '../assets/images/fashion_silk_kurti.jpg';
import fashionStreetSneakersImg from '../assets/images/fashion_street_sneakers.jpg';
import fashionSweatshirtImg from '../assets/images/fashion_sweatshirt.jpg';

// Home & Kitchen realistic assets
import cookwareSetImg from '../assets/images/hk_cookware_set.jpg';
import pendantLampImg from '../assets/images/hk_pendant_lamp.jpg';
import airFryerImg from '../assets/images/hk_air_fryer.jpg';
import cottonBedsheetImg from '../assets/images/hk_cotton_bedsheet.png';
import pressureCookerImg from '../assets/images/hk_pressure_cooker.jpg';
import casseroleSetImg from '../assets/images/hk_casserole_set.png';
import memoryPillowImg from '../assets/images/hk_memory_pillow.jpg';
import mixerGrinderImg from '../assets/images/hk_mixer_grinder.jpg';
import ceramicDinnerSetImg from '../assets/images/hk_ceramic_dinner_set.png';
import wallShelvesImg from '../assets/images/hk_wall_shelves.png';

// Beauty realistic assets
import beautyNiacinamideSerumImg from '../assets/images/beauty_niacinamide_serum.jpg';
import beautyMatteLipstickImg from '../assets/images/beauty_matte_lipstick.jpg';
import beautySunscreenGelImg from '../assets/images/beauty_sunscreen_gel.png';
import beautyArganHairSerumImg from '../assets/images/beauty_argan_hair_serum.jpg';
import beautyOudPerfumeImg from '../assets/images/beauty_oud_perfume.jpg';
import beautyCcCreamImg from '../assets/images/beauty_cc_cream.png';
import beautyOnionHairOilImg from '../assets/images/beauty_onion_hair_oil.png';
import beautyVitaminCFacewashImg from '../assets/images/beauty_vitamin_c_facewash.png';
import beautyMascaraImg from '../assets/images/beauty_mascara.jpg';
import beautyCeramideCreamImg from '../assets/images/beauty_ceramide_cream.png';
import beautyCherryBodywashImg from '../assets/images/beauty_cherry_bodywash.png';
import beautyRosewaterMistImg from '../assets/images/beauty_rosewater_mist.jpg';

// Category SVGs
import mobileCategorySvg from '../assets/category/categoryMobile.svg';
import laptopCategorySvg from '../assets/category/categoryLaptop.svg';
import electronicsCategorySvg from '../assets/category/categoryElectronics.svg';
import fashionCategorySvg from '../assets/category/categoryFashion.svg';
import homeCategorySvg from '../assets/category/CategoryHome & kitchen.svg';
import beautyCategorySvg from '../assets/category/categoryBeauty.svg';
import shoesCategorySvg from '../assets/category/categoryShoes.svg';
import bagsCategorySvg from '../assets/category/categoryBags & luddages.svg';

const categoriesList = [
  { id: 'All', name: 'All Products', icon: null },
  { id: 'Mobiles', name: 'Mobiles', icon: mobileCategorySvg },
  { id: 'Laptops', name: 'Laptops', icon: laptopCategorySvg },
  { id: 'Electronics', name: 'Electronics', icon: electronicsCategorySvg },
  { id: 'Fashion', name: 'Fashion', icon: fashionCategorySvg },
  { id: 'Home & Kitchen', name: 'Home & Kitchen', icon: homeCategorySvg },
  { id: 'Beauty', name: 'Beauty', icon: beautyCategorySvg },
  { id: 'Footwear', name: 'Footwear', icon: shoesCategorySvg },
  { id: 'Bags & Luggage', name: 'Bags & Luggage', icon: bagsCategorySvg }
];

const allShopProducts = [
  // --- MOBILES ---
  {
    id: 'mob-1',
    name: 'Redmi Note 13 Pro 5G (8GB RAM, 256GB)',
    brand: 'Xiaomi',
    category: 'Mobiles',
    image: redmiNote13Img,
    price: 18999,
    originalPrice: 24999,
    discount: '24% OFF',
    rating: 4.5,
    reviewsCount: 3120,
    popularity: 99,
    isNew: true,
    description: 'Ultra-clear 200MP camera, 120Hz AMOLED display and superfast 67W Turbo Charge.'
  },
  {
    id: 'mob-2',
    name: 'Samsung Galaxy S24 Ultra 5G (12GB, 256GB)',
    brand: 'Samsung',
    category: 'Mobiles',
    image: samsungS24UltraImg,
    price: 129999,
    originalPrice: 139999,
    discount: '7% OFF',
    rating: 4.9,
    reviewsCount: 4500,
    popularity: 98,
    badge: 'Flagship',
    description: 'Galaxy AI with built-in S-Pen, titanium frame and 200MP quad telephoto zoom.'
  },
  {
    id: 'mob-3',
    name: 'Apple iPhone 15 Pro (128GB, Natural Titanium)',
    brand: 'Apple',
    category: 'Mobiles',
    image: iphone15ProImg,
    price: 127990,
    originalPrice: 134900,
    discount: '5% OFF',
    rating: 4.8,
    reviewsCount: 3890,
    popularity: 97,
    description: 'A17 Pro chip, aerospace-grade titanium design and custom Action button.'
  },
  {
    id: 'mob-4',
    name: 'OnePlus 12 5G (16GB RAM, 512GB Storage)',
    brand: 'OnePlus',
    category: 'Mobiles',
    image: oneplus12Img,
    price: 64999,
    originalPrice: 69999,
    discount: '7% OFF',
    rating: 4.7,
    reviewsCount: 2180,
    popularity: 94,
    description: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System and 100W SuperVOOC.'
  },
  {
    id: 'mob-5',
    name: 'Google Pixel 8 Pro (128GB, Obsidian Black)',
    brand: 'Google',
    category: 'Mobiles',
    image: pixel8ProImg,
    price: 98999,
    originalPrice: 106999,
    discount: '7% OFF',
    rating: 4.6,
    reviewsCount: 1640,
    popularity: 90,
    description: 'Google Tensor G3 chip, fully upgraded pro camera system and next-gen AI features.'
  },
  {
    id: 'mob-6',
    name: 'Vivo V30 Pro 5G (ZEISS Portrait Camera)',
    brand: 'Vivo',
    category: 'Mobiles',
    image: vivoV30ProImg,
    price: 41999,
    originalPrice: 46999,
    discount: '11% OFF',
    rating: 4.5,
    reviewsCount: 1420,
    popularity: 88,
    description: 'Studio-quality portrait photography with ZEISS optics and ultra-slim 3D curved display.'
  },
  {
    id: 'mob-7',
    name: 'Nothing Phone (2) 5G (Glyph Interface, 256GB)',
    brand: 'Nothing',
    category: 'Mobiles',
    image: nothingPhone2Img,
    price: 36999,
    originalPrice: 49999,
    discount: '26% OFF',
    rating: 4.5,
    reviewsCount: 1980,
    popularity: 89,
    description: 'Iconic transparent design with customizable Glyph LED lighting and Nothing OS 2.5.'
  },

  // --- LAPTOPS ---
  {
    id: 'lap-1',
    name: 'Apple MacBook Air M2 (13.6-inch, 8GB/256GB SSD)',
    brand: 'Apple',
    category: 'Laptops',
    image: appleMacbookImg,
    price: 89990,
    originalPrice: 114900,
    discount: '22% OFF',
    rating: 4.9,
    reviewsCount: 3400,
    popularity: 99,
    badge: 'Bestseller',
    description: 'Strikingly thin design, blazing-fast M2 chip, 18 hours of battery life and Liquid Retina display.'
  },
  {
    id: 'lap-2',
    name: 'HP 15s Ryzen 5 5500U (16GB RAM, 512GB SSD)',
    brand: 'HP',
    category: 'Laptops',
    image: hpLaptopImg,
    price: 39990,
    originalPrice: 52999,
    discount: '25% OFF',
    rating: 4.4,
    reviewsCount: 2200,
    popularity: 96,
    isNew: true,
    description: 'FHD micro-edge display, dual speakers, fast charge and Windows 11 with MS Office.'
  },
  {
    id: 'lap-3',
    name: 'Dell Inspiron 15 3520 (12th Gen i5, 16GB, 512GB)',
    brand: 'Dell',
    category: 'Laptops',
    image: dellLaptopImg,
    price: 47990,
    originalPrice: 62990,
    discount: '24% OFF',
    rating: 4.3,
    reviewsCount: 1850,
    popularity: 91,
    description: '120Hz smooth FHD anti-glare display, lift-hinge ergonomics and ExpressCharge.'
  },

  // --- ELECTRONICS & AUDIO ---
  {
    id: 'elec-1',
    name: 'boAt Rockerz 450 Bluetooth On-Ear Headphones',
    brand: 'boAt',
    category: 'Electronics',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 3999,
    discount: '56% OFF',
    rating: 4.5,
    reviewsCount: 8400,
    popularity: 99,
    isNew: true,
    description: '40mm dynamic drivers, up to 15 hours continuous playback and soft padded ear cushions.'
  },
  {
    id: 'elec-2',
    name: 'Noise ColorFit Pro 5 Smartwatch with AMOLED Display',
    brand: 'Noise',
    category: 'Electronics',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    rating: 4.6,
    reviewsCount: 4200,
    popularity: 97,
    description: '1.85-inch HD AMOLED screen, Bluetooth calling with TruSync, and 100+ sports modes.'
  },
  {
    id: 'elec-3',
    name: 'Sony WH-CH510 Wireless On-Ear Headphones',
    brand: 'Sony',
    category: 'Electronics',
    image: sonyHeadphonesImg,
    price: 2499,
    originalPrice: 3999,
    discount: '37% OFF',
    rating: 4.5,
    reviewsCount: 3950,
    popularity: 95,
    description: 'Lightweight swivel design, up to 35 hours battery life with quick 10-min USB-C charging.'
  },
  {
    id: 'elec-4',
    name: 'JBL Flip Essential 2 Portable Bluetooth Speaker',
    brand: 'JBL',
    category: 'Electronics',
    image: jblSpeakerImg,
    price: 4499,
    originalPrice: 6999,
    discount: '35% OFF',
    rating: 4.7,
    reviewsCount: 5100,
    popularity: 96,
    description: 'Signature JBL Original Pro Sound, IPX7 waterproof fabric body and 10 hours playtime.'
  },
  {
    id: 'elec-5',
    name: 'boAt Airdopes 141 True Wireless Earbuds',
    brand: 'boAt',
    category: 'Electronics',
    image: boatAirdopesImg,
    price: 1199,
    originalPrice: 4490,
    discount: '73% OFF',
    rating: 4.4,
    reviewsCount: 9200,
    popularity: 94,
    description: '42 hours total playtime, ENx noise cancellation for calls, and ASAP fast charge.'
  },
  {
    id: 'elec-6',
    name: 'Canon EOS 3000D DSLR Camera (18-55mm Lens)',
    brand: 'Canon',
    category: 'Electronics',
    image: cameraCanonImg,
    price: 33990,
    originalPrice: 39995,
    discount: '15% OFF',
    rating: 4.6,
    reviewsCount: 1750,
    popularity: 87,
    description: '18MP APS-C CMOS sensor, 9-point AF system and built-in Wi-Fi for instant smartphone sharing.'
  },
  {
    id: 'elec-7',
    name: 'GoPro HERO12 Black Waterproof Action Camera',
    brand: 'GoPro',
    category: 'Electronics',
    image: goproCamImg,
    price: 37990,
    originalPrice: 45000,
    discount: '16% OFF',
    rating: 4.8,
    reviewsCount: 1120,
    popularity: 89,
    description: '5.3K60 HDR video, HyperSmooth 6.0 stabilization and rugged waterproof design up to 33ft.'
  },

  // --- FASHION ---
  {
    id: 'fash-1',
    name: "Women's Floral Fit & Flare Summer Dress",
    brand: 'Zara',
    category: 'Fashion',
    image: womenDressImg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    rating: 4.6,
    reviewsCount: 840,
    popularity: 98,
    isNew: true,
    description: 'Breezy botanical print A-line dress crafted from breathable modal cotton.'
  },
  {
    id: 'fash-2',
    name: "Men's Regular Fit Casual Oxford Shirt",
    brand: 'Roadster',
    category: 'Fashion',
    image: roadsterShirtImg,
    price: 899,
    originalPrice: 1999,
    discount: '55% OFF',
    rating: 4.4,
    reviewsCount: 1250,
    popularity: 95,
    description: 'Pure cotton washed oxford button-down shirt designed for all-day comfort.'
  },
  {
    id: 'fash-3',
    name: "Men's Solid Slim Fit Polo T-Shirt",
    brand: 'U.S. Polo Assn.',
    category: 'Fashion',
    image: usPoloTshirtImg,
    price: 1199,
    originalPrice: 2499,
    discount: '52% OFF',
    rating: 4.5,
    reviewsCount: 960,
    popularity: 93,
    description: 'Classic pique cotton polo with embroidered signature double-horseman emblem.'
  },
  {
    id: 'fash-4',
    name: 'Biba Festive Embroidered Silk Kurta Set',
    brand: 'Biba',
    category: 'Fashion',
    image: bibaKurtaImg,
    price: 2799,
    originalPrice: 5999,
    discount: '53% OFF',
    rating: 4.7,
    reviewsCount: 680,
    popularity: 92,
    description: 'Exquisite zari and thread embroidery on Chanderi silk fabric with matched palazzo pants.'
  },
  {
    id: 'fash-5',
    name: 'Classic Urban Vintage Denim Jacket',
    brand: "Levi's",
    category: 'Fashion',
    image: fashionDenimJacketImg,
    price: 2499,
    originalPrice: 4999,
    discount: '50% OFF',
    rating: 4.7,
    reviewsCount: 780,
    popularity: 94,
    description: 'Heavyweight vintage washed denim jacket with metal shank buttons and tailored fit.'
  },
  {
    id: 'fash-6',
    name: 'Premium Chino Trousers Slim Fit',
    brand: 'Allen Solly',
    category: 'Fashion',
    image: fashionChinosImg,
    price: 1399,
    originalPrice: 2799,
    discount: '50% OFF',
    rating: 4.3,
    reviewsCount: 610,
    popularity: 88,
    description: 'Stretch-infused cotton twill chinos offering clean tailored silhouette for office or evening.'
  },
  {
    id: 'fash-7',
    name: 'Oversized Fleece Streetwear Sweatshirt',
    brand: 'H&M',
    category: 'Fashion',
    image: fashionSweatshirtImg,
    price: 1499,
    originalPrice: 2499,
    discount: '40% OFF',
    rating: 4.6,
    reviewsCount: 920,
    popularity: 90,
    description: 'Heavyweight brushed fleece with ribbed trim and relaxed streetwear drop-shoulder fit.'
  },
  {
    id: 'fash-8',
    name: 'Pure Silk Embroidered Partywear Kurti',
    brand: 'W for Woman',
    category: 'Fashion',
    image: fashionSilkKurtiImg,
    price: 1899,
    originalPrice: 3999,
    discount: '52% OFF',
    rating: 4.5,
    reviewsCount: 450,
    popularity: 86,
    description: 'Rich hand-worked zari neck detailing on pure raw silk with breathable cotton lining.'
  },

  // --- HOME & KITCHEN ---
  {
    id: 'hk-1',
    name: 'Modern Ergonomic Velvet Accent Armchair',
    brand: 'UrbanHome',
    category: 'Home & Kitchen',
    image: accentChairImg,
    price: 6999,
    originalPrice: 11999,
    discount: '42% OFF',
    rating: 4.8,
    reviewsCount: 1420,
    popularity: 99,
    isNew: true,
    description: 'Plush high-density foam cushioned armchair with solid teak wood legs and ergonomic lumbar support.'
  },
  {
    id: 'hk-2',
    name: 'Contemporary Nordic Lounge Relaxing Recliner Chair',
    brand: 'UrbanHome',
    category: 'Home & Kitchen',
    image: loungeChairImg,
    price: 8499,
    originalPrice: 14999,
    discount: '43% OFF',
    rating: 4.7,
    reviewsCount: 980,
    popularity: 97,
    description: 'Minimalist Scandinavian lounge chair with reinforced steel frame and removable washable upholstery.'
  },
  {
    id: 'hk-3',
    name: 'Tri-Ply Stainless Steel 5-Piece Induction Cookware Set',
    brand: 'Prestige',
    category: 'Home & Kitchen',
    image: cookwareSetImg,
    price: 3499,
    originalPrice: 5999,
    discount: '42% OFF',
    rating: 4.6,
    reviewsCount: 2850,
    popularity: 95,
    description: 'Heavy gauge 3-ply base for uniform heat distribution without hot spots, includes toughened glass lids.'
  },
  {
    id: 'hk-4',
    name: 'Nordic Minimalist Geometric Pendant Hanging Ceiling Lamp',
    brand: 'Solimo',
    category: 'Home & Kitchen',
    image: pendantLampImg,
    price: 1899,
    originalPrice: 3499,
    discount: '46% OFF',
    rating: 4.5,
    reviewsCount: 1120,
    popularity: 93,
    description: 'Architectural hanging pendant chandelier lamp with adjustable drop cord and E27 warm LED socket.'
  },
  {
    id: 'hk-5',
    name: 'Digital Touch Screen Rapid Air Fryer 4.5L (1400W)',
    brand: 'Philips',
    category: 'Home & Kitchen',
    image: airFryerImg,
    price: 5499,
    originalPrice: 8999,
    discount: '39% OFF',
    rating: 4.7,
    reviewsCount: 3600,
    popularity: 98,
    description: 'Patented rapid air convection technology for crispy guilt-free snacks with 8 digital preset menus.'
  },
  {
    id: 'hk-6',
    name: '100% Pure Egyptian Cotton King Size Bedsheet Set',
    brand: 'Bombay Dyeing',
    category: 'Home & Kitchen',
    image: cottonBedsheetImg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    rating: 4.6,
    reviewsCount: 2150,
    popularity: 92,
    description: 'Silky smooth breathable luxury king bedsheet that gets softer with every wash, fade-resistant dyes.'
  },
  {
    id: 'hk-7',
    name: 'Hard Anodized 3L Pressure Cooker with Inner Lid',
    brand: 'Hawkins',
    category: 'Home & Kitchen',
    image: pressureCookerImg,
    price: 1799,
    originalPrice: 2499,
    discount: '28% OFF',
    rating: 4.8,
    reviewsCount: 6400,
    popularity: 96,
    description: 'Heavy duty corrosion-proof pressure cooker engineered with pressure locked safety lid and stay-cool handle.'
  },
  {
    id: 'hk-8',
    name: 'Double-Walled Stainless Steel Insulated Casserole Set (3-Pcs)',
    brand: 'Milton',
    category: 'Home & Kitchen',
    image: casseroleSetImg,
    price: 1299,
    originalPrice: 2199,
    discount: '41% OFF',
    rating: 4.5,
    reviewsCount: 3100,
    popularity: 91,
    description: 'Mirror-finish stainless steel hot pot casseroles with PUF insulation keeping food piping hot for 6+ hours.'
  },
  {
    id: 'hk-9',
    name: 'Ergonomic Slow Rebound Memory Foam Orthopedic Pillow',
    brand: 'Wakefit',
    category: 'Home & Kitchen',
    image: memoryPillowImg,
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    rating: 4.7,
    reviewsCount: 4800,
    popularity: 94,
    description: 'Contour cervical neck support pillow with breathable bamboo cover for deep pain-free sleep.'
  },
  {
    id: 'hk-10',
    name: '750W Heavy Duty Mixer Grinder with 3 Stainless Steel Jars',
    brand: 'Bajaj',
    category: 'Home & Kitchen',
    image: mixerGrinderImg,
    price: 2499,
    originalPrice: 4299,
    discount: '42% OFF',
    rating: 4.4,
    reviewsCount: 5200,
    popularity: 90,
    description: 'Titanium motor with overload protector, super-sharp multipurpose stainless steel blades.'
  },
  {
    id: 'hk-11',
    name: 'Handcrafted 16-Piece Ceramic Matte Stoneware Dinner Set',
    brand: 'Corelle',
    category: 'Home & Kitchen',
    image: ceramicDinnerSetImg,
    price: 2999,
    originalPrice: 5499,
    discount: '45% OFF',
    rating: 4.6,
    reviewsCount: 1650,
    popularity: 89,
    description: 'Microwave and dishwasher safe artisan crafted stoneware plates, bowls and serving platters.'
  },
  {
    id: 'hk-12',
    name: 'Floating Wall Display Shelves Set of 3 (Interlocking)',
    brand: 'Solimo',
    category: 'Home & Kitchen',
    image: wallShelvesImg,
    price: 799,
    originalPrice: 1499,
    discount: '47% OFF',
    rating: 4.3,
    reviewsCount: 1980,
    popularity: 86,
    description: 'Engineered wood wall mount display racks for books, plants and decorative showpieces.'
  },

  // --- BEAUTY ---
  {
    id: 'beauty-1',
    name: '10% Niacinamide & Zinc Clarifying Face Serum (30ml)',
    brand: 'Minimalist',
    category: 'Beauty',
    image: beautyNiacinamideSerumImg,
    price: 599,
    originalPrice: 799,
    discount: '25% OFF',
    rating: 4.8,
    reviewsCount: 4200,
    popularity: 99,
    isNew: true,
    description: 'Nourishing oil-free daily serum formulated with pure fermented Niacinamide to diminish spots and balance sebum.'
  },
  {
    id: 'beauty-2',
    name: 'Matte Liquid Velvet Long-Wear Lipstick (5.5ml)',
    brand: 'Maybelline',
    category: 'Beauty',
    image: beautyMatteLipstickImg,
    price: 649,
    originalPrice: 999,
    discount: '35% OFF',
    rating: 4.7,
    reviewsCount: 6800,
    popularity: 98,
    description: 'Transfer-proof pigmented liquid matte formula infused with arrowroot for non-drying lightweight all-day wear.'
  },
  {
    id: 'beauty-3',
    name: 'Hyaluronic Water-Gel Ultralight Sunscreen SPF 50+ PA++++',
    brand: 'Plum',
    category: 'Beauty',
    image: beautySunscreenGelImg,
    price: 499,
    originalPrice: 750,
    discount: '33% OFF',
    rating: 4.6,
    reviewsCount: 3100,
    popularity: 95,
    description: 'Ultra-lightweight invisible broad-spectrum gel sunscreen loaded with hyaluronic acid and niacinamide.'
  },
  {
    id: 'beauty-4',
    name: 'Moroccan Argan Oil Hair Recovery Serum & Heat Protectant',
    brand: "L'Oréal Paris",
    category: 'Beauty',
    image: beautyArganHairSerumImg,
    price: 799,
    originalPrice: 1299,
    discount: '38% OFF',
    rating: 4.7,
    reviewsCount: 5400,
    popularity: 96,
    description: 'Weightless nourishing hair oil elixir that tames frizz, locks in glossy mirror shine, and shields against heat styling.'
  },
  {
    id: 'beauty-5',
    name: 'Royal Amber & Velvet Oud Luxury Eau De Parfum (100ml)',
    brand: 'Forest Essentials',
    category: 'Beauty',
    image: beautyOudPerfumeImg,
    price: 1899,
    originalPrice: 2999,
    discount: '37% OFF',
    rating: 4.9,
    reviewsCount: 1850,
    popularity: 94,
    description: 'Enchanting artisanal fragrance blending rare smoky Agarwood, golden Amber, and delicate Damascene Rose.'
  },
  {
    id: 'beauty-6',
    name: 'All-Day Radiance Skin Perfecting CC Cream SPF 30 (40g)',
    brand: 'Lakmé',
    category: 'Beauty',
    image: beautyCcCreamImg,
    price: 349,
    originalPrice: 499,
    discount: '30% OFF',
    rating: 4.4,
    reviewsCount: 4900,
    popularity: 91,
    description: 'Multi-benefit color correction moisturizer that evens skin tone, conceals redness, and provides natural dewy glow.'
  },
  {
    id: 'beauty-7',
    name: 'Red Onion Hair Growth Oil with Black Seed Extract (200ml)',
    brand: 'WOW Skin Science',
    category: 'Beauty',
    image: beautyOnionHairOilImg,
    price: 399,
    originalPrice: 599,
    discount: '33% OFF',
    rating: 4.5,
    reviewsCount: 7200,
    popularity: 93,
    description: 'Cold-pressed botanical oil blend packed with sulfur and antioxidants to strengthen hair follicles and reduce hair fall.'
  },
  {
    id: 'beauty-8',
    name: 'Vitamin C Glowing Daily Foaming Facewash (150ml)',
    brand: 'Mamaearth',
    category: 'Beauty',
    image: beautyVitaminCFacewashImg,
    price: 349,
    originalPrice: 499,
    discount: '30% OFF',
    rating: 4.6,
    reviewsCount: 8900,
    popularity: 95,
    description: 'Gentle clarifying face wash with turmeric and vitamin C beads that deep cleanses pores without stripping natural moisture.'
  },
  {
    id: 'beauty-9',
    name: 'Volumizing & Lengthening 24H Waterproof Mascara',
    brand: 'Colorbar',
    category: 'Beauty',
    image: beautyMascaraImg,
    price: 549,
    originalPrice: 850,
    discount: '35% OFF',
    rating: 4.6,
    reviewsCount: 3600,
    popularity: 90,
    description: 'Hourglass silicone brush wand coats every lash from root to tip for clump-free dramatic false-lash volume.'
  },
  {
    id: 'beauty-10',
    name: 'Ceramide & Hyaluronic Barrier Repair Cream (100g)',
    brand: 'Dot & Key',
    category: 'Beauty',
    image: beautyCeramideCreamImg,
    price: 495,
    originalPrice: 695,
    discount: '29% OFF',
    rating: 4.7,
    reviewsCount: 2900,
    popularity: 92,
    description: 'Intense comforting moisturizer with 5 essential ceramides and probiotics to heal damaged, dry, or sensitized skin barriers.'
  },
  {
    id: 'beauty-11',
    name: 'Japanese Cherry Blossom Nourishing Body Wash (300ml)',
    brand: 'The Body Shop',
    category: 'Beauty',
    image: beautyCherryBodywashImg,
    price: 695,
    originalPrice: 995,
    discount: '30% OFF',
    rating: 4.8,
    reviewsCount: 2100,
    popularity: 89,
    description: 'Luxuriously rich lathering shower gel with organic cherry blossom petals and moisturizing aloe vera.'
  },
  {
    id: 'beauty-12',
    name: 'Pure Organic Steam-Distilled Rosewater Mist (200ml)',
    brand: 'Kama Ayurveda',
    category: 'Beauty',
    image: beautyRosewaterMistImg,
    price: 450,
    originalPrice: 650,
    discount: '31% OFF',
    rating: 4.8,
    reviewsCount: 5600,
    popularity: 94,
    description: '100% natural pure floral water made from freshly plucked Kannauj roses that tones, hydrates, and tightens pores.'
  },

  // --- FOOTWEAR ---
  {
    id: 'foot-1',
    name: "Puma Nitro Fuel Men's Road Running Shoes",
    brand: 'Puma',
    category: 'Footwear',
    image: pumaShoesImg,
    price: 3499,
    originalPrice: 6999,
    discount: '50% OFF',
    rating: 4.7,
    reviewsCount: 1420,
    popularity: 97,
    isNew: true,
    description: 'Engineered mesh upper with responsive Nitro foam midsole for explosive energy return.'
  },
  {
    id: 'foot-2',
    name: 'Streetwear Chunky Platform Low-Top Sneakers',
    brand: 'UrbanStreet',
    category: 'Footwear',
    image: fashionStreetSneakersImg,
    price: 2199,
    originalPrice: 3999,
    discount: '45% OFF',
    rating: 4.6,
    reviewsCount: 1180,
    popularity: 93,
    description: 'Bold retro chunky silhouette with shock-absorbing EVA rubber outsole and cushioned collar.'
  },

  // --- BAGS & LUGGAGE ---
  {
    id: 'bag-1',
    name: 'Teal Ergonomic 25L Water-Resistant Laptop Backpack',
    brand: 'Wildcraft',
    category: 'Bags & Luggage',
    image: tealBackpackImg,
    price: 1199,
    originalPrice: 2499,
    discount: '52% OFF',
    rating: 4.5,
    reviewsCount: 2600,
    popularity: 95,
    isNew: true,
    description: 'Padded 15.6-inch laptop compartment, organizer pockets and reinforced weather-resistant polyester.'
  },
  {
    id: 'bag-2',
    name: 'Lavie Structured Vegan Leather Shoulder Handbag',
    brand: 'Lavie',
    category: 'Bags & Luggage',
    image: lavieHandbagImg,
    price: 1699,
    originalPrice: 3999,
    discount: '58% OFF',
    rating: 4.6,
    reviewsCount: 1540,
    popularity: 92,
    description: 'Premium textured faux leather with gold metallic hardware and spacious multi-zip compartments.'
  }
];

export default function ShopPage() {
  const { navigateTo } = useNavigationContext();
  const { toggleWishlist, wishlistItems, addToCart } = useCartContext();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('popularity');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    setToastMessage(`"${product.name}" added to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();
    const wasWished = wishlistItems?.some((item) => item.id === product.id);
    toggleWishlist(product);
    setToastMessage(
      wasWished
        ? `Removed "${product.name}" from your wishlist`
        : `Added "${product.name}" to your wishlist!`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...allShopProducts];

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === 'popularity') {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, sortBy]);

  const isWishlisted = (id) => {
    return wishlistItems?.some((item) => item.id === id);
  };

  // Calculate live count for each category
  const getCategoryCount = (catId) => {
    if (catId === 'All') return allShopProducts.length;
    return allShopProducts.filter((p) => p.category.toLowerCase() === catId.toLowerCase()).length;
  };

  return (
    <div className="w-full bg-cream min-h-screen pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-800 text-white px-5 py-3.5 rounded-xl shadow-2xl font-semibold text-sm z-50 flex items-center space-x-3 border border-emerald-500/30 animate-bounce">
          <div className="bg-emerald-500 text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar - Categories */}
          <aside className="w-full lg:w-64 bg-white rounded-2xl p-5 shadow-xs border border-gray-100 shrink-0">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h2 className="text-base font-extrabold text-gray-900">Categories</h2>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="space-y-1.5">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                const count = getCategoryCount(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowMobileFilter(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-900 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-brand-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {cat.icon ? (
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center p-0.5 ${isSelected ? 'bg-white/10' : 'bg-gray-50'}`}>
                          <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                      )}
                      <span>{cat.name}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isSelected ? 'bg-white/20 text-white' : 'text-gray-400 bg-gray-100'
                      }`}>
                        {count}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-accent' : 'text-gray-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="flex-1 w-full">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Showing <span className="text-gray-900 font-bold">{filteredProducts.length}</span> items
                </p>
              </div>

              <div className="flex items-center space-x-3 ml-auto">
                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center space-x-1 border border-gray-200 rounded-xl p-1 bg-gray-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-brand-800 shadow-2xs' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'bg-white text-brand-800 shadow-2xs' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort By Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 pr-8 outline-none appearance-none cursor-pointer transition-colors"
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Items Display */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
                <p className="text-gray-500 text-base font-medium">No products found in this category.</p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 bg-brand-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors cursor-pointer"
                >
                  View All Products
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4.5">
                {filteredProducts.map((product) => {
                  const activeWish = isWishlisted(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="bg-white rounded-2xl border border-gray-100 hover:border-brand-700 p-3.5 relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      {/* Badge */}
                      {(product.isNew || product.badge) && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-brand-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shadow-2xs">
                          {product.badge || 'NEW'}
                        </span>
                      )}

                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-all cursor-pointer ${
                          activeWish
                            ? 'bg-red-50 text-red-500 shadow-xs'
                            : 'bg-white/85 text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title={activeWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${activeWish ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      {/* Product Image */}
                      <div className="w-full h-36 sm:h-40 flex items-center justify-center mb-3 bg-gray-50/50 rounded-xl overflow-hidden p-2 group-hover:bg-gray-50 transition-colors">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Details & Action */}
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          {/* Category Name */}
                          <span className="text-[11px] font-semibold text-gray-400 block mb-0.5 leading-tight">
                            {product.category}
                          </span>

                          {/* Title */}
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate mb-1.5 leading-tight group-hover:text-brand-800 transition-colors">
                            {product.name}
                          </h3>

                          {/* Rating Row */}
                          <div className="flex items-center space-x-1 mb-2 text-xs text-gray-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-gray-800">{product.rating}</span>
                            <span>({product.reviewsCount || 450})</span>
                          </div>

                          {/* Price Block */}
                          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <span className="text-xs sm:text-sm font-black text-gray-900">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                                ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                            {product.discount && (
                              <span className="text-[10px] sm:text-xs font-bold text-accent">
                                {product.discount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add to Cart CTA Button */}
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-full mt-3 py-2 px-3 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer transform active:scale-98"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const activeWish = isWishlisted(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigateTo('product-detail', product)}
                      className="bg-white rounded-2xl border border-gray-100 hover:border-brand-700 p-4 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400">{product.category}</span>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-brand-800">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1 my-1 text-xs text-gray-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-gray-800">{product.rating}</span>
                            <span>({product.reviewsCount || 450})</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm sm:text-base font-black text-gray-900">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                            {product.discount && (
                              <span className="text-xs font-bold text-accent">
                                {product.discount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            activeWish
                              ? 'border-red-200 bg-red-50 text-red-500'
                              : 'border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title={activeWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${activeWish ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="bg-brand-800 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs hover:shadow-md cursor-pointer active:scale-98"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
