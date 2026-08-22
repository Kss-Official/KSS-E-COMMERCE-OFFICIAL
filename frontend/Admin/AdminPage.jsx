import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardTab from './components/DashboardTab';
import ProductsTab from './components/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import UsersTab from './components/UsersTab';
import OrdersTab from './components/OrdersTab';
import PaymentsTab from './components/PaymentsTab';
import InventoryTab from './components/InventoryTab';
import CouponsTab from './components/CouponsTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import { useNavigationContext } from '../src/context/NavigationContext';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navContext = useNavigationContext();

  const handleExitAdmin = () => {
    if (navContext?.navigateTo) {
      navContext.navigateTo('home');
    } else {
      window.location.hash = '#home';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'users':
        return <UsersTab />;
      case 'orders':
        return <OrdersTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'coupons':
        return <CouponsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'dashboard':
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/60 font-sans antialiased text-gray-800">
      {/* Sidebar with BuyZo Logo & Brand Palette */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitAdmin={handleExitAdmin} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={activeTab} onExitAdmin={handleExitAdmin} />
        <main className="portal-main p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
