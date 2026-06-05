import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import api from '../../api/axios';

const monthlyData = [
  { month: 'Jan', revenue: 42000, cost: 28000, profit: 14000 },
  { month: 'Feb', revenue: 58000, cost: 36000, profit: 22000 },
  { month: 'Mar', revenue: 51000, cost: 33000, profit: 18000 },
  { month: 'Apr', revenue: 73000, cost: 44000, profit: 29000 },
  { month: 'May', revenue: 68000, cost: 41000, profit: 27000 },
  { month: 'Jun', revenue: 95000, cost: 57000, profit: 38000 },
  { month: 'Jul', revenue: 88000, cost: 53000, profit: 35000 },
  { month: 'Aug', revenue: 112000, cost: 68000, profit: 44000 },
  { month: 'Sep', revenue: 99000, cost: 60000, profit: 39000 },
  { month: 'Oct', revenue: 130000, cost: 78000, profit: 52000 },
  { month: 'Nov', revenue: 148000, cost: 88000, profit: 60000 },
  { month: 'Dec', revenue: 172000, cost: 102000, profit: 70000 },
];

const topProducts = [
  { name: 'Nike Air Zoom Pegasus', sold: 340, revenue: '₹30,59,660' },
  { name: 'Adidas Ultraboost 22', sold: 210, revenue: '₹27,29,790' },
  { name: 'Puma Sports T-Shirt', sold: 890, revenue: '₹13,34,110' },
  { name: 'Yonex Badminton Racket', sold: 420, revenue: '₹11,97,000' },
  { name: 'Decathlon Pull-Up Bar', sold: 300, revenue: '₹3,59,700' },
];

const AdminReports = () => {
  const [salesSummary, setSalesSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(r => setSalesSummary(r.data.dashboard)).catch(() => {});
  }, []);

  const fmtK = (v) => `₹${(v / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Sales Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Full financial overview and performance analytics</p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹12,48,500', sub: '+18.4% YTD', color: 'text-emerald-600' },
          { label: 'Total Cost', value: '₹7,88,000', sub: '+12.1% YTD', color: 'text-red-500' },
          { label: 'Net Profit', value: '₹4,60,500', sub: '+27.3% YTD', color: 'text-blue-600' },
          { label: 'Avg Order Value', value: '₹3,240', sub: '+5.2% YTD', color: 'text-violet-600' },
        ].map(k => (
          <div key={k.label} className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{k.label}</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{k.value}</p>
            <p className={`text-xs font-semibold mt-1 ${k.color}`}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue vs Cost vs Profit */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Revenue vs Cost vs Profit (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              {[['rev','#1e3a8a'],['cost','#f97316'],['prof','#10b981']].map(([k,c]) => (
                <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtK} />
            <Tooltip formatter={(v, n) => [`₹${v.toLocaleString()}`, n]} />
            <Legend />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1e3a8a" strokeWidth={2} fill="url(#g-rev)" />
            <Area type="monotone" dataKey="cost" name="Cost" stroke="#f97316" strokeWidth={2} fill="url(#g-cost)" />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fill="url(#g-prof)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Top Selling Products</h2>
        <div className="table-container">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['Rank', 'Product', 'Units Sold', 'Revenue'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProducts.map((p, i) => (
                <tr key={p.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{i + 1}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.sold.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
