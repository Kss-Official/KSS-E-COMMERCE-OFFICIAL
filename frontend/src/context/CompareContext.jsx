import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('buyzo_compare_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('buyzo_compare_items', JSON.stringify(compareItems));
    } catch (e) {}
  }, [compareItems]);

  const addToCompare = (product) => {
    if (!product) return;
    setCompareItems((prev) => {
      if (prev.some((p) => String(p.id) === String(product.id))) {
        return prev;
      }
      if (prev.length >= 4) {
        return prev;
      }
      const updated = [...prev, product];
      return updated;
    });
    setIsCompareOpen(true);
  };

  const removeFromCompare = (productId) => {
    setCompareItems((prev) => prev.filter((p) => String(p.id) !== String(productId)));
  };

  const clearCompare = () => {
    setCompareItems([]);
    setIsCompareOpen(false);
  };

  const isInCompare = (productId) => {
    return compareItems.some((p) => String(p.id) === String(productId));
  };

  const toggleCompareItem = (product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        isCompareOpen,
        setIsCompareOpen,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toggleCompareItem
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export const useCompareContext = () => useContext(CompareContext);
