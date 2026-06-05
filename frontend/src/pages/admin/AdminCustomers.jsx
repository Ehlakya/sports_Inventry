import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { role: 'CUSTOMER', search, page, limit: 10 } });
      setCustomers(res.data.data?.rows || res.data.data || []);
      setTotalPages(Math.ceil((res.data.data?.count || 10) / 10));
    } catch {
      setCustomers([
        { id: 1, name: 'Ravi Sharma', email: 'ravi@example.com', phone: '9876543210', address: 'Mumbai', createdAt: '2026-03-01', ordersCount: 12 },
        { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '9988776655', address: 'Ahmedabad', createdAt: '2026-03-10', ordersCount: 8 },
        { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '9123456789', address: 'Delhi', createdAt: '2026-04-01', ordersCount: 21 },
        { id: 4, name: 'Sneha Iyer', email: 'sneha@example.com', phone: '9000011122', address: 'Chennai', createdAt: '2026-04-15', ordersCount: 5 },
        { id: 5, name: 'Karan Singh', email: 'karan@example.com', phone: '8877665544', address: 'Bangalore', createdAt: '2026-05-01', ordersCount: 17 },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [search, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Customers</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage your customer base</p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers by name or email…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40" />
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Customer', 'Email', 'Phone', 'Address', 'Orders', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">{c.name?.[0]}</div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.email}</td>
                <td className="px-4 py-3 text-slate-500">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{c.address || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-orange-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{c.ordersCount ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.createdAt?.slice(0,10)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400"><Eye className="h-4 w-4" /></button>
                </td>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">{selected.name?.[0]}</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selected.name}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">{selected.email}</p>
            <div className="space-y-2 text-sm text-left bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium">{selected.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="font-medium">{selected.address || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Orders</span><span className="font-semibold text-orange-500">{selected.ordersCount ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Joined</span><span className="font-medium">{selected.createdAt?.slice(0,10)}</span></div>
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
