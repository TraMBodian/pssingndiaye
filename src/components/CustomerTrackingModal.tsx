import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Receipt,
  Package,
  Layers,
  Flame,
  Shirt
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { OrderStatus } from '../types';

export const CustomerTrackingModal: React.FC = () => {
  const { selectedOrderForTracking, setSelectedOrderForTracking } = useLaundry();

  if (!selectedOrderForTracking) return null;

  const order = selectedOrderForTracking;
  const pinCode = order.trackingCode.replace('TRK-', '');

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'DEPOSEE', label: 'Déposée', desc: 'Enregistré & trié', icon: <Package className="w-4 h-4" /> },
    { key: 'TRAITEMENT', label: 'Lavage & Détachage', desc: 'Nettoyage pro', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'REPASSAGE', label: 'Repassage & Soin', desc: 'Finition artisanale', icon: <Flame className="w-4 h-4" /> },
    { key: 'PRETE', label: 'Prête au retrait', desc: 'Au comptoir', icon: <Shirt className="w-4 h-4" /> },
    { key: 'LIVREE', label: 'Retirée', desc: 'Restitué au client', icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const statusOrder: OrderStatus[] = ['DEPOSEE', 'TRAITEMENT', 'REPASSAGE', 'PRETE', 'LIVREE'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="customer-tracking-modal"
        className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md max-h-[94vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Mobile App Bar Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                Lavoir Pro • Suivi Client Live
              </div>
              <div className="text-[10px] text-sky-400 font-mono">
                {order.referenceNumber}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrderForTracking(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Viewport Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-900">
          
          {/* Status Hero Card */}
          <div className={`p-4 rounded-2xl border ${
            order.status === 'PRETE'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
              : order.status === 'LIVREE'
              ? 'bg-slate-800/60 border-slate-700 text-slate-200'
              : 'bg-sky-950/40 border-sky-500/40 text-sky-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                order.status === 'PRETE' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-sky-500 text-white'
              }`}>
                {order.status === 'PRETE' ? <Sparkles className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {order.status === 'PRETE'
                    ? '🎉 Vos vêtements sont prêts !'
                    : order.status === 'LIVREE'
                    ? 'Commande retirée'
                    : order.status === 'REPASSAGE'
                    ? 'Finition & Repassage fin en cours'
                    : order.status === 'TRAITEMENT'
                    ? 'Lavage & Détachage expert en cours'
                    : 'Commande reçue & en préparation'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {order.status === 'PRETE'
                    ? 'Votre commande vous attend au comptoir. Présentez votre code au retrait.'
                    : `Disponibilité estimée le ${formatDateTime(order.estimatedReadyDate)}.`}
                </p>
              </div>
            </div>

            {/* Quick PIN code display for counter pickup */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-300">Code de retrait comptoir :</span>
              <span className="font-mono text-base font-extrabold tracking-widest bg-white/10 px-3 py-1 rounded-lg text-white border border-white/20">
                {pinCode}
              </span>
            </div>
          </div>

          {/* Real-Time Stepper Timeline */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Étapes du cycle d'entretien
            </div>

            <div className="space-y-3 pt-1">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {/* Vertical connecting line */}
                    {idx < steps.length - 1 && (
                      <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-3 ${
                        idx < currentIndex ? 'bg-sky-500' : 'bg-slate-700'
                      }`} />
                    )}

                    {/* Step Icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-md'
                        : isPassed
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {isPassed ? step.icon : idx + 1}
                    </div>

                    {/* Step text */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isCurrent ? 'text-sky-400 font-extrabold' : isPassed ? 'text-white' : 'text-slate-500'
                        }`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold animate-pulse">
                            En cours
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Garments List in Order */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Articles confiés ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>

            <div className="divide-y divide-slate-800 text-xs pt-1">
              {order.items.map((it, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div className="text-slate-300">
                    <span className="font-semibold text-white">{it.quantity}x</span> {it.articleName}
                  </div>
                  <div className="text-slate-400 font-mono">
                    {formatCurrency(it.unitPrice * it.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-medium">
              <span className="text-slate-400">État du règlement :</span>
              {order.paymentStatus === 'PAYE' ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Réglé en totalité
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  Reste à régler : {formatCurrency(order.totalAmount - order.paidAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Boutique Information & Contacts */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Lavoir Pro - Boutique Paris 8e</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              24 rue du Faubourg Saint-Honoré, 75008 Paris
              <br />Ouvert aujourd'hui de 08h00 à 19h30
            </p>

            <div className="pt-2 flex gap-2">
              <a
                href="tel:0142680012"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>Appeler la boutique</span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-850 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Ce portail est actualisé en direct à chaque étape en atelier.
          </p>
        </div>

      </div>
    </div>
  );
};
