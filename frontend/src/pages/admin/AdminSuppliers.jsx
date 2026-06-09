import React, { useEffect, useState } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X,
  User, Mail, Phone, MapPin, Lock, Loader2
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', address: '' };

const AdminSuppliers = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/suppliers', { params: { search, page, limit: 10 } });
      const data = res.data.data;
      setSuppliers(data?.rows || []);
      setTotalCount(data?.count || 0);
      setTotalPages(Math.max(1, Math.ceil((data?.count || 0) / 10)));
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch suppliers.', 'error');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, [search, page]);

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (s) => {
    setSelected(s);
    setForm({ name: s.name || '', email: s.email || '', password: '', phone: s.phone || '', address: s.address || '' });
    setModal('edit');
  };
  const openDelete = (s) => { setSelected(s); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm(EMPTY_FORM); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      showToast('Name, email, and password are required.', 'error'); return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      showToast('Phone number must be exactly 10 digits.', 'error'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/users/suppliers', form);
      showToast('Supplier created successfully!', 'success');
      closeModal();
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create supplier.', 'error');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, address: form.address };
      if (form.password.trim()) payload.password = form.password;
      await api.put(`/users/suppliers/${selected.id}`, payload);
      showToast('Supplier updated successfully!', 'success');
      closeModal();
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update supplier.', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/users/suppliers/${selected.id}`);
      showToast('Supplier deleted.', 'success');
      closeModal();
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete supplier.', 'error');
    } finally { setSubmitting(false); }
  };

  const fieldConfig = [
    { icon: User, label: 'Full Name', key: 'name', type: 'text', required: true, placeholder: 'Supplier company name' },
    { icon: Mail, label: 'Email Address', key: 'email', type: 'email', required: true, placeholder: 'supplier@company.com' },
    { icon: Lock, label: modal === 'edit' ? 'New Password (leave blank to keep)' : 'Password', key: 'password', type: 'password', required: modal === 'add', placeholder: modal === 'edit' ? 'Leave blank to keep current' : 'Min 6 characters' },
    { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel', required: false, placeholder: '10-digit mobile number' },
    { icon: MapPin, label: 'Address', key: 'address', type: 'text', required: false, placeholder: 'City, State' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">
            {totalCount} supplier{totalCount !== 1 ? 's' : ''} in the network
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-md"
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Supplier', 'Email', 'Phone', 'Address'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                Joined & Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4">
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td></tr>
                ))
              : suppliers.length === 0
              ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No suppliers found.</td></tr>
              : suppliers.map(s => (
                  <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{s.address || '—'}</td>
                    <td className="px-4 py-3 sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors z-10 shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[-8px_0_10px_-4px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-xs whitespace-nowrap">{s.createdAt?.slice(0, 10)}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(s)}
                            title="Edit supplier"
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelete(s)}
                            title="Delete supplier"
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {modal === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={modal === 'add' ? handleAdd : handleEdit} className="p-6 space-y-4">
              {fieldConfig.map(({ icon: Icon, label, key, type, required, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={type}
                      required={required}
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      onInput={key === 'phone' ? (e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); }) : undefined}
                      maxLength={key === 'phone' ? 10 : undefined}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (modal === 'add' ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />)}
                  {submitting ? 'Saving…' : modal === 'add' ? 'Create Supplier' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Supplier?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">{selected.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {submitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuppliers;
