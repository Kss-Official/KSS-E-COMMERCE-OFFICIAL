// Product Assets & Image Resolver for BuyZo Frontend
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';
import dellLaptopImg from '../assets/images/dell_laptop.jpg';
import hpLaptopImg from '../assets/images/hp_laptop.jpg';
import appleIphone15Img from '../assets/images/apple_iphone15.jpg';
import samsungS23Img from '../assets/images/samsung_s23.png';
import boatAirdopesImg from '../assets/images/boat_airdopes.png';
import sonySoundbarImg from '../assets/images/sony_soundbar.png';
import jblWaveTwsImg from '../assets/images/jbl_wave_tws.png';
import appleMacbookImg from '../assets/images/apple_macbook.png';
import cameraCanonImg from '../assets/images/camera_canon.jpg';
import goproImg from '../assets/images/gopro_action_cam.jpg';
import pumaShoesImg from '../assets/images/puma_shoes.jpg';
import bibaKurtaImg from '../assets/images/biba_kurta.jpg';
import roadsterShirtImg from '../assets/images/roadster_shirt.jpg';
import loungeChairImg from '../assets/images/lounge_chair.jpg';
import accentChairImg from '../assets/images/accent_chair.jpg';
import usPoloTshirtImg from '../assets/images/us_polo_tshirt.jpg';
import womenDressImg from '../assets/images/women_dress.jpg';
import tealBackpackImg from '../assets/images/teal_backpack.jpg';
import redmiNote13Img from '../assets/images/redmi_note13.jpg';
import richDadPoorDadImg from '../assets/images/rich_dad_poor_dad.png';
import atomicHabitsImg from '../assets/images/atomic_habits.png';
import bookIkigaiImg from '../assets/images/book_ikigai.jpg';
import boldfitShakerImg from '../assets/images/boldfit_shaker.jpg';

// Additional Fashion, Beauty, Mobile & Accessories Images
import fashionChinosImg from '../assets/images/fashion_chinos.jpg';
import fashionDenimJacketImg from '../assets/images/fashion_denim_jacket.jpg';
import fashionSilkKurtiImg from '../assets/images/fashion_silk_kurti.jpg';
import fashionStreetSneakersImg from '../assets/images/fashion_street_sneakers.jpg';
import fashionSweatshirtImg from '../assets/images/fashion_sweatshirt.jpg';
import lavieHandbagImg from '../assets/images/lavie_handbag.jpg';

// Beauty Images
import beautyArganHairSerumImg from '../assets/images/beauty_argan_hair_serum.jpg';
import beautyCcCreamImg from '../assets/images/beauty_cc_cream.png';
import beautyCeramideCreamImg from '../assets/images/beauty_ceramide_cream.png';
import beautyCherryBodywashImg from '../assets/images/beauty_cherry_bodywash.png';
import beautyMascaraImg from '../assets/images/beauty_mascara.jpg';
import beautyMatteLipstickImg from '../assets/images/beauty_matte_lipstick.jpg';
import beautyNiacinamideSerumImg from '../assets/images/beauty_niacinamide_serum.jpg';
import beautyOnionHairOilImg from '../assets/images/beauty_onion_hair_oil.png';
import beautyOudPerfumeImg from '../assets/images/beauty_oud_perfume.jpg';
import beautyRosewaterMistImg from '../assets/images/beauty_rosewater_mist.jpg';
import beautySunscreenGelImg from '../assets/images/beauty_sunscreen_gel.png';
import beautyVitaminCFacewashImg from '../assets/images/beauty_vitamin_c_facewash.png';

// Kitchen, Lighting & Furniture Images
import pressureCookerImg from '../assets/images/pressure_cooker.jpg';
import pendantLampImg from '../assets/images/pendant_lamp.jpg';
import brownLeatherArmchairImg from '../assets/images/brown_leather_armchair.jpg';
import emeraldAccentChairImg from '../assets/images/emerald_accent_chair.jpg';
import loungeReclinerImg from '../assets/images/lounge_recliner.jpg';
import midcenturyArmchairImg from '../assets/images/midcentury_armchair.jpg';
import beigeBoucleChairImg from '../assets/images/beige_boucle_chair.jpg';

