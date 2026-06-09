import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || res.data.data || []);
    } catch {
      setCategories([
        { id: 1, categoryName: 'Footwear', createdAt: '2026-01-01' },
        { id: 2, categoryName: 'Apparel', createdAt: '2026-01-01' },
        { id: 3, categoryName: 'Equipment', createdAt: '2026-01-01' },
        { id: 4, categoryName: 'Accessories', createdAt: '2026-01-02' },
        { id: 5, categoryName: 'Nutrition', createdAt: '2026-01-02' },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); setName(''); setShowModal(true); };
  const openEdit = (c) => { setEditItem(c); setName(c.categoryName); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) {
        await api.put(`/categories/${editItem.id}`, { categoryName: name });
        showToast('Category updated successfully!', 'success');
      } else {
        await api.post('/categories', { categoryName: name });
        showToast('Category created successfully!', 'success');
      }
      setShowModal(false); fetch();
    } catch (err) { 
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to save category', 'error');
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { 
      await api.delete(`/categories/${id}`); 
      showToast('Category deleted successfully!', 'success');
      fetch(); 
    }
    catch (err) { 
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to delete category', 'error');
    }
    finally { setDeleteId(null); }
  };

  const bgColors = ['bg-blue-100 text-blue-800','bg-orange-100 text-orange-800','bg-emerald-100 text-emerald-800','bg-violet-100 text-violet-800','bg-rose-100 text-rose-800'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Organize products into categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={cat.id} className="glass-card glass-card-hover rounded-2xl p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColors[i % bgColors.length]}`}>
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{cat.categoryName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {cat.id}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{editItem ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Footwear" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-600" /></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-500 mb-6">Products linked to this category may be affected.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
