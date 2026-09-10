import React from 'react';
import { CheckCircle2, Info, MessageSquareText, X } from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';

export const Toast: React.FC = () => {
  const { activeToast, clearToast } = useLaundry();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 ${
        activeToast.type === 'sms'
          ? 'bg-slate-900 text-white border-slate-800'
          : activeToast.type === 'success'
          ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
          : 'bg-white text-slate-900 border-slate-200'
      }`}>
        <div className="shrink-0 mt-0.5">
          {activeToast.type === 'sms' ? (
            <MessageSquareText className="w-5 h-5 text-sky-400" />
          ) : activeToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Info className="w-5 h-5 text-sky-600" />
          )}
        </div>
        <div className="flex-1 text-sm font-medium">
          {activeToast.message}
        </div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
