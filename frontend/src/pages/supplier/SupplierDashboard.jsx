import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Package, ClipboardList, TrendingUp, CheckCircle, Clock,
  IndianRupee, Truck, RefreshCw, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useSelector } from 'react-redux';

// ─── Status config (UPPERCASE keys to match DB) ──────────────────────────────
const STATUS_CFG = {
  PENDING:    { label: 'Pending',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  PROCESSING: { label: 'Processing', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  SHIPPED:    { label: 'Shipped',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
  DELIVERED:  { label: 'Delivered',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
  CANCELLED:  { label: 'Cancelled',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Static chart data (illustrative trend) ───────────────────────────────────
const chartData = [
  { month: 'Jan', orders: 8 }, { month: 'Feb', orders: 12 }, { month: 'Mar', orders: 7 },
  { month: 'Apr', orders: 15 }, { month: 'May', orders: 11 }, { month: 'Jun', orders: 18 },
];

const SupplierDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setStats(res.data.dashboard);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const s = stats || {};
  const orderHistory = s.orderHistory || [];

  const cards = [
    { icon: Package,      label: 'Total Bulk Orders',  value: loading ? '—' : (s.totalBulkOrders ?? 0),        color: 'bg-blue-900' },
    { icon: Clock,        label: 'Pending Orders',     value: loading ? '—' : (s.pendingOrders ?? 0),           color: 'bg-orange-500' },
    { icon: CheckCircle,  label: 'Completed Orders',   value: loading ? '—' : (s.completedOrders ?? 0),        color: 'bg-emerald-600' },
    { icon: IndianRupee,  label: 'Total Purchase Amt',  value: loading ? '—' : fmtCurrency(s.totalPurchaseAmount), color: 'bg-violet-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Welcome back, {user?.name?.split(' ')[0] || 'Supplier'}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Live overview of your supplier portal</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))
          : cards.map(c => (
              <div key={c.label} className="glass-card glass-card-hover rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{c.label}</span>
                  <div className={`p-2.5 rounded-xl ${c.color}`}><c.icon className="h-5 w-5 text-white" /></div>
                </div>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{c.value}</p>
              </div>
            ))
        }
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Monthly Order Volume</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#1e3a8a" radius={[6, 6, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Supply Orders (Live from DB) */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Recent Supply Orders</h2>
            <Link
              to="/supplier/orders"
              className="text-xs text-blue-900 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center gap-3">
              <Package className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500 font-medium">No bulk orders placed yet</p>
              <Link
                to="/supplier/products"
                className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orderHistory.map(o => {
                const cfg = STATUS_CFG[o.orderStatus] || STATUS_CFG.PENDING;
                // Get first item product name
                const firstProduct = o.items?.[0]?.product?.productName || 'Bulk Product';
                const totalQty = o.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;

                return (
                  <div key={o.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {o.orderNumber ? `#${o.orderNumber}` : `#SO-${o.id}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {firstProduct} {totalQty > 0 ? `(Qty: ${totalQty})` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {fmtCurrency(o.totalAmount)}
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <span className="text-[10px] text-slate-400">{fmtDate(o.createdAt)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
