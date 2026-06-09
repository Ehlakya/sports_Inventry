import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Package, Grid, RefreshCw, ShoppingCart } from 'lucide-react';
import apiClient from '../../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { useToast } from '../../components/common/Toast';
import { CardSkeleton } from '../../components/common/Skeleton';

const SupplierProducts = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  
  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(20000);

  // Expand States for Sidebar
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Modal States
  const [modalProduct, setModalProduct] = useState(null);
  const [modalQuantities, setModalQuantities] = useState({});

  // Options lists
  const brands = ['Nike', 'Adidas', 'Puma', 'Kookaburra', 'Wilson', 'Decathlon', 'Yonex', 'Under Armour', 'Reebok'];
  
  const [sizes, setSizes] = useState([]);

  // Fetch unique sizes dynamically based on category
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) {
          queryParams.append('categoryId', selectedCategory);
        }
        const res = await apiClient.get(`/products/sizes?${queryParams.toString()}`);
        setSizes(res.data.sizes);
      } catch (err) {
        console.error('Error fetching sizes:', err);
      }
    };
    fetchSizes();
  }, [selectedCategory]);

  // Clear selected sizes filter when category changes
  useEffect(() => {
    setSelectedSizes([]);
  }, [selectedCategory]);

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('categoryId') || '');
    setSelectedBrand(searchParams.get('brand') || '');
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        setCategories(res.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory) queryParams.append('categoryId', selectedCategory);
      if (selectedBrand) queryParams.append('brand', selectedBrand);
      if (selectedSizes.length > 0) queryParams.append('size', selectedSizes.join(','));

      const response = await apiClient.get(`/products?${queryParams.toString()}`);
      
      // Client-side sub-filtering for price
      let filtered = response.data.products;

      if (maxPrice) {
        // Use supplierPrice for Supplier
        filtered = filtered.filter(prod => parseFloat(prod.supplierPrice) <= maxPrice);
      }

      setProducts(filtered);
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedBrand, selectedSizes, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedSizes([]);
    setMaxPrice(20000);
    setSearchParams({});
  };

  const openModal = (product) => {
    setModalProduct(product);
    const initialQuantities = {};
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach(s => {
        initialQuantities[s.size] = '';
      });
    } else {
      initialQuantities['N/A'] = '';
    }
    setModalQuantities(initialQuantities);
  };

  const handleQuantityChange = (size, value) => {
    setModalQuantities(prev => ({
      ...prev,
      [size]: value === '' ? '' : Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleAddToCart = () => {
    const itemsToAdd = [];
    let hasError = false;

    Object.entries(modalQuantities).forEach(([size, qtyStr]) => {
      const qty = parseInt(qtyStr) || 0;
      if (qty <= 0) return;

      let maxStock = modalProduct.availableQuantity;
      if (size !== 'N/A') {
        const sizeObj = modalProduct.sizes?.find(s => s.size === size);
        maxStock = sizeObj ? sizeObj.stock : 0;
      }

      if (qty > maxStock) {
        showToast(`Size ${size}: Only ${maxStock} items available in stock.`, 'warning');
        hasError = true;
        return;
      }

      itemsToAdd.push({
        productId: modalProduct.id,
        productName: modalProduct.productName,
        imageUrl: modalProduct.imageUrl,
        brand: modalProduct.brand,
        size,
        quantity: qty,
        price: parseFloat(modalProduct.supplierPrice),
        availableStock: maxStock
      });
    });

    if (hasError) return false;

    if (itemsToAdd.length === 0) {
      showToast('Please enter a quantity for at least one size.', 'error');
      return false;
    }

    itemsToAdd.forEach(item => {
      dispatch(addToCart(item));
    });

    showToast(`Added ${itemsToAdd.reduce((sum, item) => sum + item.quantity, 0)} items to Bulk Order Cart.`, 'success');
    return true;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 1. FILTER SIDEBAR */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6 md:sticky md:top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" /> Filters
            </h2>
            <button 
              onClick={handleResetFilters}
              className="text-xs font-semibold text-orange-500 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Product name, brand..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedCategory(''); setSearchParams(prev => { prev.delete('categoryId'); return prev; }); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-slate-100 font-bold dark:bg-slate-800 text-orange-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
              >
                All Categories
              </button>
              {(showAllCategories ? categories : categories.slice(0, 4)).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id.toString()); setSearchParams(prev => { prev.set('categoryId', cat.id); return prev; }); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === cat.id.toString() ? 'bg-slate-100 font-bold dark:bg-slate-800 text-orange-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                >
                  {cat.categoryName}
                </button>
              ))}
              {categories.length > 4 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors mt-1"
                >
                  {showAllCategories ? '- Less' : '+ More'}
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brand</label>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedBrand(''); setSearchParams(prev => { prev.delete('brand'); return prev; }); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedBrand ? 'bg-slate-100 font-bold dark:bg-slate-800 text-orange-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
              >
                All Brands
              </button>
              {(showAllBrands ? brands : brands.slice(0, 4)).map((br) => (
                <button
                  key={br}
                  onClick={() => { setSelectedBrand(br); setSearchParams(prev => { prev.set('brand', br); return prev; }); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedBrand === br ? 'bg-slate-100 font-bold dark:bg-slate-800 text-orange-500' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                >
                  {br}
                </button>
              ))}
              {brands.length > 4 && (
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors mt-1"
                >
                  {showAllBrands ? '- Less' : '+ More'}
                </button>
              )}
            </div>
          </div>

          {/* Size Filter */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Size Filter</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sizes.map((sz) => {
                  const isChecked = selectedSizes.includes(sz);
                  return (
                    <label 
                      key={sz} 
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedSizes(selectedSizes.filter(s => s !== sz));
                          } else {
                            setSelectedSizes([...selectedSizes, sz]);
                          }
                        }}
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 h-4 w-4 cursor-pointer"
                      />
                      <span className={`text-slate-700 dark:text-slate-300 ${isChecked ? 'font-semibold text-orange-500' : ''}`}>
                        {sz}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Max Supplier Price</span>
              <span className="text-slate-800 dark:text-slate-200">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="30000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

        </aside>

        {/* 2. PRODUCTS LISTING GRID */}
        <div className="flex-grow space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Supplier Catalog</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedSizes.length > 0 ? (
                  `Showing ${products.length} Products for Size ${selectedSizes.join(', ')}`
                ) : (
                  `Found ${products.length} products available for bulk ordering`
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Grid className="h-4 w-4 text-slate-700 dark:text-slate-300" /> Grid View
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">No Products Found</h3>
              <p className="text-xs text-slate-400 px-8 max-w-sm mx-auto">
                We couldn't find any sports items matching your current filters. Try resetting search strings or category selections.
              </p>
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all"
                >
                  
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'} 
                      alt={product.productName} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 px-2 py-0.5 rounded bg-slate-900/70 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider">
                      {product.brand}
                    </span>
                    
                    {/* Stock status indicator */}
                    <span className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider ${product.availableQuantity > 0 ? 'bg-green-600/70' : 'bg-red-600/70'}`}>
                      {product.availableQuantity > 0 ? `In Stock (${product.availableQuantity})` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <div className="block text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {product.productName}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes && product.sizes.map(s => (
                          <span 
                            key={s.size} 
                            className={`text-[8px] font-semibold px-1 py-0.5 border rounded-sm ${s.stock > 0 ? 'border-slate-200 text-slate-500 dark:border-slate-800' : 'border-red-100 text-red-300 dark:border-red-950/40 dark:text-red-800/40 line-through'}`}
                          >
                            {s.size}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Supplier Price</span>
                        <span className="text-base font-black text-slate-800 dark:text-slate-100">
                          ₹{product.supplierPrice ? parseFloat(product.supplierPrice).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => openModal(product)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 text-white hover:bg-blue-800 text-xs font-semibold transition-colors shadow-sm"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="h-4 w-4" /> Add to Cart
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* ADD TO BULK ORDER MODAL */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl w-full max-w-2xl shadow-2xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header / Product Info */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img 
                  src={modalProduct.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'} 
                  alt={modalProduct.productName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">{modalProduct.brand}</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{modalProduct.productName}</h3>
                  </div>
                  <button onClick={() => setModalProduct(null)} className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0">
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Supplier Price</span>
                    <span className="text-base font-black text-slate-800 dark:text-slate-100">
                      ₹{parseFloat(modalProduct.supplierPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Available</span>
                    <span className={`text-base font-black ${modalProduct.availableQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {modalProduct.availableQuantity} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Body / Size & Quantity Selection */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4 bg-white dark:bg-slate-900">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Quantities</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(modalQuantities).map((size) => {
                  const sizeObj = modalProduct.sizes?.find(s => s.size === size);
                  const maxStock = sizeObj ? sizeObj.stock : modalProduct.availableQuantity;
                  const isOutOfStock = size !== 'N/A' && maxStock === 0;

                  return (
                    <div key={size} className={`flex flex-col gap-2 p-3 rounded-2xl border ${isOutOfStock ? 'border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-950/10' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-black text-lg ${isOutOfStock ? 'text-red-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                          {size === 'N/A' ? 'Standard' : size}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {isOutOfStock ? 'Sold Out' : `${maxStock} left`}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={maxStock}
                        placeholder="Qty: 0"
                        disabled={isOutOfStock}
                        value={modalQuantities[size] || ''}
                        onChange={(e) => handleQuantityChange(size, e.target.value)}
                        className="w-full px-3 py-2 text-center font-bold border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-sm disabled:opacity-50"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer / Order Summary */}
            {(() => {
              const totalUnits = Object.values(modalQuantities).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0);
              const subtotal = totalUnits * parseFloat(modalProduct.supplierPrice || 0);
              const gst = subtotal * 0.12;
              const grandTotal = subtotal + gst;

              return (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Order Summary</h4>
                      <p className="text-xs text-slate-500">Review your bulk order quantities before adding to cart.</p>
                    </div>
                    
                    <div className="w-full sm:w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Total Units:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{totalUnits} items</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Subtotal:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">GST (12%):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                        <span className="font-black text-slate-800 dark:text-slate-100">Grand Total:</span>
                        <span className="font-black text-blue-600 dark:text-blue-400">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setModalProduct(null)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (handleAddToCart()) {
                          setModalProduct(null);
                        }
                      }}
                      disabled={totalUnits === 0}
                      className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;
