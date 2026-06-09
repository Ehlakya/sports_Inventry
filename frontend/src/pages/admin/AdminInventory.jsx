import React, { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../../api/axios';

const ORDERED_BY_FILTERS = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Customers Only', value: 'Customer' },
  { label: 'Suppliers Only', value: 'Supplier' },
];

const AdminInventory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderedByFilter, setOrderedByFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tableScrollRef = useRef(null);

  const fetchLogs = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const res = await api.get('/inventory/transactions', {
        params: { search, orderedBy: orderedByFilter, page, limit: 10 },
      });
      setLogs(res.data.data?.rows || res.data.transactions || []);
      setTotalPages(Math.max(Math.ceil((res.data.data?.count || 0) / 10), 1));
    } catch {
      // Ignore mock generation for now to avoid overwriting polling
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => { 
    fetchLogs(); 
    const interval = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(interval);
  }, [search, orderedByFilter, page]);

  const scrollTable = (direction) => {
    tableScrollRef.current?.scrollBy({
      left: direction * 420,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Inventory Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Complete audit trail of all stock movements</p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by product"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40"
            />
          </div>
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            {ORDERED_BY_FILTERS.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => { setOrderedByFilter(filter.value); setPage(1); }}
                className={`px-3 py-2 text-xs font-bold transition-colors ${orderedByFilter === filter.value ? 'bg-blue-900 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Left edge hover zone */}
        <div className="absolute inset-y-0 left-0 z-20 w-16 group/left hidden lg:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white via-white/80 to-transparent opacity-0 transition-opacity duration-200 group-hover/left:opacity-100 dark:from-slate-900 dark:via-slate-900/80" />
          <button
            type="button"
            onClick={() => scrollTable(-1)}
            className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 flex items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 opacity-0 shadow-lg transition-opacity duration-200 group-hover/left:opacity-100 hover:bg-slate-50 focus:opacity-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300"
            title="Slide table left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Right edge hover zone */}
        <div className="absolute inset-y-0 right-0 z-20 w-16 group/right">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-full bg-gradient-to-l from-white via-white/80 to-transparent opacity-0 transition-opacity duration-200 group-hover/right:opacity-100 dark:from-slate-900 dark:via-slate-900/80" />
          <button
            type="button"
            onClick={() => scrollTable(1)}
            className="absolute right-0 top-1/2 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-l-full border border-r-0 border-blue-200 bg-blue-900 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/right:opacity-100 hover:bg-blue-800 focus:opacity-100 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            title="Slide table right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="pointer-events-none absolute right-0 top-4 rounded-l-lg bg-blue-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover/right:opacity-100 dark:bg-blue-700">
            More
          </div>
        </div>

        <div
          ref={tableScrollRef}
          className="table-container overflow-x-auto scroll-smooth"
          tabIndex={0}
          aria-label="Inventory log table, scroll horizontally for more columns"
        >
        <table className="min-w-[2000px] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {[
                'Order No.', 'Customer Name', 'Username', 'Phone Number', 
                'Product Name', 'Size', 'Qty', 'Price', 'GST', 'Total',
                'Order Date', 'Exp. Delivery', 'Order Status', 'User Type', 
                'Stock Before', 'Stock After', 'Log Description'
              ].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={17} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : logs.length === 0 ? (
              <tr><td colSpan={17} className="px-4 py-10 text-center text-slate-400">No inventory logs found.</td></tr>
            ) : logs.map(log => {
              const stockBefore = log.stockBefore ?? log.quantityBefore;
              const stockAfter = log.stockAfter ?? log.quantityAfter;
              const isInflow = Number(stockAfter || 0) >= Number(stockBefore || 0);
              
              return (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-900 dark:text-blue-400 whitespace-nowrap">{log.orderNumber || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{log.customerName || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{log.username || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{log.phoneNumber || '-'}</td>
                  
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{log.productName || '-'}</td>
                  <td className="px-4 py-3 text-center">{log.productSize || '-'}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">{log.quantity}</td>
                  
                  <td className="px-4 py-3 whitespace-nowrap">{log.customerPrice !== '-' ? `₹${parseFloat(log.customerPrice).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{log.gstAmount !== '-' ? `₹${parseFloat(log.gstAmount).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold">{log.totalAmount !== '-' ? `₹${parseFloat(log.totalAmount).toLocaleString('en-IN')}` : '-'}</td>
                  
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{log.orderDate ? new Date(log.orderDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{log.expectedDeliveryDate ? new Date(log.expectedDeliveryDate).toLocaleDateString() : '-'}</td>
                  
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${log.orderStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {log.orderStatus || '-'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${log.userType === 'Supplier' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.userType || '-'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 text-center">{stockBefore ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600 text-center">{stockAfter ?? '-'}</td>
                  
                  <td className="px-4 py-3 text-slate-500 max-w-[300px] truncate" title={log.notes}>{log.notes || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
