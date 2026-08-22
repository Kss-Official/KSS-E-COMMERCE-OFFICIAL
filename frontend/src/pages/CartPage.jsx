import React, { useState } from 'react';
import { Minus, Plus, Trash2, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';

// Import images for recommendations
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import jblSpeakerImg from '../assets/images/jbl_speaker.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';

const recommendations = [
  {
    id: 'rec-1',
    name: 'boAt Airdopes 141',
    image: boatRockerzImg,
    price: 1299,
    originalPrice: 4490,
    discount: '71% OFF'
  },
  {
    id: 'rec-2',
    name: 'JBL Flip Essential 2',
    image: jblSpeakerImg,
    price: 4499,
    originalPrice: 6999,
    discount: '35% OFF'
  },
  {
    id: 'rec-3',
    name: 'Fast Charger 65W',
    image: noiseSmartwatchImg,
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF'
  },
  {
    id: 'rec-4',
    name: 'Wireless Mouse',
    image: boatRockerzImg,
    price: 699,
    originalPrice: 1299,
    discount: '46% OFF'
  }
];

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, addToCart } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const [checkoutToast, setCheckoutToast] = useState(null);

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalOriginalPrice = cartItems.reduce((acc, item) => {
    const orig = item.originalPrice || item.price * 1.5;
    return acc + orig * item.quantity;
  }, 0);

  const finalTotalAmount = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const totalDiscount = totalOriginalPrice - finalTotalAmount;

  const handleCheckout = () => {
    setCheckoutToast('Order placed successfully! Thank you for shopping with BuyZo.');
    setTimeout(() => setCheckoutToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {checkoutToast && (
        <div className="fixed bottom-6 right-6 bg-[#0d5c46] text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center space-x-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{checkoutToast}</span>
        </div>
      )}

      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-6">
        My Cart <span className="text-base font-semibold text-gray-500">({totalItemsCount} Items)</span>
      </h1>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center shadow-2xs max-w-lg mx-auto my-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0d5c46]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 mt-2 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            onClick={() => navigateTo('electronics')}
            className="py-3 px-8 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2"
          >
            <span>Explore Electronics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Cart Grid Layout: Items List (Left) + Order Summary (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Cart Items Box */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedColor}`}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Left: Product Thumbnail & Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-gray-200/80 rounded-xl p-2 flex items-center justify-center shrink-0">
                        <img
                          src={item.image || boatRockerzImg}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3
                          onClick={() => navigateTo('product-detail', item)}
                          className="font-bold text-gray-900 text-sm sm:text-base hover:text-[#0d5c46] cursor-pointer transition-colors"
                        >
                          {item.name}
                        </h3>
                        {item.selectedColor && (
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            Color: <span className="text-gray-600 font-semibold">{item.selectedColor}</span>
                          </p>
                        )}
                        {/* Price Display */}
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-base font-extrabold text-gray-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-xs font-bold text-[#ff5100]">
                              {item.discount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper & Trash Remove */}
                    <div className="flex items-center space-x-4 self-end sm:self-center">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Trash Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* You May Also Like Section */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-4">You may also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigateTo('product-detail', rec)}
                    className="bg-white border border-gray-200/90 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2 mb-2">
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900 text-center line-clamp-1 group-hover:text-[#0d5c46]">
                      {rec.name}
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{rec.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{rec.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Price Details (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-4 sticky top-6">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Price Details
              </h2>

              <div className="space-y-3 text-xs font-medium text-gray-700">
                <div className="flex justify-between items-center">
                  <span>Price ({totalItemsCount} items)</span>
                  <span className="font-bold text-gray-900">
                    ₹{totalOriginalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount</span>
                  <span className="font-bold text-[#0d5c46]">
                    -₹{totalDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charges</span>
                  <span className="font-extrabold text-[#0d5c46]">FREE</span>
                </div>
              </div>

              {/* Total Amount Divider */}
              <div className="border-t border-dashed border-gray-200 pt-3 my-2 flex justify-between items-center text-gray-900">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-xl font-black">
                  ₹{finalTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Savings Banner */}
              {totalDiscount > 0 && (
                <div className="bg-emerald-50/80 border border-emerald-200/70 text-[#0d5c46] text-xs font-bold rounded-xl p-3 text-center">
                  You saved ₹{totalDiscount.toLocaleString('en-IN')} on this order
                </div>
              )}

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#ff5100] hover:bg-[#e64900] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer mt-2"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping Button */}
              <button
                onClick={() => navigateTo('electronics')}
                className="w-full py-3 bg-white border border-[#0d5c46] text-[#0d5c46] hover:bg-emerald-50 font-bold text-sm rounded-xl transition-all cursor-pointer mt-2"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
