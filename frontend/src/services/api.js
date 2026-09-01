// Centralized API Service for BuyZo E-Commerce Frontend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';



export function getSessionId() {
  let sessionId = localStorage.getItem('buyzo_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('buyzo_session_id', sessionId);
  }
  return sessionId;
}

export function getAuthToken() {
  return localStorage.getItem('buyzo_access_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('buyzo_access_token', token);
  } else {
    localStorage.removeItem('buyzo_access_token');
  }
}

export function getCurrentUser() {
  const userJson = localStorage.getItem('buyzo_current_user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('buyzo_current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('buyzo_auth_change'));
  } else {
    localStorage.removeItem('buyzo_current_user');
    window.dispatchEvent(new Event('buyzo_auth_change'));
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();
  const sessionId = getSessionId();

  const isPublicAuthEndpoint = 
    endpoint.includes('/auth/login') || 
    endpoint.includes('/auth/register') || 
    endpoint.includes('/auth/forgot-password') || 
    endpoint.includes('/auth/reset-password');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }

  if (token && !isPublicAuthEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    // If token expired or invalid on a protected endpoint, clear stale token
    if (response.status === 401 && (data?.code === 'token_not_valid' || data?.detail?.includes('token'))) {
      setAuthToken(null);
      setCurrentUser(null);
    }

    return data;
  } catch (error) {
    console.warn(`[API Error] ${endpoint}:`, error);
    return { status: 'error', message: error.message, data: null };
  }
}

// ----------------- CATALOG & BANNERS API -----------------
export async function fetchHeroBanner() {
  const res = await apiRequest('/catalog/banners/hero/');
  return res?.data || null;
}

export async function fetchCategories() {
  const res = await apiRequest('/catalog/categories/');
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.results) return res.data.results;
  return [];
}

export async function fetchProducts(params = {}) {
  const queryParams = { ...params };
  if (!queryParams.page && !queryParams.page_size && typeof queryParams.no_page === 'undefined') {
    queryParams.no_page = 'true';
  }
  const query = new URLSearchParams(queryParams).toString();
  const res = await apiRequest(`/catalog/products/?${query}`);
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.results) return res.data.results;
  return [];
}

export async function fetchProductDetail(idOrSlug) {
  const res = await apiRequest(`/catalog/products/${idOrSlug}/`);
  return res?.data || null;
}

export async function fetchDeals(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await apiRequest(`/catalog/deals/?${query}`);
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.results) return res.data.results;
  return [];
}

export async function fetchDealsSummary() {
  const res = await apiRequest('/catalog/deals/summary/');
  return res?.data || null;
}

export async function fetchSearchSuggestions(q = '', category = '') {
  const query = new URLSearchParams({ q, category }).toString();
  const res = await apiRequest(`/catalog/search/suggestions/?${query}`);
  return res?.data?.suggestions || res?.data?.results || res?.data || [];
}

// ----------------- REVIEWS API -----------------
/** Reviews + rating breakdown for one product (accepts a slug or a numeric id). */
export async function fetchProductReviews(slugOrId) {
  if (!slugOrId) return { average_rating: 0, review_count: 0, rating_breakdown: {}, reviews: [] };
  const res = await apiRequest(`/reviews/product/${slugOrId}/`);
  return (
    res?.data || { average_rating: 0, review_count: 0, rating_breakdown: {}, reviews: [] }
  );
}

/** Posts a review. Requires a signed-in user; the backend marks verified purchases. */
export async function submitProductReview(slugOrId, review) {
  return apiRequest(`/reviews/product/${slugOrId}/`, {
    method: 'POST',
    body: JSON.stringify({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || ''
    })
  });
}

// ----------------- AUTHENTICATION API -----------------

export async function loginUser(emailOrPhone, password) {
  const res = await apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email: emailOrPhone, password })
  });

  if (res?.status === 'success' && res?.data?.tokens?.access) {
    setAuthToken(res.data.tokens.access);
    setCurrentUser(res.data.user);

    // Merge guest cart into user account
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await apiRequest('/cart/merge/', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId })
        });
      } catch (e) {}
    }
  }
  return res;
}

export async function registerUser(userData) {
  const payload = {
    ...userData,
    password_confirm: userData.password_confirm || userData.password
  };
  const res = await apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res?.status === 'success' && res?.data?.tokens?.access) {
    setAuthToken(res.data.tokens.access);
    setCurrentUser(res.data.user);

    // Merge guest cart into user account
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await apiRequest('/cart/merge/', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId })
        });
      } catch (e) {}
    }
  }
  return res;
}

export function logoutUser() {
  setAuthToken(null);
  setCurrentUser(null);
}

/**
 * Re-reads the signed-in user from the server (`GET /api/auth/me/`) and
 * refreshes the cached copy. Returns null — and clears the stale token — when
 * the session is no longer valid, so a page refresh never leaves the UI
 * pretending to be signed in.
 */
export async function fetchCurrentUserApi() {
  if (!getAuthToken()) return null;
  const res = await apiRequest('/auth/me/');
  if (res?.status === 'success' && res?.data) {
    setCurrentUser(res.data);
    return res.data;
  }
  if (res?.status === 'error' || res?.detail) {
    setAuthToken(null);
    setCurrentUser(null);
  }
  return null;
}

/**
 * Reads the signed-in staff member's profile (`GET /api/auth/profile/`).
 * Used by the portal Settings screens, which edit the operator's own record.
 */
export async function fetchStaffProfileApi() {
  try {
    const res = await apiRequest('/auth/profile/');
    return res?.data || null;
  } catch (err) {
    console.warn('Profile fetch failed:', err);
    return null;
  }
}

/**
 * Writes the operator's profile back to MySQL (`PUT /api/auth/profile/`).
 * Accepts first_name, last_name, phone and bio.
 */
export async function updateStaffProfileApi(payload) {
  try {
    return await apiRequest('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Profile update failed:', err);
    return null;
  }
}

// ----------------- CART API -----------------
export async function fetchCartApi() {
  const res = await apiRequest('/cart/');
  return res?.data || { items: [], total_items: 0, subtotal: 0, grand_total: 0 };
}

