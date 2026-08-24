import React from 'react';
import { CartProvider } from './context/CartContext';
import { NavigationProvider, useNavigationContext } from './context/NavigationContext';
import TopAnnouncement from './components/layout/TopAnnouncement';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ElectronicsPage from './pages/ElectronicsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ContactPage from './pages/ContactPage';
import DealsPage from './pages/DealsPage';
import FashionPage from './pages/FashionPage';
import BestSellersPage from './pages/BestSellersPage';
import BeautyPage from './pages/BeautyPage';
import HomeKitchenPage from './pages/HomeKitchenPage';
import ShopPage from './pages/ShopPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage';

import AdminPage from '../Admin';
import DeliveryAgentPage from '../DeliveryAgentPortal';
import WarehousePage from '../WarehousePortal';

function AppContent() {
  const { currentPage } = useNavigationContext();

  if (currentPage === 'admin') {
    return <AdminPage />;
  }

  if (currentPage === 'delivery-agent') {
    return <DeliveryAgentPage />;
  }

  if (currentPage === 'warehouse') {
    return <WarehousePage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage />;
      case 'delivery-agent':
        return <DeliveryAgentPage />;
      case 'warehouse':
        return <WarehousePage />;
      case 'shop':
        return <ShopPage />;
      case 'electronics':
        return <ElectronicsPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmed':
        return <OrderConfirmedPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'login':
        return <LoginPage />;
      case 'new-arrivals':
        return <NewArrivalsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'contact':
        return <ContactPage />;
      case 'deals':
        return <DealsPage />;
      case 'fashion':
        return <FashionPage />;
      case 'best-sellers':
        return <BestSellersPage />;
      case 'beauty':
        return <BeautyPage />;
      case 'home-kitchen':
        return <HomeKitchenPage />;
      default:
        return <HomePage />;
    }
  };

  const isLoginPage = currentPage === 'login';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col justify-between">
      {!isLoginPage && <TopAnnouncement />}
      {!isLoginPage && <Header />}
      {!isLoginPage && <Navbar />}
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </CartProvider>
  );
}
