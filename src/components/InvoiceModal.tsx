import React from 'react';
import { 
  X, 
  Printer, 
  Send, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { formatCurrency, formatDateTime, formatDate, getPaymentBadgeInfo } from '../utils/formatters';

export const InvoiceModal: React.FC = () => {
  const { 
    selectedOrderForInvoice, 
    setSelectedOrderForInvoice, 
    setSelectedOrderForSms,
    setSelectedOrderForTracking
  } = useLaundry();

  if (!selectedOrderForInvoice) return null;

  const order = selectedOrderForInvoice;
  const paymentBadge = getPaymentBadgeInfo(order.paymentStatus);
  const remainingDue = Math.max(0, order.totalAmount - order.paidAmount);
  const totalPieces = order.items.reduce((s, i) => s + i.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="invoice-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Top action toolbar (hidden during print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold">
              {order.referenceNumber}
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              Facture & Ticket de Caisse Blanchisserie
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedOrderForSms(order);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 font-medium flex items-center gap-1.5 transition-colors"
              title="Envoyer ou voir le SMS client"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SMS Client</span>
            </button>

            <button
              onClick={() => {
                setSelectedOrderForTracking(order);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-medium flex items-center gap-1.5 transition-colors"
              title="Simuler le suivi mobile client"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Lien Suivi</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket & Invoice Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white" id="printable-receipt">
          
          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-dashed border-slate-300">
            <div className="mb-2 flex flex-col items-center gap-2">
              <img
                src="/assets/aistudio/logo.png"
                alt="S.L Ndiaye Pressing"
                className="h-20 w-28 object-contain"
              />
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                S.L Ndiaye Pressing
              </h1>
            </div>
            <p className="text-xs text-slate-700">
              24 rue du Faubourg Saint-Honoré, 75008 Paris
            </p>
            <p className="text-xs text-slate-700">
              Tél : 01 42 68 00 12 • SIRET 842 910 324 00018 • TVA FR74842910324
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 px-3 py-0.5 rounded-full">
              <span>Ouvert Lun-Sam 08h00 - 19h30 sans interruption</span>
            </div>
          </div>

          {/* Key Reference & Pickup Alert */}
          <div className="py-4 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-700">Facture N° :</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">
                {order.referenceNumber}
              </div>
              <div className="text-[11px] text-slate-700 mt-1">
                Déposé le : {formatDateTime(order.createdAt)}
              </div>
              {order.isExpress && (
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1.5">
                  <Zap className="w-3 h-3" /> Service Express 24h Prioritaire
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-slate-700">Date de retrait prévue :</div>
              <div className="text-sm font-extrabold text-sky-700">
                {formatDateTime(order.estimatedReadyDate)}
              </div>
              <div className="mt-1 text-[11px] text-slate-700 font-medium">
                Code de retrait : <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{order.trackingCode.replace('TRK-', '')}</span>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="py-3 border-b border-slate-200 bg-slate-50/70 -mx-6 sm:-mx-8 px-6 sm:px-8 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-700">Client : </span>
              <strong className="text-slate-900">{order.clientName}</strong>
              <div className="text-slate-700 font-mono">{order.clientPhone}</div>
            </div>
            <div className="text-right">
              <span className="text-slate-700">Articles confiés : </span>
              <span className="font-bold text-slate-900">{totalPieces} pièce{totalPieces > 1 ? 's' : ''}</span>
              {order.hangerCount ? (
                <div className="text-[11px] text-slate-700">Sur cintre: {order.hangerCount} | Housses: {order.bagCount || 1}</div>
              ) : null}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-semibold text-left">
                  <th className="pb-2">Description de la pièce</th>
                  <th className="pb-2 text-center w-12">Qté</th>
                  <th className="pb-2 text-right w-20">P.U. TTC</th>
                  <th className="pb-2 text-right w-24">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2 text-slate-800">
                      <div className="font-medium">{item.articleName}</div>
                      {item.notes && (
                        <div className="text-[11px] text-amber-700 italic">
                          ↳ Constat : {item.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-2 text-center text-slate-700 font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right text-slate-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-semibold text-slate-900">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes & Special instructions */}
          {order.notes && (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4">
              <strong>Instructions atelier :</strong> {order.notes}
            </div>
          )}

          {/* Totals & Payments */}
          <div className="pt-2 border-t-2 border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Total Hors Taxes (HT) :</span>
              <span>{formatCurrency(Math.round((order.totalAmount / 1.20) * 100) / 100)}</span>
            </div>
            {order.isExpress && (
              <div className="flex justify-between text-amber-700">
                <span>Majoration Service Express 24h :</span>
                <span>Inclus</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700">
              <span>Dont TVA 20% :</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total TTC :</span>
              <span className="text-lg text-slate-950">{formatCurrency(order.totalAmount)}</span>
            </div>

            <div className="flex justify-between pt-1 font-medium text-slate-800">
              <span>Montant réglé ({order.paymentMethod || 'Carte'}) :</span>
              <span>{formatCurrency(order.paidAmount)}</span>
            </div>

            {remainingDue > 0 ? (
              <div className="flex justify-between font-bold text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                <span>SOLDE RESTANT DÛ AU RETRAIT :</span>
                <span>{formatCurrency(remainingDue)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Facture soldée en totalité
              </div>
            )}
          </div>

          {/* Barcode / Tracking Representation */}
          <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-300 text-center space-y-2">
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Suivi en direct de votre linge par SMS & QR Code
            </div>

            {/* Visual Barcode */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-10 flex items-center gap-0.5">
                {[4, 2, 6, 2, 8, 4, 2, 6, 2, 4, 8, 2, 6, 4, 2, 8, 2, 4, 6, 2, 8, 4, 6, 2, 4].map((width, i) => (
                  <div 
                    key={i} 
                    className="bg-slate-900 h-full" 
                    style={{ width: `${width}px` }} 
                  />
                ))}
              </div>
              <div className="font-mono text-xs text-slate-700 tracking-widest mt-1">
                *{order.trackingCode}*
              </div>
            </div>

            <p className="text-[10px] text-slate-700 max-w-sm mx-auto">
              Lien de suivi client : <strong className="text-sky-700">https://lndry.app/t/{order.trackingCode}</strong>
            </p>
          </div>

          {/* Legal / Laundry Notice */}
          <div className="mt-6 text-[9px] text-slate-700 text-center leading-relaxed border-t border-slate-100 pt-3">
            Tout article déposé non réclamé dans un délai de 3 mois sera remis à une organisation caritative conformément à la loi du 31 décembre 1903. La responsabilité du pressing est régie par les conditions générales du barème CNET.
          </div>

        </div>

        {/* Bottom footer button bar */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Imprimable au format ticket 80mm ou page A4
          </div>
          <button
            onClick={() => setSelectedOrderForInvoice(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
