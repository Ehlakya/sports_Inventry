import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ShoppingBag, Clock, CheckCircle, XCircle, Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const statusColor = {
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcon = {
  Delivered: CheckCircle,
  Processing: Clock,
  Shipped: Package,
  Pending: Clock,
  Cancelled: XCircle,
};

const CustomerDashboard = () => {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/orders/my').then(r => setOrders(r.data.data?.rows || r.data.data || [])).catch(() => {
      setOrders([
        { id: 8821, totalAmount: 4299, status: 'Delivered', createdAt: '2026-06-04', OrderItems: [{ Product: { productName: 'Nike Air Zoom Pegasus' } }] },
        { id: 8818, totalAmount: 1850, status: 'Shipped', createdAt: '2026-06-03', OrderItems: [{ Product: { productName: 'Yonex Badminton Racket' } }] },
        { id: 8815, totalAmount: 899, status: 'Processing', createdAt: '2026-06-01', OrderItems: [{ Product: { productName: 'Puma Sports Shorts' } }] },
      ]);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center animate-fade-in">
      <ShoppingBag className="h-16 w-16 text-slate-300" />
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Sign in to view your orders</h2>
      <Link to="/login" className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition-colors">Login</Link>
    </div>
  );

  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const pending = orders.filter(o => ['Processing', 'Pending', 'Shipped'].includes(o.status)).length;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card rounded-2xl p-8 flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-900 to-orange-500 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
          {user?.name?.[0] || 'C'}
        </div>
        <div>
          <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Hello, {user?.name?.split(' ')[0]}! 👋</p>
          <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-900 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'In Progress', value: pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Delivered', value: delivered, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(c => (
          <div key={c.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.bg}`}>
              <c.icon className={`h-6 w-6 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{c.value}</p>
              <p className="text-xs text-slate-400 font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">My Orders</h2>
          <Link to="/products" className="text-sm text-blue-900 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline">
            Shop More <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-4">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <p className="text-slate-500 font-medium">No orders yet</p>
            <Link to="/products" className="px-4 py-2 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => {
              const Icon = statusIcon[o.status] || Clock;
              return (
                <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-900 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Order #{o.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                        {o.OrderItems?.[0]?.Product?.productName || 'Sports Product'}
                        {o.OrderItems?.length > 1 ? ` +${o.OrderItems.length - 1} more` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">₹{Number(o.totalAmount).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{o.createdAt?.slice(0, 10)}</p>
                    </div>
                    <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[o.status] || statusColor.Pending}`}>
                      <Icon className="h-3 w-3" />
                      {o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
