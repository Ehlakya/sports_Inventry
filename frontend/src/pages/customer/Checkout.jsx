import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, CreditCard, ShieldCheck, QrCode, Smartphone } from 'lucide-react';
import { selectCartItems, selectCartSubtotal, clearCart } from '../../store/cartSlice';
import { useToast } from '../../components/common/Toast';
import apiClient from '../../api/axios';
import phonePeQR from '../../assets/phonepe-qr.jpg';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'phonepe'

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
          orderId: order.id,
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
                <label className="text-xs font-semibold text-slate-400">
                  Contact Number
                  <span className="ml-1 text-slate-300 dark:text-slate-600 font-normal">(10 digits)</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Enter a valid 10-digit phone number'
                    }
                  })}
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, arrows, home, end
                    const allowedKeys = ['Backspace','Delete','Tab','Escape','ArrowLeft','ArrowRight','Home','End'];
                    if (allowedKeys.includes(e.key)) return;
                    // Block anything that isn't a digit
                    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                  }}
                  onInput={(e) => {
                    // Extra safety: strip non-digits and cap at 10
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }}
                  placeholder="e.g. 9876543210"
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

          {/* Payment Gateway */}
          <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-black uppercase tracking-tight border-b border-slate-100 dark:border-slate-900 pb-3">
              Payment Method
            </h2>

            {/* Payment Toggle Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* COD Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <CreditCard className={`h-6 w-6 ${paymentMethod === 'cod' ? 'text-orange-500' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${paymentMethod === 'cod' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}>
                  Cash on Delivery
                </span>
                {paymentMethod === 'cod' && (
                  <span className="text-[10px] font-semibold text-orange-500 bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-full">Selected</span>
                )}
              </button>

              {/* PhonePe Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('phonepe')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'phonepe'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Smartphone className={`h-6 w-6 ${paymentMethod === 'phonepe' ? 'text-purple-500' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold ${paymentMethod === 'phonepe' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}>
                  PhonePe / UPI
                </span>
                {paymentMethod === 'phonepe' && (
                  <span className="text-[10px] font-semibold text-purple-500 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">Selected</span>
                )}
              </button>
            </div>

            {/* COD Detail */}
            {paymentMethod === 'cod' && (
              <div className="flex gap-4 items-start p-4 rounded-xl border border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-500/5 transition-all duration-300">
                <CreditCard className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold">Cash On Delivery</h4>
                  <p className="text-slate-400 leading-relaxed">Payment is securely captured at your doorstep upon physical verification of items.</p>
                </div>
              </div>
            )}

            {/* PhonePe QR Detail */}
            {paymentMethod === 'phonepe' && (
              <div className="flex flex-col items-center gap-4 p-5 rounded-xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/10 dark:to-slate-950 transition-all duration-300">
                {/* PhonePe Header */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-md shadow-purple-500/30">
                    <span className="text-white font-black text-sm">₱</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-purple-700 dark:text-purple-400">PhonePe</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">UPI Accepted Here</p>
                  </div>
                </div>

                {/* QR Code Image */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-purple-400 to-purple-700 rounded-2xl opacity-20 blur-md"></div>
                  <div className="relative bg-white rounded-xl p-3 shadow-lg border border-purple-100">
                    <img
                      src={phonePeQR}
                      alt="PhonePe QR Code - EHLAKYA SHREE.G"
                      className="w-52 h-52 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">EHLAKYA SHREE.G</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Open PhonePe app → Scan &amp; Pay → Enter amount &amp; confirm
                  </p>
                </div>

                {/* Steps */}
                <div className="w-full grid grid-cols-3 gap-2 text-center">
                  {['Open PhonePe', 'Scan QR', 'Pay & Done'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                        {i + 1}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
