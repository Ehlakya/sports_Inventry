import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { 
  selectCartItems, 
  selectCartSubtotal, 
  updateQuantity, 
  removeFromCart, 
  clearCart 
} from '../../store/cartSlice';
import { useToast } from '../../components/common/Toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  // Customer GST: 18%
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;

  const handleQtyChange = (productId, size, currentQty, amount, stock) => {
    const newQty = currentQty + amount;
    if (newQty >= 1 && newQty <= stock) {
      dispatch(updateQuantity({ productId, size, quantity: newQty }));
    }
  };

  const handleRemove = (productId, size, name) => {
    dispatch(removeFromCart({ productId, size }));
    showToast(`Removed ${name} (Size: ${size}) from cart.`, 'info');
  };

  const handleClear = () => {
    dispatch(clearCart());
    showToast('Shopping cart cleared.', 'info');
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 max-w-lg mx-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-450 dark:bg-slate-800">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight">Your Cart is Empty</h2>
            <p className="text-xs text-slate-400 px-12 leading-relaxed">
              Looks like you haven't added any sports gear to your shopping cart yet. Let's find something to upgrade your game.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white transition-colors shadow-lg shadow-orange-500/20"
          >
            Explore Gear <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-slate-400">Review your products, size configurations, and GST pricing</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 1. ITEMS LIST */}
        <div className="flex-grow space-y-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-900">
              {cartItems.map((item) => (
                <div 
                  key={`${item.productId}-${item.size}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      {/* Thumbnail */}
                      <span className="text-[10px] uppercase font-bold text-slate-500">{item.brand}</span>
                    </div>
                    <div className="space-y-1">
                      <Link 
                        to={`/products/${item.productId}`}
                        className="text-sm font-bold text-slate-850 dark:text-slate-150 hover:text-orange-500 transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <div className="flex gap-3 text-xs text-slate-450">
                        <span>Brand: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.brand}</strong></span>
                        <span>Size: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.size}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Pricing Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    
                    {/* Qty count */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.size, item.quantity, -1, item.availableStock)}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1 hover:bg-slate-150 dark:hover:bg-slate-850 font-bold transition-all disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.size, item.quantity, 1, item.availableStock)}
                        disabled={item.quantity >= item.availableStock}
                        className="px-2.5 py-1 hover:bg-slate-150 dark:hover:bg-slate-850 font-bold transition-all disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    {/* Cost */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ₹{item.price} each
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemove(item.productId, item.size, item.productName)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            <button
              onClick={handleClear}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Clear Entire Cart
            </button>
          </div>

        </div>

        {/* 2. ORDER BREAKDOWN */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-tight border-b border-slate-100 dark:border-slate-900 pb-3">
              Order Pricing
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (18% applied)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-green-600 dark:text-green-400">FREE</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-900 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-orange-500/20"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>

      </div>

    </div>
  );
};

export default Cart;
