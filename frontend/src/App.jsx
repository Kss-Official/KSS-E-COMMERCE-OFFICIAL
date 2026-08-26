import React from 'react';
import { CartProvider } from './context/CartContext';
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
import LoginPage from './pages/LoginPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage';
import WelcomeScreen, { hasSeenWelcome } from './components/WelcomeScreen';

import { getCurrentUser, fetchCurrentUserApi } from './services/api';
import { homePageForRole, isStaffRole } from './utils/roles';
import AdminPage from '../Admin';
import DeliveryAgentPage from '../DeliveryAgentPortal';
import WarehousePage from '../WarehousePortal';

function AppContent() {
  const { currentPage, navigateTo } = useNavigationContext();
  const hasRestoredSession = React.useRef(false);

  // First-time visitors get the branded intro once per browser. A returning
  // visitor, or anyone already signed in, skips straight to the storefront.
  const [showWelcome, setShowWelcome] = React.useState(
    () => !hasSeenWelcome() && !getCurrentUser()
  );

  // On first load only, revalidate the cached session against the server and
  // drop a signed-in staff member straight into their portal. Guarded by a ref
  // so it does not fight with in-portal navigation (or trap staff on the login
  // page when they want to switch accounts).
  React.useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;

    const cached = getCurrentUser();
    if (!cached) return;

    let cancelled = false;
    (async () => {
      // `/api/auth/me/` returns the authoritative role plus a `home_page` key;
      // it also clears the token when the session has expired.
      const fresh = await fetchCurrentUserApi();
      if (cancelled) return;

      const user = fresh || cached;
      if (!user?.role || !isStaffRole(user.role)) return;

      const portalPage = fresh?.home_page || homePageForRole(user.role);
      if (portalPage !== currentPage) {
        navigateTo(portalPage);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-cream font-sans text-ink flex flex-col justify-between relative">
      {!isLoginPage && <Header />}
      {!isLoginPage && <Navbar />}
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
      {!isLoginPage && <Footer />}

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
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </CartProvider>
  );
}
