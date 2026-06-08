import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  IndianRupee,
  CalendarDays,
  Tag,
  Layers,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Download
} from 'lucide-react';
import api from '../../api/axios';
import { downloadFile } from '../../utils/downloadFile';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-400',
    Icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    classes: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
    Icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    classes: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    dot: 'bg-orange-500',
    Icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    dot: 'bg-red-500',
    Icon: XCircle,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fmt = (num) =>
  Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
    <div className="bg-slate-100 dark:bg-slate-800 h-16" />
    <div className="p-5 space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="flex gap-4">
          <div className="h-20 w-20 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Order Item Row ───────────────────────────────────────────────────────────
const OrderItemRow = ({ item }) => {
  const product = item.product || {};
  const unitPrice = parseFloat(item.price || 0);
  const qty = item.quantity || 1;
  const gstRate = 0.18;
  const gstAmt = unitPrice * qty * gstRate;
  const finalPrice = unitPrice * qty + gstAmt;
  const hasSize = item.size && item.size !== 'N/A';
  const categoryName = product.category?.categoryName || '';

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50/70 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
      
      {/* Product Image */}
      <div className="h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80'}
          alt={product.productName}
          className="h-full w-full object-cover"
          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80'; }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2">
          {product.productName || 'Unknown Product'}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {product.brand && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Tag className="h-2.5 w-2.5" /> {product.brand}
            </span>
          )}
          {categoryName && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
              <Layers className="h-2.5 w-2.5" /> {categoryName}
            </span>
          )}
          {hasSize && (
            <span className="inline-flex items-center text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-md border border-orange-100 dark:border-orange-900">
              Size: {item.size}
            </span>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 sm:gap-y-0 text-right sm:items-center w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-800 sm:border-t-0">
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qty</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{qty}</span>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unit Price</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">₹{fmt(unitPrice)}</span>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GST (18%)</span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">₹{fmt(gstAmt)}</span>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">₹{fmt(finalPrice)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    await downloadFile(`/orders/${order.id}/invoice`, `Invoice_${order.orderNumber || order.id}.pdf`);
    setDownloading(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      
      {/* Card Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/80 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 cursor-pointer select-none"
        onClick={() => setExpanded(p => !p)}
      >
        {/* Order number & date */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Order Number</span>
            <span className="text-sm font-extrabold text-blue-900 dark:text-blue-400 font-mono tracking-tight">
              #{order.orderNumber || order.id}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Order Date</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CalendarDays className="h-3 w-3 text-slate-400" />
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {(order.items?.length || 0)} Item{(order.items?.length || 0) !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {order.items?.map(i => i.product?.productName).filter(Boolean).join(', ').slice(0, 40) || '—'}
              {(order.items?.map(i => i.product?.productName).filter(Boolean).join(', ') || '').length > 40 ? '…' : ''}
            </span>
          </div>
        </div>

        {/* Right: status + total */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Order Total</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{fmt(order.totalAmount)}
            </span>
          </div>
          <StatusBadge status={order.orderStatus} />
          <ChevronRight
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>

      {/* Expandable Body */}
      {expanded && (
        <>
          {/* Items */}
          <div className="p-5 space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map(item => <OrderItemRow key={item.id} item={item} />)
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No items found.</p>
            )}
          </div>

          {/* Footer: Delivery + Amount Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            {/* Expected Delivery */}
            {order.estimatedDeliveryDate && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expected Delivery Date</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {formatDate(order.estimatedDeliveryDate)}
                  </p>
                </div>
              </div>
            )}

            {/* Amount breakdown summary */}
            <div className="flex items-center gap-6 text-xs flex-wrap justify-end">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <Download className="h-4 w-4" />
                {downloading ? 'Downloading...' : 'Download Invoice'}
              </button>
              <div className="text-right">
                <p className="text-slate-400 font-semibold">Subtotal</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">₹{fmt(order.subtotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold">GST (18%)</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">₹{fmt(order.gstAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold">Total Paid</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">₹{fmt(order.totalAmount)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/orders')
      .then(r => {
        // Filter to only CUSTOMER_ORDER type, sorted newest first (already DESC from backend)
        const customerOrders = (r.data.orders || []).filter(o => o.orderType === 'CUSTOMER_ORDER');
        setOrders(customerOrders);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Stats ──
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.orderStatus)).length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track all your purchases and delivery status
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" /> Shop More
          </Link>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Total Orders"
            value={loading ? '—' : totalOrders}
            color="text-blue-700 dark:text-blue-400"
            bgColor="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Spent"
            value={loading ? '—' : `₹${totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            color="text-violet-700 dark:text-violet-400"
            bgColor="bg-violet-100 dark:bg-violet-900/30"
          />
          <StatCard
            icon={TrendingUp}
            label="Pending / Active"
            value={loading ? '—' : pendingOrders}
            color="text-amber-700 dark:text-amber-400"
            bgColor="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            icon={CheckCircle}
            label="Delivered"
            value={loading ? '—' : deliveredOrders}
            color="text-emerald-700 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          />
        </div>

        {/* ── Orders List ── */}
        <div className="space-y-5">
          
          {/* Section label */}
          {!loading && orders.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Order History ({totalOrders})
              </h2>
              <span className="text-xs text-slate-400">Sorted by latest first</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-5">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center py-16 text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">{error}</h3>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center gap-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No orders yet</h3>
                <p className="text-sm text-slate-400 mt-1">Once you place an order, it will appear here.</p>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold transition-colors"
              >
                <ShoppingBag className="h-4 w-4" /> Start Shopping
              </Link>
            </div>
          )}

          {/* Orders */}
          {!loading && !error && orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default CustomerOrders;
