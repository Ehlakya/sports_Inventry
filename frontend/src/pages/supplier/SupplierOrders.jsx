import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, IndianRupee, Download } from 'lucide-react';
import api from '../../api/axios';
import { downloadFile } from '../../utils/downloadFile';

const statusColor = {
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  PENDING: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/orders')
      .then(r => {
        setOrders(r.data.orders || []);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;
  const totalPurchaseAmount = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleDownload = async (orderId, orderNumber) => {
    setDownloadingId(orderId);
    await downloadFile(`/orders/${orderId}/invoice`, `Supplier_Invoice_${orderNumber || orderId}.pdf`);
    setDownloadingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">Track all your past and active bulk supply orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Orders</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : totalOrders}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : pendingOrders}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Delivered</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{loading ? '-' : deliveredOrders}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Purchase</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {loading ? '-' : `₹${totalPurchaseAmount.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No Order History</h3>
            <p className="text-sm text-slate-500 mt-2">You haven't placed any bulk orders yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              
              {/* Order Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Order Number</span>
                  <span className="text-base font-bold text-blue-900 dark:text-blue-400">#{order.orderNumber || order.id}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Order Date</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex flex-col gap-1 md:items-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusColor[order.orderStatus] || statusColor.PENDING}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      
                      <div className="h-16 w-16 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img 
                          src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80'} 
                          alt={item.product?.productName} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.product?.productName || 'Unknown Product'}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {item.product?.brand}
                          </span>
                          {item.size && item.size !== 'N/A' && (
                            <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full sm:w-auto text-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Supplier Price</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Quantity</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.quantity}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">GST</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">12%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Item Total</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info Footer */}
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {order.estimatedDeliveryDate ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Expected Delivery Date:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatDate(order.estimatedDeliveryDate)}</span>
                  </div>
                ) : <div />}
                
                <button
                  onClick={() => handleDownload(order.id, order.orderNumber)}
                  disabled={downloadingId === order.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  {downloadingId === order.id ? 'Downloading...' : 'Download Invoice'}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default SupplierOrders;
