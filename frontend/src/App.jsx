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
import ShopPage from './pages/ShopPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import NewArrivalsPage from './pages/NewArrivalsPage';

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
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <TopAnnouncement />
      <Header />
      <Navbar />
      <div>
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
