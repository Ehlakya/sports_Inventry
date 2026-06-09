import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Package, Users, Truck, ShoppingCart, Layers,
  TrendingUp, IndianRupee, RefreshCw, AlertTriangle,
  ShoppingBag, Store, Download
} from 'lucide-react';
import api from '../../api/axios';
import { downloadFile } from '../../utils/downloadFile';

// ─── Static chart data (illustrative trends) ─────────────────────────────────
const salesData = [
  { month: 'Jan', sales: 42000 }, { month: 'Feb', sales: 58000 },
  { month: 'Mar', sales: 51000 }, { month: 'Apr', sales: 73000 },
  { month: 'May', sales: 68000 }, { month: 'Jun', sales: 95000 },
  { month: 'Jul', sales: 88000 }, { month: 'Aug', sales: 112000 },
  { month: 'Sep', sales: 99000 }, { month: 'Oct', sales: 130000 },
  { month: 'Nov', sales: 148000 }, { month: 'Dec', sales: 172000 },
];

const STATUS_CFG = {
  PENDING:    { label: 'Pending',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  PROCESSING: { label: 'Processing', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  SHIPPED:    { label: 'Shipped',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
  DELIVERED:  { label: 'Delivered',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
  CANCELLED:  { label: 'Cancelled',  cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
};

const ORDER_FILTERS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Customer Orders', value: 'CUSTOMER_ORDER' },
  { label: 'Supplier Orders', value: 'SUPPLIER_ORDER' },
];

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{value}</div>
    {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [orderFilter, setOrderFilter] = useState('ALL');

  const fetchStats = useCallback(async (isRefresh = false) => {
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
  }, []);

  const handleDownload = async (orderId, orderNumber, isSupplier) => {
    setDownloadingId(orderId);
    const prefix = isSupplier ? 'Supplier_Invoice_' : 'Invoice_';
    await downloadFile(`/orders/${orderId}/invoice`, `${prefix}${orderNumber || orderId}.pdf`);
    setDownloadingId(null);
  };

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const s = stats || {};
  const salesSummary = s.salesSummary || {};

  const statCards = [
    { icon: Package,     label: 'Total Products',   value: loading ? '—' : fmt(s.totalProducts),  sub: 'Across all categories',      color: 'bg-blue-900' },
    { icon: Truck,       label: 'Suppliers',         value: loading ? '—' : fmt(s.totalSuppliers), sub: 'Registered suppliers',        color: 'bg-violet-600' },
    { icon: Users,       label: 'Customers',         value: loading ? '—' : fmt(s.totalCustomers), sub: 'Registered customers',        color: 'bg-emerald-600' },
    { icon: ShoppingCart,label: 'Total Orders',      value: loading ? '—' : fmt(s.totalOrders),    sub: 'All order types combined',    color: 'bg-orange-500' },
    { icon: Layers,      label: 'Stock Units',       value: loading ? '—' : fmt(s.availableStock), sub: 'Total available inventory',   color: 'bg-sky-600' },
    { icon: TrendingUp,  label: 'Total Revenue',     value: loading ? '—' : fmtCurrency(salesSummary.totalRevenue), sub: 'All confirmed orders', color: 'bg-rose-500' },
  ];

  const recentOrders = s.recentOrders || [];
  const filteredRecentOrders = orderFilter === 'ALL'
    ? recentOrders
    : recentOrders.filter(order => order.orderType === orderFilter);
  const lowStockAlerts = s.lowStockAlerts || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live statistics from the database</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading
          ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36" />)
          : statCards.map(c => <StatCard key={c.label} {...c} />)
        }
      </div>

      {/* Revenue Split */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Customer Revenue</p>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{fmtCurrency(salesSummary.customerRevenue)}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-violet-700 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Supplier Revenue</p>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{fmtCurrency(salesSummary.supplierRevenue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-6">Monthly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1e3a8a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Sales']} />
              <Area type="monotone" dataKey="sales" stroke="#1e3a8a" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Low Stock Alerts</h2>
            {lowStockAlerts.length > 0 && (
              <span className="ml-auto text-[10px] font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">{lowStockAlerts.length}</span>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : lowStockAlerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
              <Package className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-64">
              {lowStockAlerts.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.productName}</p>
                    <p className="text-[10px] text-slate-500">{item.brand} · Size {item.size}</p>
                  </div>
                  <span className={`ml-3 flex-shrink-0 text-xs font-extrabold px-2 py-0.5 rounded-lg ${item.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders (Live from DB) */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Recent Orders</h2>
            <span className="text-xs text-slate-400 font-medium">Last 10 orders · filter by source</span>
          </div>
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            {ORDER_FILTERS.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setOrderFilter(filter.value)}
                className={`px-3 py-2 text-xs font-bold transition-colors ${orderFilter === filter.value ? 'bg-blue-900 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : filteredRecentOrders.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center gap-2 text-slate-400">
            <ShoppingCart className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium">No orders placed yet</p>
          </div>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {['Order #', 'Product', 'Quantity', 'User Type', 'Order Source', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                    Date & Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecentOrders.map(order => {
                  const cfg = STATUS_CFG[order.orderStatus] || STATUS_CFG.PENDING;
                  const isSupplierOrder = order.orderType === 'SUPPLIER_ORDER';
                  const userType = order.userType || (isSupplierOrder ? 'Supplier' : 'Customer');
                  const sourceDetails = order.sourceDetails || {};
                  const name = sourceDetails.customerName || sourceDetails.supplierName || order.orderedByName || order.customerName || 'Unknown';
                  const username = sourceDetails.username || '—';
                  const phone = sourceDetails.phoneNumber || '—';
                  return (
                    <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-900 dark:text-blue-400 whitespace-nowrap">
                        {order.orderNumber || `#${order.id}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[160px] truncate">{order.productName}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{order.quantity || order.items?.[0]?.quantity || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSupplierOrder ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                          {userType}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-[180px]">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {order.orderSource || (isSupplierOrder ? 'Supplier Order' : 'Customer Order')}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{name}</span>
                          {isSupplierOrder ? (
                            <span> · ID: {sourceDetails.supplierId || '-'}</span>
                          ) : (
                            <span>
                              {username !== '—' && ` · @${username}`}
                              {phone !== '—' && ` · ${phone}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {fmtCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">{fmtDate(order.createdAt)}</span>
                          <button
                            onClick={() => handleDownload(order.id, order.orderNumber, order.orderType === 'SUPPLIER_ORDER')}
                            disabled={downloadingId === order.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50 transition-colors shrink-0"
                            title="Download Invoice"
                          >
                            <Download className="h-3.5 w-3.5" /> {downloadingId === order.id ? 'Wait...' : 'Invoice'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
