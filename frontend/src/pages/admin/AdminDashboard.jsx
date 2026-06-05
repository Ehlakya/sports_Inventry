import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Package, Users, Truck, ShoppingCart, Layers,
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import api from '../../api/axios';

const COLORS = ['#1e3a8a', '#f97316', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'];

const salesData = [
  { month: 'Jan', sales: 42000, orders: 120 },
  { month: 'Feb', sales: 58000, orders: 145 },
  { month: 'Mar', sales: 51000, orders: 132 },
  { month: 'Apr', sales: 73000, orders: 198 },
  { month: 'May', sales: 68000, orders: 180 },
  { month: 'Jun', sales: 95000, orders: 240 },
  { month: 'Jul', sales: 88000, orders: 220 },
  { month: 'Aug', sales: 112000, orders: 285 },
  { month: 'Sep', sales: 99000, orders: 260 },
  { month: 'Oct', sales: 130000, orders: 310 },
  { month: 'Nov', sales: 148000, orders: 355 },
  { month: 'Dec', sales: 172000, orders: 410 },
];

const categoryData = [
  { name: 'Footwear', value: 35 },
  { name: 'Apparel', value: 25 },
  { name: 'Equipment', value: 20 },
  { name: 'Accessories', value: 12 },
  { name: 'Nutrition', value: 8 },
];

const recentOrders = [
  { id: '#ORD-8821', customer: 'Ravi Sharma', product: 'Nike Air Zoom', amount: '₹4,299', status: 'Delivered', date: 'Jun 4, 2026' },
  { id: '#ORD-8820', customer: 'Priya Patel', product: 'Adidas Ultraboost', amount: '₹7,999', status: 'Processing', date: 'Jun 4, 2026' },
  { id: '#ORD-8819', customer: 'Amit Kumar', product: 'Decathlon Dumbbells', amount: '₹2,499', status: 'Shipped', date: 'Jun 3, 2026' },
  { id: '#ORD-8818', customer: 'Sneha Iyer', product: 'Yonex Badminton Racket', amount: '₹1,850', status: 'Pending', date: 'Jun 3, 2026' },
  { id: '#ORD-8817', customer: 'Karan Singh', product: 'Puma Sports Shorts', amount: '₹899', status: 'Delivered', date: 'Jun 2, 2026' },
];

const statusColor = {
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const StatCard = ({ icon: Icon, label, value, delta, deltaType, color }) => (
  <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{value}</div>
    <div className={`flex items-center gap-1 text-sm font-medium ${deltaType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
      {deltaType === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      <span>{delta} from last month</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch {
        // Use fallback demo data
        setStats({
          totalProducts: 1284,
          totalSuppliers: 48,
          totalCustomers: 3620,
          totalOrders: 8821,
          availableStock: 24560,
          totalRevenue: '₹12,48,500',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: Package, label: 'Total Products', value: stats?.totalProducts?.toLocaleString() ?? '—', delta: '+24', deltaType: 'up', color: 'bg-blue-900' },
    { icon: Truck, label: 'Suppliers', value: stats?.totalSuppliers?.toLocaleString() ?? '—', delta: '+3', deltaType: 'up', color: 'bg-violet-600' },
    { icon: Users, label: 'Customers', value: stats?.totalCustomers?.toLocaleString() ?? '—', delta: '+182', deltaType: 'up', color: 'bg-emerald-600' },
    { icon: ShoppingCart, label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() ?? '—', delta: '+340', deltaType: 'up', color: 'bg-orange-500' },
    { icon: Layers, label: 'Stock Units', value: stats?.availableStock?.toLocaleString() ?? '—', delta: '-120', deltaType: 'down', color: 'bg-sky-600' },
    { icon: TrendingUp, label: 'Revenue', value: stats?.totalRevenue ?? '₹12,48,500', delta: '+18.4%', deltaType: 'up', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {statCards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Monthly Sales Revenue</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Sales']} />
              <Area type="monotone" dataKey="sales" stroke="#1e3a8a" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart + Orders Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Recent Orders</h2>
          <div className="table-container">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-900 dark:text-blue-400">{order.id}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{order.customer}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{order.product}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{order.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{order.date}</td>
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

export default AdminDashboard;
