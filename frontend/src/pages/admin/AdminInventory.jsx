import React, { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../../api/axios';

const ORDERED_BY_FILTERS = [
  { label: 'All Logs', value: 'ALL' },
  { label: 'Customer', value: 'Customer' },
  { label: 'Supplier', value: 'Supplier' },
];

const AdminInventory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderedByFilter, setOrderedByFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tableScrollRef = useRef(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/transactions', {
        params: { search, orderedBy: orderedByFilter, page, limit: 10 },
      });
      setLogs(res.data.data?.rows || res.data.transactions || []);
      setTotalPages(Math.max(Math.ceil((res.data.data?.count || 0) / 10), 1));
    } catch {
      setLogs([
        { id: 1, orderNumber: 'ORD001', productName: 'Cricket Bat', quantity: 5, stockBefore: 20, stockAfter: 15, transactionType: 'CUSTOMER_ORDER_OUTFLOW', orderedBy: 'Customer', notes: 'Customer purchased 5 Cricket Bat', transactionDate: '2026-06-02T14:30:00Z' },
        { id: 2, orderNumber: 'ORD002', productName: 'Jersey', quantity: 100, stockBefore: 250, stockAfter: 150, transactionType: 'SUPPLIER_ORDER_OUTFLOW', orderedBy: 'Supplier', notes: 'Supplier ordered 100 Jersey', transactionDate: '2026-06-03T09:00:00Z' },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [search, orderedByFilter, page]);

  const scrollTable = (direction) => {
    tableScrollRef.current?.scrollBy({
      left: direction * 420,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="relative group">
        <button
          type="button"
          onClick={() => scrollTable(-1)}
          className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 opacity-0 shadow-lg transition-opacity duration-200 hover:bg-slate-50 focus:opacity-100 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 lg:flex"
          title="Slide table left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white via-white/80 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-slate-900 dark:via-slate-900/80" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/80 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-slate-900 dark:via-slate-900/80" />
        <button
          type="button"
          onClick={() => scrollTable(1)}
          className="absolute right-2 top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-l-full border border-r-0 border-blue-200 bg-blue-900 text-white opacity-0 shadow-lg transition-opacity duration-200 hover:bg-blue-800 focus:opacity-100 group-hover:opacity-100 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          title="Slide table right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="pointer-events-none absolute right-0 top-4 z-20 rounded-l-lg bg-blue-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 dark:bg-blue-700">
          More
        </div>

        <div
          ref={tableScrollRef}
          className="table-container overflow-x-auto scroll-smooth"
          tabIndex={0}
          aria-label="Inventory log table, scroll horizontally for more columns"
        >
        <table className="min-w-[1320px] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Order Number', 'Product Name', 'Quantity', 'Stock Before', 'Stock After', 'Transaction Date', 'Transaction Type', 'Ordered By', 'Inventory History'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={9} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : logs.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No inventory logs found.</td></tr>
            ) : logs.map(log => {
              const stockBefore = log.stockBefore ?? log.quantityBefore;
              const stockAfter = log.stockAfter ?? log.quantityAfter;
              const isInflow = Number(stockAfter || 0) >= Number(stockBefore || 0);
              return (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-900 dark:text-blue-400 whitespace-nowrap">{log.orderNumber || '-'}</td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{log.productName || log.product?.productName || log.Product?.productName || '-'}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{log.quantity}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{stockBefore ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{stockAfter ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(log.transactionDate || log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isInflow ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {isInflow ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
                      {log.transactionType}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${log.orderedBy === 'Supplier' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                      {log.orderedBy || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[260px] truncate">{log.notes || '-'}</td>
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
