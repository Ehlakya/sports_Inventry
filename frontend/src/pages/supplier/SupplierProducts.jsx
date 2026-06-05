import React, { useEffect, useState } from 'react';
import { Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
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
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Product Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">Browse all available products for bulk ordering</p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-900/10 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-900 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">{p.productName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.Category?.categoryName}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-extrabold text-blue-900 dark:text-blue-400">₹{Number(p.price).toLocaleString()}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock > 50 ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default SupplierProducts;
