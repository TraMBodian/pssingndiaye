import React from 'react';
import { 
  PlusCircle, 
  Users, 
  Layers, 
  BarChart3, 
  MessageSquareText, 
  Receipt,
  Search, 
  Clock
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';

interface NavbarProps {
  currentTab: 'orders' | 'clients' | 'analytics' | 'sms' | 'billing' | 'profile';
  setCurrentTab: (tab: 'orders' | 'clients' | 'analytics' | 'sms' | 'billing' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentUser,
    orders, 
    customers, 
    smsLogs, 
    searchQuery, 
    setSearchQuery, 
    setIsNewOrderModalOpen
  } = useLaundry();

  const activeOrdersCount = orders.filter(o => o.status !== 'LIVREE').length;
  const readyOrdersCount = orders.filter(o => o.status === 'PRETE').length;

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-wrap items-center gap-3 py-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/assets/aistudio/logo.png"
              alt="S.L Ndiaye Pressing"
              className="h-12 w-28 object-contain"
            />
          </div>

          {/* Search bar */}
          <div className="order-none flex min-w-0 flex-1 items-center relative lg:max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Rechercher commande, client, n° tel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                id="btn-clear-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs px-1"
                title="Effacer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="order-last flex w-full items-center justify-center gap-1 overflow-x-auto border-t border-slate-100 pt-2 sm:gap-2">
            <button
              id="nav-tab-orders"
              onClick={() => setCurrentTab('orders')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'orders'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Commandes</span>
              {activeOrdersCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-sky-600 text-white">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-clients"
              onClick={() => setCurrentTab('clients')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'clients'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clients</span>
              <span className="hidden sm:inline text-xs text-slate-700 font-normal">
                ({customers.length})
              </span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'analytics'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Revenus & Stats</span>
            </button>

            <button
              id="nav-tab-sms"
              onClick={() => setCurrentTab('sms')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'sms'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Journal des SMS en temps réel"
            >
              <MessageSquareText className="w-4 h-4" />
              <span className="hidden md:inline">Journal SMS</span>
              <span className="px-1.5 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-700">
                {smsLogs.length}
              </span>
            </button>
            <button
              id="nav-tab-billing"
              onClick={() => setCurrentTab('billing')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                currentTab === 'billing'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Historique des factures"
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden md:inline">Facturation</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              id="btn-new-invoice-modal"
              onClick={() => setIsNewOrderModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all ring-2 ring-sky-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle Facture</span>
              <span className="sm:hidden">Facture</span>
            </button>

            {/* Admin profile */}
            {currentUser && (
              <div className="flex items-center border-l border-slate-200 pl-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('profile')}
                  className={`flex items-center gap-1.5 rounded-lg p-1 transition-colors ${
                    currentTab === 'profile' ? 'bg-sky-50' : 'hover:bg-slate-100'
                  }`}
                  aria-label="Ouvrir le profil administrateur"
                  title={`${currentUser.name} - Ouvrir le profil`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-100 text-xs font-bold text-sky-800 shadow-2xs select-none">
                    {currentUser.name.split(' ').map(namePart => namePart[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="hidden max-w-24 truncate text-xs font-semibold text-slate-700 xl:block">
                    {currentUser.name}
                  </span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Subheader Alert for Ready Orders waiting for pickup */}
      {readyOrdersCount > 0 && currentTab === 'orders' && (
        <div className="bg-emerald-50/90 border-t border-emerald-100 px-4 py-1.5 text-xs text-emerald-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>{readyOrdersCount} commande{readyOrdersCount > 1 ? 's sont' : ' est'} prête{readyOrdersCount > 1 ? 's' : ''}</strong> au comptoir pour retrait client (SMS envoyés).
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
