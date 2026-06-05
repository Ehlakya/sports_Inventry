import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Package, ClipboardList, TrendingUp, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import api from '../../api/axios';
import { useSelector } from 'react-redux';

const orderData = [
  { month: 'Jan', orders: 8 }, { month: 'Feb', orders: 12 }, { month: 'Mar', orders: 7 },
  { month: 'Apr', orders: 15 }, { month: 'May', orders: 11 }, { month: 'Jun', orders: 18 },
];

const recentOrders = [
  { id: '#SO-2210', product: 'Nike Air Zoom (Qty: 50)', amount: '₹4,49,950', status: 'Delivered', date: 'Jun 1, 2026' },
  { id: '#SO-2209', product: 'Adidas Ultraboost (Qty: 30)', amount: '₹3,89,970', status: 'Processing', date: 'May 28, 2026' },
  { id: '#SO-2208', product: 'Puma T-Shirts (Qty: 200)', amount: '₹2,99,800', status: 'Shipped', date: 'May 20, 2026' },
];

const statusColor = {
  Delivered: 'bg-emerald-100 text-emerald-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-orange-100 text-orange-700',
  Pending: 'bg-slate-100 text-slate-600',
};

const SupplierDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data.dashboard)).catch(() => {
      setStats({ totalProducts: 24, pendingOrders: 3, completedOrders: 68, totalRevenue: '₹18,45,200' });
    });
  }, []);

  const cards = [
    { icon: Package, label: 'My Products', value: stats?.totalProducts ?? '—', color: 'bg-blue-900', delta: '+2 this month' },
    { icon: Clock, label: 'Pending Orders', value: stats?.pendingOrders ?? '—', color: 'bg-orange-500', delta: 'Needs attention' },
    { icon: CheckCircle, label: 'Completed Orders', value: stats?.completedOrders ?? '—', color: 'bg-emerald-600', delta: '+8 this month' },
    { icon: TrendingUp, label: 'Total Revenue', value: stats?.totalRevenue ?? '—', color: 'bg-violet-600', delta: '+12.4% YTD' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Welcome back, {user?.name?.split(' ')[0] || 'Supplier'}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here's your supplier portal overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(c => (
          <div key={c.label} className="glass-card glass-card-hover rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{c.label}</span>
              <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon className="h-5 w-5 text-white" /></div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{c.value}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" />{c.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Monthly Order Volume</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#1e3a8a" radius={[6, 6, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Recent Supply Orders</h2>
          <div className="space-y-3">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{o.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{o.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{o.amount}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor[o.status]}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
