import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Search, 
  Send, 
  CheckCheck, 
  Clock, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  QrCode,
  Zap,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { formatDateTime } from '../utils/formatters';
import { OrderStatus } from '../types';

export const SmsLogsView: React.FC = () => {
  const { 
    smsLogs, 
    orders, 
    updateOrderStatus,
    autoSmsOnStatusChange,
    setAutoSmsOnStatusChange,
    setSelectedOrderForSms, 
    setSelectedOrderForTracking,
    getStatusDisplayLabel 
  } = useLaundry();

  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'CHANGEMENT_STATUT' | 'PRETE_RETRAIT' | 'CONFIRMATION'>('ALL');
  
  // Interactive test simulator state
  const [testOrderId, setTestOrderId] = useState<string>(orders[0]?.id || '');
  const [testTargetStatus, setTestTargetStatus] = useState<OrderStatus>('PRETE');

  const filteredLogs = smsLogs.filter(log => {
    const q = search.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      log.clientName.toLowerCase().includes(q) ||
      log.clientPhone.includes(q) ||
      log.message.toLowerCase().includes(q) ||
      (log.orderReference && log.orderReference.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (selectedTypeFilter === 'CHANGEMENT_STATUT') {
      return log.type === 'CHANGEMENT_STATUT' || log.type === 'PRETE_RETRAIT';
    }
    if (selectedTypeFilter === 'PRETE_RETRAIT') {
      return log.type === 'PRETE_RETRAIT';
    }
    if (selectedTypeFilter === 'CONFIRMATION') {
      return log.type === 'CONFIRMATION';
    }
    return true;
  });

  const handleTestSimulateStatusChange = () => {
    if (!testOrderId) return;
    updateOrderStatus(testOrderId, testTargetStatus, true);
  };

  const statusChangeCount = smsLogs.filter(s => s.type === 'CHANGEMENT_STATUT' || s.type === 'PRETE_RETRAIT').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Système de Notifications SMS & Journal en Direct
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              Traçabilité en temps réel des SMS automatiques générés lors de chaque changement de statut de commande.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Passerelle SMS Active (100% Délivrés)
          </span>
        </div>
      </div>

      {/* Interactive Status Transition SMS Test Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-white p-4 sm:p-5 rounded-2xl border border-sky-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Simulateur de Changement de Statut & Envoi SMS Automatique
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Sélectionnez une commande et un nouveau statut pour déclencher l'envoi instantané d'un SMS au client contenant le numéro de commande et le nouveau statut.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Sélectionner une commande pour le test"
              value={testOrderId}
              onChange={e => setTestOrderId(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.referenceNumber} - {o.clientName} ({getStatusDisplayLabel(o.status)})
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-700 font-bold">➔</span>

            <select
              aria-label="Sélectionner le nouveau statut"
              value={testTargetStatus}
              onChange={e => setTestTargetStatus(e.target.value as OrderStatus)}
              className="text-xs py-2 px-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="TRAITEMENT">En cours de lavage</option>
              <option value="REPASSAGE">En cours de repassage</option>
              <option value="PRETE">Prête à être récupérée ✨</option>
              <option value="LIVREE">Livrée & Retirée ✅</option>
              <option value="DEPOSEE">Déposée au comptoir</option>
            </select>

            <button
              type="button"
              onClick={handleTestSimulateStatusChange}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Déclencher le SMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTypeFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous les SMS ({smsLogs.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('CHANGEMENT_STATUT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTypeFilter === 'CHANGEMENT_STATUT'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Changements de statut ({statusChangeCount})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('PRETE_RETRAIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTypeFilter === 'PRETE_RETRAIT'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Prêtes au retrait
          </button>
          <button
            onClick={() => setSelectedTypeFilter('CONFIRMATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTypeFilter === 'CONFIRMATION'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dépôts confirmés
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par client, tél, mot-clé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
          />
        </div>
      </div>

      {/* SMS Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-700">
            Aucun SMS correspondant au filtre.
          </div>
        ) : (
          filteredLogs.map(sms => {
            const relatedOrder = orders.find(o => o.id === sms.orderId);
            const refNumber = sms.orderReference || relatedOrder?.referenceNumber;

            return (
              <div
                key={sms.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {sms.clientName}
                    </span>
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                      {sms.clientPhone}
                    </span>

                    {refNumber && (
                      <span className="font-mono font-bold text-slate-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[11px]">
                        N° {refNumber}
                      </span>
                    )}

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      sms.type === 'PRETE_RETRAIT'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : sms.type === 'CHANGEMENT_STATUT'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : sms.type === 'CONFIRMATION'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {sms.type === 'PRETE_RETRAIT' 
                        ? '✨ Prête à récupérer (SMS auto)' 
                        : sms.type === 'CHANGEMENT_STATUT'
                        ? '🔄 Changement de statut (SMS auto)'
                        : sms.type === 'CONFIRMATION'
                        ? '🧺 Dépôt confirmé'
                        : 'Information'}
                    </span>

                    {sms.newStatus && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Nouveau statut : {getStatusDisplayLabel(sms.newStatus)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(sms.sentAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Délivré
                    </span>
                  </div>
                </div>

                {/* SMS Text Bubble */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs font-sans text-slate-800 leading-relaxed flex items-start gap-2.5">
                  <MessageSquareText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-mono text-slate-900">{sms.message}</p>
                  </div>
                </div>

                {/* Bottom Order Link & Actions */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  {relatedOrder ? (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700">Commande associée :</span>
                      <strong className="font-mono text-slate-900">{relatedOrder.referenceNumber}</strong>
                      <span className="text-slate-700">({relatedOrder.totalAmount} € - {getStatusDisplayLabel(relatedOrder.status)})</span>
                    </div>
                  ) : (
                    <div className="text-slate-700 italic">Commande #{refNumber || 'N/A'}</div>
                  )}

                  <div className="flex items-center gap-2">
                    {relatedOrder && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForTracking(relatedOrder)}
                          className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Simuler vue client</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedOrderForSms(relatedOrder)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Renvoyer / Éditer</span>
                        </button>
                      </>
                    )}
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
