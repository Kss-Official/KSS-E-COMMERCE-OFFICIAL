import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  Wallet,
  Banknote,
  Plus,
  ChevronRight,
  CheckCircle,
  Tag,
  Truck,
  X,
  Sparkles,
  ArrowRight,
  Edit2,
  Trash2,
  MapPin,
  Loader2
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import {
  fetchAddressesApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi
} from '../services/api';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartContext();
  const { navigateTo } = useNavigationContext();

  // State for Delivery Address (100% Dynamic - ZERO fallback dummy addresses)
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // State for Delivery Option (standard = 0, express = 99)
  const [deliveryOption, setDeliveryOption] = useState('standard');

  // State for Payment Method
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  // State for Modals & Form
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSaveError, setAddressSaveError] = useState('');
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    type: 'HOME',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  const [orderPlacedModal, setOrderPlacedModal] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Load addresses from Backend on mount & auth change
  const loadAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const data = await fetchAddressesApi();
      const list = Array.isArray(data) ? data : [];
      setAddresses(list);
      if (list.length > 0) {
        setSelectedAddressId((prevId) => {
          if (prevId && list.some((a) => a.id === prevId)) return prevId;
          const defaultAddr = list.find((a) => a.is_default || a.isDefault);
          return defaultAddr ? defaultAddr.id : list[0].id;
        });
      } else {
        setSelectedAddressId(null);
      }
    } catch (err) {
      console.warn('[CheckoutPage] Error loading addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
    window.addEventListener('buyzo_auth_change', loadAddresses);
    return () => window.removeEventListener('buyzo_auth_change', loadAddresses);
  }, [loadAddresses]);

  // Calculations based on actual dynamic cartItems
  const displayItems = cartItems;

  const totalOriginalPrice = displayItems.reduce((acc, item) => {
    const orig = item.originalPrice || item.price * 1.45;
    return acc + orig * (item.quantity || 1);
  }, 0);

  const basePrice = displayItems.reduce((acc, item) => {
    return acc + item.price * (item.quantity || 1);
  }, 0);

  const totalDiscount = Math.max(0, totalOriginalPrice - basePrice);
  const deliveryCharge = deliveryOption === 'express' ? 99 : 0;
  const finalTotal = basePrice + deliveryCharge;

  // Handle Add / Edit Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaveError('');

    if (!newAddressForm.name.trim() || !newAddressForm.address.trim() || !newAddressForm.phone.trim()) {
      setAddressSaveError('Please fill in all required fields (Name, Address, Phone).');
      return;
    }
    if (!newAddressForm.city.trim() || !newAddressForm.state.trim() || !newAddressForm.pincode.trim()) {
      setAddressSaveError('Please fill in City, State, and Pincode.');
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        const updated = await updateAddressApi(editingAddressId, newAddressForm);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddressId ? { ...a, ...updated, id: a.id } : a))
        );
      } else {
        const created = await addAddressApi(newAddressForm);
        setAddresses((prev) => [...prev, created]);
        setSelectedAddressId(created.id);
      }
      // Success path — close modal and refresh
      setIsAddAddressOpen(false);
      setEditingAddressId(null);
      setAddressSaveError('');
      setNewAddressForm({ name: '', type: 'HOME', address: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
      loadAddresses();
    } catch (err) {
      console.warn('[CheckoutPage] Error saving address:', err);
      // Show the backend/API error message directly
      setAddressSaveError(err?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddress = (addr, e) => {
    if (e) e.stopPropagation();
    setEditingAddressId(addr.id);
    setNewAddressForm({
      name: addr.name || addr.recipient_name || '',
      type: addr.type || addr.address_type || 'HOME',
      address: addr.street_address || addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || addr.postal_code || '',
      phone: addr.phone || addr.phone_number || '',
      isDefault: Boolean(addr.isDefault || addr.is_default)
    });
    setIsAddAddressOpen(true);
  };

  const handleDeleteAddress = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteAddressApi(id);
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        if (selectedAddressId === id) {
          setSelectedAddressId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
    } catch (err) {
      console.warn('[CheckoutPage] Error deleting address:', err);
    }
  };

  // Handle Place Order
  const handlePlaceOrder = () => {
    if (addresses.length === 0) {
      setIsAddAddressOpen(true);
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    const newOrderId = `#BZ${Date.now().toString().slice(-8)}`;
    setOrderId(newOrderId);

    if (clearCart) {
      clearCart();
    }

    const orderData = {
      orderId: newOrderId,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedDelivery: '3 – 5 Days',
      totalPaid: finalTotal.toLocaleString('en-IN'),
      paymentMethod: paymentMethod.toUpperCase(),
      address: {
        name: selectedAddr?.name || selectedAddr?.recipient_name || 'Customer',
        type: selectedAddr?.type || selectedAddr?.address_type || 'HOME',
        details: selectedAddr?.address || selectedAddr?.formatted_address || `${selectedAddr?.street_address || ''}, ${selectedAddr?.city || ''} ${selectedAddr?.state || ''}`,
        phone: selectedAddr?.phone || selectedAddr?.phone_number || ''
      },
      items: displayItems
    };

    navigateTo('order-confirmed', orderData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-gray-800">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-3">
        <button onClick={() => navigateTo('home')} className="hover:text-gray-900 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => navigateTo('cart')} className="hover:text-gray-900 cursor-pointer">
          Cart
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-900 font-semibold">Checkout</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center space-x-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
        <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-md text-xs font-semibold">
          <Lock className="w-3 h-3 text-emerald-700" />
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* Main Grid: Left Steps (8 cols) + Right Order Summary (4 cols) */}
      {cartItems.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center shadow-2xs max-w-lg mx-auto my-8">
          <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 mt-2 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="py-3 px-8 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            Explore Products
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Steps 1, 2, 3 */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-[#063328] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Delivery Address</h2>
              </div>
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setNewAddressForm({ name: '', type: 'HOME', address: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
                  setIsAddAddressOpen(true);
                }}
                className="text-xs sm:text-sm font-bold text-[#ff5100] hover:underline cursor-pointer"
              >
                + Add Address
              </button>
            </div>

            {/* Address Cards Grid or Empty State */}
            {isLoadingAddresses ? (
              <div className="py-8 text-center text-gray-400 text-xs flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#063328]" />
                <span>Loading delivery addresses...</span>
              </div>
            ) : addresses.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  No saved delivery addresses found. Add an address to proceed.
                </p>
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setNewAddressForm({ name: '', type: 'HOME', address: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
                    setIsAddAddressOpen(true);
                  }}
                  className="px-5 py-2.5 bg-[#063328] hover:bg-[#04241c] text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between relative border ${
                        isSelected
                          ? 'border-2 border-[#063328] bg-emerald-50/15 shadow-xs'
                          : 'border-gray-200/90 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {/* Custom Radio Icon */}
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#063328]' : 'border-gray-400'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#063328]" />}
                            </div>
                            <span className="font-bold text-sm text-gray-900 line-clamp-1">{addr.name || addr.recipient_name}</span>
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                (addr.type || addr.address_type) === 'HOME'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {addr.type || addr.address_type}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={(e) => handleEditAddress(addr, e)}
                              className="p-1 text-gray-400 hover:text-[#063328] rounded transition-colors"
                              title="Edit Address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed pl-6">
                          {addr.address || addr.formatted_address || `${addr.street_address || ''}, ${addr.city || ''} ${addr.state || ''}`}
                        </p>
                      </div>
                      <div className="mt-3 pl-6 text-xs text-gray-700 font-semibold">
                        {addr.phone || addr.phone_number}
                      </div>
                    </div>
                  );
                })}

                {/* Add New Address Button Card */}
                <div
                  onClick={() => {
                    setEditingAddressId(null);
                    setNewAddressForm({ name: '', type: 'HOME', address: '', city: '', state: '', pincode: '', phone: '', isDefault: false });
                    setIsAddAddressOpen(true);
                  }}
                  className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:bg-emerald-50/20 group min-h-[140px]"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-700 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                    +
                  </div>
                  <span className="text-xs font-bold text-[#063328] mt-2.5 group-hover:text-emerald-800">
                    Add New Address
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Delivery Options */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#063328] text-white flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Delivery Options</h2>
            </div>

            {/* Delivery Option Rows */}
            <div className="space-y-3">
              {/* Option 1: Standard Delivery */}
              <div
                onClick={() => setDeliveryOption('standard')}
                className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all border ${
                  deliveryOption === 'standard'
                    ? 'border-2 border-[#063328] bg-emerald-50/15 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryOption === 'standard' ? 'border-[#063328]' : 'border-gray-400'
                    }`}
                  >
                    {deliveryOption === 'standard' && (
                      <div className="w-2 h-2 rounded-full bg-[#063328]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        Standard Delivery
                      </span>
                      <span className="text-[10px] font-bold text-[#063328] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        FREE
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Estimated 3 – 5 Days delivery</p>
                  </div>
                </div>
                <div className="text-right font-black text-xs sm:text-sm text-[#063328]">FREE</div>
              </div>

              {/* Option 2: Express Delivery */}
              <div
                onClick={() => setDeliveryOption('express')}
                className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all border ${
                  deliveryOption === 'express'
                    ? 'border-2 border-[#063328] bg-emerald-50/15 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryOption === 'express' ? 'border-[#063328]' : 'border-gray-400'
                    }`}
                  >
                    {deliveryOption === 'express' && (
                      <div className="w-2 h-2 rounded-full bg-[#063328]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        Express Delivery
                      </span>
                      <span className="text-[10px] font-bold text-[#ff5100] bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                        FAST
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Guaranteed Delivery in 24 - 48 Hours</p>
                  </div>
                </div>
                <div className="text-right font-bold text-xs sm:text-sm text-gray-900">₹99</div>
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Method */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#063328] text-white flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Payment Method</h2>
            </div>

            {/* Payment Options Accordion/List */}
            <div className="space-y-3">
              {/* Option 1: UPI */}
              <div
                className={`rounded-2xl border transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-2 border-[#063328] bg-emerald-50/15 p-4 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 p-4 bg-white'
                }`}
              >
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'upi' ? 'border-[#063328]' : 'border-gray-400'
                      }`}
                    >
                      {paymentMethod === 'upi' && (
                        <div className="w-2 h-2 rounded-full bg-[#063328]" />
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff5100] font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900">
                        UPI (GPay / PhonePe / Paytm / BHIM)
                      </div>
                      <div className="text-[11px] text-gray-500">Instant approval &amp; fast refund</div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 pt-3 border-t border-emerald-900/10 pl-7 space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Enter UPI ID / VPA</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#063328] text-white text-xs font-bold rounded-xl hover:bg-[#04241c] cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Credit / Debit Card */}
              <div
                className={`rounded-2xl border transition-all ${
                  paymentMethod === 'card'
                    ? 'border-2 border-[#063328] bg-emerald-50/15 p-4 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 p-4 bg-white'
                }`}
              >
                <div
                  onClick={() => setPaymentMethod('card')}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-[#063328]' : 'border-gray-400'
                      }`}
                    >
                      {paymentMethod === 'card' && (
                        <div className="w-2 h-2 rounded-full bg-[#063328]" />
                      )}
                    </div>
                    <CreditCard className="w-6 h-6 text-gray-700" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900">
                        Credit / Debit Card
                      </div>
                      <div className="text-[11px] text-gray-500">Visa, Mastercard, RuPay, Amex</div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 pt-3 border-t border-emerald-900/10 pl-7 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/28"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: Net Banking */}
              <div
                onClick={() => setPaymentMethod('netbanking')}
                className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-2 border-[#063328] bg-emerald-50/15 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'netbanking' ? 'border-[#063328]' : 'border-gray-400'
                    }`}
                  >
                    {paymentMethod === 'netbanking' && (
                      <div className="w-2 h-2 rounded-full bg-[#063328]" />
                    )}
                  </div>
                  <Building2 className="w-6 h-6 text-gray-700" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-gray-900">Net Banking</div>
                    <div className="text-[11px] text-gray-500">All major Indian banks supported</div>
                  </div>
                </div>
              </div>

              {/* Option 4: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-2 border-[#063328] bg-emerald-50/15 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-[#063328]' : 'border-gray-400'
                    }`}
                  >
                    {paymentMethod === 'cod' && (
                      <div className="w-2 h-2 rounded-full bg-[#063328]" />
                    )}
                  </div>
                  <Banknote className="w-6 h-6 text-gray-700" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-gray-900">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-gray-500">Pay cash or UPI at your doorstep</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Review (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Order Summary</h2>
              <span className="text-xs font-semibold text-gray-500">
                {displayItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} Items
              </span>
            </div>

            {/* Item Previews */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {displayItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 p-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Qty: {item.quantity || 1} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <div className="text-xs font-black text-gray-900 text-right shrink-0">
                    ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total MRP</span>
                <span>₹{totalOriginalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount on MRP</span>
                <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span>{deliveryCharge === 0 ? <strong className="text-[#063328]">FREE</strong> : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (GST 18%)</span>
                <span>Included</span>
              </div>
            </div>

            {/* Final Total */}
            <div className="border-t border-gray-100 pt-4 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-gray-900">Total Amount</span>
                <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#063328]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Coupon Promo Card */}
            <div className="bg-orange-50/70 border border-dashed border-orange-200 rounded-2xl p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#ff5100] text-white flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-900">Apply Promo Code</div>
                <div className="text-[11px] text-gray-500">View available offers on the next step</div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-[#ff5100] hover:bg-[#e64900] text-white font-black text-base rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Place Order</span>
            </button>

            {/* Legal Disclaimers */}
            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              By placing this order, you agree to our{' '}
              <a href="#terms" className="text-gray-700 underline font-semibold hover:text-black">Terms &amp; Conditions</a>{' '}
              and{' '}
              <a href="#privacy" className="text-gray-700 underline font-semibold hover:text-black">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Add / Edit Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => {
                  setIsAddAddressOpen(false);
                  setEditingAddressId(null);
                  setAddressSaveError('');
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {addressSaveError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                <span className="text-red-500 text-lg leading-none mt-0.5">⚠</span>
                <p className="text-xs font-semibold text-red-700">{addressSaveError}</p>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asbin Sharma"
                  value={newAddressForm.name}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newAddressForm.phone}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address / Flat / Building</label>
                <input
                  type="text"
                  required
                  placeholder="House No., Building, Street Area"
                  value={newAddressForm.address}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={newAddressForm.city}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={newAddressForm.state}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="560033"
                    value={newAddressForm.pincode}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-[#063328]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address Type</label>
                <div className="flex space-x-4">
                  {['HOME', 'WORK', 'OTHER'].map((type) => (
                    <label key={type} className="flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        checked={newAddressForm.type === type}
                        onChange={() => setNewAddressForm({ ...newAddressForm, type })}
                        className="accent-[#063328]"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  disabled={isSavingAddress}
                  onClick={() => {
                    setIsAddAddressOpen(false);
                    setEditingAddressId(null);
                    setAddressSaveError('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-6 py-2.5 rounded-xl bg-[#063328] hover:bg-[#04241c] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60 flex items-center space-x-2"
                >
                  {isSavingAddress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingAddress ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save & Deliver Here')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Confirmation Modal */}
      {orderPlacedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#063328] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1 text-xs font-bold text-[#ff5100] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Order Placed Successfully!</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">Thank You For Your Order</h3>
              <p className="text-xs text-gray-500">
                Order ID: <span className="font-bold text-[#063328]">{orderId}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 border border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-bold text-gray-900">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Payment:</span>
                <span className="font-bold text-[#063328]">{paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">
                  {addresses.find((a) => a.id === selectedAddressId)?.address || addresses.find((a) => a.id === selectedAddressId)?.formatted_address || 'Selected Address'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setOrderPlacedModal(false);
                  navigateTo('orders');
                }}
                className="w-full py-3 bg-[#063328] hover:bg-[#04241c] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-md"
              >
                Track Your Order
              </button>
              <button
                onClick={() => {
                  setOrderPlacedModal(false);
                  navigateTo('home');
                }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs cursor-pointer"
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
