import React, { createContext, useState, useContext } from 'react';

// Import images for initial cart state & wishlist state
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import redmiNote13Img from '../assets/images/redmi_note13.jpg';
import womenDressImg from '../assets/images/women_dress.jpg';
import loungeChairImg from '../assets/images/lounge_chair.jpg';

const CartContext = createContext();

const initialCart = [
  {
    id: 'elec-1',
    name: 'boAt Rockerz 450',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 3999,
    discount: '56% OFF',
    selectedColor: 'Teal Green',
    quantity: 1
  },
  {
    id: 'elec-2',
    name: 'Noise ColorFit Pro 5',
    image: noiseSmartwatchImg,
    price: 2999,
    originalPrice: 4999,
    discount: '40% OFF',
    selectedColor: 'Black',
    quantity: 1
  }
];

const initialWishlist = [
  {
    id: 'wish-1',
    name: 'Redmi Note 13 Pro 5G',
    specs: '8GB RAM, 128GB Storage',
    category: 'Electronics',
    image: redmiNote13Img,
    price: 18999,
    originalPrice: 21999,
    discount: '14% OFF',
    inStock: true,
    deliveryDate: 'Delivery by 24 May'
  },
  {
    id: 'wish-2',
    name: 'boAt Rockerz 450',
    specs: 'Wireless Over Ear Headphones',
    category: 'Electronics',
    image: boatRockerzImg,
    price: 1499,
    originalPrice: 2490,
    discount: '40% OFF',
    inStock: true,
    deliveryDate: 'Delivery by 24 May'
  },
  {
    id: 'wish-3',
    name: 'Women A-Line Dress',
    specs: 'Green, Size: M',
    category: 'Fashion',
    image: womenDressImg,
    price: 999,
    originalPrice: 1999,
    discount: '50% OFF',
    inStock: true,
    deliveryDate: 'Delivery by 24 May'
  },
  {
    id: 'wish-4',
    name: 'Modern Lounge Chair',
    specs: 'Teal Blue',
    category: 'Home & Kitchen',
    image: loungeChairImg,
    price: 7999,
    originalPrice: 12999,
    discount: '38% OFF',
    inStock: true,
    deliveryDate: 'Delivery by 24 May'
  }
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(initialCart);
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += product.quantity || 1;
        return updated;
      }
      return [
        ...prev,
        {
          ...product,
          quantity: product.quantity || 1,
          selectedColor: product.selectedColor || 'Default'
        }
      ];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCartContext = () => useContext(CartContext);

