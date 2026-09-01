import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  fetchCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  getCurrentUser
} from '../services/api';
import { getProductImage } from '../utils/productAssets';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    total_items: 0,
    subtotal: 0,
    estimated_tax: 0,
    estimated_shipping: 0,
    grand_total: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Helper to format cart items consistently for the UI
  const formatCartItems = (rawItems) => {
    if (!Array.isArray(rawItems)) return [];
    return rawItems.map((item) => {
      const p = item.product_details || {};
      const itemName = item.name || p.name || p.title || 'Product';
      const unitPrice = Number(item.unit_price || item.price || p.price || p.current_price || 0);
      const origPrice = Number(item.originalPrice || p.originalPrice || p.original_price || (unitPrice > 0 ? unitPrice * 1.25 : 0));
      const discount = item.discount || p.discount || (origPrice > unitPrice ? `${Math.round(((origPrice - unitPrice) / origPrice) * 100)}% OFF` : '');

      return {
        id: item.id,
        productId: item.productId || item.product || p.id,
        name: itemName,
        image: getProductImage(itemName, item.image || p.image || p.primary_image),
        price: unitPrice,
        originalPrice: origPrice,
        discount: discount,
        selectedColor: item.selectedColor || item.selected_color || '',
        selectedSize: item.selectedSize || item.selected_size || '',
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.total_price) || unitPrice * (Number(item.quantity) || 1)
      };
    });
  };

  // Normalises a product name so the same item is recognised regardless of
  // casing/spacing differences between the local UI shape and the API shape.
  const wishlistNameKey = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

  // Decides whether a stored wishlist row refers to the same product as the
  // target. The target may be a full product object or a bare id, because
  // wishlist rows carry their own backend `id` distinct from `productId`.
  const isWishlistedItemMatch = (item, target) => {
    if (!item || target === null || target === undefined) return false;

    if (typeof target !== 'object') {
      return String(item.id) === String(target) || String(item.productId) === String(target);
    }

    const targetIds = [target.id, target.productId, target.product_id].filter(
      (v) => v !== null && v !== undefined && v !== ''
    );
    if (targetIds.some((id) => String(item.id) === String(id) || String(item.productId) === String(id))) {
      return true;
    }

    const targetName = wishlistNameKey(target.name || target.title);
    return targetName !== '' && wishlistNameKey(item.name) === targetName;
  };

  // Helper to format wishlist items consistently for the UI
  const formatWishlistItems = (rawItems) => {    if (!Array.isArray(rawItems)) return [];
    return rawItems.map((item) => {
      const p = item.product_details || item.product || {};
      const itemName = item.name || p.name || p.title || 'Product';
      const unitPrice = Number(item.price || p.price || p.current_price || 0);
      const origPrice = Number(item.originalPrice || p.originalPrice || p.original_price || (unitPrice > 0 ? unitPrice * 1.25 : 0));
      const discount = item.discount || p.discount || (origPrice > unitPrice ? `${Math.round(((origPrice - unitPrice) / origPrice) * 100)}% OFF` : '');

      return {
        id: item.id,
        productId: item.productId || p.id || item.id,
        name: itemName,
        image: getProductImage(itemName, item.image || p.image || p.primary_image),
        price: unitPrice,
        originalPrice: origPrice,
        discount: discount,
        category: item.category || p.category || p.category_name || 'General',
        specs: item.specs || p.specs || '',
        inStock: item.inStock !== false,
        deliveryDate: item.deliveryDate || 'Delivery in 2-4 days'
      };
    });
  };

  // Fetch Cart from Backend
  const refreshCart = useCallback(async () => {
    try {
      const data = await fetchCartApi();
      if (data && Array.isArray(data.items)) {
        setCartItems(formatCartItems(data.items));
        setCartSummary({
          total_items: data.total_items || 0,
          subtotal: data.subtotal || 0,
          estimated_tax: data.estimated_tax || 0,
          estimated_shipping: data.estimated_shipping || 0,
          grand_total: data.grand_total || 0
        });
      }
    } catch (e) {
      console.warn('[CartContext] Error fetching cart:', e);
    }
  }, []);

  // Fetch Wishlist from Backend
  const refreshWishlist = useCallback(async () => {
    try {
      const items = await fetchWishlistApi();
      if (Array.isArray(items)) {
        setWishlistItems(formatWishlistItems(items));
      }
    } catch (e) {
      console.warn('[CartContext] Error fetching wishlist:', e);
    }
  }, []);

  // Load Cart & Wishlist on initial mount and when auth changes
  useEffect(() => {
    refreshCart();
    refreshWishlist();

    const handleAuthChange = () => {
      refreshCart();
      refreshWishlist();
    };

    window.addEventListener('buyzo_auth_change', handleAuthChange);
    return () => window.removeEventListener('buyzo_auth_change', handleAuthChange);
  }, [refreshCart, refreshWishlist]);

  // Helper to match a product with a cart item accurately
  const isItemMatch = (cartItem, targetProduct) => {
    if (!cartItem || !targetProduct) return false;
    const targetIds = [targetProduct.id, targetProduct.productId, targetProduct.product_id, targetProduct.pk]
      .filter((v) => v !== null && v !== undefined && v !== '')
      .map(String);
    const itemIds = [cartItem.id, cartItem.productId, cartItem.product_id, cartItem.product]
      .filter((v) => v !== null && v !== undefined && v !== '')
      .map(String);
    if (targetIds.some((tid) => itemIds.includes(tid))) return true;

    const targetName = String(targetProduct.name || targetProduct.title || '').trim().toLowerCase();
    const itemName = String(cartItem.name || '').trim().toLowerCase();
    if (targetName && itemName) {
      return targetName === itemName || targetName.includes(itemName) || itemName.includes(targetName);
    }
    return false;
  };

  // Add Item to Cart
  const addToCart = async (product, options = {}) => {
    if (!product) return;
    const qty = options.quantity || product.quantity || 1;
    const color = options.selectedColor || product.selectedColor || product.selected_color || '';
    const size = options.selectedSize || product.selectedSize || product.selected_size || '';

    // Optimistic Update
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => isItemMatch(i, product) && (!color || i.selectedColor === color));

      if (existingIdx > -1) {
        const copy = [...prev];
        const updatedQty = Number(copy[existingIdx].quantity || 0) + qty;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: updatedQty,
          totalPrice: (copy[existingIdx].price || 0) * updatedQty
        };
        return copy;
      }

      const unitPrice = Number(product.price || product.current_price || 0);
      const origPrice = Number(product.originalPrice || product.original_price || (unitPrice > 0 ? unitPrice * 1.25 : 0));
      return [
        ...prev,
        {
          id: product.id || `temp-${Date.now()}`,
          productId: product.productId || product.id,
          name: product.name || product.title || 'Product',
          image: product.image || product.primary_image || '',
          price: unitPrice,
          originalPrice: origPrice,
          discount: product.discount || (origPrice > unitPrice ? `${Math.round(((origPrice - unitPrice) / origPrice) * 100)}% OFF` : ''),
          selectedColor: color,
          selectedSize: size,
          quantity: qty,
          totalPrice: unitPrice * qty
        }
      ];
    });

    // Backend Sync
    try {
      const syncPid = product.productId || product.id;
      const data = await addToCartApi({
        product_id: syncPid,
        id: syncPid,
        name: product.name || product.title,
        price: product.price || product.current_price,
        quantity: qty,
        selected_color: color,
        selected_size: size,
        variant_id: options.variantId || product.variant_id || null
      });

      if (data && Array.isArray(data.items)) {
        setCartItems(formatCartItems(data.items));
        setCartSummary({
          total_items: data.total_items || 0,
          subtotal: data.subtotal || 0,
          estimated_tax: data.estimated_tax || 0,
          estimated_shipping: data.estimated_shipping || 0,
          grand_total: data.grand_total || 0
        });
      }
    } catch (e) {
      console.warn('[CartContext] Add to cart sync error:', e);
    }
  };

  // Update Item Quantity
  const updateQuantity = async (itemIdOrProductId, newQuantity) => {
    const key = String(itemIdOrProductId);
    if (newQuantity <= 0) {
      removeFromCart(itemIdOrProductId);
      return;
    }

    // Optimistic Update
    setCartItems((prev) =>
      prev.map((item) => {
        if (String(item.id) === key || String(item.productId) === key) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.price * newQuantity
          };
        }
        return item;
      })
    );

    // Backend Sync
    try {
      const data = await updateCartItemApi(itemIdOrProductId, newQuantity);
      if (data && Array.isArray(data.items)) {
        setCartItems(formatCartItems(data.items));
        setCartSummary({
          total_items: data.total_items || 0,
          subtotal: data.subtotal || 0,
          estimated_tax: data.estimated_tax || 0,
          estimated_shipping: data.estimated_shipping || 0,
          grand_total: data.grand_total || 0
        });
      }
    } catch (e) {
      console.warn('[CartContext] Update quantity sync error:', e);
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (itemIdOrProductId) => {
    const key = String(itemIdOrProductId);
    // Optimistic Update
    setCartItems((prev) => prev.filter((i) => String(i.id) !== key && String(i.productId) !== key));

    // Backend Sync
    try {
      const data = await removeCartItemApi(itemIdOrProductId);
      if (data && Array.isArray(data.items)) {
        setCartItems(formatCartItems(data.items));
        setCartSummary({
          total_items: data.total_items || 0,
          subtotal: data.subtotal || 0,
          estimated_tax: data.estimated_tax || 0,
          estimated_shipping: data.estimated_shipping || 0,
          grand_total: data.grand_total || 0
        });
      }
    } catch (e) {
      console.warn('[CartContext] Remove from cart sync error:', e);
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setCartItems([]);
    setCartSummary({
      total_items: 0,
      subtotal: 0,
      estimated_tax: 0,
      estimated_shipping: 0,
      grand_total: 0
    });
    try {
      await clearCartApi();
    } catch (e) {
      console.warn('[CartContext] Clear cart sync error:', e);
    }
  };

  // Add Item to Wishlist
  const addToWishlist = async (product) => {
    if (!product) return;
    const pid = product.id || product.productId;
    const pname = product.name || product.title;

    // Optimistic Update
    setWishlistItems((prev) => {
      if (prev.some((i) => isWishlistedItemMatch(i, product))) {
        return prev;
      }
      const unitPrice = Number(product.price || product.current_price || 0);
      const origPrice = Number(product.originalPrice || product.original_price || unitPrice * 1.25);
      return [
        ...prev,
        {
          id: pid,
          productId: pid,
          name: pname,
          image: product.image || product.primary_image || '',
          price: unitPrice,
          originalPrice: origPrice,
          discount: product.discount || (origPrice > unitPrice ? `${Math.round(((origPrice - unitPrice) / origPrice) * 100)}% OFF` : ''),
          category: product.category || product.category_name || 'General',
          specs: product.specs || '',
          inStock: true,
          deliveryDate: 'Delivery in 2-4 days'
        }
      ];
    });

    // Backend Sync
    try {
      const items = await addToWishlistApi(product);
      if (Array.isArray(items) && items.length > 0) {
        setWishlistItems(formatWishlistItems(items));
      }
    } catch (e) {
      console.warn('[CartContext] Add to wishlist sync error:', e);
    }
  };

  // Remove Item from Wishlist
  const removeFromWishlist = async (productIdOrObject) => {
    const targetId = typeof productIdOrObject === 'object' ? (productIdOrObject.id || productIdOrObject.productId) : productIdOrObject;

    // Optimistic Update
    setWishlistItems((prev) => prev.filter((i) => !isWishlistedItemMatch(i, productIdOrObject)));

    // Backend Sync
    try {
      const items = await removeFromWishlistApi(targetId);
      if (Array.isArray(items)) {
        setWishlistItems(formatWishlistItems(items));
      }
    } catch (e) {
      console.warn('[CartContext] Remove from wishlist sync error:', e);
    }
  };

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [
        ...prev,
        {
          ...product,
          inStock: product.inStock ?? true,
          deliveryDate: product.deliveryDate || 'Delivery by 2-3 Days'
        }
      ];
    });
  };

  const isInWishlist = (productIdOrObject) => {
    return wishlistItems.some((item) => isWishlistedItemMatch(item, productIdOrObject));
  };

  const clearWishlist = async () => {
    const items = wishlistItems;
    setWishlistItems([]);
    for (const it of items) {
      try {
        await removeFromWishlistApi(it.productId || it.id);
      } catch (e) {}
    }
  };

  const [savedForLater, setSavedForLater] = useState(() => {
    try {
      const saved = localStorage.getItem('buyzo_saved_for_later');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Mini Cart Drawer State
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  // Gift Wrapping & Message State
  const [isGiftWrapping, setIsGiftWrapping] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const giftWrapFee = isGiftWrapping ? 49 : 0;

  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);

  useEffect(() => {
    try {
      localStorage.setItem('buyzo_saved_for_later', JSON.stringify(savedForLater));
    } catch (e) {}
  }, [savedForLater]);

  const saveForLater = (cartItemId) => {
    const itemToSave = cartItems.find((i) => String(i.id) === String(cartItemId) || String(i.productId) === String(cartItemId));
    if (!itemToSave) return;
    setCartItems((prev) => prev.filter((i) => String(i.id) !== String(cartItemId) && String(i.productId) !== String(cartItemId)));
    setSavedForLater((prev) => {
      if (prev.some((s) => String(s.id) === String(itemToSave.id))) return prev;
      return [...prev, itemToSave];
    });
  };

  const moveToCart = (savedItemId) => {
    const itemToMove = savedForLater.find((s) => String(s.id) === String(savedItemId) || String(s.productId) === String(savedItemId));
    if (!itemToMove) return;
    setSavedForLater((prev) => prev.filter((s) => String(s.id) !== String(savedItemId) && String(s.productId) !== String(savedItemId)));
    addToCart(itemToMove);
  };

  const removeFromSaved = (savedItemId) => {
    setSavedForLater((prev) => prev.filter((s) => String(s.id) !== String(savedItemId) && String(s.productId) !== String(savedItemId)));
  };

  const getItemQuantity = (product) => {
    if (!product) return 0;
    const found = cartItems.find((i) => isItemMatch(i, product));
    return found ? Number(found.quantity) || 0 : 0;
  };

  const isInCart = (product) => {
    return getItemQuantity(product) > 0;
  };

  const cartCount = cartItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
  const wishlistCount = wishlistItems.length;
  const savedCount = savedForLater.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        savedForLater,
        cartCount,
        wishlistCount,
        savedCount,
        cartSummary,
        isLoading,
        isMiniCartOpen,
        setIsMiniCartOpen,
        openMiniCart,
        closeMiniCart,
        isGiftWrapping,
        setIsGiftWrapping,
        giftMessage,
        setGiftMessage,
        giftWrapFee,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        isInCart,
        isItemMatch,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        // Pages consume this predicate under both names; keep them in sync.
        isWishlisted: isInWishlist,
        isProductInWishlist: isInWishlist,
        clearWishlist,
        saveForLater,
        moveToCart,
        removeFromSaved
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCartContext = () => useContext(CartContext);
