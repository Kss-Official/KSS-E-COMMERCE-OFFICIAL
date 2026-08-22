import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'electronics' | 'product-detail'
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'product-detail' && data) {
      setSelectedProduct(data);
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
        navigateTo
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigationContext = () => useContext(NavigationContext);
