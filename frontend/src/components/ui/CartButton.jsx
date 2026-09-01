import React from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';

export default function CartButton({ product, className = '', variant = 'default' }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart, isItemMatch } = useCartContext();

  if (!product) return null;

  // Find existing cart item matching this product
  const cartItem = cartItems?.find((item) => isItemMatch ? isItemMatch(item, product) : (
    String(item.id) === String(product.id) ||
    String(item.productId) === String(product.id) ||
    (product.name && item.name && String(item.name).toLowerCase() === String(product.name).toLowerCase())
  ));

  const quantity = cartItem ? Number(cartItem.quantity) || 0 : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, { quantity: 1 });
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cartItem) return;
    const targetKey = cartItem.id || cartItem.productId || product.id;
    if (quantity <= 1) {
      removeFromCart(targetKey);
    } else {
      updateQuantity(targetKey, quantity - 1);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cartItem) {
      addToCart(product, { quantity: 1 });
    } else {
      const stockCap = Number(product.stock_quantity ?? product.stock ?? 999);
      if (quantity < stockCap) {
        const targetKey = cartItem.id || cartItem.productId || product.id;
        updateQuantity(targetKey, quantity + 1);
      }
    }
  };

  // If item is in cart -> Render Compact Glassmorphic Dark Emerald Stepper Pill [- Qty +]
  if (quantity > 0) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className={`inline-flex items-center justify-between w-full bg-gradient-to-r from-[#063328] via-[#094839] to-[#063328] text-white font-extrabold rounded-full p-0.5 sm:p-1 border border-emerald-400/30 shadow-md shadow-[#063328]/20 transition-all duration-300 transform scale-100 select-none ${className}`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          aria-label="Decrease quantity"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/30 hover:bg-emerald-500 hover:shadow-xs active:bg-emerald-600 active:scale-90 flex items-center justify-center text-white transition-all duration-200 cursor-pointer shrink-0 border border-emerald-400/30"
        >
          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
        </button>

        <span className="px-1.5 sm:px-2 text-xs font-black tracking-tight select-none min-w-[22px] text-center text-white drop-shadow-xs">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          aria-label="Increase quantity"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/30 hover:bg-emerald-500 hover:shadow-xs active:bg-emerald-600 active:scale-90 flex items-center justify-center text-white transition-all duration-200 cursor-pointer shrink-0 border border-emerald-400/30"
        >
          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
        </button>
      </div>
    );
  }

  // Initial "Add to Cart" Button
  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`w-full max-w-full overflow-hidden bg-[#063328] hover:bg-[#094839] text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 shadow-soft cursor-pointer active:scale-95 group border border-emerald-500/20 ${className}`}
    >
      <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:scale-110 transition-transform text-emerald-300 shrink-0" />
      <span className="truncate">Add to Cart</span>
    </button>
  );
}

