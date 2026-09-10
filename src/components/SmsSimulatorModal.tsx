import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Sparkles, 
  CheckCheck, 
  Clock, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { formatDateTime } from '../utils/formatters';

export const SmsSimulatorModal: React.FC = () => {
  const { 
    selectedOrderForSms, 
    setSelectedOrderForSms, 
    sendSms, 
    smsLogs,
    setSelectedOrderForTracking 
  } = useLaundry();

  if (!selectedOrderForSms) return null;

  const order = selectedOrderForSms;
  const clientFirstName = order.clientName.split(' ')[0] || 'Client';
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const pinCode = order.trackingCode.replace('TRK-', '');

  // Pre-configured French templates
  const templates = [
    {
      id: 'prete',
      label: '✨ Prête pour retrait',
      type: 'PRETE_RETRAIT' as const,
      text: `✨ Blanchisserie Pro: Bonjour ${clientFirstName}, vos ${itemCount} articles (Cmd #${order.referenceNumber}) sont prêts au pressing ! Retrait dès aujourd'hui jusqu'à 19h30. Suivi direct: https://lndry.app/t/${order.trackingCode} Code: ${pinCode}`
    },
    {
      id: 'confirmation',
      label: '🧺 Confirmation de dépôt',
      type: 'CONFIRMATION' as const,
      text: `🧺 Blanchisserie Pro: Bonjour ${clientFirstName}, votre commande #${order.referenceNumber} (${itemCount} articles) est enregistrée. Prévue le ${new Date(order.estimatedReadyDate).toLocaleDateString('fr-FR')}. Suivi en temps réel: https://lndry.app/t/${order.trackingCode}`
    },
    {
      id: 'traitement',
      label: '🫧 En cours de traitement',
      type: 'EN_TRAITEMENT' as const,
      text: `🫧 Blanchisserie Pro: Vos articles #${order.referenceNumber} sont actuellement en cours de détachage et lavage pro par nos maîtres artisans.`
    },
    {
      id: 'rappel',
      label: '⏰ Rappel retrait 48h',
      type: 'RAPPEL_RETRAIT' as const,
      text: `⏰ Blanchisserie Pro: Bonjour ${clientFirstName}, rappel amical: vos vêtements #${order.referenceNumber} vous attendent au comptoir. À très vite !`
    }
  ];

  const [currentText, setCurrentText] = useState(templates[0].text);
  const [selectedType, setSelectedType] = useState<typeof templates[0]['type']>('PRETE_RETRAIT');
  const [isSending, setIsSending] = useState(false);

  const orderSmsHistory = smsLogs.filter(s => s.orderId === order.id);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      sendSms(order.id, currentText, selectedType);
      setIsSending(false);
      setSelectedOrderForSms(null);
    }, 400);
  };

  const charCount = currentText.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="sms-simulator-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Envoi de SMS en Temps Réel</span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {order.referenceNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span>Destinataire :</span>
                <strong className="text-white">{order.clientName}</strong>
                <span>({order.clientPhone})</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrderForSms(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Simulated Smartphone Screen */}
          <div className="bg-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-300/80 shadow-inner">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-3">
              Aperçu en direct sur le smartphone du client
            </div>

            {/* Smartphone screen box */}
            <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              {/* Phone Status Bar */}
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>12:45</span>
                <span className="font-semibold text-slate-700">LavoirPro SMS</span>
                <span>5G 98%</span>
              </div>

              {/* Chat Thread */}
              <div className="p-4 bg-slate-50 min-h-[160px] flex flex-col justify-end space-y-3">
                <div className="text-center text-[10px] text-slate-400 font-medium">
                  Aujourd'hui
                </div>

                {/* SMS Bubble */}
                <div className="bg-sky-600 text-white text-xs p-3.5 rounded-2xl rounded-tr-xs shadow-xs leading-relaxed max-w-[90%] self-end">
                  {currentText}
                  <div className="text-[10px] text-sky-200 text-right mt-1 flex items-center justify-end gap-1">
                    <span>12:45</span>
                    <CheckCheck className="w-3 h-3 text-sky-200" />
                  </div>
                </div>
              </div>

              {/* Link test button */}
              <div className="p-2 bg-white border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForTracking(order)}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 py-1 px-2 rounded hover:bg-sky-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Tester le lien de suivi client (https://lndry.app/t/...)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick template pickers */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Modèles de messages rapides
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setCurrentText(tpl.text);
                    setSelectedType(tpl.type);
                  }}
                  className={`p-2 rounded-xl text-left border text-xs font-medium transition-all ${
                    currentText === tpl.text
                      ? 'bg-sky-50 text-sky-900 border-sky-300 ring-1 ring-sky-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Personnaliser le contenu du SMS :
              </label>
              <span className={`text-[11px] font-mono ${charCount > 160 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                {charCount} car. ({smsSegments} SMS)
              </span>
            </div>
            <textarea
              rows={3}
              value={currentText}
              onChange={e => setCurrentText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans leading-relaxed"
            />
          </div>

          {/* SMS History for this order */}
          {orderSmsHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Historique des SMS déjà expédiés pour cette commande ({orderSmsHistory.length})</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {orderSmsHistory.map(sms => (
                  <div key={sms.id} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Envoyé le {formatDateTime(sms.sentAt)}</span>
                      </div>
                      <div className="text-slate-600 line-clamp-1 text-[11px] mt-0.5">{sms.message}</div>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800 rounded">
                      Délivré
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href={`sms:${order.clientPhone.replace(/\s+/g, '')}?body=${encodeURIComponent(currentText)}`}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
            title="Lancer l'application Messages native"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Ouvrir dans l'app Messages locale</span>
          </a>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedOrderForSms(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-confirm-send-sms"
              disabled={isSending || !currentText.trim()}
              onClick={handleSend}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-98 shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Envoi en cours...' : 'Envoyer le SMS maintenant'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
