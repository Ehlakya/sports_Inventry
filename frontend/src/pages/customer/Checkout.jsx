import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { selectCartItems, selectCartSubtotal, clearCart } from '../../store/cartSlice';
import { useToast } from '../../components/common/Toast';
import apiClient from '../../api/axios';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [placing, setPlacing] = useState(false);

  // Customer GST: 18%
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  });

  const onSubmit = async (shippingDetails) => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    setPlacing(true);
    
    // Map cart items for API payload: { productId, size, quantity }
    const itemsPayload = cartItems.map(item => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity
    }));

    try {
      const response = await apiClient.post('/orders', { items: itemsPayload });
      
      const { order, expectedDeliveryDate, deliveryWithin } = response.data;
      
      showToast('Order placed successfully!', 'success');
      dispatch(clearCart());
      
      // Navigate to success page, passing state details
      navigate('/order-success', { 
        state: { 
          orderNumber: order.orderNumber,
          expectedDeliveryDate,
          deliveryWithin,
          totalAmount: order.totalAmount
        } 
      });
    } catch (error) {
      console.error('Order checkout error:', error);
      const errMsg = error.response?.data?.error || 'Order placement failed. Please verify stocks.';
      showToast(errMsg, 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold">No items to checkout</h2>
        <Link to="/products" className="text-orange-500 font-semibold hover:underline mt-2 inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-400">Complete your transaction with secure payment and address validation</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 1. SHIPPING DETAILS FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow space-y-6">
          <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-black uppercase tracking-tight border-b border-slate-100 dark:border-slate-900 pb-3">
              Shipping Address Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                {errors.name && <span className="text-[10px] text-red-400 font-semibold">{errors.name.message}</span>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Contact Number</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                {errors.phone && <span className="text-[10px] text-red-400 font-semibold">{errors.phone.message}</span>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Full Shipping Address</label>
              <textarea
                rows="3"
                {...register('address', { required: 'Address is required' })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
              />
              {errors.address && <span className="text-[10px] text-red-400 font-semibold">{errors.address.message}</span>}
            </div>
          </div>

          {/* Secure Guarantee */}
          <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-black uppercase tracking-tight border-b border-slate-100 dark:border-slate-900 pb-3">
              Payment Gateway
            </h2>
            <div className="flex gap-4 items-start p-4 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-900 dark:bg-slate-900/40">
              <CreditCard className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold">COD / Cash On Delivery (Default)</h4>
                <p className="text-slate-400 leading-relaxed">Payments are securely captured at doorsteps upon physical verification of items.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> SECURE CHECKOUT GUARANTEED BY ANTIGRAVITY SPORTS
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-850 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Return to Cart
            </Link>
            <button
              type="submit"
              disabled={placing}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Place Order'}
            </button>
          </div>

        </form>

        {/* 2. ORDER SUMMARY */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-base font-black uppercase tracking-tight border-b border-slate-100 dark:border-slate-900 pb-3">
              Order Summary
            </h2>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between py-3 text-xs">
                  <div className="space-y-0.5 max-w-[200px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{item.productName}</span>
                    <span className="text-slate-400 font-medium">Size: {item.size} | Qty: {item.quantity}</span>
                  </div>
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-3 text-sm border-t border-slate-100 dark:border-slate-900 pt-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (18% applied)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span className="font-semibold text-green-600 dark:text-green-400">FREE</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-900 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        </aside>

      </div>

    </div>
  );
};

export default Checkout;
