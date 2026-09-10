import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Receipt, 
  Award, 
  ShoppingBag, 
  Plus, 
  Sparkles, 
  Send, 
  Clock, 
  Edit3, 
  CheckCircle2,
  Check
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { formatCurrency, formatDateTime, formatDate, getStatusBadgeInfo, getPaymentBadgeInfo } from '../utils/formatters';

export const CustomerHistoryModal: React.FC = () => {
  const { 
    selectedCustomerForHistory, 
    setSelectedCustomerForHistory, 
    orders, 
    smsLogs, 
    setSelectedOrderForInvoice, 
    setSelectedOrderForSms,
    updateCustomer,
    setIsNewOrderModalOpen
  } = useLaundry();

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState('');

  if (!selectedCustomerForHistory) return null;

  const customer = selectedCustomerForHistory;
  
  // All orders by this customer sorted chronologically (newest first)
  const customerOrders = orders
    .filter(o => o.clientId === customer.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // All SMS notifications sent to this customer
  const customerSms = smsLogs.filter(s => s.clientPhone === customer.phone || s.clientName === customer.fullName);

  const averageBasket = customer.ordersCount > 0 ? customer.totalSpent / customer.ordersCount : 0;

  const handleSavePreferences = () => {
    updateCustomer(customer.id, { preferences: editedPreferences });
    setIsEditingPreferences(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="customer-history-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {customer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {customer.fullName}
                </h2>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  customer.loyaltyLevel === 'VIP' 
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                    : customer.loyaltyLevel === 'REGULIER'
                    ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {customer.loyaltyLevel === 'VIP' ? '★ Client VIP' : customer.loyaltyLevel === 'REGULIER' ? 'Client Régulier' : 'Nouveau Client'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {customer.email}
                  </span>
                )}
                {customer.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {customer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCustomerForHistory(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifetime Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50 text-center py-3">
          <div>
            <div className="text-[11px] text-slate-700 uppercase font-semibold">Chiffre d'Affaires</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {formatCurrency(customer.totalSpent)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-700 uppercase font-semibold">Commandes traitées</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {customerOrders.length} service{customerOrders.length > 1 ? 's' : ''}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-700 uppercase font-semibold">Panier Moyen</div>
            <div className="text-base font-extrabold text-sky-700 mt-0.5">
              {formatCurrency(averageBasket)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-700 uppercase font-semibold">Dernière visite</div>
            <div className="text-xs font-bold text-slate-800 mt-1">
              {formatDate(customer.lastVisitDate)}
            </div>
          </div>
        </div>

        {/* Modal Body - Tabs or Sections */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Customer Preferences Card */}
          <div className="bg-sky-50/60 rounded-xl p-3.5 border border-sky-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Préférences d'entretien & Exigences client
              </span>
              {!isEditingPreferences ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditedPreferences(customer.preferences || '');
                    setIsEditingPreferences(true);
                  }}
                  className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Modifier
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="text-xs bg-sky-600 text-white px-2 py-0.5 rounded font-semibold flex items-center gap-1 hover:bg-sky-700"
                >
                  <Check className="w-3 h-3" /> Enregistrer
                </button>
              )}
            </div>

            {isEditingPreferences ? (
              <input
                type="text"
                value={editedPreferences}
                onChange={e => setEditedPreferences(e.target.value)}
                placeholder="Ex: Cintre bois, amidon léger, lessive sans parfum..."
                className="w-full text-xs p-2 rounded bg-white border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            ) : (
              <p className="text-xs text-slate-700 italic">
                {customer.preferences || 'Aucune préférence particulière renseignée.'}
              </p>
            )}
          </div>

          {/* Full Service History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-600" />
                <span>Historique chronologique des services ({customerOrders.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomerForHistory(null);
                  setIsNewOrderModalOpen(true);
                }}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle commande pour {customer.fullName.split(' ')[0]}</span>
              </button>
            </div>

            {customerOrders.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {customerOrders.map(order => {
                  const statusInfo = getStatusBadgeInfo(order.status);
                  const paymentInfo = getPaymentBadgeInfo(order.paymentStatus);
                  const totalPieces = order.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-sky-300 transition-all shadow-2xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {order.referenceNumber}
                          </span>
                          <span className="text-xs text-slate-700">
                            {formatDateTime(order.createdAt)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusInfo.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}></span>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${paymentInfo.color}`}>
                            {paymentInfo.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Facture</span>
                          </button>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-700">{totalPieces} pièces :</span>
                        {order.items.map((it, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                            {it.quantity}x {it.articleName}
                            {it.notes ? ` (${it.notes})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SMS History Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <Send className="w-4 h-4 text-slate-600" />
              <span>Historique des SMS de suivi envoyés ({customerSms.length})</span>
            </h3>

            {customerSms.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                Aucun SMS envoyé à ce client pour le moment.
              </div>
            ) : (
              <div className="space-y-2">
                {customerSms.map(sms => (
                  <div key={sms.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-800">
                          Délivré le {formatDateTime(sms.sentAt)}
                        </span>
                        {sms.orderReference && (
                          <span className="bg-sky-100 text-sky-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Cmd #{sms.orderReference}
                          </span>
                        )}
                        {sms.type === 'CHANGEMENT_STATUT' && (
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Changement statut
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-700">
                        Destinataire : {sms.clientPhone}
                      </span>
                    </div>
                    <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono text-xs">
                      {sms.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedCustomerForHistory(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
