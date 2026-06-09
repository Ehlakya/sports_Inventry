import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, ShoppingBag, Calendar, Activity, X } from 'lucide-react';
import api from '../../api/axios';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal State
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (date) params.date = date;

      const res = await api.get('/users/customers', { params });
      setCustomers(res.data.data?.rows || []);
      setTotalPages(Math.ceil((res.data.data?.count || 10) / 10));
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchCustomers(); 
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status, date, page]);

  const handleViewDetails = async (id) => {
    setDetailsLoading(true);
    // Open modal with skeleton first
    setSelected({ id, loading: true });
    try {
      const res = await api.get(`/users/customers/${id}`);
      setSelected(res.data.data);
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
      setSelected(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Customers</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your customer base</p>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Search by name or username…" 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40" 
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40 appearance-none text-slate-700 dark:text-slate-300 min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40 text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Customer', 'Username / Email', 'Phone', 'Address', 'Status', 'Orders'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                Joined & Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No customers found matching your criteria.
                </td>
              </tr>
            ) : customers.map(c => (
              <tr key={c.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap block">{c.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">ID: {c.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 dark:text-slate-300">@{c.username || 'unknown'}</span>
                    <span className="text-xs text-slate-500">{c.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{c.address || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{c.ordersCount || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-3 sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-xs whitespace-nowrap">{fmtDate(c.createdAt)}</span>
                    <button onClick={() => handleViewDetails(c.id)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 transition-colors shrink-0" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Page {page} of {totalPages || 1}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in bg-white dark:bg-slate-900">
            
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <X className="h-5 w-5" />
            </button>

            {selected.loading ? (
              <div className="p-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto" />
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 animate-pulse mx-auto rounded" />
                <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
              </div>
            ) : (
              <div className="p-6 md:p-8">
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6 text-center md:text-left">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-extrabold flex-shrink-0 shadow-lg shadow-orange-500/20">
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selected.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selected.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {selected.isActive ? 'Active Account' : 'Inactive Account'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">@{selected.username || 'unknown'}</p>
                    <p className="text-slate-500 text-sm">{selected.email}</p>
                    <p className="text-slate-400 text-xs mt-2">Customer ID: {selected.id} · Joined: {fmtDate(selected.createdAt)}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Orders</p>
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{selected.totalOrders || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Spent</p>
                    <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{fmtCurrency(selected.totalAmountSpent)}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-sm text-left bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50 mb-6">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Contact Information</h3>
                  <div className="flex justify-between items-start"><span className="text-slate-500 w-1/3">Phone</span><span className="font-medium text-slate-800 dark:text-slate-200 flex-1 text-right">{selected.phone || 'Not provided'}</span></div>
                  <div className="flex justify-between items-start"><span className="text-slate-500 w-1/3">Address</span><span className="font-medium text-slate-800 dark:text-slate-200 flex-1 text-right">{selected.address || 'Not provided'}</span></div>
                </div>

                {/* Recent Orders List */}
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between">
                    <span>Recent Orders</span>
                    <span className="text-xs font-medium text-slate-400">Latest 5</span>
                  </h3>
                  
                  {(!selected.recentOrders || selected.recentOrders.length === 0) ? (
                    <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      No orders placed yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selected.recentOrders.map(order => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/50 gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{order.orderNumber || `#${order.id}`}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                                ${order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  order.orderStatus === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}
                              `}>
                                {order.orderStatus}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {order.items?.[0]?.product?.productName || 'Product'} 
                              {order.items?.length > 1 && <span className="text-slate-400 text-xs"> +{order.items.length - 1} more</span>}
                            </p>
                          </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{fmtCurrency(order.totalAmount)}</span>
                            <span className="text-xs text-slate-400">{fmtDate(order.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
