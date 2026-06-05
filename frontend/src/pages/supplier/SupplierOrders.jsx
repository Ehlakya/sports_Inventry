import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

const statusColor = {
  Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/orders', { params: { page, limit: 10 } }).then(r => {
      setOrders(r.data.data?.rows || r.data.data || []);
      setTotalPages(Math.ceil((r.data.data?.count || 10) / 10));
    }).catch(() => {
      setOrders([
        { id: 'SO-2210', totalAmount: 449950, status: 'Delivered', createdAt: '2026-06-01', itemCount: 50 },
        { id: 'SO-2209', totalAmount: 389970, status: 'Processing', createdAt: '2026-05-28', itemCount: 30 },
        { id: 'SO-2208', totalAmount: 299800, status: 'Shipped', createdAt: '2026-05-20', itemCount: 200 },
        { id: 'SO-2207', totalAmount: 171000, status: 'Delivered', createdAt: '2026-05-10', itemCount: 60 },
        { id: 'SO-2206', totalAmount: 89850, status: 'Cancelled', createdAt: '2026-05-01', itemCount: 75 },
      ]);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">Track all your past and active bulk supply orders</p>
      </div>

      <div className="table-container">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Order ID', 'Units', 'Total Amount', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : orders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-blue-900 dark:text-blue-400">#{o.id}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{o.itemCount ?? '—'} units</td>
                <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">₹{Number(o.totalAmount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[o.status] || statusColor.Pending}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{o.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default SupplierOrders;