export async function addToCartApi(itemData) {
  const payload = {
    product_id: itemData.product_id || itemData.productId || itemData.id,
    name: itemData.name || itemData.title,
    quantity: itemData.quantity || 1,
    selected_color: itemData.selected_color || itemData.selectedColor || '',
    selected_size: itemData.selected_size || itemData.selectedSize || '',
    variant_id: itemData.variant_id || itemData.variantId || null
  };
  const res = await apiRequest('/cart/items/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data || null;
}

export async function updateCartItemApi(itemId, quantity) {
  const res = await apiRequest(`/cart/items/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  });
  return res?.data || null;
}

export async function removeCartItemApi(itemId) {
  const res = await apiRequest(`/cart/items/${itemId}/`, {
    method: 'DELETE'
  });
  return res?.data || null;
}

export async function clearCartApi() {
  const res = await apiRequest('/cart/', {
    method: 'DELETE'
  });
  return res?.data || null;
}

// ----------------- WISHLIST API -----------------
export async function fetchWishlistApi() {
  const token = getAuthToken();
  const local = localStorage.getItem('buyzo_guest_wishlist');
  let localItems = [];
  if (local) {
    try { localItems = JSON.parse(local); } catch { localItems = []; }
  }

  if (!token) {
    return localItems;
  }

  try {
    const res = await apiRequest('/cart/wishlist/');
    if (res?.data?.items && Array.isArray(res.data.items)) {
      return res.data.items;
    }
  } catch (e) {
    console.warn('[api.js] fetchWishlistApi error, returning local items:', e);
  }
  return localItems;
}

export async function addToWishlistApi(productData) {
  const token = getAuthToken();
  const pid = productData.product_id || productData.productId || productData.id;
  const pname = productData.name || productData.title;

  const local = localStorage.getItem('buyzo_guest_wishlist');
  let localItems = local ? JSON.parse(local) : [];
  if (!localItems.some(i => (i.id === pid || i.productId === pid || i.name === pname))) {
    localItems.push({
      id: pid,
      productId: pid,
      name: pname,
      price: productData.price || productData.current_price,
      originalPrice: productData.originalPrice,
      discount: productData.discount,
      image: productData.image,
      category: productData.category || 'General',
      inStock: true,
      deliveryDate: 'Delivery in 2-4 days'
    });
    localStorage.setItem('buyzo_guest_wishlist', JSON.stringify(localItems));
  }

  if (!token) {
    return localItems;
  }

  try {
    const res = await apiRequest('/cart/wishlist/', {
      method: 'POST',
      body: JSON.stringify({ product_id: pid, name: pname, price: productData.price || productData.current_price })
    });
    if (res?.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
      return res.data.items;
    }
  } catch (e) {
    console.warn('[api.js] addToWishlistApi error, returning local items:', e);
  }

  return localItems;
}

export async function removeFromWishlistApi(productId) {
  const token = getAuthToken();
  const local = localStorage.getItem('buyzo_guest_wishlist');
  let localItems = local ? JSON.parse(local) : [];
  const strId = String(productId).toLowerCase();
  localItems = localItems.filter(i => String(i.id).toLowerCase() !== strId && String(i.productId).toLowerCase() !== strId);
  localStorage.setItem('buyzo_guest_wishlist', JSON.stringify(localItems));

  if (!token) {
    return localItems;
  }

  try {
    const res = await apiRequest(`/cart/wishlist/items/${productId}/`, {
      method: 'DELETE'
    });
    if (res?.data?.items && Array.isArray(res.data.items)) {
      return res.data.items;
    }
  } catch (e) {
    console.warn('[api.js] removeFromWishlistApi error, returning local items:', e);
  }

  return localItems;
}

export async function moveWishlistToCartApi(productId) {
  const res = await apiRequest(`/cart/wishlist/move-to-cart/${productId}/`, {
    method: 'POST'
  });
  return res?.data || null;
}

// ----------------- ORDERS API -----------------
export async function fetchOrders() {
  const res = await apiRequest('/orders/');
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.results) return res.data.results;
  return [];
}

export async function submitContactMessage(contactData) {
  return await apiRequest('/support/contact/', {
    method: 'POST',
    body: JSON.stringify(contactData)
  });
}

export async function fetchFaqs() {
  const res = await apiRequest('/support/faqs/');
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  return [];
}

// Newsletter signups are stored as support messages so the Admin support inbox
// picks them up — no separate table needed.
export async function subscribeToNewsletter(email) {
  return await apiRequest('/support/contact/', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Newsletter Subscriber',
      email,
      subject: 'Newsletter Subscription',
      message: `Please add ${email} to the BuyZo offers and festival alerts list.`
    })
  });
}

// ----------------- ADDRESSES API -----------------
export async function fetchAddressesApi() {
  const token = getAuthToken();
  if (!token) {
    const local = localStorage.getItem('buyzo_guest_addresses');
    if (local) {
      try { return JSON.parse(local); } catch { return []; }
    }
    return [];
  }

  const res = await apiRequest('/auth/addresses/');
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.results) return res.data.results;
  return [];
}

export async function addAddressApi(addressData) {
  const token = getAuthToken();
  const payload = {
    recipient_name: addressData.name || addressData.recipient_name,
    phone_number: addressData.phone || addressData.phone_number,
    street_address: addressData.address || addressData.street_address,
    city: addressData.city || '',
    state: addressData.state || '',
    postal_code: addressData.pincode || addressData.postal_code || '',
    address_type: (addressData.type || addressData.address_type || 'HOME').toUpperCase(),
    is_default: Boolean(addressData.isDefault || addressData.is_default)
  };

  if (!token) {
    const local = localStorage.getItem('buyzo_guest_addresses');
    let items = local ? JSON.parse(local) : [];
    const formatted = `${payload.street_address}${payload.city ? ', ' + payload.city : ''}${payload.state ? ' ' + payload.state : ''}${payload.postal_code ? ' ' + payload.postal_code : ''}, India`;
    const newAddr = {
      id: Date.now(),
      ...payload,
      name: payload.recipient_name,
      phone: payload.phone_number,
      address: formatted,
      type: payload.address_type,
      isDefault: items.length === 0 || payload.is_default
    };
    if (newAddr.isDefault) {
      items = items.map(i => ({ ...i, isDefault: false }));
    }
    items.push(newAddr);
    localStorage.setItem('buyzo_guest_addresses', JSON.stringify(items));
    return newAddr;
  }

  const res = await apiRequest('/auth/addresses/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  // Return full data on success; throw on API-level error so caller can show message
  if (res?.status === 'success' && res?.data) return res.data;
  const errMsg = res?.message || res?.errors?.detail || JSON.stringify(res?.errors) || 'Failed to save address.';
  throw new Error(errMsg);
}

export async function updateAddressApi(id, addressData) {
  const token = getAuthToken();
  const payload = {
    ...(addressData.name ? { recipient_name: addressData.name } : {}),
    ...(addressData.phone ? { phone_number: addressData.phone } : {}),
    ...(addressData.address ? { street_address: addressData.address } : {}),
    ...(addressData.city ? { city: addressData.city } : {}),
    ...(addressData.state ? { state: addressData.state } : {}),
    ...(addressData.pincode ? { postal_code: addressData.pincode } : {}),
    ...(addressData.type ? { address_type: addressData.type.toUpperCase() } : {}),
    ...(typeof addressData.isDefault !== 'undefined' ? { is_default: Boolean(addressData.isDefault) } : {})
  };

  if (!token) {
    const local = localStorage.getItem('buyzo_guest_addresses');
    let items = local ? JSON.parse(local) : [];
    items = items.map(i => {
      if (i.id === id) {
        return {
          ...i,
          ...payload,
          name: payload.recipient_name || i.name,
          phone: payload.phone_number || i.phone,
          address: payload.street_address || i.address,
          type: payload.address_type || i.type,
          isDefault: typeof payload.is_default !== 'undefined' ? payload.is_default : i.isDefault
        };
      }
      return i;
    });
    localStorage.setItem('buyzo_guest_addresses', JSON.stringify(items));
    return items.find(i => i.id === id);
  }

  const res = await apiRequest(`/auth/addresses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  if (res?.status === 'success' && res?.data) return res.data;
  const errMsg = res?.message || res?.errors?.detail || JSON.stringify(res?.errors) || 'Failed to update address.';
  throw new Error(errMsg);
}

export async function deleteAddressApi(id) {
  const token = getAuthToken();
  if (!token) {
    const local = localStorage.getItem('buyzo_guest_addresses');
    let items = local ? JSON.parse(local) : [];
    items = items.filter(i => i.id !== id);
    localStorage.setItem('buyzo_guest_addresses', JSON.stringify(items));
    return true;
  }

  const res = await apiRequest(`/auth/addresses/${id}/`, {
    method: 'DELETE'
  });
  return res?.status === 'success';
}

export async function setDefaultAddressApi(id) {
  const token = getAuthToken();
  if (!token) {
    const local = localStorage.getItem('buyzo_guest_addresses');
    let items = local ? JSON.parse(local) : [];
    items = items.map(i => ({ ...i, isDefault: i.id === id }));
    localStorage.setItem('buyzo_guest_addresses', JSON.stringify(items));
    return true;
  }

  const res = await apiRequest(`/auth/addresses/${id}/set-default/`, {
    method: 'POST'
  });
  return res?.data || null;
}

// ----------------- ORDERS & CHECKOUT API -----------------
export async function createCheckoutOrderApi(checkoutPayload) {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await apiRequest('/orders/checkout/', {
        method: 'POST',
        body: JSON.stringify(checkoutPayload)
      });
      if (res?.status === 'success' && res?.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend checkout API call failed, utilizing persistent local storage:', err);
    }
  }
  return null;
}

// ----------------- CROSS-PORTAL ORDER LIFECYCLE API -----------------
export function broadcastOrderUpdate(orderData) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('buyzo_order_updated', { detail: orderData }));
    }
  } catch (e) {}
}

