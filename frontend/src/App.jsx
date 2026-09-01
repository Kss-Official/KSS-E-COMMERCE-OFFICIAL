import React from 'react';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import { NavigationProvider, useNavigationContext } from './context/NavigationContext';
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
import ComparePage from './pages/ComparePage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage';
import WelcomeScreen, { hasSeenWelcome } from './components/WelcomeScreen';
import SocialProofTicker from './components/ui/SocialProofTicker';
import AIFloatingWidget from './components/ui/AIFloatingWidget';
import CompareDrawerModal from './components/ui/CompareDrawerModal';
import MiniCartDrawerModal from './components/ui/MiniCartDrawerModal';

import { getCurrentUser, fetchCurrentUserApi } from './services/api';
import { homePageForRole, isStaffRole } from './utils/roles';
import AdminPage from '../Admin';
import DeliveryAgentPage from '../DeliveryAgentPortal';
import WarehousePage from '../WarehousePortal';

function AppContent() {
  const { currentPage, navigateTo } = useNavigationContext();
  const hasRestoredSession = React.useRef(false);

  const [showWelcome, setShowWelcome] = React.useState(
    () => !hasSeenWelcome() && !getCurrentUser()
  );

  React.useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    const cached = getCurrentUser();
    if (!cached) return;

    let cancelled = false;
    (async () => {
      const fresh = await fetchCurrentUserApi();
      if (cancelled) return;

      const user = fresh || cached;
      if (!user?.role || !isStaffRole(user.role)) return;

      const savedPage = localStorage.getItem('buyzo_current_page');
      const targetPage = ['delivery-agent', 'warehouse', 'admin'].includes(currentPage)
        ? currentPage
        : savedPage || fresh?.home_page || homePageForRole(user.role);

      if (targetPage && targetPage !== currentPage) {
        navigateTo(targetPage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      case 'compare':
        return <ComparePage />;
      case 'support':
        return <SupportPage />;
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
    <div className="min-h-screen bg-white font-sans text-ink flex flex-col justify-between relative overflow-x-hidden w-full max-w-full">
      {!isLoginPage && <Header />}
      {!isLoginPage && <Navbar />}
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        {renderCurrentPage()}
      </div>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <SocialProofTicker />}
      {!isLoginPage && <AIFloatingWidget />}
      {!isLoginPage && <CompareDrawerModal />}
      {!isLoginPage && <MiniCartDrawerModal />}

      {showWelcome && (
        <WelcomeScreen
          onDismiss={() => setShowWelcome(false)}
          onNavigate={(target) => {
            setShowWelcome(false);
            if (target) navigateTo(target);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <CompareProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </CompareProvider>
    </CartProvider>
  );
}

