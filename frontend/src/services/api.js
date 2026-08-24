// Centralized API Service for BuyZo E-Commerce Frontend

export const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
  const query = new URLSearchParams(params).toString();
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
  if (!token) {
    // For guest users, read local wishlist storage
    const local = localStorage.getItem('buyzo_guest_wishlist');
    if (local) {
      try { return JSON.parse(local); } catch { return []; }
    }
    return [];
  }

  const res = await apiRequest('/cart/wishlist/');
  return res?.data?.items || [];
}

export async function addToWishlistApi(productData) {
  const token = getAuthToken();
  const pid = productData.product_id || productData.productId || productData.id;
  const pname = productData.name || productData.title;

  if (!token) {
    const local = localStorage.getItem('buyzo_guest_wishlist');
    let items = local ? JSON.parse(local) : [];
    if (!items.some(i => (i.id === pid || i.productId === pid || i.name === pname))) {
      items.push({
        id: pid,
        productId: pid,
        name: pname,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.discount,
        image: productData.image,
        category: productData.category || 'General',
        inStock: true,
        deliveryDate: 'Delivery in 2-4 days'
      });
      localStorage.setItem('buyzo_guest_wishlist', JSON.stringify(items));
    }
    return items;
  }

  const res = await apiRequest('/cart/wishlist/', {
    method: 'POST',
    body: JSON.stringify({ product_id: pid, name: pname, price: productData.price || productData.current_price })
  });
  return res?.data?.items || [];
}

export async function removeFromWishlistApi(productId) {
  const token = getAuthToken();
  if (!token) {
    const local = localStorage.getItem('buyzo_guest_wishlist');
    let items = local ? JSON.parse(local) : [];
    items = items.filter(i => i.id !== productId && i.productId !== productId);
    localStorage.setItem('buyzo_guest_wishlist', JSON.stringify(items));
    return items;
  }

  const res = await apiRequest(`/cart/wishlist/items/${productId}/`, {
    method: 'DELETE'
  });
  return res?.data?.items || [];
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

// ----------------- ADMIN API -----------------
export async function fetchAdminUsers() {
  const res = await apiRequest('/auth/admin/users/');
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.results) return res.data.results;
  return [];
}
