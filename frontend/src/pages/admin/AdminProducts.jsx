import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../../api/axios';

const BRANDS = ['Nike', 'Adidas', 'Puma', 'Decathlon', 'Yonex', 'Under Armour', 'Reebok'];

const emptyForm = {
  productName: '', categoryId: '', brand: '', description: '',
  price: '', discountPrice: '', stock: '', sku: '', imageUrl: ''
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search, page, limit: 10 } });
      setProducts(res.data.data?.rows || res.data.data || []);
      setTotalPages(Math.ceil((res.data.data?.count || 10) / 10));
    } catch {
      setProducts([
        { id: 1, productName: 'Nike Air Zoom Pegasus', brand: 'Nike', price: 8999, stock: 120, sku: 'NK-AZP-001', Category: { categoryName: 'Footwear' } },
        { id: 2, productName: 'Adidas Ultraboost 22', brand: 'Adidas', price: 12999, stock: 85, sku: 'AD-UB22-002', Category: { categoryName: 'Footwear' } },
        { id: 3, productName: 'Puma Sports T-Shirt', brand: 'Puma', price: 1499, stock: 300, sku: 'PM-ST-003', Category: { categoryName: 'Apparel' } },
        { id: 4, productName: 'Yonex Badminton Racket', brand: 'Yonex', price: 2850, stock: 60, sku: 'YX-BR-004', Category: { categoryName: 'Equipment' } },
        { id: 5, productName: 'Decathlon Pull-Up Bar', brand: 'Decathlon', price: 1199, stock: 45, sku: 'DC-PUB-005', Category: { categoryName: 'Equipment' } },
      ]);
    } finally { setLoading(false); }
  }, [search, page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch { setCategories([{ id: 1, categoryName: 'Footwear' }, { id: 2, categoryName: 'Apparel' }, { id: 3, categoryName: 'Equipment' }]); }
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({ productName: p.productName, categoryId: p.categoryId || '', brand: p.brand, description: p.description || '', price: p.price, discountPrice: p.discountPrice || '', stock: p.stock, sku: p.sku, imageUrl: p.imageUrl || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) await api.put(`/products/${editItem.id}`, form);
      else await api.post('/products', form);
      setShowModal(false);
      fetchProducts();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/products/${id}`); fetchProducts(); }
    catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your entire sports product catalog</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4 flex gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products by name, SKU or brand…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Product', 'Category', 'Brand', 'Price', 'Stock', 'SKU', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" /></td></tr>
            )) : products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{p.productName}</td>
                <td className="px-4 py-3 text-slate-500">{p.Category?.categoryName || '—'}</td>
                <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-semibold">{p.brand}</span></td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">₹{Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${p.stock < 20 ? 'text-red-500' : p.stock < 50 ? 'text-orange-500' : 'text-emerald-600'}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 transition-colors"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{editItem ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Product Name', key: 'productName', required: true, full: true },
                  { label: 'Price (₹)', key: 'price', type: 'number', required: true },
                  { label: 'Discount Price (₹)', key: 'discountPrice', type: 'number' },
                  { label: 'Stock', key: 'stock', type: 'number', required: true },
                  { label: 'SKU', key: 'sku', required: true },
                  { label: 'Image URL', key: 'imageUrl' },
                ].map(f => (
                  <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{f.label}{f.required && ' *'}</label>
                    <input
                      type={f.type || 'text'}
                      required={f.required}
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Brand *</label>
                  <select required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/40">
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category *</label>
                  <select required value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/40">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/40 resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-60">
                  {saving ? 'Saving…' : editItem ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
