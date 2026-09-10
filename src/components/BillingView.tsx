import React from 'react';
import { FileText, Search, Wallet } from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { formatCurrency, formatDateTime, getPaymentBadgeInfo, getStatusBadgeInfo } from '../utils/formatters';

export const BillingView: React.FC = () => {
  const {
    orders,
    searchQuery,
    setSearchQuery,
    setSelectedOrderForInvoice
  } = useLaundry();

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const invoices = orders.filter(order =>
    !normalizedQuery ||
    order.referenceNumber.toLowerCase().includes(normalizedQuery) ||
    order.clientName.toLowerCase().includes(normalizedQuery) ||
    order.clientPhone.includes(normalizedQuery)
  );
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const paidRevenue = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const outstandingRevenue = Math.max(0, totalRevenue - paidRevenue);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-600">Traçabilité financière</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">Gestion de facturation</h1>
        <p className="mt-1 text-sm text-slate-600">Retrouvez chaque facture enregistrée et son historique de règlement.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-600">Factures enregistrées</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700">Total encaissé</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">{formatCurrency(paidRevenue)}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-amber-700">Reste à encaisser</p>
          <p className="mt-1 text-2xl font-black text-amber-700">{formatCurrency(outstandingRevenue)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="billing-search-input"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Rechercher une facture, un client ou un téléphone..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Aucune facture trouvée</p>
          </div>
        ) : invoices.map(order => {
          const paymentInfo = getPaymentBadgeInfo(order.paymentStatus);
          const statusInfo = getStatusBadgeInfo(order.status);
          const remaining = Math.max(0, order.totalAmount - order.paidAmount);
          return (
            <div key={order.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900">{order.referenceNumber}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${paymentInfo.color}`}>{paymentInfo.label}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{order.clientName}</p>
                  <p className="text-xs text-slate-500">Créée le {formatDateTime(order.createdAt)} · {order.clientPhone}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <p className="text-base font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                  {remaining > 0 && <p className="text-xs font-semibold text-rose-600">Reste {formatCurrency(remaining)}</p>}
                  {remaining === 0 && <p className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600"><Wallet className="h-3 w-3" />Soldée</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInvoice(order)}
                  className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  Voir la facture
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
