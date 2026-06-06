import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, Package,
  ChevronRight, IndianRupee, Truck, RefreshCw, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

// ─── Status config (UPPERCASE keys to match DB) ──────────────────────────────
const STATUS_CFG = {
  PENDING:    { label: 'Pending',    Icon: Clock,       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  PROCESSING: { label: 'Processing', Icon: Clock,       cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  SHIPPED:    { label: 'Shipped',    Icon: Truck,       cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
  DELIVERED:  { label: 'Delivered',  Icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
  CANCELLED:  { label: 'Cancelled',  Icon: XCircle,     cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CustomerDashboard = () => {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    api.get('/dashboard')
      .then(r => {
        setStats(r.data.dashboard);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center animate-fade-in">
      <ShoppingBag className="h-16 w-16 text-slate-300" />
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Sign in to view your orders</h2>
      <Link to="/login" className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors">Login</Link>
    </div>
  );

  const s = stats || {};
  const recentOrders = s.recentOrders || [];

  const summaryCards = [
    { label: 'Total Orders',   value: loading ? '—' : s.totalOrders ?? 0,                    icon: ShoppingBag,  color: 'text-blue-900 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Spent',    value: loading ? '—' : fmtCurrency(s.totalAmountSpent),        icon: IndianRupee,  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'In Progress',    value: loading ? '—' : s.pendingOrders ?? 0,                   icon: Clock,        color: 'text-orange-500',                      bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Delivered',      value: loading ? '—' : s.deliveredOrders ?? 0,                 icon: CheckCircle,  color: 'text-emerald-600',                     bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card rounded-2xl p-8 flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-900 to-orange-500 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
          {user?.name?.[0] || 'C'}
        </div>
        <div className="flex-1">
          <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Hello, {user?.name?.split(' ')[0]}! 👋</p>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
        </div>
        <Link
          to="/orders"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm"
        >
          <ClipboardList className="h-4 w-4" /> View All Orders
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.bg} flex-shrink-0`}>
              <c.icon className={`h-6 w-6 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{c.value}</p>
              <p className="text-xs text-slate-400 font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders (Live from DB) */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Recent Orders</h2>
          <div className="flex items-center gap-3">
            <Link to="/orders" className="text-sm text-blue-900 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-4">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <p className="text-slate-500 font-medium">No orders yet</p>
            <Link to="/products" className="px-4 py-2 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(o => {
              const cfg = STATUS_CFG[o.orderStatus] || STATUS_CFG.PENDING;
              const StatusIcon = cfg.Icon;
              // Get first product name from nested items
              const firstProduct = o.items?.[0]?.product?.productName || 'Sports Product';
              const itemCount = o.items?.length || 0;

              return (
                <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Product image or icon */}
                    {o.items?.[0]?.product?.imageUrl ? (
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex-shrink-0 border border-slate-100 dark:border-slate-800">
                        <img
                          src={o.items[0].product.imageUrl}
                          alt={firstProduct}
                          className="h-full w-full object-cover"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-blue-900 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {o.orderNumber ? `#${o.orderNumber}` : `Order #${o.id}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                        {firstProduct}
                        {itemCount > 1 ? ` +${itemCount - 1} more` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {fmtCurrency(o.totalAmount)}
                      </p>
                      <p className="text-xs text-slate-400">{fmtDate(o.createdAt)}</p>
                    </div>
                    <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile: View All Orders link */}
      <div className="sm:hidden">
        <Link
          to="/orders"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold transition-colors"
        >
          <ClipboardList className="h-4 w-4" /> View All Orders
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;