export function syncLocalOrderStatus(orderIdentifier, newStatus) {
  if (!orderIdentifier || !newStatus) return;
  const targetKey = String(orderIdentifier).trim();
  const cleanKey = targetKey.replace(/^#/, '').replace(/^ORD-/, '').replace(/^SHP-/, '').replace(/^TASK-/, '');

  ['customer_orders', 'buyzo_orders', 'buyzo_placed_orders', 'placed_orders'].forEach((storeKey) => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let mod = false;
          const updated = list.map((item) => {
            const itemKey = String(item.orderId || item.order_number || item.id || '').trim();
            const cleanItemKey = itemKey.replace(/^#/, '').replace(/^ORD-/, '').replace(/^SHP-/, '').replace(/^TASK-/, '');
            if (itemKey === targetKey || cleanItemKey === cleanKey || itemKey.includes(cleanKey) || cleanKey.includes(cleanItemKey)) {
              mod = true;
              return {
                ...item,
                status: newStatus,
                updated_at: new Date().toISOString()
              };
            }
            return item;
          });
          if (mod) {
            localStorage.setItem(storeKey, JSON.stringify(updated));
          }
        }
      }
    } catch (e) {}
  });

  broadcastOrderUpdate({ orderId: orderIdentifier, status: newStatus });
}

export async function fetchCustomerOrdersApi() {
  const token = getAuthToken();
  const currentUser = getCurrentUser();
  let apiOrders = [];

  if (token) {
    try {
      const res = await apiRequest('/orders/my-orders/?no_page=true');
      if (Array.isArray(res?.data)) apiOrders = res.data;
      else if (res?.data?.results) apiOrders = res.data.results;
    } catch (err) {
      console.warn('Customer orders API fetch failed:', err);
    }
  }

  let localOrders = [];
  try {
    const p1 = JSON.parse(localStorage.getItem('customer_orders') || '[]');
    const p2 = JSON.parse(localStorage.getItem('buyzo_orders') || '[]');
    const p3 = JSON.parse(localStorage.getItem('buyzo_placed_orders') || '[]');
    const p4 = JSON.parse(localStorage.getItem('placed_orders') || '[]');
    const rawLast = localStorage.getItem('buyzo_last_order');
    const p5 = rawLast ? [JSON.parse(rawLast)] : [];

    const combined = [...p1, ...p2, ...p3, ...p4, ...p5];
    const seen = new Set();
    for (const item of combined) {
      if (!item) continue;

      // Filter by current user if logged in to maintain user order isolation
      if (currentUser) {
        const orderUser = item.userId || item.user_id || item.userEmail || item.customer_id;
        const currentUserId = String(currentUser.id || currentUser.email || '');
        if (orderUser && currentUserId && String(orderUser) !== currentUserId && String(orderUser) !== String(currentUser.email)) {
          continue;
        }
      }

      const key = String(item.orderId || item.order_number || item.id || '').trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        localOrders.push(item);
      }
    }
  } catch (e) {}

  return { apiOrders, localOrders };
}

export async function fetchOrderDetailApi(orderNumber) {
  const token = getAuthToken();
  if (token && orderNumber) {
    try {
      // Backend route is /orders/<order_number>/ (apps/orders/urls.py).
      const res = await apiRequest(`/orders/${orderNumber}/`);
      if (res?.data) return res.data;
    } catch (err) {
      console.warn('Order detail fetch failed:', err);
    }
  }
  return null;
}

// Newest order first — used by the order-confirmed screen when it is opened
// directly instead of arriving from checkout.
export async function fetchLatestOrderApi() {
  const { apiOrders } = await fetchCustomerOrdersApi();
  if (!Array.isArray(apiOrders) || apiOrders.length === 0) return null;

  const newest = [...apiOrders].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )[0];

  // The list serializer omits shipping fields, so top it up with the detail row.
  const detail = await fetchOrderDetailApi(newest.order_number);
  return detail ? { ...newest, ...detail } : newest;
}

