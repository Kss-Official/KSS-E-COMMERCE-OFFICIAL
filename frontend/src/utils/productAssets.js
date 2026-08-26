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
  if (
    existingImage &&
    typeof existingImage === 'string' &&
    existingImage.trim() !== '' &&
    !existingImage.includes('undefined') &&
    !existingImage.includes('null') &&
    existingImage !== 'null' &&
    (existingImage.startsWith('http') || existingImage.startsWith('data:') || existingImage.startsWith('/'))
  ) {
    return existingImage;
  }

  const n = (name || '').toLowerCase();

  // ----------------- MOBILITY & SMARTPHONES -----------------
  if (n.includes('s24 ultra') || n.includes('s24')) return samsungS24UltraImg;
  if (n.includes('iphone 15 pro') || n.includes('15 pro')) return iphone15ProImg;
  if (n.includes('iphone') || n.includes('apple iphone')) return appleIphone15Img;
  if (n.includes('samsung') || n.includes('s23') || n.includes('galaxy')) return samsungS23Img;
  if (n.includes('oneplus 12') || n.includes('oneplus')) return oneplus12Img;
  if (n.includes('pixel 8') || n.includes('pixel')) return pixel8ProImg;
  if (n.includes('nothing phone') || n.includes('nothing')) return nothingPhone2Img;
  if (n.includes('vivo v30') || n.includes('vivo')) return vivoV30ProImg;
  if (n.includes('redmi') || n.includes('note 13') || n.includes('realme') || n.includes('smartphone')) return redmiNote13Img;

  // ----------------- COMPUTERS & LAPTOPS -----------------
  if (n.includes('macbook') || n.includes('apple mac')) return appleMacbookImg;
  if (n.includes('dell') || n.includes('inspiron')) return dellLaptopImg;
  if (n.includes('hp 15s') || n.includes('hp laptop') || (n.includes('hp') && n.includes('laptop'))) return hpLaptopImg;

  // ----------------- AUDIO & WEARABLES -----------------
  if (n.includes('rockerz') || (n.includes('boat') && (n.includes('headphone') || n.includes('450')))) return boatRockerzImg;
  if (n.includes('wave call') || n.includes('airdopes') || n.includes('t300') || n.includes('buds')) return boatAirdopesImg;
  if (n.includes('noise') || n.includes('colorfit') || n.includes('smartwatch')) return noiseSmartwatchImg;
  if (n.includes('sony soundbar') || n.includes('ht-s20r')) return sonySoundbarImg;
  if (n.includes('sony') || n.includes('wh-ch510')) return sonyHeadphonesImg;
  if (n.includes('jbl wave') || n.includes('tws') || n.includes('200')) return jblWaveTwsImg;
  if (n.includes('jbl') || n.includes('speaker') || n.includes('flip')) return jblSpeakerImg;
  if (n.includes('canon') || n.includes('eos')) return cameraCanonImg;
  if (n.includes('pixel 8 pro') || n.includes('pixel')) return pixel8ProImg;
  if (n.includes('nothing phone') || n.includes('nothing 2')) return nothingPhone2Img;
  if (n.includes('vivo v30') || n.includes('v30 pro')) return vivoV30ProImg;
  if (n.includes('redmi note 13') || n.includes('redmi')) return redmiNote13Img;
  if (n.includes('iphone 15') || n.includes('iphone')) return appleIphone15Img;
  if (n.includes('s23') || n.includes('galaxy s23')) return samsungS23Img;

  // ----------------- ELECTRONICS & AUDIO -----------------
  if (n.includes('rockerz 450') || n.includes('boat rockerz')) return boatRockerzImg;
  if (n.includes('colorfit pro 5') || n.includes('noise colorfit')) return noiseSmartwatchImg;
  if (n.includes('wh-ch510') || n.includes('sony headphones')) return sonyHeadphonesImg;
  if (n.includes('flip essential') || n.includes('jbl flip')) return jblSpeakerImg;
  if (n.includes('airdopes') || n.includes('boat airdopes')) return boatAirdopesImg;
  if (n.includes('soundbar') || n.includes('ht-s20r')) return sonySoundbarImg;
  if (n.includes('wave 200') || n.includes('wave tws')) return jblWaveTwsImg;
  if (n.includes('wave call 2') || n.includes('smartwatch')) return noiseSmartwatchImg;
  if (n.includes('buds t300') || n.includes('earbuds')) return boatAirdopesImg;
  if (n.includes('eos 1500d') || n.includes('canon') || n.includes('dslr')) return cameraCanonImg;
  if (n.includes('hero 12') || n.includes('gopro')) return goproImg;

  // ----------------- LAPTOPS & COMPUTERS -----------------
  if (n.includes('macbook') || n.includes('apple macbook')) return appleMacbookImg;
  if (n.includes('inspiron 15') || n.includes('dell inspiron') || n.includes('dell')) return dellLaptopImg;
  if (n.includes('hp 15s') || n.includes('hp laptop') || n.includes('hp')) return hpLaptopImg;

  // ----------------- BEAUTY & PERSONAL CARE -----------------
  if (n.includes('niacinamide') || n.includes('clarifying face serum')) return beautyNiacinamideSerumImg;
  if (n.includes('lipstick') || n.includes('matte liquid velvet')) return beautyMatteLipstickImg;
  if (n.includes('sunscreen') || n.includes('ultralight sunscreen')) return beautySunscreenGelImg;
  if (n.includes('argan oil') || n.includes('hair recovery serum')) return beautyArganHairSerumImg;
  if (n.includes('cc cream') || n.includes('complexion care')) return beautyCcCreamImg;

  // ----------------- FASHION & APPAREL -----------------
  if (n.includes('anarkali') || n.includes('biba')) return bibaKurtaImg;
  if (n.includes('silk kurti') || n.includes('embellished silk')) return fashionSilkKurtiImg;
  if (n.includes('dress') || n.includes('a-line') || n.includes('fit & flare') || n.includes('floral')) return womenDressImg;
  if (n.includes('oxford shirt') || n.includes('casual shirt') || n.includes('roadster')) return roadsterShirtImg;
  if (n.includes('polo') || n.includes('t-shirt') || n.includes('tshirt')) return usPoloTshirtImg;
  if (n.includes('chinos') || n.includes('straight fit chinos') || n.includes('pant')) return fashionChinosImg;
  if (n.includes('jacket') || n.includes('denim jacket') || n.includes('denim')) return fashionDenimJacketImg;
  if (n.includes('sweatshirt') || n.includes('hoodie') || n.includes('crewneck')) return fashionSweatshirtImg;

  // ----------------- FOOTWEAR -----------------
  if (n.includes('red tape') || n.includes('streetwear') || n.includes('chunky sole') || n.includes('sneaker')) return fashionStreetSneakersImg;
  if (n.includes('puma') || n.includes('flyer flex') || n.includes('running') || n.includes('shoes')) return pumaShoesImg;

  // ----------------- BAGS & LUGGAGE -----------------
  if (n.includes('lavie') || n.includes('satchel') || n.includes('handbag') || n.includes('sling')) return lavieHandbagImg;
  if (n.includes('skybags') || n.includes('backpack') || n.includes('wildcraft') || n.includes('laptop backpack')) return tealBackpackImg;

  // ----------------- KITCHEN & COOKWARE -----------------
  if (n.includes('cooker') || n.includes('pressure cooker') || n.includes('anodized')) return pressureCookerImg;

  // ----------------- LIGHTING & HOME DECOR -----------------
  if (n.includes('lamp') || n.includes('pendant') || n.includes('ceiling lamp') || n.includes('geometric')) return pendantLampImg;

  // ----------------- FURNITURE & SEATING (100% Unique Per Item) -----------------
  if (n === 'accent upholstered armchair') return brownLeatherArmchairImg;
  if (n.includes('modern ergonomic velvet accent armchair')) return emeraldAccentChairImg;
  if (n.includes('contemporary nordic lounge relaxing recliner chair')) return loungeReclinerImg;
  if (n.includes('classic velvet ergonomic accent armchair')) return accentChairImg;
  if (n.includes('modern teal blue lounge chair')) return loungeChairImg;
  if (n.includes('mid-century modern upholstered armchair')) return midcenturyArmchairImg;
  if (n.includes('contemporary nordic velvet lounge chair')) return beigeBoucleChairImg;
  if (n.includes('nordic velvet ergonomic accent armchair')) return accentChairImg;

  if (n.includes('mid-century') || n.includes('mid century')) return midcenturyArmchairImg;
  if (n.includes('recliner')) return loungeReclinerImg;
  if (n.includes('boucle')) return beigeBoucleChairImg;
  if (n.includes('leather')) return brownLeatherArmchairImg;
  if (n.includes('emerald') || n.includes('brass')) return emeraldAccentChairImg;
  if (n.includes('teal blue lounge') || n.includes('lounge chair')) return loungeChairImg;
  if (n.includes('accent') || n.includes('armchair') || n.includes('chair')) return accentChairImg;

  // Category-Based Smart Fallbacks
  if (n.includes('mobile') || n.includes('phone')) return redmiNote13Img;
  if (n.includes('laptop') || n.includes('pc') || n.includes('computer')) return hpLaptopImg;
  if (n.includes('shoe') || n.includes('footwear')) return pumaShoesImg;
  if (n.includes('bag') || n.includes('luggage')) return tealBackpackImg;
  if (n.includes('fashion') || n.includes('wear') || n.includes('clothing')) return roadsterShirtImg;
  if (n.includes('beauty') || n.includes('care')) return beautyCcCreamImg;

  return boatRockerzImg;
}
