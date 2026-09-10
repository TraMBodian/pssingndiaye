import React, { useState } from 'react';
import { LaundryProvider, useLaundry } from './context/LaundryContext';
import { Navbar } from './components/Navbar';
import { OrdersView } from './components/OrdersView';
import { ClientsView } from './components/ClientsView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SmsLogsView } from './components/SmsLogsView';
import { AdminLoginView } from './components/AdminLoginView';
import { NewOrderModal } from './components/NewOrderModal';
import { InvoiceModal } from './components/InvoiceModal';
import { SmsSimulatorModal } from './components/SmsSimulatorModal';
import { CustomerTrackingModal } from './components/CustomerTrackingModal';
import { CustomerHistoryModal } from './components/CustomerHistoryModal';
import { Toast } from './components/Toast';
import { ProfileView } from './components/ProfileView';
import { BillingView } from './components/BillingView';

function AppContent() {
  const { isAuthenticated } = useLaundry();
  const [currentTab, setCurrentTab] = useState<'orders' | 'clients' | 'analytics' | 'sms' | 'billing' | 'profile'>('orders');

  if (!isAuthenticated) {
    return (
      <>
        <AdminLoginView />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Navigation Header */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'orders' && <OrdersView />}
        {currentTab === 'clients' && <ClientsView />}
        {currentTab === 'analytics' && <AnalyticsDashboard />}
        {currentTab === 'sms' && <SmsLogsView />}
        {currentTab === 'profile' && <ProfileView />}
        {currentTab === 'billing' && <BillingView />}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Lavoir Pro</span>
            <span>•</span>
            <span>Solution de facturation & suivi SMS temps réel pour blanchisseries et pressings modernes</span>
          </div>
          <div className="text-slate-700">
            TVA 20% conforme • Barème CNET • Passerelle SMS 24/7
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <NewOrderModal />
      <InvoiceModal />
      <SmsSimulatorModal />
      <CustomerTrackingModal />
      <CustomerHistoryModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <LaundryProvider>
      <AppContent />
    </LaundryProvider>
  );
}