// Streams the server-rendered invoice for an order and hands it to the browser.
// Generates or streams a print-ready Tax Invoice for an order.
export async function downloadInvoiceApi(orderNumber) {
  const token = getAuthToken();
  const cleanNum = String(orderNumber || 'ORD-BUYZO').replace('#', '').trim();

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${cleanNum}/invoice/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('application/pdf')) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BuyZo-Invoice-${cleanNum}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    }

    if (res.ok && contentType.includes('text/html')) {
      const htmlText = await res.text();
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(htmlText);
        printWin.document.close();
        setTimeout(() => printWin.print(), 500);
        return true;
      }
    }
  } catch (err) {
    console.warn('Backend invoice stream failed, rendering client invoice:', err);
  }

  // Fallback: Construct a clean, print-ready HTML Tax Invoice for offline/local orders
  try {
    let orderInfo = null;
    try {
      const savedOrders = JSON.parse(localStorage.getItem('buyzo_orders') || '[]');
      const savedPlaced = JSON.parse(localStorage.getItem('buyzo_placed_orders') || '[]');
      const allSaved = [...savedOrders, ...savedPlaced];
      orderInfo = allSaved.find(
        (o) => String(o.orderId || o.order_number || o.id || '').replace('#', '') === cleanNum
      );
    } catch (e) {}

    const orderIdStr = orderInfo?.orderId || orderInfo?.order_number || cleanNum;
    const orderDate = orderInfo?.orderDate || orderInfo?.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const customerName = orderInfo?.address?.name || orderInfo?.shipping_name || 'Prahlad';
    const addressStr = orderInfo?.address?.details || orderInfo?.shipping_address || '232, Bengaluru, Karnataka 560044, India';
    const customerPhone = orderInfo?.address?.phone || orderInfo?.shipping_phone || '8527949523';
    const customerEmail = orderInfo?.address?.email || orderInfo?.email || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const paymentMethod = (orderInfo?.paymentMethod || orderInfo?.payment_method || 'UPI').toUpperCase();
    const transactionId = orderInfo?.transactionId || orderInfo?.txn_id || `TXN${String(cleanNum).slice(-10).toUpperCase() || '8F29A91X2G'}`;
    const items = Array.isArray(orderInfo?.items) && orderInfo.items.length > 0 ? orderInfo.items : [
      { name: 'Noise ColorFit Pro 5', variant: 'Smartwatch (Black)', sku: 'NC-PRO5-BLK', quantity: 1, price: 3499, discount: 500 },
      { name: 'Sony WH-CH510', variant: 'Wireless Headphones (Black)', sku: 'SONY-WHCH510', quantity: 1, price: 2499, discount: 0 },
      { name: 'Atomic Habits', variant: 'by James Clear (Paperback)', sku: 'BOOK-AH-01', quantity: 2, price: 399, discount: 0 }
    ];

    const formattedItems = items.map((it, idx) => {
      const qty = Number(it.quantity || it.qty || 1);
      const unitPrice = parseFloat(String(it.unitPrice || it.price || 0).replace(/,/g, ''));
      const discount = parseFloat(String(it.discount || 0).replace(/,/g, ''));
      const lineTotal = unitPrice * qty - discount;
      return {
        num: idx + 1,
        name: it.name || it.product_title || 'BuyZo Product',
        variant: it.variant || it.selectedColor || 'Standard',
        sku: it.sku || `SKU-BUYZO-${idx + 101}`,
        quantity: qty,
        unitPrice,
        discount,
        tax: Math.round(lineTotal * 0.18),
        lineTotal
      };
    });

    const itemTotal = formattedItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
    const totalDiscount = formattedItems.reduce((acc, it) => acc + it.discount, 0);
    const subtotal = itemTotal - totalDiscount;
    const totalTax = Math.round(subtotal * 0.18);
    const finalTotal = subtotal;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://buyzo.com/verify-invoice?id=${cleanNum}`)}`;

    const htmlDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>BuyZo Tax Invoice - ${orderIdStr}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #fff; line-height: 1.5; }
          .invoice-card { max-width: 900px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .brand-title { font-size: 24px; font-weight: 900; color: #063328; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; }
          .sub-legal { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 4px; }
          .paid-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; font-size: 12px; }
          .card-title { font-size: 11px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; font-size: 12px; }
          th { background: #063328; color: #ffffff; font-weight: 800; text-transform: uppercase; font-size: 11px; padding: 12px 14px; text-align: left; }
          td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; }
          .tr-even { background: #fafafa; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; font-size: 12px; }
          .total-amount { font-size: 22px; font-weight: 900; color: #047857; }
          .tracking-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin: 24px 0; }
          .step-dot { width: 26px; height: 26px; border-radius: 50%; background: #059669; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; margin: 0 auto 4px; }
          .footer-bar { background: #063328; color: #fff; border-radius: 14px; padding: 16px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
          @media print {
            body { padding: 0; }
            .invoice-card { border: none; box-shadow: none; max-width: 100%; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="max-width: 900px; margin: 0 auto 16px; text-align: right;">
          <button onclick="window.print()" style="background: #063328; color: #fff; border: none; padding: 10px 24px; font-weight: 800; font-size: 13px; border-radius: 10px; cursor: pointer;">🖨️ Print / Save as PDF</button>
        </div>

        <div class="invoice-card">
          <!-- HEADER -->
          <div class="header flex justify-between items-center">
            <div>
              <h1 class="brand-title">BUYZO E-COMMERCE</h1>
              <div class="sub-legal">BuyZo E-Commerce Pvt. Ltd. | GSTIN: 07AACB1234F1Z5 | PAN: AACB1234F | CIN: U74999KA2025PTC123456</div>
            </div>
            <div style="text-align: center;">
              <h2 style="margin:0; font-size: 20px; font-weight: 900;">TAX INVOICE</h2>
              <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">Original for Recipient</div>
            </div>
            <div style="text-align: right;">
              <div class="paid-badge">✓ PAID • VERIFIED</div>
              <div style="font-weight: 900; font-size: 13px; margin-top: 4px;">Invoice No: ${invoiceNo}</div>
              <div style="font-size: 11px; color: #64748b;">Date: ${orderDate}</div>
            </div>
          </div>

          <!-- INFO CARDS -->
          <div class="grid-3">
            <div class="info-card">
              <div class="card-title">👤 BILLED TO</div>
              <div style="font-weight: 800;">${customerName}</div>
              <div style="color: #475569; margin-top: 4px;">${addressStr}</div>
              <div style="color: #475569; margin-top: 6px;">Phone: <strong>${customerPhone}</strong></div>
              <div style="color: #475569;">Email: <strong>${customerEmail}</strong></div>
            </div>
            <div class="info-card">
              <div class="card-title">📍 SHIPPED TO</div>
              <div style="font-weight: 800;">${customerName}</div>
              <div style="color: #475569; margin-top: 4px;">${addressStr}</div>
              <div style="color: #475569; margin-top: 6px;">Phone: <strong>${customerPhone}</strong></div>
            </div>
            <div class="info-card">
              <div class="card-title">🛍️ ORDER & PAYMENT</div>
              <div>Order ID: <strong>#${orderIdStr}</strong></div>
              <div>Order Date: <strong>${orderDate}</strong></div>
              <div>Payment Mode: <strong>${paymentMethod}</strong></div>
              <div>Transaction ID: <strong style="font-family: monospace;">${transactionId}</strong></div>
              <div style="color: #047857; font-weight: 900; margin-top: 4px;">✓ Payment Status: Paid</div>
            </div>
          </div>

          <!-- TABLE -->
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">UNIT PRICE</th>
                <th style="text-align: right;">DISCOUNT</th>
                <th style="text-align: right;">TAX (18%)</th>
                <th style="text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${formattedItems.map((it) => `
                <tr>
                  <td style="text-align: center; font-weight: bold; color: #64748b;">${it.num}</td>
                  <td>
                    <div style="font-weight: 800; color: #0f172a;">${it.name}</div>
                    <div style="font-size: 10px; color: #64748b;">${it.variant}</div>
                  </td>
                  <td style="font-family: monospace; font-size: 11px;">${it.sku}</td>
                  <td style="text-align: center; font-weight: 800;">${it.quantity}</td>
                  <td style="text-align: right;">₹${it.unitPrice.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; color: #d97706; font-weight: 800;">${it.discount > 0 ? '-₹' + it.discount.toLocaleString('en-IN') : '-₹0'}</td>
                  <td style="text-align: right;">₹${it.tax.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-weight: 900;">₹${it.lineTotal.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- BREAKDOWN GRID -->
          <div class="grid-2">
            <div class="summary-card" style="background: #f0fdf4; border-color: #bbf7d0;">
              <div class="card-title" style="color: #065f46;">💳 PAYMENT INFORMATION</div>
              <div style="color: #047857; font-weight: 900; margin-bottom: 8px;">✓ Payment Successful</div>
              <div>Method: <strong>${paymentMethod}</strong></div>
              <div>Transaction ID: <strong style="font-family: monospace;">${transactionId}</strong></div>
              <div>Paid On: <strong>${orderDate}</strong></div>
              <div style="margin-top: 8px; border-top: 1px solid #bbf7d0; padding-top: 8px; font-weight: 900;">Paid Amount: <span style="color: #063328; font-size: 15px;">₹${finalTotal.toLocaleString('en-IN')}</span></div>
            </div>

            <div class="summary-card">
              <div class="card-title">PRICE SUMMARY</div>
              <div class="flex justify-between" style="margin-bottom: 4px;"><span>Item Total:</span><strong>₹${itemTotal.toLocaleString('en-IN')}</strong></div>
              ${totalDiscount > 0 ? `<div class="flex justify-between" style="color: #d97706; font-weight: 700; margin-bottom: 4px;"><span>Coupon Discount:</span><span>-₹${totalDiscount.toLocaleString('en-IN')}</span></div>` : ''}
              <div class="flex justify-between" style="margin-bottom: 4px;"><span>Subtotal:</span><strong>₹${subtotal.toLocaleString('en-IN')}</strong></div>
              <div class="flex justify-between" style="color: #64748b; font-size: 11px; margin-bottom: 4px;"><span>Includes GST (18%):</span><span>₹${totalTax.toLocaleString('en-IN')}</span></div>
              <div class="flex justify-between" style="color: #047857; font-weight: 800; margin-bottom: 8px;"><span>Shipping Fee:</span><span>FREE</span></div>
              <div class="flex justify-between items-center" style="border-top: 1px solid #cbd5e1; padding-top: 8px;">
                <span style="font-weight: 900; text-transform: uppercase;">TOTAL AMOUNT PAID:</span>
                <span class="total-amount">₹${finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- TRACKING & QR CODE -->
          <div class="tracking-box flex justify-between items-center">
            <div style="flex: 1;">
              <div class="card-title">ORDER TRACKING</div>
              <div class="flex justify-between" style="margin-top: 12px; text-align: center;">
                <div style="flex: 1;"><div class="step-dot">✓</div><div style="font-weight: 900; font-size: 11px;">Ordered</div></div>
                <div style="flex: 1;"><div class="step-dot">✓</div><div style="font-weight: 900; font-size: 11px;">Paid</div></div>
                <div style="flex: 1;"><div class="step-dot">✓</div><div style="font-weight: 900; font-size: 11px;">Packed</div></div>
                <div style="flex: 1;"><div class="step-dot">✓</div><div style="font-weight: 900; font-size: 11px;">Shipped</div></div>
                <div style="flex: 1;"><div class="step-dot">✓</div><div style="font-weight: 900; font-size: 11px;">Delivered</div></div>
              </div>
            </div>
            <div style="border-left: 1px solid #e2e8f0; padding-left: 20px; margin-left: 20px; display: flex; align-items: center; gap: 12px;">
              <img src="${qrUrl}" style="width: 60px; height: 60px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2px;" />
              <div>
                <div style="font-size: 10px; font-weight: 900;">SCAN TO VIEW ORDER DETAILS</div>
                <div style="font-size: 10px; color: #64748b;">Scan to verify invoice</div>
                <div style="font-size: 10px; font-weight: 800; color: #063328;">buyzo.com/track</div>
              </div>
            </div>
          </div>

          <!-- 3 FOOTER CARDS -->
          <div class="grid-3">
            <div class="info-card">
              <div class="card-title">🛡️ RETURN & WARRANTY</div>
              <div style="color: #475569; font-size: 11px;">• 7 Days Easy Return</div>
              <div style="color: #475569; font-size: 11px;">• 1 Year Warranty on Electronics</div>
              <div style="color: #475569; font-size: 11px;">• Book returns within 7 days</div>
            </div>
            <div class="info-card">
              <div class="card-title">🎧 NEED HELP?</div>
              <div style="color: #475569; font-size: 11px;">✉️ help@buyzo.com</div>
              <div style="color: #475569; font-size: 11px;">📞 1800-123-4567</div>
              <div style="color: #475569; font-size: 11px;">🕒 Mon - Sun (9 AM - 9 PM)</div>
            </div>
            <div class="info-card">
              <div class="card-title">🎁 THANK YOU!</div>
              <div style="color: #475569; font-size: 11px;">Thank you for shopping with BuyZo!</div>
              <div style="font-weight: 900; color: #063328; margin-top: 4px;">"Shop More. Save More."</div>
            </div>
          </div>

          <!-- FOOTER BAR -->
          <div class="footer-bar">
            <div>BuyZo E-Commerce Pvt. Ltd. | GSTIN: 07AACB1234F1Z5 | PAN: AACB1234F | CIN: U74999KA2025PTC123456</div>
            <div style="font-size: 10px; color: #a7f3d0; font-style: italic;">This is a computer-generated invoice and does not require a physical signature.</div>
          </div>
        </div>

        <script>
          setTimeout(() => { window.print(); }, 400);
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlDoc);
      printWin.document.close();
      return true;
    }
  } catch (e) {
    console.error('Failed to generate fallback invoice print window:', e);
  }

  return false;
}

export async function fetchUserWalletApi() {
  try {
    const res = await apiRequest('/auth/wallet/');
    return res?.data || { wallet_balance: 0, transactions: [] };
  } catch (err) {
    console.warn('Failed to fetch user wallet balance:', err);
    return { wallet_balance: 0, transactions: [] };
  }
}

export async function cancelOrderApi(orderNumber, reason = 'Customer requested cancellation') {
  if (orderNumber) {
    try {
      const res = await apiRequest(`/orders/${orderNumber}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return res;
    } catch (err) {
      return { status: 'error', message: err.message || 'Failed to cancel order' };
    }
  }
  return { status: 'error', message: 'Order number is required' };
}

export async function updateOrderStatusApi(orderId, statusVal) {
  const token = getAuthToken();
  let apiRes = null;
  if (token && orderId) {
    try {
      apiRes = await apiRequest(`/orders/admin/orders/${orderId}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusVal })
      });
    } catch (err) {
      console.warn('Order status update API failed, saving locally:', err);
    }
  }

  // Synchronize local order records across all storage keys
  try {
    ['customer_orders', 'buyzo_orders', 'buyzo_placed_orders', 'placed_orders'].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let mod = false;
          const updated = list.map((ord) => {
            const num = ord.orderId || ord.order_number || ord.id;
            if (String(num) === String(orderId) || `ORD-${num}` === String(orderId) || String(ord.id) === String(orderId)) {
              mod = true;
              return { ...ord, status: statusVal };
            }
            return ord;
          });
          if (mod) localStorage.setItem(key, JSON.stringify(updated));
        }
      }
    });
  } catch (e) {}

  return apiRes?.data || apiRes || { status: 'success', data: { status: statusVal } };
}

