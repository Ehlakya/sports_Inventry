import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';
import { downloadFile } from '../../utils/downloadFile';

const OrderSuccess = () => {
  const location = useLocation();
  const state = location.state || {};
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!state.orderId) return;
    setDownloading(true);
    await downloadFile(`/orders/${state.orderId}/invoice`, `Invoice_${state.orderNumber || state.orderId}.pdf`);
    setDownloading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 animate-fade-in">
      <div className="relative mb-8">
        <div className="h-28 w-28 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="h-14 w-14 text-emerald-600" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <Package className="h-5 w-5 text-orange-500" />
        </div>
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-3">Order Placed Successfully!</h1>
      <p className="text-slate-500 max-w-md mb-2">
        Thank you for your purchase! Your order is being processed and will be delivered soon.
      </p>
      <p className="text-sm text-slate-400 mb-8">You'll receive a confirmation email with your order details.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {state.orderId && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {downloading ? 'Downloading...' : 'Download Invoice'}
          </button>
        )}
        <Link to="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-900/20">
          <Package className="h-4 w-4" /> Track Orders
        </Link>
        <Link to="/products" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
