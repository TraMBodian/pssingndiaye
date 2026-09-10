import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Calendar, 
  Award, 
  ChevronRight, 
  Plus,
  Send,
  Sparkles,
  Receipt
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { Customer } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ClientsView: React.FC = () => {
  const { 
    customers, 
    orders, 
    searchQuery,
    setSearchQuery,
    addCustomer, 
    setSelectedCustomerForHistory, 
    setIsNewOrderModalOpen,
    setSelectedOrderForSms
  } = useLaundry();

  const [loyaltyFilter, setLoyaltyFilter] = useState<'ALL' | 'VIP' | 'REGULIER' | 'NOUVEAU'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New customer form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [preferences, setPreferences] = useState('');

  // Filtering
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (loyaltyFilter !== 'ALL' && c.loyaltyLevel !== loyaltyFilter) {
      return false;
    }
    return true;
  });

  // Aggregate stats
  const totalRevenueAllClients = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersAllClients = customers.reduce((sum, c) => sum + c.ordersCount, 0);
  const averageCustomerSpend = customers.length > 0 ? totalRevenueAllClients / customers.length : 0;
  const vipCount = customers.filter(c => c.loyaltyLevel === 'VIP').length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addCustomer({
      fullName: name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@client.fr`,
      address,
      loyaltyLevel: 'NOUVEAU',
      preferences
    });

    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPreferences('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Client Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700">Clients enregistrés</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{customers.length}</span>
            <span className="text-xs text-sky-600 font-medium">Portefeuille actif</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700">Chiffre d'affaires cumulé</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenueAllClients)}</span>
            <span className="text-xs text-emerald-600 font-medium">{totalOrdersAllClients} prestations</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700">Valeur Moyenne / Client</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(averageCustomerSpend)}</span>
            <span className="text-xs text-sky-600 font-medium">LTV moyen</span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="text-xs font-semibold text-amber-800">Clients VIP privilégiés</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">{vipCount}</span>
            <span className="text-xs text-amber-700 font-semibold">&gt; 10 commandes</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        {/* Loyalty filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setLoyaltyFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              loyaltyFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({customers.length})
          </button>
          <button
            onClick={() => setLoyaltyFilter('VIP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              loyaltyFilter === 'VIP' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            VIP ({vipCount})
          </button>
          <button
            onClick={() => setLoyaltyFilter('REGULIER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              loyaltyFilter === 'REGULIER' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Réguliers
          </button>
          <button
            onClick={() => setLoyaltyFilter('NOUVEAU')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              loyaltyFilter === 'NOUVEAU' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Nouveaux
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="ml-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nouveau Client</span>
          </button>
        </div>

      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => {
          const clientOrders = orders.filter(o => o.clientId === cust.id);
          const latestOrder = clientOrders[0];

          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200">
                      {cust.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {cust.fullName}
                      </h3>
                      <div className="text-xs text-slate-700 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    cust.loyaltyLevel === 'VIP'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : cust.loyaltyLevel === 'REGULIER'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cust.loyaltyLevel === 'VIP' ? '★ VIP' : cust.loyaltyLevel}
                  </span>
                </div>

                {/* Info Pills */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-700 uppercase block font-semibold">Total Dépensé</span>
                    <strong className="text-slate-900">{formatCurrency(cust.totalSpent)}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-700 uppercase block font-semibold">Commandes</span>
                    <strong className="text-slate-900">{clientOrders.length} service{clientOrders.length > 1 ? 's' : ''}</strong>
                  </div>
                </div>

                {/* Laundry Preferences Tag */}
                {cust.preferences && (
                  <div className="mt-2.5 text-[11px] text-sky-800 bg-sky-50/70 p-2 rounded-lg border border-sky-100 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />
                    <span className="line-clamp-1 italic">{cust.preferences}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForHistory(cust)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-600" />
                  <span>Historique complet</span>
                </button>

                {latestOrder && (
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForSms(latestOrder)}
                    className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                    title="Envoyer un SMS à ce client"
                  >
                    <Send className="w-4 h-4 text-sky-600" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <span>Nouveau Fichier Client</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hélène Mercier"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">N° Téléphone Mobile (pour suivi SMS) *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +33 6 12 34 56 78"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse E-mail</label>
                <input
                  type="email"
                  placeholder="Ex: helene.mercier@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse physique / Résidence</label>
                <input
                  type="text"
                  placeholder="Ex: 12 rue de la Paix, 75002 Paris"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exigences & Préférences blanchisserie</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cintre obligatoire, lessive écologique, bouton de rechange..."
                  value={preferences}
                  onChange={e => setPreferences(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs"
                >
                  Enregistrer le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