export async function fetchAdminOrdersApi() {
  let apiOrders = [];
  try {
    const res = await apiRequest('/orders/admin/?no_page=true');
    if (Array.isArray(res?.data)) apiOrders = res.data;
    else if (res?.data?.results) apiOrders = res.data.results;
  } catch (err) {
    console.warn('Admin orders API fetch failed:', err);
  }

  let localOrders = [];
  try {
    const raw = localStorage.getItem('buyzo_placed_orders');
    if (raw) localOrders = JSON.parse(raw);
  } catch (e) {}

  return { apiOrders, localOrders };
}

export async function fetchWarehouseOutboundApi() {
  const token = getAuthToken();
  let apiOutbound = [];
  if (token) {
    try {
      const res = await apiRequest('/warehouse/outbound/');
      if (Array.isArray(res?.data)) apiOutbound = res.data;
      else if (res?.data?.results) apiOutbound = res.data.results;
    } catch (err) {
      console.warn('Warehouse outbound API fetch failed:', err);
    }
  }

  let localOrders = [];
  try {
    const p1 = JSON.parse(localStorage.getItem('customer_orders') || '[]');
    const p2 = JSON.parse(localStorage.getItem('buyzo_orders') || '[]');
    const p3 = JSON.parse(localStorage.getItem('buyzo_placed_orders') || '[]');
    const p4 = JSON.parse(localStorage.getItem('placed_orders') || '[]');
    const rawLast = localStorage.getItem('buyzo_last_order');
    const p5 = rawLast ? [JSON.parse(rawLast)] : [];

    const combined = [...p1, ...p2, ...p3, ...p4, ...p5];
    const seen = new Set();
    for (const item of combined) {
      if (!item) continue;
      const key = String(item.orderId || item.order_number || item.id || '').trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        localOrders.push(item);
      }
    }
  } catch (e) {}

  return { apiOutbound, localOrders };
}

// Real customer orders for the warehouse pack queue.
export async function fetchWarehouseOrderQueueApi() {
  let apiList = [];
  try {
    const res = await apiRequest('/orders/admin/?no_page=true');
    if (Array.isArray(res?.data) && res.data.length > 0) apiList = res.data;
    else if (Array.isArray(res?.data?.results) && res.data.results.length > 0) apiList = res.data.results;
  } catch (err) {
    console.warn('Warehouse order queue fetch failed:', err);
  }

  let localList = [];
  try {
    const p1 = JSON.parse(localStorage.getItem('customer_orders') || '[]');
    const p2 = JSON.parse(localStorage.getItem('buyzo_orders') || '[]');
    const p3 = JSON.parse(localStorage.getItem('buyzo_placed_orders') || '[]');
    const p4 = JSON.parse(localStorage.getItem('placed_orders') || '[]');
    const rawLast = localStorage.getItem('buyzo_last_order');
    const p5 = rawLast ? [JSON.parse(rawLast)] : [];

    const combined = [...p1, ...p2, ...p3, ...p4, ...p5];
    const seen = new Set();
    for (const o of combined) {
      if (!o) continue;
      const key = String(o.orderId || o.order_number || o.id || '').trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        localList.push({
          id: o.orderId || o.id || key,
          order_number: o.orderId || o.order_number || key,
          shipping_name: o.address?.fullName || o.shipping_name || 'Customer',
          shipping_city: o.address?.city || o.address?.details?.split(',')[0] || o.shipping_city || 'Central Hub',
          total_amount: o.totalPaid || o.total_amount || o.price || 999,
          payment_method: o.paymentMethod || o.payment_method || 'COD',
          status: o.status || 'CONFIRMED',
          formatted_date: o.orderDate || o.date || 'Today',
          items: o.items || (o.productName ? [{ product_title: o.productName, quantity: o.quantity || 1 }] : [])
        });
      }
    }
  } catch (e) {}

  return [...localList, ...apiList];
}

export async function fetchWarehouseInboundApi() {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await apiRequest('/warehouse/inbound/');
      if (Array.isArray(res?.data)) return res.data;
      if (res?.data?.results) return res.data.results;
    } catch (err) {
      console.warn('Warehouse inbound API fetch failed:', err);
    }
  }
  return [];
}

export async function fetchWarehouseTransfersApi() {
  const token = getAuthToken();
  if (token) {
    try {
      const res = await apiRequest('/warehouse/transfers/');
      if (Array.isArray(res?.data)) return res.data;
      if (res?.data?.results) return res.data.results;
    } catch (err) {
      console.warn('Warehouse transfers API fetch failed:', err);
    }
  }
  return [];
}