// Flagship Smartphones
import iphone15ProImg from '../assets/images/iphone_15_pro.jpg';
import samsungS24UltraImg from '../assets/images/samsung_s24_ultra.jpg';
import oneplus12Img from '../assets/images/oneplus_12.jpg';
import pixel8ProImg from '../assets/images/pixel_8_pro.jpg';
import nothingPhone2Img from '../assets/images/nothing_phone_2.jpg';
import vivoV30ProImg from '../assets/images/vivo_v30_pro.jpg';

export function getProductImage(name = '', existingImage = '') {
  const n = (name || '').toLowerCase();

  // 1. SMARTPHONES & MOBILITY
  if (n.includes('s24 ultra') || n.includes('s24')) return samsungS24UltraImg;
  if (n.includes('iphone 15 pro') || n.includes('15 pro')) return iphone15ProImg;
  if (n.includes('iphone') || n.includes('apple iphone')) return appleIphone15Img;
  if (n.includes('samsung') || n.includes('s23') || n.includes('galaxy')) return samsungS23Img;
  if (n.includes('oneplus 12') || n.includes('oneplus')) return oneplus12Img;
  if (n.includes('pixel 8') || n.includes('pixel')) return pixel8ProImg;
  if (n.includes('nothing phone') || n.includes('nothing')) return nothingPhone2Img;
  if (n.includes('vivo v30') || n.includes('vivo')) return vivoV30ProImg;
  if (n.includes('redmi') || n.includes('note 13') || n.includes('realme') || n.includes('smartphone')) return redmiNote13Img;

  // 2. COMPUTERS & LAPTOPS
  if (n.includes('macbook') || n.includes('apple mac')) return appleMacbookImg;
  if (n.includes('dell') || n.includes('inspiron')) return dellLaptopImg;
  if (n.includes('hp 15s') || n.includes('hp laptop') || (n.includes('hp') && n.includes('laptop'))) return hpLaptopImg;

  // 3. AUDIO & WEARABLES
  if (n.includes('rockerz') || (n.includes('boat') && (n.includes('headphone') || n.includes('450')))) return boatRockerzImg;
  if (n.includes('wave call') || n.includes('airdopes') || n.includes('t300') || n.includes('earbuds')) return boatAirdopesImg;
  if (n.includes('noise') || n.includes('colorfit') || n.includes('smartwatch')) return noiseSmartwatchImg;
  if (n.includes('sony soundbar') || n.includes('ht-s20r')) return sonySoundbarImg;
  if (n.includes('sony') || n.includes('wh-ch510')) return sonyHeadphonesImg;
  if (n.includes('jbl wave') || n.includes('tws')) return jblWaveTwsImg;
  if (n.includes('jbl') || n.includes('speaker') || n.includes('flip')) return jblSpeakerImg;
  if (n.includes('canon') || n.includes('eos') || n.includes('dslr')) return cameraCanonImg;
  if (n.includes('hero 12') || n.includes('gopro')) return goproImg;

  // 4. BOOKS, STATIONERY & NOTEBOOKS
  if (n.includes('faber') || n.includes('colour') || n.includes('shade') || n.includes('pencil') || n.includes('crayons') || n.includes('art')) return bookIkigaiImg;
  if (n.includes('classmate') || n.includes('notebook') || n.includes('spiral') || n.includes('register') || n.includes('paper') || n.includes('atomic habits')) return atomicHabitsImg;
  if (n.includes('ncert') || n.includes('guide') || n.includes('rich dad') || n.includes('psychology of money') || n.includes('book') || n.includes('edition') || n.includes('housel') || n.includes('clear')) return richDadPoorDadImg;
  if (n.includes('ikigai')) return bookIkigaiImg;

  // 5. BEAUTY & PERSONAL CARE
  if (n.includes('niacinamide') || n.includes('clarifying face serum') || n.includes('serum')) return beautyNiacinamideSerumImg;
  if (n.includes('lipstick') || n.includes('matte liquid') || n.includes('lip')) return beautyMatteLipstickImg;
  if (n.includes('sunscreen') || n.includes('gel')) return beautySunscreenGelImg;
  if (n.includes('argan') || n.includes('hair oil') || n.includes('hair')) return beautyArganHairSerumImg;
  if (n.includes('cc cream') || n.includes('cream')) return beautyCcCreamImg;

  // 6. FASHION & APPAREL
  if (n.includes('anarkali') || n.includes('biba') || n.includes('kurta') || n.includes('kurti')) return bibaKurtaImg;
  if (n.includes('dress') || n.includes('a-line') || n.includes('fit & flare') || n.includes('floral')) return womenDressImg;
  if (n.includes('oxford shirt') || n.includes('casual shirt') || n.includes('roadster') || n.includes('shirt')) return roadsterShirtImg;
  if (n.includes('polo') || n.includes('t-shirt') || n.includes('tshirt')) return usPoloTshirtImg;
  if (n.includes('chinos') || n.includes('trousers') || n.includes('pant')) return fashionChinosImg;
  if (n.includes('jacket') || n.includes('denim')) return fashionDenimJacketImg;
  if (n.includes('sweatshirt') || n.includes('hoodie')) return fashionSweatshirtImg;

  // 7. FOOTWEAR & SHOES
  if (n.includes('sneaker') || n.includes('streetwear')) return fashionStreetSneakersImg;
  if (n.includes('puma') || n.includes('flyer flex') || n.includes('running') || n.includes('shoes') || n.includes('shoe')) return pumaShoesImg;

  // 8. BAGS & LUGGAGE
  if (n.includes('lavie') || n.includes('handbag') || n.includes('tote') || n.includes('satchel') || n.includes('purse')) return lavieHandbagImg;
  if (n.includes('skybags') || n.includes('backpack') || n.includes('wildcraft') || n.includes('luggage') || n.includes('safari')) return tealBackpackImg;

  // 9. KITCHEN & HOME APPLIANCES
  if (n.includes('cookware') || n.includes('induction') || n.includes('casserole') || n.includes('utensil')) return cookwareSetImg;
  if (n.includes('lamp') || n.includes('pendant') || n.includes('ceiling') || n.includes('light')) return pendantLampImg;
  if (n.includes('air fryer') || n.includes('fryer')) return airFryerImg;
  if (n.includes('bedsheet') || n.includes('cotton') || n.includes('pillow')) return cottonBedsheetImg;
  if (n.includes('cooker') || n.includes('pressure cooker') || n.includes('washing machine') || n.includes('appliance')) return pressureCookerImg;

  // 10. FURNITURE & CHAIRS
  if (n.includes('recliner')) return loungeReclinerImg;
  if (n.includes('lounge chair') || n.includes('modern lounge')) return loungeChairImg;
  if (n.includes('accent') || n.includes('armchair') || n.includes('executive') || n.includes('mesh') || n.includes('chair') || n.includes('furniture')) return accentChairImg;
  if (n.includes('shelf') || n.includes('shelves') || n.includes('wall shelves')) return wallShelvesImg;

  // 11. SPORTS & FITNESS
  if (n.includes('treadmill') || n.includes('dumbbell') || n.includes('shaker') || n.includes('kore') || n.includes('fitkit') || n.includes('fitness') || n.includes('gym')) return boldfitShakerImg;

  // 12. IF EXISTING IMAGE IS VALID AND NON-GENERIC URL
  let cleanImage = existingImage;
  if (cleanImage && typeof cleanImage === 'string') {
    cleanImage = cleanImage.replace(/\/media\/media\//g, '/media/');
  }

  if (
    cleanImage &&
    typeof cleanImage === 'string' &&
    cleanImage.trim() !== '' &&
    !cleanImage.includes('undefined') &&
    !cleanImage.includes('null') &&
    cleanImage !== 'null' &&
    !cleanImage.includes('bestsellers_hero') &&
    !cleanImage.includes('hk_wall_shelves') &&
    !cleanImage.includes('wall_shelves') &&
    (cleanImage.startsWith('http') || cleanImage.startsWith('data:') || (cleanImage.startsWith('/') && !cleanImage.includes('/media/products/')))
  ) {
    return cleanImage;
  }

  // Fallbacks by broad category keywords
  if (n.includes('mobile') || n.includes('phone')) return redmiNote13Img;
  if (n.includes('laptop') || n.includes('pc') || n.includes('computer')) return hpLaptopImg;
  if (n.includes('shoe') || n.includes('footwear')) return pumaShoesImg;
  if (n.includes('bag') || n.includes('luggage')) return tealBackpackImg;
  if (n.includes('fashion') || n.includes('wear') || n.includes('clothing')) return roadsterShirtImg;
  if (n.includes('beauty') || n.includes('care')) return beautyCcCreamImg;

  return boatRockerzImg;
}
