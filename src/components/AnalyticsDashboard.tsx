import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  ArrowUpRight, 
  Sparkles, 
  BarChart2, 
  PieChart as PieIcon,
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useLaundry } from '../context/LaundryContext';
import { formatCurrency } from '../utils/formatters';

export const AnalyticsDashboard: React.FC = () => {
  const { monthlyStats, orders } = useLaundry();

  // Current month is Sept 2026
  const currentMonthData = monthlyStats[monthlyStats.length - 1];
  const prevMonthData = monthlyStats[monthlyStats.length - 2];

  const growthPct = prevMonthData 
    ? Math.round(((currentMonthData.revenue - prevMonthData.revenue) / prevMonthData.revenue) * 100) 
    : 12;

  const averageTicket = currentMonthData.ordersCount > 0 
    ? currentMonthData.revenue / currentMonthData.ordersCount 
    : 0;

  // Breakdown by category
  const categoryData = [
    { name: 'Pressing & Nettoyage à sec', value: currentMonthData.pressingRevenue, color: '#0284c7' },
    { name: 'Lavage au kilo', value: currentMonthData.lavageRevenue, color: '#06b6d4' },
    { name: 'Literie & Couettes', value: currentMonthData.literieRevenue, color: '#6366f1' },
    { name: 'Option Express 24h', value: currentMonthData.expressRevenue, color: '#f59e0b' }
  ];

  // Top services in active orders
  const serviceCountMap: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(i => {
      serviceCountMap[i.articleName] = (serviceCountMap[i.articleName] || 0) + i.quantity;
    });
  });

  const topServices = Object.entries(serviceCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Header with Monthly focus */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <TrendingUp className="w-4 h-4" />
            <span>Tableau de Bord Financier & Performance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
            Suivi des Revenus Mensuels • {currentMonthData.month}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Analyse en temps réel du chiffre d'affaires, des volumes d'articles et de la rentabilité par catégorie.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Croissance vs M-1</div>
            <div className="text-lg font-black text-emerald-400">+{growthPct}%</div>
          </div>
        </div>
      </div>

      {/* 4 Financial KPIs Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Revenu Mensuel en cours</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatCurrency(currentMonthData.revenue)}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>+{formatCurrency(currentMonthData.revenue - prevMonthData.revenue)}</span>
            <span className="text-slate-700 font-normal">vs mois dernier</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Commandes traitées</span>
            <ShoppingBag className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {currentMonthData.ordersCount}
          </div>
          <div className="mt-1 text-xs text-sky-600 font-medium">
            Moyenne 8.2 commandes / jour
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Panier Moyen (Ticket)</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatCurrency(averageTicket)}
          </div>
          <div className="mt-1 text-xs text-slate-700">
            Ratio 3.8 vêtements / commande
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Option Express 24h</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {formatCurrency(currentMonthData.expressRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-700">
            Surcharge +25% priorité
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart: Monthly Revenue Bar & Area evolution (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                <span>Évolution du Chiffre d'Affaires Mensuel (2026)</span>
              </h3>
              <p className="text-xs text-slate-700">
                Comparatif des revenus mensuels générés sur les 9 derniers mois
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
              Total cumulé : {formatCurrency(monthlyStats.reduce((s, m) => s + m.revenue, 0))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val) => `${val}€`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Chiffre d\'affaires']}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0284c7" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-sky-600" />
              <span>Répartition par Service</span>
            </h3>
            <p className="text-xs text-slate-700">
              Ventilation des recettes du mois en cours
            </p>
          </div>

          {/* Donut Chart */}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend List */}
          <div className="space-y-2 text-xs">
            {categoryData.map(cat => {
              const pct = Math.round((cat.value / currentMonthData.revenue) * 100);
              return (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-slate-700 line-clamp-1">{cat.name}</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    {pct}% <span className="font-normal text-slate-700">({formatCurrency(cat.value)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom row: Top Services Performed & Monthly Detail Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Demanded Items (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Prestations les plus sollicitées</span>
          </h3>

          <div className="space-y-2 pt-1">
            {topServices.map(([name, count], index) => (
              <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{name}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {count} traités
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Breakdown Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 overflow-hidden">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Historique détaillé des revenus mensuels</span>
          </h3>

          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="pb-2">Mois</th>
                  <th className="pb-2 text-right">CA Total</th>
                  <th className="pb-2 text-right">Commandes</th>
                  <th className="pb-2 text-right">Pressing</th>
                  <th className="pb-2 text-right">Lavage au kg</th>
                  <th className="pb-2 text-right">Express</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...monthlyStats].reverse().map(m => (
                  <tr key={m.month} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">{m.month}</td>
                    <td className="py-2.5 text-right font-extrabold text-sky-700">{formatCurrency(m.revenue)}</td>
                    <td className="py-2.5 text-right text-slate-700">{m.ordersCount}</td>
                    <td className="py-2.5 text-right text-slate-700">{formatCurrency(m.pressingRevenue)}</td>
                    <td className="py-2.5 text-right text-slate-700">{formatCurrency(m.lavageRevenue)}</td>
                    <td className="py-2.5 text-right font-medium text-amber-700">{formatCurrency(m.expressRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