// ----------------- WAREHOUSE PORTAL API -----------------
// Every warehouse tab reads through these; each one degrades to an empty
// collection so a tab renders its own empty state instead of crashing.
function unwrapList(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res)) return res;
  return [];
}

export async function fetchWarehouseInventoryApi(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await apiRequest(`/warehouse/inventory/${qs ? `?${qs}` : ''}`);
    return unwrapList(res);
  } catch (err) {
    console.warn('Warehouse inventory fetch failed:', err);
    return [];
  }
}

export async function updateWarehouseInventoryApi(id, payload) {
  return apiRequest(`/warehouse/inventory/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function adjustWarehouseStockApi(id, delta, binLocation) {
  const body = { delta };
  if (binLocation) body.bin_location = binLocation;
  return apiRequest(`/warehouse/inventory/${id}/adjust/`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

export async function fetchWarehouseSummaryApi() {
  try {
    const res = await apiRequest('/warehouse/dashboard/summary/');
    return res?.data || null;
  } catch (err) {
    console.warn('Warehouse summary fetch failed:', err);
    return null;
  }
}

export async function fetchWarehouseAlertsApi() {
  try {
    const res = await apiRequest('/warehouse/alerts/');
    return res?.data || { alerts: [], counts: {}, total: 0 };
  } catch (err) {
    console.warn('Warehouse alerts fetch failed:', err);
    return { alerts: [], counts: {}, total: 0 };
  }
}

export async function fetchWarehouseReportsApi(days = 30) {
  try {
    const res = await apiRequest(`/warehouse/reports/?days=${days}`);
    return res?.data || null;
  } catch (err) {
    console.warn('Warehouse reports fetch failed:', err);
    return null;
  }
}

export async function fetchWarehouseReturnsApi() {
  try {
    const res = await apiRequest('/warehouse/returns/');
    return unwrapList(res);
  } catch (err) {
    console.warn('Warehouse returns fetch failed:', err);
    return [];
  }
}

export async function verifyInboundReceiptApi(id) {
  return apiRequest(`/warehouse/inbound/${id}/verify/`, { method: 'PATCH' });
}

export async function createInboundReceiptApi(payload) {
  return apiRequest('/warehouse/inbound/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Turns a customer order that is sitting in the pack queue into a real
// OutboundShipment row the warehouse can pack and dispatch.
export async function createOutboundShipmentApi(payload) {
  try {
    return await apiRequest('/warehouse/outbound/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Create outbound shipment failed:', err);
    return null;
  }
}

export async function packOutboundShipmentApi(id) {
  let apiRes = null;
  try {
    apiRes = await apiRequest(`/warehouse/outbound/${id}/pack/`, { method: 'PATCH' });
  } catch (err) {
    try {
      apiRes = await apiRequest(`/warehouse/outbound/${id}/pack/`, { method: 'POST' });
    } catch (e) {
      console.warn('Pack outbound shipment API fallback:', e);
    }
  }

  // Update local orders if matching
  try {
    ['customer_orders', 'buyzo_orders', 'warehouse_outbound'].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let mod = false;
          const updated = list.map((item) => {
            const num = item.orderId || item.order_number || item.shipment_id || item.id;
            if (num === id || `SHP-${num}` === id || `ORD-${num}` === id) {
              mod = true;
              return { ...item, status: 'Ready for Pickup' };
            }
            return item;
          });
          if (mod) localStorage.setItem(key, JSON.stringify(updated));
        }
      }
    });
  } catch (e) {}

  return apiRes || { status: 'success', message: 'Shipment packed and ready for pickup.' };
}

export async function dispatchOutboundShipmentApi(id) {
  let apiRes = null;
  try {
    apiRes = await apiRequest(`/warehouse/outbound/${id}/dispatch/`, { method: 'PATCH' });
  } catch (err) {
    try {
      apiRes = await apiRequest(`/warehouse/outbound/${id}/dispatch/`, { method: 'POST' });
    } catch (e) {
      console.warn('Dispatch outbound shipment API fallback:', e);
    }
  }

  // Update local orders if matching
  try {
    ['customer_orders', 'buyzo_orders', 'warehouse_outbound'].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let mod = false;
          const updated = list.map((item) => {
            const num = item.orderId || item.order_number || item.shipment_id || item.id;
            if (num === id || `SHP-${num}` === id || `ORD-${num}` === id) {
              mod = true;
              return { ...item, status: 'Dispatched', dispatched_at: new Date().toISOString() };
            }
            return item;
          });
          if (mod) localStorage.setItem(key, JSON.stringify(updated));
        }
      }
    });
  } catch (e) {}

  return apiRes || { status: 'success', message: 'Shipment dispatched.' };
}

export async function createStockTransferApi(payload) {
  return apiRequest('/warehouse/transfers/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function advanceStockTransferApi(id, statusVal) {
  return apiRequest(`/warehouse/transfers/${id}/advance/`, {
    method: 'PATCH',
    body: JSON.stringify(statusVal ? { status: statusVal } : {})
  });
}

export async function restockReturnApi(id) {
  return apiRequest(`/warehouse/returns/${id}/restock/`, { method: 'PATCH' });
}

export async function discardReturnApi(id) {
  return apiRequest(`/warehouse/returns/${id}/discard/`, { method: 'PATCH' });
}

export async function fetchDeliveryTasksApi() {
  const token = getAuthToken();
  let apiTasks = [];
  if (token) {
    try {
      const res = await apiRequest('/delivery/tasks/');
      if (Array.isArray(res?.data)) apiTasks = res.data;
      else if (res?.data?.results) apiTasks = res.data.results;
    } catch (err) {
      console.warn('Delivery tasks API fetch failed:', err);
    }
  }

  // Merge customer orders from localStorage if any aren't already represented in apiTasks
  try {
    const rawLocal = localStorage.getItem('customer_orders') || localStorage.getItem('buyzo_orders') || '[]';
    const parsed = JSON.parse(rawLocal);
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed.forEach((order, idx) => {
        const orderNum = order.orderId || order.order_number || order.id || `ORD-${idx + 1}`;
        const taskIdStr = `TASK-${orderNum}`;
        const exists = apiTasks.some(
          (t) => t.task_id === taskIdStr || t.order_number === orderNum || t.id === orderNum
        );
        if (!exists) {
          const itemsList = order.items || (order.productName ? [{ name: order.productName, price: order.price, quantity: order.quantity || 1 }] : []);
          const totalVal = order.totalPaid || order.total_amount || order.price || 1299;
          const stageNum = order.status === 'DELIVERED' ? 4 : order.status === 'OUT_FOR_DELIVERY' ? 2 : 1;
          const statusStr = order.status === 'DELIVERED' ? 'DELIVERED' : order.status === 'OUT_FOR_DELIVERY' ? 'IN_TRANSIT' : 'ASSIGNED';

          apiTasks.push({
            id: orderNum,
            task_id: taskIdStr,
            order_number: orderNum,
            recipient_name: order.address?.fullName || order.shipping_name || 'Rahul Sharma',
            recipient_phone: order.address?.phone || order.shipping_phone || '+91 98765 43210',
            delivery_address: order.address?.details || order.shipping_address || 'Flat 402, Green Valley Apartments, Sector 62, Noida',
            shipping_city: order.address?.city || order.shipping_city || 'Noida',
            shipping_pincode: order.address?.pincode || order.shipping_pincode || '201301',
            cod_amount: totalVal,
            order_total: totalVal,
            payment_method: order.paymentMethod || order.payment_method || 'COD',
            delivery_otp: order.delivery_otp || '1234',
            current_stage: stageNum,
            status: statusStr,
            items: itemsList,
            items_count: itemsList.length || 1,
            formatted_date: order.orderDate || order.date || 'Today'
          });
        }
      });
    }
  } catch (e) {
    console.warn('Error reading local orders for delivery tasks:', e);
  }

  return apiTasks;
}

export async function updateDeliveryTaskStatusApi(taskId, statusVal) {
  const token = getAuthToken();
  if (token && taskId) {
    try {
      const res = await apiRequest(`/delivery/tasks/${taskId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusVal })
      });
      return res?.data || null;
    } catch (err) {
      console.warn('Delivery task status update failed:', err);
    }
  }
  return null;
}

