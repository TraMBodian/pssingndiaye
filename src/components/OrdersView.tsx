import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Send, 
  QrCode, 
  Receipt, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Zap, 
  Phone,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { OrderStatus } from '../types';
import { formatCurrency, formatDateTime, formatDate, getStatusBadgeInfo, getPaymentBadgeInfo } from '../utils/formatters';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    searchQuery, 
    setSearchQuery, 
    updateOrderStatus, 
    autoSmsOnStatusChange,
    setAutoSmsOnStatusChange,
    setIsNewOrderModalOpen, 
    setSelectedOrderForInvoice, 
    setSelectedOrderForTracking, 
    setSelectedOrderForSms,
    setSelectedCustomerForHistory,
    customers
  } = useLaundry();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PRETE' | 'LIVREE'>('ALL');

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      order.referenceNumber.toLowerCase().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.clientPhone.includes(query) ||
      order.trackingCode.toLowerCase().includes(query) ||
      order.items.some(i => i.articleName.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'ACTIVE') {
      return ['DEPOSEE', 'TRAITEMENT', 'REPASSAGE'].includes(order.status);
    }
    if (statusFilter === 'PRETE') {
      return order.status === 'PRETE';
    }
    if (statusFilter === 'LIVREE') {
      return order.status === 'LIVREE';
    }
    return true;
  });

  // KPI calculations
  const inProgressCount = orders.filter(o => ['DEPOSEE', 'TRAITEMENT', 'REPASSAGE'].includes(o.status)).length;
  const readyCount = orders.filter(o => o.status === 'PRETE').length;
  const expressCount = orders.filter(o => o.isExpress && o.status !== 'LIVREE').length;
  const pendingPaymentSum = orders
    .filter(o => o.status !== 'LIVREE')
    .reduce((sum, o) => sum + Math.max(0, o.totalAmount - o.paidAmount), 0);

  const getNextStatusAction = (status: OrderStatus): { next: OrderStatus; label: string; sendsSms?: boolean } | null => {
    switch (status) {
      case 'DEPOSEE':
        return { next: 'TRAITEMENT', label: 'Passer en Lavage (SMS auto)', sendsSms: true };
      case 'TRAITEMENT':
        return { next: 'REPASSAGE', label: 'Passer en Repassage (SMS auto)', sendsSms: true };
      case 'REPASSAGE':
        return { next: 'PRETE', label: 'Marquer Prête ✨ (SMS auto)', sendsSms: true };
      case 'PRETE':
        return { next: 'LIVREE', label: 'Valider retrait ✅ (SMS auto)', sendsSms: true };
      case 'LIVREE':
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Real-time SMS Notification System Active Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">
                Système Automatique de Notifications SMS
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                autoSmsOnStatusChange ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${autoSmsOnStatusChange ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                {autoSmsOnStatusChange ? 'Envois SMS automatiques actifs' : 'Envois SMS désactivés'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dès qu'une commande change de statut (ex. : de <em>« En cours de traitement »</em> à <em>« Prête à être récupérée »</em>), un SMS instantané est expédié au client avec son <strong>numéro de commande</strong> et son <strong>nouveau statut</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={autoSmsOnStatusChange}
              onChange={e => setAutoSmsOnStatusChange(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 accent-sky-500"
            />
            <span className="text-xs font-semibold text-slate-200 select-none">
              SMS automatique activé
            </span>
          </label>
        </div>
      </div>

      {/* Top summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700">En cours en atelier</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{inProgressCount}</span>
            <span className="text-xs text-sky-600 font-medium">Lavage & Repassage</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800">Prêtes pour retrait</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">{readyCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">SMS envoyé</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700">À encaisser au comptoir</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(pendingPaymentSum)}</span>
            <span className="text-xs text-amber-600 font-medium">Restes dus</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700">Commandes Express 24h</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 flex items-center gap-1">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
              {expressCount}
            </span>
            <span className="text-xs text-slate-700">Prioritaires</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En atelier ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('PRETE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'PRETE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Prêtes au retrait ({readyCount})
          </button>
          <button
            onClick={() => setStatusFilter('LIVREE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'LIVREE'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Livrées ({orders.filter(o => o.status === 'LIVREE').length})
          </button>
        </div>

        {/* Right action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Commande</span>
          </button>
        </div>

      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Aucune commande trouvée</h3>
            <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? `Aucun résultat pour "${searchQuery}". Essayez avec un autre nom ou n° de téléphone.`
                : 'Il n’y a aucune commande dans cette catégorie pour le moment.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1 text-xs text-sky-600 font-semibold hover:underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusInfo = getStatusBadgeInfo(order.status);
            const paymentInfo = getPaymentBadgeInfo(order.paymentStatus);
            const nextAction = getNextStatusAction(order.status);
            const totalPieces = order.items.reduce((s, i) => s + i.quantity, 0);
            const remainingDue = Math.max(0, order.totalAmount - order.paidAmount);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Info, Client, Reference, Pieces */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {order.referenceNumber}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}></span>
                      {statusInfo.label}
                    </span>

                    {order.isExpress && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Zap className="w-3 h-3 fill-amber-600 text-amber-600" />
                        Express 24h
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200" title="Chaque changement de statut génère automatiquement un SMS avec le N° de commande et le nouveau statut">
                      <MessageSquare className="w-3 h-3 text-sky-600" />
                      SMS auto
                    </span>

                    <span className="text-[11px] text-slate-700">
                      Déposé le {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  {/* Client line */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const cust = customers.find(c => c.id === order.clientId);
                        if (cust) setSelectedCustomerForHistory(cust);
                      }}
                      className="font-bold text-slate-900 hover:text-sky-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      <span>{order.clientName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <div className="text-slate-700 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{order.clientPhone}</span>
                    </div>

                    <div className="text-slate-700">
                      Code retrait : <strong className="font-mono text-slate-800">{order.trackingCode.replace('TRK-', '')}</strong>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="font-semibold text-slate-800">
                      {totalPieces} pièce{totalPieces > 1 ? 's' : ''} :
                    </span>
                    {order.items.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700"
                      >
                        {item.quantity}x {item.articleName}
                        {item.notes ? ` (${item.notes})` : ''}
                      </span>
                    ))}
                    {order.notes && (
                      <span className="text-[11px] text-amber-700 italic">
                        • Note : {order.notes}
                      </span>
                    )}
                  </div>

                  {/* Estimated ready date info */}
                  <div className="text-xs text-slate-700 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {order.status === 'PRETE'
                        ? <strong className="text-emerald-700">Prête depuis le {formatDateTime(order.actualReadyDate || order.estimatedReadyDate)}</strong>
                        : order.status === 'LIVREE'
                        ? <span className="text-slate-700">Retirée le {formatDateTime(order.deliveredDate || order.estimatedReadyDate)}</span>
                        : `Prévue pour le : ${formatDateTime(order.estimatedReadyDate)}`}
                    </span>
                  </div>
                </div>

                {/* Right: Payment, Next Status Stepper & Action buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Financial amount */}
                  <div className="text-left lg:text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${paymentInfo.color}`}>
                        {paymentInfo.label}
                      </span>
                      {remainingDue > 0 && (
                        <span className="text-[11px] font-bold text-rose-600">
                          (Reste {formatCurrency(remainingDue)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status progression & Quick selector */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {nextAction && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, nextAction.next, true)}
                        className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all ${
                          nextAction.next === 'PRETE'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-600/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                        title="Changer de statut et envoyer un SMS automatique"
                      >
                        <span>{nextAction.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label="Changer statut"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus, true)}
                        className="text-[11px] font-medium py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        title="Changer de statut manuellement (déclenche l'envoi du SMS automatique avec le N° et le nouveau statut)"
                      >
                        <option value="DEPOSEE">1. Déposée</option>
                        <option value="TRAITEMENT">2. En cours de lavage</option>
                        <option value="REPASSAGE">3. En repassage</option>
                        <option value="PRETE">4. Prête à récupérer ✨</option>
                        <option value="LIVREE">5. Livrée & Retirée ✅</option>
                      </select>
                    </div>
                  </div>

                  {/* Utility action icons: Facture, SMS, Suivi Mobile */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Afficher & Imprimer la facture"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-600" />
                      <span>Facture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOrderForSms(order)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium flex items-center gap-1 border border-sky-200 transition-colors"
                      title="Envoyer ou prévisualiser un SMS"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-600" />
                      <span>SMS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOrderForTracking(order)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Simuler la vue mobile de suivi client"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Suivi Live</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
