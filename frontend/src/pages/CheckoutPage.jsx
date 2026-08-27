import React, { useState, useEffect } from 'react';
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
  PackageCheck
} from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useNavigationContext } from '../context/NavigationContext';
import { fetchAddressesApi, addAddressApi, createCheckoutOrderApi, getCurrentUser } from '../services/api';

function ConfettiCanvas() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#063328', '#108a57', '#ff5100', '#fbbf24', '#3b82f6', '#ec4899', '#8b5cf6'];
    const particles = Array.from({ length: 85 }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 220,
      y: canvas.height / 2 - 40 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 16 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.vRot;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          ctx.restore();
        }
      });
      if (particles.some((p) => p.opacity > 0)) {
        animId = requestAnimationFrame(render);
      }
    };
    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] w-full h-full"
    />
  );
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartContext();
  const { navigateTo } = useNavigationContext();

  // State for Delivery Address (Dynamic - empty by default for new users)
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Load user's saved addresses dynamically on component mount
  useEffect(() => {
    let isMounted = true;
    async function loadAddresses() {
      try {
        setIsLoadingAddresses(true);
        const list = await fetchAddressesApi();
        if (isMounted && Array.isArray(list)) {
          const formatted = list.map((a) => ({
            id: a.id,
            name: a.name || a.recipient_name || 'Customer',
            type: (a.type || a.address_type || 'HOME').toUpperCase(),
            address: a.address || a.formatted_address || `${a.street_address || ''}${a.city ? ', ' + a.city : ''}${a.state ? ' ' + a.state : ''}${a.postal_code ? ' ' + a.postal_code : ''}, India`,
            phone: a.phone || a.phone_number || '',
            city: a.city || '',
            state: a.state || '',
            pincode: a.pincode || a.postal_code || '',
            isDefault: Boolean(a.isDefault || a.is_default)
          }));
          setAddresses(formatted);
          if (formatted.length > 0) {
            const defaultAddr = formatted.find((a) => a.isDefault) || formatted[0];
            setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        if (isMounted) setIsLoadingAddresses(false);
      }
    }
    loadAddresses();
    return () => { isMounted = false; };
  }, []);

  // State for Delivery Option (standard = 0, express = 99)
  const [deliveryOption, setDeliveryOption] = useState('standard');

  // State for Payment Method
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  // State for Modals
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    type: 'HOME',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const [orderPlacedModal, setOrderPlacedModal] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculations based on cartItems
  const displayItems = cartItems.length > 0 ? cartItems : [
    {
      id: 'demo-1',
      name: 'boAt Rockerz 450',
      selectedColor: 'Teal Green',
      quantity: 1,
      price: 1499,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=60'
    },
    {
      id: 'demo-2',
      name: 'Noise ColorFit Pro 5',
      selectedColor: 'Jet Black',
      quantity: 1,
      price: 2999,
      originalPrice: 4999,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=60'
    }
  ];

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

  // Handle Add Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddressForm.name || !newAddressForm.address || !newAddressForm.phone) return;

    try {
      const saved = await addAddressApi({
        name: newAddressForm.name,
        type: newAddressForm.type,
        address: newAddressForm.address,
        city: newAddressForm.city,
        state: newAddressForm.state,
        pincode: newAddressForm.pincode,
        phone: newAddressForm.phone,
        isDefault: addresses.length === 0
      });

      const formattedNew = {
        id: saved.id || Date.now(),
        name: saved.name || saved.recipient_name || newAddressForm.name,
        type: (saved.type || saved.address_type || newAddressForm.type).toUpperCase(),
        address: saved.address || saved.formatted_address || `${newAddressForm.address}${newAddressForm.city ? ', ' + newAddressForm.city : ''}${newAddressForm.state ? ' ' + newAddressForm.state : ''}${newAddressForm.pincode ? ' ' + newAddressForm.pincode : ''}, India`,
        phone: saved.phone || saved.phone_number || newAddressForm.phone,
        city: newAddressForm.city,
        state: newAddressForm.state,
        pincode: newAddressForm.pincode,
        isDefault: Boolean(saved.isDefault || saved.is_default)
      };

      const updatedList = [...addresses, formattedNew];
      setAddresses(updatedList);
      setSelectedAddressId(formattedNew.id);
      setIsAddAddressOpen(false);
      setNewAddressForm({ name: '', type: 'HOME', address: '', city: '', state: '', pincode: '', phone: '' });
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placementPhase, setPlacementPhase] = useState('processing'); // 'processing' | 'confirmed' | 'confetti'
  const [placedOrderData, setPlacedOrderData] = useState(null);

  // Synthesize Victory Audio Chime using Web Audio API
  const playVictoryChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: B5 (987Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.22, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.85);
    } catch (e) {}
  };

  // Handle Place Order with Multi-Phase Animation Sequence
  const handlePlaceOrder = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      sessionStorage.setItem('buyzo_post_login_redirect', 'checkout');
      navigateTo('login');
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!selectedAddr) {
      alert('Please add a delivery address before placing your order.');
      setIsAddAddressOpen(true);
      return;
    }
    const newOrderId = `#BZ${Date.now().toString().slice(-8)}`;

    const now = new Date();
    const datePart = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    const orderDateStr = `${datePart}, ${timePart}`;

    const minDelivery = new Date(now);
    minDelivery.setDate(now.getDate() + (deliveryOption === 'express' ? 1 : 3));
    const maxDelivery = new Date(now);
    maxDelivery.setDate(now.getDate() + (deliveryOption === 'express' ? 2 : 5));

    const formatDateShort = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const estDeliveryStr = `${formatDateShort(minDelivery)} – ${formatDateShort(maxDelivery)}`;

    const orderData = {
      orderId: newOrderId,
      id: newOrderId,
      order_number: newOrderId,
      orderDate: orderDateStr,
      created_at: now.toISOString(),
      estimatedDelivery: estDeliveryStr,
      totalPaid: finalTotal.toLocaleString('en-IN'),
      total_amount: finalTotal,
      userId: currentUser?.id || currentUser?.email || 'user',
      customer_id: currentUser?.id || null,
      userEmail: currentUser?.email || '',
      paymentMethod: paymentMethod.toUpperCase(),
      status: 'CONFIRMED',
      address: {
        name: selectedAddr?.name || 'Customer',
        type: selectedAddr?.type || 'HOME',
        details: selectedAddr?.address || 'Bengaluru, Karnataka, India',
        phone: selectedAddr?.phone || ''
      },
      items: displayItems.map((item, idx) => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 1;
        const itemTitle = item.name || item.title || 'Product';
        return {
          id: item.id || idx + 1,
          productId: item.productId || item.id,
          name: itemTitle,
          product_title: itemTitle,
          variant: item.selectedColor || item.color || item.variant || 'Standard',
          selectedColor: item.selectedColor || item.color || '',
          selected_color: item.selectedColor || item.color || '',
          selectedSize: item.selectedSize || item.size || '',
          selected_size: item.selectedSize || item.size || '',
          quantity: itemQty,
          price: itemPrice,
          unit_price: itemPrice,
          total_price: itemPrice * itemQty,
          image: item.image || ''
        };
      }),
      timeline: [
        {
          status: 'Order Confirmed',
          date: orderDateStr,
          completed: true,
          current: false
        },
        {
          status: 'Processing',
          date: 'We are packing your order',
          completed: false,
          current: true
        },
        {
          status: 'Shipped',
          date: `Expected by ${formatDateShort(minDelivery)}`,
          completed: false,
          current: false
        },
        {
          status: 'Out for Delivery',
          date: `Expected by ${formatDateShort(maxDelivery)}`,
          completed: false,
          current: false
        },
        {
          status: 'Delivered',
          date: `Expected by ${formatDateShort(maxDelivery)}`,
          completed: false,
          current: false
        }
      ]
    };

    setPlacedOrderData(orderData);
    setIsPlacingOrder(true);
    setPlacementPhase('processing');

    // Attempt backend API checkout call
    try {
      const checkoutPayload = {
        address_id: typeof selectedAddr.id === 'number' && selectedAddr.id < 1000000000 ? selectedAddr.id : null,
        recipient_name: selectedAddr.name,
        phone_number: selectedAddr.phone,
        street_address: selectedAddr.address,
        payment_method: paymentMethod.toUpperCase(),
        items: displayItems.map((item) => ({
          id: item.id || item.productId,
          productId: item.productId || item.id,
          name: item.name || item.title,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          selectedColor: item.selectedColor || item.color || '',
          selectedSize: item.selectedSize || item.size || '',
          image: item.image || ''
        }))
      };
      const apiRes = await createCheckoutOrderApi(checkoutPayload);
      if (apiRes && (apiRes.order_number || apiRes.id)) {
        orderData.orderId = apiRes.order_number || `ORD-${apiRes.id}`;
        orderData.id = apiRes.id || orderData.id;
        orderData.order_number = apiRes.order_number || orderData.orderId;
        if (apiRes.delivery_otp) orderData.delivery_otp = apiRes.delivery_otp;
        setPlacedOrderData(orderData);
      }
    } catch (err) {
      console.warn('Backend order checkout submission:', err);
    }

    // Store in buyzo_placed_orders and buyzo_orders for cross-portal and My Orders persistence
    try {
      const existingPlaced = JSON.parse(localStorage.getItem('buyzo_placed_orders') || '[]');
      existingPlaced.unshift(orderData);
      localStorage.setItem('buyzo_placed_orders', JSON.stringify(existingPlaced));

      const existingOrders = JSON.parse(localStorage.getItem('buyzo_orders') || '[]');
      existingOrders.unshift(orderData);
      localStorage.setItem('buyzo_orders', JSON.stringify(existingOrders));

      localStorage.setItem('buyzo_last_order', JSON.stringify(orderData));
    } catch (e) {}

    if (clearCart) {
      clearCart();
    }

    // Phase 2: Confirmed Checkmark + Victory Audio Chime at 1.1s
    setTimeout(() => {
      setPlacementPhase('confirmed');
      playVictoryChime();
    }, 1100);

    // Phase 3: Confetti Explosion at 1.9s
    setTimeout(() => {
      setPlacementPhase('confetti');
    }, 1900);

    // Phase 4: Navigate to Order Confirmed Page at 3.6s
    setTimeout(() => {
      setIsPlacingOrder(false);
      navigateTo('order-confirmed', orderData);
    }, 3600);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Steps 1, 2, 3 */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-brand-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Delivery Address</h2>
              </div>
              <button
                onClick={() => setIsAddAddressOpen(true)}
                className="text-xs sm:text-sm font-bold text-accent hover:underline cursor-pointer"
              >
                Change / Select Address
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between relative border ${
                      isSelected
                        ? 'border-2 border-brand-800 bg-emerald-50/15 shadow-xs'
                        : 'border-gray-200/90 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {/* Custom Radio Icon */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-brand-800' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-brand-800" />}
                        </div>
                        <span className="font-bold text-sm text-gray-900">{addr.name}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            addr.type === 'HOME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pl-6">{addr.address}</p>
                    </div>
                    <div className="mt-3 pl-6 text-xs text-gray-700 font-semibold">{addr.phone}</div>
                  </div>
                );
              })}

              {/* Add New Address Button Card */}
              <div
                onClick={() => setIsAddAddressOpen(true)}
                className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:bg-emerald-50/20 group min-h-[140px]"
              >
                <div className="w-8 h-8 rounded-full border-2 border-emerald-700 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  +
                </div>
                <span className="text-xs font-bold text-brand-800 mt-2.5 group-hover:text-emerald-800">
                  Add New Address
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Options */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-brand-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
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
                    ? 'border-2 border-brand-800 bg-emerald-50/15 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryOption === 'standard' ? 'border-brand-800' : 'border-gray-400'
                    }`}
                  >
                    {deliveryOption === 'standard' && <div className="w-2 h-2 rounded-full bg-brand-800" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">Standard Delivery</div>
                    <div className="text-xs text-gray-500">Delivery in 3–5 business days</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-700 uppercase tracking-wide">FREE</div>
                  <div className="text-[11px] text-gray-500">by 24 May, Sat</div>
                </div>
              </div>

              {/* Option 2: Express Delivery */}
              <div
                onClick={() => setDeliveryOption('express')}
                className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all border ${
                  deliveryOption === 'express'
                    ? 'border-2 border-brand-800 bg-emerald-50/15 shadow-xs'
                    : 'border-gray-200/90 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      deliveryOption === 'express' ? 'border-brand-800' : 'border-gray-400'
                    }`}
                  >
                    {deliveryOption === 'express' && <div className="w-2 h-2 rounded-full bg-brand-800" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">Express Delivery</div>
                    <div className="text-xs text-gray-500">Delivery in 1–2 business days</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900">₹99</div>
                  <div className="text-[11px] text-gray-500">by 21 May, Wed</div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Method */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-gray-800" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Payment Method</h2>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* UPI */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all border min-h-[90px] ${
                  paymentMethod === 'upi'
                    ? 'border-2 border-brand-800 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mr-1 ${
                      paymentMethod === 'upi' ? 'border-brand-800' : 'border-gray-400'
                    }`}
                  >
                    {paymentMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-brand-800" />}
                  </div>
                  <span className="font-black text-xs text-brand-800 tracking-wider italic">UPI</span>
                  <span className="text-accent text-[10px] font-bold">▶</span>
                </div>
                <span className="text-[10px] text-gray-500 leading-tight">Unified Payments</span>
              </div>

              {/* Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all border min-h-[90px] ${
                  paymentMethod === 'card'
                    ? 'border-2 border-brand-800 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-gray-700 mb-1" />
                <span className="text-[11px] font-bold text-gray-900 leading-tight">Credit / Debit Card</span>
              </div>

              {/* Net Banking */}
              <div
                onClick={() => setPaymentMethod('netbanking')}
                className={`rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all border min-h-[90px] ${
                  paymentMethod === 'netbanking'
                    ? 'border-2 border-brand-800 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-800 mb-1" />
                <span className="text-[11px] font-bold text-gray-900 leading-tight">Net Banking</span>
              </div>

              {/* Wallets */}
              <div
                onClick={() => setPaymentMethod('wallets')}
                className={`rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all border min-h-[90px] ${
                  paymentMethod === 'wallets'
                    ? 'border-2 border-brand-800 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Wallet className="w-5 h-5 text-emerald-700 mb-1" />
                <span className="text-[11px] font-bold text-gray-900 leading-tight">Wallets</span>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`rounded-2xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all border min-h-[90px] col-span-2 sm:col-span-1 ${
                  paymentMethod === 'cod'
                    ? 'border-2 border-brand-800 bg-emerald-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-center w-7 h-4 rounded bg-emerald-600 text-white text-[9px] font-bold mb-1 shadow-2xs">
                  ₹
                </div>
                <span className="text-[11px] font-bold text-gray-900 leading-tight">Cash on Delivery</span>
              </div>
            </div>

            {/* Dynamic Payment Input Section */}
            {paymentMethod === 'upi' && (
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Enter Virtual Payment Address (UPI ID)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank / paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800 focus:ring-1 focus:ring-[#063328]"
                  />
                  <button className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                    Verify
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">A payment request will be sent to your UPI App upon placing order.</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Valid Thru (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Guarantee Strip */}
            <div className="mt-4 flex items-center space-x-2 bg-emerald-50/70 border border-emerald-100/90 text-emerald-900 text-xs px-3.5 py-2.5 rounded-xl font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Your data is safe and secure with 256-bit SSL encryption.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-sm space-y-5 sticky top-24">
            {/* Header */}
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Order Summary</h3>

            {/* Cart Items Preview */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {displayItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between space-x-3 py-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-gray-500">{item.selectedColor || 'Standard'}</p>
                      <p className="text-[11px] text-gray-500">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  <div className="text-right font-black text-sm text-gray-900 shrink-0">
                    ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-200/80" />

            {/* Price Calculations */}
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Price ({displayItems.length} items)</span>
                <span className="font-semibold text-gray-900">₹{totalOriginalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-bold">-₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-bold text-emerald-700">
                  {deliveryOption === 'standard' ? 'FREE' : '₹99'}
                </span>
              </div>
            </div>

            <hr className="border-gray-200/80" />

            {/* Total Amount & Savings */}
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-base sm:text-lg font-black text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-gray-900">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs font-bold text-emerald-700 mt-1">
                You saved ₹{totalDiscount.toLocaleString('en-IN')} on this order!
              </div>
            </div>

            {/* Coupon / Offers Box */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">Save more with offers</div>
                <div className="text-[11px] text-gray-500">View available offers on the next step</div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-accent hover:bg-accent-600 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-98"
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

      {/* Add New Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Add New Delivery Address</h3>
              <button
                onClick={() => setIsAddAddressOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newAddressForm.name}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-hidden focus:border-brand-800"
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
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save &amp; Deliver Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Confirmation Animated Modal */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/65 backdrop-blur-md transition-all duration-500 animate-fade-in p-4">
          {placementPhase === 'confetti' && <ConfettiCanvas />}

          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-emerald-500/30 relative overflow-hidden transform transition-all duration-300 scale-100">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

            {/* Phase 1: Processing */}
            {placementPhase === 'processing' && (
              <div className="py-6 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-75" />
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                  <PackageCheck className="w-7 h-7 text-[#063328] absolute" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    Securing Your Order...
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Verifying items & reserving warehouse stock
                  </p>
                </div>
              </div>
            )}

            {/* Phase 2 & 3: Confirmed & Confetti Explosion */}
            {(placementPhase === 'confirmed' || placementPhase === 'confetti') && (
              <div className="py-4 space-y-4" style={{ animation: 'popScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                {/* Animated SVG Success Checkmark */}
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-50" />
                  <svg className="w-10 h-10 text-emerald-600 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path
                      d="M20 6L9 17l-5-5"
                      style={{
                        strokeDasharray: 50,
                        strokeDashoffset: 0,
                        animation: 'drawCheck 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards'
                      }}
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-black tracking-widest uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Order Confirmed 🎉</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Thank You for Shopping!
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold">
                    Order <span className="text-[#063328] font-black">{placedOrderData?.orderId}</span> is confirmed
                  </p>
                </div>

                {/* OTP Pill */}
                <div className="bg-gradient-to-r from-[#063328] to-[#0d5c46] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md text-left">
                  <div>
                    <p className="text-[10px] text-emerald-300 uppercase font-black tracking-wider">Delivery Verification OTP</p>
                    <p className="text-xs text-white/90 font-semibold">Share code with Delivery Rider</p>
                  </div>
                  <span className="text-lg font-black tracking-widest bg-white/20 px-3 py-1 rounded-xl border border-white/30 text-emerald-200">
                    1234
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