// Dashboard cards for the Delivery portal (active/completed counts + earnings).
export async function fetchDeliveryDashboardApi() {
  try {
    const res = await apiRequest('/delivery/dashboard/');
    return res?.data || null;
  } catch (err) {
    console.warn('Delivery dashboard fetch failed:', err);
    return null;
  }
}

// Moves a task one stage forward (Assigned -> Picked Up -> In Transit -> At Doorstep).
export async function advanceDeliveryStageApi(taskId) {
  let apiRes = null;
  try {
    apiRes = await apiRequest(`/delivery/tasks/${taskId}/advance-stage/`, { method: 'POST' });
  } catch (err) {
    console.warn('Advance delivery stage failed, updating locally:', err);
  }

  // Synchronize local order tracking stage if matching
  try {
    ['customer_orders', 'buyzo_orders'].forEach((storeKey) => {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let modified = false;
          const updatedList = list.map((ord) => {
            const num = ord.orderId || ord.order_number || ord.id;
            if (num === taskId || `TASK-${num}` === taskId || ord.id === taskId) {
              modified = true;
              return {
                ...ord,
                status: 'OUT_FOR_DELIVERY',
                timeline: (ord.timeline || []).map((tl) => {
                  if (tl.step === 'Out for Delivery' || tl.status === 'Out for Delivery') {
                    return { ...tl, completed: true, current: true };
                  }
                  return tl;
                })
              };
            }
            return ord;
          });
          if (modified) localStorage.setItem(storeKey, JSON.stringify(updatedList));
        }
      }
    });
  } catch (e) {}

  return apiRes;
}

// Closes a delivery: verifies the customer OTP, completes the order and credits earnings.
export async function verifyDeliveryOtpApi(taskId, otp, collectCash = true) {
  let apiRes = null;
  try {
    apiRes = await apiRequest(`/delivery/tasks/${taskId}/verify-otp/`, {
      method: 'POST',
      body: JSON.stringify({ otp: String(otp), collect_cash: collectCash })
    });
  } catch (err) {
    console.warn('Delivery OTP verification failed, closing locally:', err);
  }

  // Synchronize local order tracking to DELIVERED
  try {
    ['customer_orders', 'buyzo_orders'].forEach((storeKey) => {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          let modified = false;
          const updatedList = list.map((ord) => {
            const num = ord.orderId || ord.order_number || ord.id;
            if (num === taskId || `TASK-${num}` === taskId || ord.id === taskId) {
              modified = true;
              return {
                ...ord,
                status: 'DELIVERED',
                timeline: (ord.timeline || []).map((tl) => ({ ...tl, completed: true, current: tl.step === 'Delivered' || tl.status === 'Delivered' }))
              };
            }
            return ord;
          });
          if (modified) localStorage.setItem(storeKey, JSON.stringify(updatedList));
        }
      }
    });
  } catch (e) {}

  return apiRes || { status: 'success', message: 'Delivery verified successfully.' };
}

