import React, { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

function pageFromPath(path, saved) {
  const p = (path || '').toLowerCase();
  if (p.includes('/delivery') || p.includes('/rider')) return 'delivery-agent';
  if (p.includes('/warehouse')) return 'warehouse';
  if (p.includes('/admin')) return 'admin';
  if (p.includes('/login') || p.includes('/signin')) return 'login';
  if (p.includes('/cart')) return 'cart';
  if (p.includes('/checkout')) return 'checkout';
  if (p.includes('/orders')) return 'orders';
  if (p.includes('/wishlist')) return 'wishlist';
  if (saved && saved !== 'home') return saved;
  return 'home';
}

function pathFromPage(page) {
  switch (page) {
    case 'delivery-agent':
      return '/delivery';
    case 'warehouse':
      return '/warehouse';
    case 'admin':
      return '/admin';
    case 'login':
      return '/login';
    case 'cart':
      return '/cart';
    case 'checkout':
      return '/checkout';
    case 'orders':
      return '/orders';
    case 'wishlist':
      return '/wishlist';
    case 'home':
    default:
      return '/';
  }
}

export function NavigationProvider({ children }) {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem('buyzo_current_page');
      return pageFromPath(window.location.pathname, saved);
    } catch {
      return 'home';
    }
  });

  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderData, setSelectedOrderData] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('buyzo_current_page', currentPage);
    } catch {}
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const p = pageFromPath(window.location.pathname, localStorage.getItem('buyzo_current_page'));
      setCurrentPage(p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    try {
      localStorage.setItem('buyzo_current_page', page);
      const newPath = pathFromPage(page);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ page }, '', newPath);
      }
    } catch {}

    if (page === 'product-detail' && data) {
      setSelectedProduct(data);
    } else if (page === 'order-confirmed' && data) {
      setSelectedOrderData(data);
    } else if (typeof data === 'string') {
      setSelectedSubCategory(data);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedSubCategory,
        setSelectedSubCategory,
        selectedProduct,
        setSelectedProduct,
        selectedOrderData,
        setSelectedOrderData,
        navigateTo
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigationContext = () => useContext(NavigationContext);
