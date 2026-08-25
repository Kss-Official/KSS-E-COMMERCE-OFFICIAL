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
export async function fetchCustomerOrdersApi() {
  let apiOrders = [];
  try {
    const res = await apiRequest('/orders/my-orders/?no_page=true');
    if (Array.isArray(res?.data)) apiOrders = res.data;
    else if (res?.data?.results) apiOrders = res.data.results;
  } catch (err) {
    console.warn('Customer orders API fetch failed:', err);
  }

  let localOrders = [];
  try {
    const raw = localStorage.getItem('buyzo_placed_orders');
    if (raw) localOrders = JSON.parse(raw);
  } catch (e) {}

  return { apiOrders, localOrders };
}

export async function fetchOrderDetailApi(orderNumber) {
  const token = getAuthToken();
  if (token && orderNumber) {
    try {
      const res = await apiRequest(`/orders/detail/${orderNumber}/`);
      if (res?.data) return res.data;
    } catch (err) {
      console.warn('Order detail fetch failed:', err);
    }
  }
  return null;
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
  if (token && orderId) {
    try {
      const res = await apiRequest(`/orders/admin/orders/${orderId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusVal })
      });
      return res?.data || res || null;
    } catch (err) {
      console.warn('Order status update failed:', err);
    }
  }
  return null;
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
    const raw = localStorage.getItem('buyzo_placed_orders');
    if (raw) localOrders = JSON.parse(raw);
  } catch (e) {}

  return { apiOutbound, localOrders };
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

// ----------------- ADMIN API -----------------
export async function fetchAdminUsers(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'All') query.append('role', params.role.toUpperCase().replace(/\s+/g, '_'));
    if (typeof params.is_active !== 'undefined') query.append('is_active', params.is_active);

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

export async function createCategoryApi(categoryData) {
  const payload = {
    name: categoryData.name,
    is_active: true
  };
  const res = await apiRequest('/catalog/categories/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res?.data || res;
}

export async function deleteCategoryApi(id) {
  const res = await apiRequest(`/catalog/categories/${id}/`, {
    method: 'DELETE'
  });
  return res?.status === 'success' || true;
}

export async function fetchCouponsApi() {
  try {
    const res = await apiRequest('/coupons/');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (res?.data?.results) return res.data.results;
  } catch (err) {
    console.warn('Coupons API fetch failed:', err);
  }
  return [];
}

export async function createCouponApi(couponData) {
  const payload = {
    code: couponData.code.toUpperCase(),
    discount_value: parseFloat(couponData.discount.replace(/[^0-9.]/g, '')) || 10,
    discount_type: (couponData.type || 'PERCENTAGE').toUpperCase(),
    is_active: couponData.status !== 'Inactive'
  };
  const res = await apiRequest('/coupons/', {
    method: 'POST',
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
