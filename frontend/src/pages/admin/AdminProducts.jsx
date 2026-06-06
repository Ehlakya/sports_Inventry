import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  X, Loader2, Package, Image as ImageIcon, PlusCircle, MinusCircle
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

const BRANDS = ['Nike', 'Adidas', 'Puma', 'Kookaburra', 'Wilson', 'Decathlon', 'Yonex', 'Under Armour', 'Reebok'];

const EMPTY_FORM = {
  productName: '',
  categoryId: '',
  brand: '',
  description: '',
  customerPrice: '',
  supplierPrice: '',
  imageUrl: '',
  sizes: [{ size: '', stock: 0 }],
};

const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);

  const LIMIT = 10;

  // ── Fetch Products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search } });
      const all = res.data.products || [];
      setTotalPages(Math.max(1, Math.ceil(all.length / LIMIT)));
      const start = (page - 1) * LIMIT;
      setProducts(all.slice(start, start + LIMIT));
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // ── Fetch Categories ───────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, []);

  // ── Modal Helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setImgPreviewError(false);
    setModal('add');
  };

  const openEdit = (p) => {
    setSelected(p);
    setForm({
      productName: p.productName || '',
      categoryId: p.categoryId ? String(p.categoryId) : '',
      brand: p.brand || '',
      description: p.description || '',
      customerPrice: p.customerPrice || '',
      supplierPrice: p.supplierPrice || '',
      imageUrl: p.imageUrl || '',
      sizes: p.sizes?.length ? p.sizes.map(s => ({ size: s.size, stock: s.stock })) : [{ size: '', stock: 0 }],
    });
    setImgPreviewError(false);
    setModal('edit');
  };

  const openDelete = (p) => { setSelected(p); setModal('delete'); };

  const closeModal = () => { setModal(null); setSelected(null); setForm(EMPTY_FORM); };

  // ── Size row helpers ───────────────────────────────────────────────────────
  // ── Size row helpers ───────────────────────────────────────────────────────
  const addSizeRow = () => setForm(f => ({ ...f, sizes: [...f.sizes, { size: '', stock: 0 }] }));
  const removeSizeRow = (i) => setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const updateSize = (i, field, value) => setForm(f => ({
    ...f,
    sizes: f.sizes.map((s, idx) => idx === i ? { ...s, [field]: field === 'stock' ? Number(value) : value } : s)
  }));

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    const catName = categories.find(c => c.id === Number(newCatId))?.categoryName;
    let newSizes = form.sizes;

    if (catName === 'Apparel') {
      newSizes = ['S', 'M', 'L', 'XL', 'XXL'].map(s => ({ size: s, stock: 0 }));
    } else if (catName === 'Footwear') {
      newSizes = ['5', '6', '7', '8', '9', '10'].map(s => ({ size: s, stock: 0 }));
    } else if (catName === 'Equipment') {
      newSizes = [];
    }

    setForm(f => ({ ...f, categoryId: newCatId, sizes: newSizes }));
  };

  // ── Submit Handlers ────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.productName.trim()) return showToast('Product name is required.', 'error');
    if (!form.categoryId) return showToast('Please select a category.', 'error');
    if (!form.brand) return showToast('Please select a brand.', 'error');
    if (!form.customerPrice || Number(form.customerPrice) <= 0) return showToast('Valid customer price is required.', 'error');
    if (!form.supplierPrice || Number(form.supplierPrice) <= 0) return showToast('Valid supplier price is required.', 'error');

    const validSizes = form.sizes.filter(s => s.size.trim());

    const payload = {
      productName: form.productName.trim(),
      categoryId: Number(form.categoryId),
      brand: form.brand,
      description: form.description.trim(),
      customerPrice: Number(form.customerPrice),
      supplierPrice: Number(form.supplierPrice),
      imageUrl: form.imageUrl.trim() || null,
      ...(modal === 'add' && validSizes.length > 0 ? { sizes: validSizes } : {}),
    };

    setSubmitting(true);
    try {
      if (modal === 'edit') {
        await api.put(`/products/${selected.id}`, payload);
        // Update sizes separately if provided
        if (validSizes.length > 0) {
          await api.put(`/products/${selected.id}/sizes`, { sizes: validSizes });
        }
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created successfully!', 'success');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      const detail = err.response?.data?.details?.map(d => d.message).join(', ')
        || err.response?.data?.error
        || 'Failed to save product.';
      showToast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/products/${selected.id}`);
      showToast('Product deleted.', 'success');
      closeModal();
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Input class ────────────────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/40';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your entire sports product catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or brand…"
            className={inputCls + ' pl-10'}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {['Product', 'Category', 'Brand', 'Customer Price', 'Stock', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4">
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </td></tr>
                ))
              : products.length === 0
              ? (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No products found</p>
                    <p className="text-xs mt-1">Click "Add Product" to create one.</p>
                  </td></tr>
                )
              : products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.productName} className="h-full w-full object-cover" />
                            : <Package className="h-5 w-5 m-2.5 text-slate-400" />
                          }
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">{p.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category?.categoryName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-semibold">{p.brand}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      ₹{Number(p.customerPrice).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.availableQuantity < 10 ? 'text-red-500' : p.availableQuantity < 30 ? 'text-orange-500' : 'text-emerald-600'}`}>
                        {p.availableQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => openDelete(p)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
            }
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

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {modal === 'add' ? '➕ Add New Product' : '✏️ Edit Product'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modal === 'add' ? 'Fill in the details to add a new product to the catalog.' : 'Update the product information below.'}
                </p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  value={form.productName}
                  onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                  placeholder="e.g. Air Zoom Running Shoes"
                  className={inputCls}
                />
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category <span className="text-red-500">*</span></label>
                  <select required value={form.categoryId} onChange={handleCategoryChange} className={inputCls}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Brand <span className="text-red-500">*</span></label>
                  <select required value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputCls}>
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Customer Price + Supplier Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Price (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="1" step="0.01" required
                    value={form.customerPrice}
                    onChange={e => setForm(f => ({ ...f, customerPrice: e.target.value }))}
                    placeholder="e.g. 8500"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Supplier Price (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number" min="1" step="0.01" required
                    value={form.supplierPrice}
                    onChange={e => setForm(f => ({ ...f, supplierPrice: e.target.value }))}
                    placeholder="e.g. 5500"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the product features, materials, and benefits…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Image URL</label>
                <div className="flex gap-3">
                  <input
                    type="url" value={form.imageUrl}
                    onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setImgPreviewError(false); }}
                    placeholder="https://images.unsplash.com/photo-…"
                    className={inputCls + ' flex-1'}
                  />
                  {form.imageUrl && !imgPreviewError ? (
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      onError={() => setImgPreviewError(true)}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes & Stock */}
              {(() => {
                const catName = categories.find(c => c.id === Number(form.categoryId))?.categoryName;
                if (catName === 'Equipment') return null; // Hide sizes completely
                
                const isPredefined = catName === 'Apparel' || catName === 'Footwear';

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sizes &amp; Stock</label>
                      {!isPredefined && (
                        <button type="button" onClick={addSizeRow} className="text-xs text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                          <PlusCircle className="h-3.5 w-3.5" /> Add Size
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {form.sizes.map((row, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            type="text" value={row.size}
                            onChange={e => updateSize(i, 'size', e.target.value)}
                            readOnly={isPredefined}
                            placeholder="e.g. UK-9, M, Standard"
                            className={inputCls + ' flex-1' + (isPredefined ? ' bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed' : '')}
                          />
                          <input
                            type="number" min="0" value={row.stock}
                            onChange={e => updateSize(i, 'stock', e.target.value)}
                            placeholder="Stock"
                            className={inputCls + ' w-24'}
                          />
                          {!isPredefined && (
                            <button
                              type="button"
                              onClick={() => removeSizeRow(i)}
                              disabled={form.sizes.length === 1}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Leave size blank to skip. For edit, sizes update separately.</p>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {submitting ? 'Saving…' : modal === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Product?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">{selected.productName}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button
                onClick={handleDelete} disabled={submitting}
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

export default AdminProducts;