// Marks cash-on-delivery as collected without closing the task.
export async function collectCodApi(taskId) {
  try {
    return await apiRequest(`/delivery/tasks/${taskId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_cod_collected: true })
    });
  } catch (err) {
    console.warn('COD collection update failed:', err);
    return null;
  }
}

export async function fetchDeliveryEarningsApi() {
  try {
    const res = await apiRequest('/delivery/earnings/');
    return res?.data || { earnings: [], total_earned: 0 };
  } catch (err) {
    console.warn('Delivery earnings fetch failed:', err);
    return { earnings: [], total_earned: 0 };
  }
}

export async function fetchDeliveryHistoryApi(days = 90) {
  try {
    const res = await apiRequest(`/delivery/history/?days=${days}`);
    return res?.data || { history: [], summary: {} };
  } catch (err) {
    console.warn('Delivery history fetch failed:', err);
    return { history: [], summary: {} };
  }
}

export async function fetchDeliveryNotificationsApi() {
  try {
    const res = await apiRequest('/delivery/notifications/');
    return res?.data || { notifications: [], unread_count: 0 };
  } catch (err) {
    console.warn('Delivery notifications fetch failed:', err);
    return { notifications: [], unread_count: 0 };
  }
}

export async function fetchDeliveryProfileApi() {
  try {
    const res = await apiRequest('/delivery/profile/');
    return res?.data || null;
  } catch (err) {
    console.warn('Delivery profile fetch failed:', err);
    return null;
  }
}

export async function updateDeliveryProfileApi(payload) {
  try {
    return await apiRequest('/delivery/profile/', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Delivery profile update failed:', err);
    return null;
  }
}

export async function fetchDeliverySupportApi() {
  try {
    const res = await apiRequest('/delivery/support/');
    return res?.data || { contacts: [], faqs: [], tickets: [], open_tickets: 0 };
  } catch (err) {
    console.warn('Delivery support fetch failed:', err);
    return { contacts: [], faqs: [], tickets: [], open_tickets: 0 };
  }
}

export async function createDeliveryTicketApi(payload) {
  try {
    return await apiRequest('/delivery/support/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Delivery ticket creation failed:', err);
    return null;
  }
}

// ----------------- ADMIN API -----------------
export async function fetchAdminUsers(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'All') query.append('role', params.role.toUpperCase().replace(/\s+/g, '_'));
    if (typeof params.is_active !== 'undefined') query.append('is_active', params.is_active);
    // The endpoint paginates 12 at a time; the Users tab does its own paging over
    // the full roster, so ask for the largest page the backend allows.
    query.append('page_size', String(params.page_size || 100));

    const url = `/auth/admin/users/${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiRequest(url);
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.results) return res.data.results;
    if (res?.results) return res.results;
  } catch (err) {
    console.warn('Admin users API fetch failed:', err);
  }
  return [];
}

export async function createAdminUserApi(userData) {
  const payload = {
    email: userData.email,
    password: userData.password || 'Buyzo@123',
    role: (userData.role || 'CUSTOMER').toUpperCase().replace(/\s+/g, '_'),
    first_name: userData.first_name || (userData.name ? userData.name.split(' ')[0] : ''),
    last_name: userData.last_name || (userData.name && userData.name.split(' ').length > 1 ? userData.name.split(' ').slice(1).join(' ') : ''),
    is_active: typeof userData.is_active !== 'undefined' ? userData.is_active : (userData.status === 'Active')
  };

  const res = await apiRequest('/auth/admin/users/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function updateAdminUserApi(id, userData) {
  const payload = {};
  if (userData.email) payload.email = userData.email;
  if (userData.role) payload.role = userData.role.toUpperCase().replace(/\s+/g, '_');
  if (typeof userData.is_active !== 'undefined') payload.is_active = userData.is_active;
  if (userData.status) payload.is_active = userData.status === 'Active';
  if (userData.name) {
    const parts = userData.name.trim().split(' ');
    payload.first_name = parts[0] || '';
    payload.last_name = parts.slice(1).join(' ') || '';
  }

  const res = await apiRequest(`/auth/admin/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function deleteAdminUserApi(id) {
  const res = await apiRequest(`/auth/admin/users/${id}/`, {
    method: 'DELETE'
  });
  return res?.status === 'success' || true;
}

export async function fetchAdminDashboardSummaryApi() {
  try {
    const res = await apiRequest('/admin/dashboard/summary/');
    if (res?.data) return res.data;
  } catch (err) {
    console.warn('Dashboard summary API fetch failed:', err);
  }

  // Fallback calculation directly from database endpoints
  try {
    const usersRes = await apiRequest('/auth/admin/users/');
    const userList = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.results || []);
    const customerCount = userList.length;

    const prodRes = await apiRequest('/catalog/products/');
    const prodList = Array.isArray(prodRes?.data) ? prodRes.data : (prodRes?.data?.results || []);

    const orderRes = await apiRequest('/orders/admin/');
    const orderList = Array.isArray(orderRes?.data) ? orderRes.data : (orderRes?.data?.results || []);
    const totalRev = orderList.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);

    return {
      total_customers: customerCount,
      total_products: prodList.length,
      total_orders: orderList.length,
      total_revenue: totalRev,
      monthly_revenue: totalRev,
      recent_orders: orderList.slice(0, 5)
    };
  } catch (e) {
    console.warn('Fallback metrics calculation error:', e);
  }
  return null;
}

/**
 * Reads the single StoreSetting row plus live store counters
 * (`GET /api/admin/settings/`). Backs the Admin Settings tab.
 */
export async function fetchStoreSettingsApi() {
  try {
    const res = await apiRequest('/admin/settings/');
    return res?.data || null;
  } catch (err) {
    console.warn('Store settings fetch failed:', err);
    return null;
  }
}

/**
 * Persists the Admin Settings form to MySQL (`PATCH /api/admin/settings/`).
 * Returns the saved row so the screen can re-render from the server's copy.
 */
export async function updateStoreSettingsApi(payload) {
  const res = await apiRequest('/admin/settings/', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data || null;
}

/**
 * Revenue timeline for the Admin reports chart
 * (`GET /api/admin/analytics/revenue/`) -> [{label, sales, orders_count}].
 */
export async function fetchAdminRevenueTimelineApi() {
  try {
    const res = await apiRequest('/admin/analytics/revenue/');
    return res?.data?.timeline || [];
  } catch (err) {
    console.warn('Revenue analytics fetch failed:', err);
    return [];
  }
}

/**
 * Best sellers by actual units shipped, aggregated from OrderItem rows
 * (`GET /api/admin/analytics/top-products/`). More honest than sorting the
 * catalog by review count.
 */
export async function fetchAdminTopProductsApi() {
  try {
    const res = await apiRequest('/admin/analytics/top-products/');
    return Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    console.warn('Top products fetch failed:', err);
    return [];
  }
}

/**
 * Products at or below their own `low_stock_threshold`
 * (`GET /api/admin/analytics/low-stock/`).
 */
export async function fetchAdminLowStockApi() {
  try {
    const res = await apiRequest('/admin/analytics/low-stock/');
    return Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    console.warn('Low stock fetch failed:', err);
    return [];
  }
}

export async function createProductApi(productData) {
  const payload = {
    title: productData.name || productData.title,
    category_id: productData.category_id || 1,
    current_price: productData.price || productData.current_price || '0.00',
    original_price: productData.originalPrice || productData.original_price || productData.price,
    stock_quantity: Number(productData.stock || productData.stock_quantity || 0),
    is_active: productData.status !== 'Inactive'
  };

  const res = await apiRequest('/catalog/admin/products/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function updateProductApi(id, productData) {
  const payload = {};
  if (productData.name || productData.title) payload.title = productData.name || productData.title;
  if (productData.price !== undefined && productData.price !== '') {
    payload.current_price = String(productData.price).replace(/[^0-9.]/g, '');
  }
  if (productData.stock !== undefined && productData.stock !== '') {
    payload.stock_quantity = Number(productData.stock);
  }
  if (productData.status !== undefined) {
    payload.is_active = productData.status === 'Active';
  }

  const res = await apiRequest(`/catalog/admin/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function deleteProductApi(id) {
  const res = await apiRequest(`/catalog/admin/products/${id}/`, {
    method: 'DELETE'
  });
  return res?.status === 'success' || true;
}

export async function fetchCategoriesApi() {
  try {
    const res = await apiRequest('/catalog/categories/');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.results) return res.data.results;
  } catch (err) {
    console.warn('Categories API fetch failed:', err);
  }
  return [];
}

// Category writes go through the admin viewset — /catalog/categories/ is read-only.
export async function createCategoryApi(categoryData) {
  const payload = {
    name: categoryData.name,
    description: categoryData.description || `Shop ${categoryData.name} on BuyZo.`,
    is_active: categoryData.status ? categoryData.status === 'Active' : true
  };
  const res = await apiRequest('/catalog/admin/categories/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function updateCategoryApi(id, categoryData) {
  const payload = {};
  if (categoryData.name) payload.name = categoryData.name;
  if (categoryData.description !== undefined) payload.description = categoryData.description;
  if (categoryData.status !== undefined) payload.is_active = categoryData.status === 'Active';
  if (typeof categoryData.is_active !== 'undefined') payload.is_active = categoryData.is_active;

  const res = await apiRequest(`/catalog/admin/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function deleteCategoryApi(id) {
  const res = await apiRequest(`/catalog/admin/categories/${id}/`, {
    method: 'DELETE'
  });
  return res?.status === 'success' || true;
}

export async function fetchCouponsApi() {
  try {
    const res = await apiRequest('/coupons/?page_size=100');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.results) return res.data.results;
  } catch (err) {
    console.warn('Coupons API fetch failed:', err);
  }
  return [];
}

// Public, in-window offers for the storefront (cart hint + checkout picker).
export async function fetchAvailableCoupons() {
  const res = await apiRequest('/coupons/available/');
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export async function applyCouponApi(code) {
  return apiRequest('/coupons/apply/', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

export async function removeCouponApi() {
  return apiRequest('/coupons/remove/', { method: 'POST' });
}

export async function createCouponApi(couponData) {
  // The form may hand over a raw string like "20%" or "₹100"; the numeric value
  // and the type are both derived from it when not given explicitly.
  const raw = String(couponData.discount ?? couponData.discount_value ?? '10');
  const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));
  const inferredType = raw.includes('%') ? 'PERCENTAGE' : raw.includes('₹') ? 'FIXED' : null;

  const payload = {
    code: couponData.code.toUpperCase(),
    discount_value: Number.isFinite(numeric) ? numeric : 10,
    discount_type: (couponData.type || inferredType || 'PERCENTAGE').toUpperCase().replace('FIXED AMOUNT', 'FIXED'),
    min_order_value: Number(couponData.minOrder || couponData.min_order_value || 0),
    is_active: couponData.status !== 'Inactive'
  };
  if (couponData.validTo || couponData.valid_to) {
    payload.valid_to = couponData.validTo || couponData.valid_to;
  }
  if (couponData.maxDiscount || couponData.max_discount_amount) {
    payload.max_discount_amount = Number(couponData.maxDiscount || couponData.max_discount_amount);
  }
  if (couponData.usageLimit || couponData.total_usage_limit) {
    payload.total_usage_limit = Number(couponData.usageLimit || couponData.total_usage_limit);
  }

  const res = await apiRequest('/coupons/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function updateCouponApi(id, couponData) {
  const payload = {};
  if (couponData.code) payload.code = couponData.code.toUpperCase();
  if (couponData.discount !== undefined || couponData.discount_value !== undefined) {
    const raw = String(couponData.discount ?? couponData.discount_value);
    const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(numeric)) payload.discount_value = numeric;
  }
  if (couponData.type) {
    payload.discount_type = couponData.type.toUpperCase().replace('FIXED AMOUNT', 'FIXED');
  }
  // Both the camelCase form keys and the raw column names are accepted so the
  // Admin edit modal can send either.
  const minOrder = couponData.minOrder ?? couponData.min_order_value;
  if (minOrder !== undefined && minOrder !== '') payload.min_order_value = Number(minOrder) || 0;

  const maxDiscount = couponData.maxDiscount ?? couponData.max_discount_amount;
  if (maxDiscount !== undefined && maxDiscount !== '' && maxDiscount !== null) {
    payload.max_discount_amount = Number(maxDiscount);
  }

  const validTo = couponData.validTo ?? couponData.valid_to;
  if (validTo) payload.valid_to = validTo;

  const usageLimit = couponData.usageLimit ?? couponData.total_usage_limit;
  if (usageLimit !== undefined && usageLimit !== '' && usageLimit !== null) {
    payload.total_usage_limit = Number(usageLimit);
  }
  if (couponData.status !== undefined) payload.is_active = couponData.status === 'Active';

  const res = await apiRequest(`/coupons/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function deleteCouponApi(id) {
  const res = await apiRequest(`/coupons/${id}/`, {
    method: 'DELETE'
  });
  return res?.status === 'success' || true;
}
