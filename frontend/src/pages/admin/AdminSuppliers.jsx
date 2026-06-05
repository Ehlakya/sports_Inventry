import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../api/axios';

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { role: 'SUPPLIER', search, page, limit: 10 } });
      setSuppliers(res.data.data?.rows || res.data.data || []);
      setTotalPages(Math.ceil((res.data.data?.count || 10) / 10));
    } catch {
      setSuppliers([
        { id: 1, name: 'SportZone Distributors', email: 'info@sportzone.com', phone: '9876543210', address: 'Mumbai, MH', createdAt: '2026-01-15' },
        { id: 2, name: 'Nike India Supply', email: 'supply@nike.in', phone: '9988776655', address: 'Delhi, DL', createdAt: '2026-02-01' },
        { id: 3, name: 'Adidas Wholesale Hub', email: 'wholesale@adidas.in', phone: '9123456789', address: 'Bangalore, KA', createdAt: '2026-02-10' },
        { id: 4, name: 'FitGear Pvt Ltd', email: 'orders@fitgear.com', phone: '9000011122', address: 'Chennai, TN', createdAt: '2026-03-01' },
        { id: 5, name: 'ProSports Imports', email: 'import@prosports.com', phone: '8877665544', address: 'Hyderabad, TS', createdAt: '2026-03-15' },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, [search, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Suppliers</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your supplier network and contact info</p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search suppliers…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40" />
        </div>
      </div>

      <div className="table-container">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Supplier', 'Email', 'Phone', 'Address', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : suppliers.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold">{s.name?.[0]}</div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{s.email}</td>
                <td className="px-4 py-3 text-slate-500">{s.phone || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{s.address || '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.createdAt?.slice(0,10)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(s)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400"><Eye className="h-4 w-4" /></button>
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
          <div className="glass-panel rounded-2xl w-full max-w-sm shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-blue-900 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">{selected.name?.[0]}</div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selected.name}</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[{ icon: Mail, label: selected.email }, { icon: Phone, label: selected.phone || 'N/A' }, { icon: MapPin, label: selected.address || 'N/A' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Icon className="h-4 w-4" /></div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;
