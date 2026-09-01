// Pincode & Delivery Serviceability Engine for BuyZo E-Commerce

export function checkPincodeServiceability(pincode) {
  if (!pincode || String(pincode).trim().length !== 6 || isNaN(Number(pincode))) {
    return {
      isValid: false,
      message: 'Please enter a valid 6-digit Pincode.'
    };
  }

  const pinNum = Number(pincode);
  const today = new Date();
  
  // Metro cities (Delhi/NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad) -> Next Day / 2 Days
  const isMetro = (pinNum >= 110001 && pinNum <= 110096) || // Delhi
                  (pinNum >= 400001 && pinNum <= 400104) || // Mumbai
                  (pinNum >= 560001 && pinNum <= 560108) || // Bengaluru
                  (pinNum >= 700001 && pinNum <= 700157) || // Kolkata
                  (pinNum >= 600001 && pinNum <= 600130) || // Chennai
                  (pinNum >= 500001 && pinNum <= 500095);   // Hyderabad

  const daysToAdd = isMetro ? 1 : (pinNum % 3 === 0 ? 2 : 3);
  const etaDate = new Date(today);
  etaDate.setDate(today.getDate() + daysToAdd);

  const formattedDate = etaDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return {
    isValid: true,
    pincode: String(pincode),
    isExpress: isMetro,
    estimatedDate: formattedDate,
    deliveryFee: isMetro ? 0 : 49,
    isCodAvailable: true,
    message: isMetro
      ? `Express Delivery by Tomorrow (${formattedDate})`
      : `Standard Delivery by ${formattedDate}`
  };
}

export function getSavedPincode() {
  try {
    return localStorage.getItem('buyzo_user_pincode') || '110001';
  } catch {
    return '110001';
  }
}

export function setSavedPincode(pincode) {
  try {
    localStorage.setItem('buyzo_user_pincode', String(pincode));
  } catch (err) {
    console.error('Failed to save pincode', err);
  }
}
