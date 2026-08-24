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

export function getProductImage(name = '', existingImage = '') {
  if (existingImage && typeof existingImage === 'string' && existingImage.trim() !== '' && !existingImage.includes('undefined')) {
    return existingImage;
  }

  const n = (name || '').toLowerCase();

  if (n.includes('iphone') || n.includes('apple iphone')) return appleIphone15Img;
  if (n.includes('samsung') || n.includes('s23') || n.includes('galaxy')) return samsungS23Img;
  if (n.includes('macbook')) return appleMacbookImg;
  if (n.includes('dell')) return dellLaptopImg;
  if (n.includes('hp 15s') || n.includes('hp laptop') || (n.includes('hp') && n.includes('laptop'))) return hpLaptopImg;
  if (n.includes('noise') || n.includes('colorfit')) return noiseSmartwatchImg;
  if (n.includes('sony soundbar') || n.includes('ht-s20r')) return sonySoundbarImg;
  if (n.includes('sony') || n.includes('wh-ch510')) return sonyHeadphonesImg;
  if (n.includes('jbl wave') || n.includes('tws')) return jblWaveTwsImg;
  if (n.includes('jbl') || n.includes('speaker') || n.includes('flip')) return jblSpeakerImg;
  if (n.includes('airdopes')) return boatAirdopesImg;
  if (n.includes('rockerz') || (n.includes('boat') && !n.includes('airdopes'))) return boatRockerzImg;
  if (n.includes('canon') || n.includes('eos')) return cameraCanonImg;
  if (n.includes('gopro')) return goproImg;
  if (n.includes('redmi') || n.includes('note 13')) return redmiNote13Img;
  if (n.includes('puma') || n.includes('shoes') || n.includes('sneaker')) return pumaShoesImg;
  if (n.includes('biba') || n.includes('kurta') || n.includes('kurti')) return bibaKurtaImg;
  if (n.includes('roadster') || n.includes('shirt')) return roadsterShirtImg;
  if (n.includes('lounge') || n.includes('teal blue lounge')) return loungeChairImg;
  if (n.includes('accent') || n.includes('armchair')) return accentChairImg;
  if (n.includes('polo') || n.includes('t-shirt') || n.includes('tshirt')) return usPoloTshirtImg;
  if (n.includes('dress') || n.includes('a-line')) return womenDressImg;
  if (n.includes('backpack') || n.includes('safari')) return tealBackpackImg;

  return boatRockerzImg;
}
