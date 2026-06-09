import React, { useEffect, useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag, IndianRupee } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-400',
    Icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
    Icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    classes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    dot: 'bg-orange-500',
    Icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    dot: 'bg-red-500',
    Icon: XCircle,
  },
};

const ORDER_TYPE_FILTERS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Customer Orders', value: 'Customer' },
  { label: 'Supplier Orders', value: 'Supplier' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  
  // Track updating state per order
  const [updatingId, setUpdatingId] = useState(null);
  
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
      // Update local state to reflect change instantly
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(err.response?.data?.error || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Filtering
  const filteredOrders = orders.filter(o => {
    const searchMatch = !search || 
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toString().includes(search) ||
      o.sourceDetails?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.sourceDetails?.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    
    const statusMatch = !statusFilter || o.orderStatus === statusFilter;
    const typeMatch = orderTypeFilter === 'ALL' || o.userType === orderTypeFilter;
    
    return searchMatch && statusMatch && typeMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Order Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and update status for all customer and supplier orders</p>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by Order No, Customer/Supplier Name…" 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40" 
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shrink-0">
            {ORDER_TYPE_FILTERS.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setOrderTypeFilter(filter.value)}
                className={`px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap ${orderTypeFilter === filter.value ? 'bg-blue-900 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40 appearance-none text-slate-700 dark:text-slate-300 min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Order Details', 'Customer / Supplier', 'Order Type', 'Date & Amount'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                Status Update
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={4} className="px-4 py-4"><div className="h-10 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-slate-300" />
                    <span>No orders found matching your criteria.</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.map(o => {
              const name = o.user?.name || o.sourceDetails?.customerName || o.sourceDetails?.supplierName || 'Unknown';
              const phone = o.user?.phone || o.sourceDetails?.phoneNumber || '—';
              const username = o.user?.username || o.sourceDetails?.username || '—';
              const itemsText = o.items?.map(i => i.product?.productName).filter(Boolean).join(', ') || 'Unknown items';
              
              const currentCfg = STATUS_CONFIG[o.orderStatus] || STATUS_CONFIG.PENDING;
              const Icon = currentCfg.Icon;

              return (
                <tr key={o.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  
                  {/* Order Details */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1 max-w-[250px]">
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        #{o.orderNumber || o.id}
                      </span>
                      <span className="text-xs text-slate-500 truncate" title={itemsText}>
                        {o.items?.length || 0} Item(s): {itemsText}
                      </span>
                    </div>
                  </td>

                  {/* Customer / Supplier */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {name}
                      </span>
                      {username !== '—' && (
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">@{username}</span>
                      )}
                      <span className="text-xs text-slate-500">{phone}</span>
                    </div>
                  </td>

                  {/* Order Type */}
                  <td className="px-4 py-4 align-top">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${o.userType === 'Supplier' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {o.userType}
                    </span>
                  </td>

                  {/* Date & Amount */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                        {fmtCurrency(o.totalAmount)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {fmtDate(o.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Status Update Component */}
                  <td className="px-4 py-4 align-top min-w-[250px] sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col gap-3">
                      
                      {/* Current Status Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Current:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${currentCfg.classes}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {currentCfg.label}
                        </span>
                      </div>

                      {/* Update Action */}
                      <div className="flex items-center gap-2">
                        <select 
                          id={`status-select-${o.id}`}
                          defaultValue={o.orderStatus}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          disabled={updatingId === o.id}
                          onClick={() => {
                            const val = document.getElementById(`status-select-${o.id}`).value;
                            if(val !== o.orderStatus) {
                              handleUpdateStatus(o.id, val);
                            } else {
                              showToast('Order is already in this status', 'info');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {updatingId === o.id ? 'Updating...' : 'Update'}
                        </button>
                      </div>

                      {/* Status Timeline Visualization */}
                      <div className="flex items-center gap-1 mt-2">
                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, idx, arr) => {
                          const isCurrent = o.orderStatus === step;
                          const stepIdx = arr.indexOf(o.orderStatus);
                          const isPast = stepIdx !== -1 && idx <= stepIdx;
                          const isCancelled = o.orderStatus === 'CANCELLED';
                          
                          let bg = 'bg-slate-200 dark:bg-slate-800';
                          if (isCancelled) bg = 'bg-red-200 dark:bg-red-900/40';
                          else if (isCurrent) bg = 'bg-blue-500';
                          else if (isPast) bg = 'bg-emerald-400';

                          return (
                            <React.Fragment key={step}>
                              <div 
                                className={`h-2 flex-1 rounded-full ${bg} transition-colors duration-500`} 
                                title={STATUS_CONFIG[step].label}
                              />
                              {idx < arr.length - 1 && <div className="w-1" />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
