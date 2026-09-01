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
import AdminSupportTickets from './AdminSupportTickets';
import { LayoutDashboard, Package, ShoppingBag, Users, Menu } from 'lucide-react';
import { useNavigationContext } from '../src/context/NavigationContext';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
      case 'support':
        return <AdminSupportTickets />;
      case 'dashboard':
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/60 font-sans antialiased text-gray-800 pb-16 md:pb-0 relative">
      {/* Desktop Standing Sidebar */}
      <div className="hidden md:block h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitAdmin={handleExitAdmin} />
      </div>

      {/* Mobile Slide-Over Sidebar Drawer (< 768px) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />
          <div className="relative w-[280px] bg-[#004d47] h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onExitAdmin={handleExitAdmin}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar
          title={activeTab}
          onExitAdmin={handleExitAdmin}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="portal-main p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#003430] text-white border-t border-[#005c54] flex items-center justify-around py-2 z-40 shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'dashboard' ? 'text-emerald-300 font-bold' : 'text-emerald-100/70'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'products' ? 'text-emerald-300 font-bold' : 'text-emerald-100/70'}`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Products</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'orders' ? 'text-emerald-300 font-bold' : 'text-emerald-100/70'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'users' ? 'text-emerald-300 font-bold' : 'text-emerald-100/70'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Users</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer text-emerald-100/70 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </div>
  );
}
