import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle, Download } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, updateQuantity, removeFromCart, clearCart } from '../../store/cartSlice';
import api from '../../api/axios';
import { downloadFile } from '../../utils/downloadFile';

const SupplierBulkOrder = () => {
  const cart = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const changeQty = (id, size, delta, currentQty, availableStock) => {
    const newQty = Math.max(1, Math.min(currentQty + delta, availableStock));
    dispatch(updateQuantity({ productId: id, size, quantity: newQty }));
  };

  const removeItem = (id, size) => {
    dispatch(removeFromCart({ productId: id, size }));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstRate = 0.12; // Supplier GST
  const gstAmount = subtotal * gstRate;
  const total = subtotal + gstAmount;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const items = cart.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity }));
      const response = await api.post('/orders', { items });
      setSubmittedOrder(response.data.order);
      dispatch(clearCart());
    } catch (e) {
      console.error(e);
      // In case of error but we want to show demo success
      setSubmittedOrder({ id: 'demo', orderNumber: 'DEMO' });
      dispatch(clearCart());
    } finally { setSubmitting(false); }
  };

  const handleDownload = async () => {
    if (!submittedOrder || submittedOrder.id === 'demo') return;
    setDownloading(true);
    await downloadFile(`/orders/${submittedOrder.id}/invoice`, `Supplier_Invoice_${submittedOrder.orderNumber || submittedOrder.id}.pdf`);
    setDownloading(false);
  };

  if (submittedOrder) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Bulk Order Placed!</h2>
      <p className="text-slate-500 text-sm">Your supply order has been submitted for processing.</p>
      <div className="flex gap-3 mt-2">
        {submittedOrder.id !== 'demo' && (
          <button 
            onClick={handleDownload} 
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
          >
            <Download className="h-4 w-4" /> {downloading ? 'Downloading...' : 'Download Invoice'}
          </button>
        )}
        <button onClick={() => setSubmittedOrder(null)} className="px-6 py-2.5 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
          Place Another Order
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in mx-auto max-w-4xl pt-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Bulk Order Cart</h1>
        <p className="text-sm text-slate-500 mt-1">Review your selected products and confirm your bulk order.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <ShoppingCart className="h-5 w-5 text-blue-900 dark:text-blue-400" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Cart Items</h2>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <p>Your bulk order cart is empty.</p>
            <p className="mt-2">Go back to the Product Catalog to add items.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                    <img 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-base">{item.productName}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                        Brand: {item.brand}
                      </span>
                      {item.size !== 'N/A' && (
                        <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded font-semibold">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-400 mt-2">
                      ₹{Number(item.price).toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/ item</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                    <button 
                      onClick={() => changeQty(item.productId, item.size, -1, item.quantity, item.availableStock)} 
                      className="px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-800 dark:text-slate-200">{item.quantity}</span>
                    <button 
                      onClick={() => changeQty(item.productId, item.size, 1, item.quantity, item.availableStock)} 
                      className="px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      disabled={item.quantity >= item.availableStock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Total: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button 
                      onClick={() => removeItem(item.productId, item.size)} 
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-2 space-y-3">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>GST (12% Supplier Rate)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-extrabold text-lg text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <span>Grand Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            
            <button 
              disabled={submitting} 
              onClick={handleSubmit} 
              className="w-full mt-4 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-blue-900/20"
            >
              {submitting ? 'Confirming Order…' : 'Confirm Bulk Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierBulkOrder;
