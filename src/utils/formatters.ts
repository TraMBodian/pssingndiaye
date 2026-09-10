export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getStatusBadgeInfo = (status: string) => {
  switch (status) {
    case 'DEPOSEE':
      return {
        label: 'Déposée',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
        step: 1
      };
    case 'TRAITEMENT':
      return {
        label: 'Lavage & Traitement',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        dotColor: 'bg-blue-500',
        step: 2
      };
    case 'REPASSAGE':
      return {
        label: 'Repassage & Finition',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotColor: 'bg-indigo-500',
        step: 3
      };
    case 'PRETE':
      return {
        label: 'Prête pour retrait',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
        dotColor: 'bg-emerald-500',
        step: 4
      };
    case 'LIVREE':
      return {
        label: 'Livrée / Retirée',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        dotColor: 'bg-slate-400',
        step: 5
      };
    default:
      return {
        label: status,
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        dotColor: 'bg-slate-400',
        step: 1
      };
  }
};

export const getPaymentBadgeInfo = (status: string) => {
  switch (status) {
    case 'PAYE':
      return {
        label: 'Payé',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'ACOMPTE':
      return {
        label: 'Acompte versé',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    case 'EN_ATTENTE':
      return {
        label: 'À régler au retrait',
        color: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    default:
      return {
        label: status,
        color: 'bg-slate-100 text-slate-700 border-slate-200'
      };
  }
};
