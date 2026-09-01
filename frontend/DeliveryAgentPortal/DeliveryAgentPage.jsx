import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardTab from './components/DashboardTab';
import MyDeliveriesTab from './components/MyDeliveriesTab';
import ActiveDeliveryTab from './components/ActiveDeliveryTab';
import HistoryTab from './components/HistoryTab';
import EarningsTab from './components/EarningsTab';
import CashInHandTab from './components/CashInHandTab';
import NotificationsTab from './components/NotificationsTab';
import ProfileTab from './components/ProfileTab';
import SupportTab from './components/SupportTab';
import { useNavigationContext } from '../src/context/NavigationContext';
import { getCurrentUser, autoAuthenticateRole, logoutUser } from '../src/services/api';

export default function DeliveryAgentPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navContext = useNavigationContext();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'DELIVERY_AGENT') {
      autoAuthenticateRole('delivery');
    }
  }, []);

  const handleExitPortal = () => {
    if (navContext?.navigateTo) {
      navContext.navigateTo('home');
    } else {
      window.location.hash = '#home';
    }
  };

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem('buyzo_access_token');
    localStorage.removeItem('buyzo_current_user');
    localStorage.setItem('buyzo_current_page', 'login');
    if (navContext?.navigateTo) {
      navContext.navigateTo('login');
    } else {
      window.location.hash = '#login';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'my-deliveries':
        return <MyDeliveriesTab setActiveTab={setActiveTab} />;
      case 'active-delivery':
        return <ActiveDeliveryTab setActiveTab={setActiveTab} />;
      case 'history':
        return <HistoryTab setActiveTab={setActiveTab} />;
      case 'earnings':
        return <EarningsTab setActiveTab={setActiveTab} />;
      case 'cash-in-hand':
      case 'cash-tracker':
      case 'cash_tracker':
      case 'cash_in_hand':
      case 'cash':
        return <CashInHandTab setActiveTab={setActiveTab} />;
      case 'notifications':
        return <NotificationsTab setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileTab setActiveTab={setActiveTab} />;
      case 'support':
        return <SupportTab setActiveTab={setActiveTab} />;
      case 'dashboard':
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/70 font-sans antialiased text-gray-800">
      {/* Delivery Agent Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitPortal={handleExitPortal} onLogout={handleLogout} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar title={activeTab} onExitPortal={handleExitPortal} onLogout={handleLogout} setActiveTab={setActiveTab} />
        <main className="portal-main p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
