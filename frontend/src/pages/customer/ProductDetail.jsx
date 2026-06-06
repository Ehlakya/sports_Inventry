import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCart, ArrowLeft, Loader2, Award, Truck, ShieldAlert } from 'lucide-react';
import apiClient from '../../api/axios';
import { addToCart } from '../../store/cartSlice';
import { useToast } from '../../components/common/Toast';
import { Skeleton } from '../../components/common/Skeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data.product);
        
        // Auto-select first available size that has stock
        if (response.data.product.category?.categoryName !== 'Equipment' && response.data.product.sizes?.length > 0) {
          const firstAvailable = response.data.product.sizes?.find(s => s.stock > 0);
          if (firstAvailable) {
            setSelectedSize(firstAvailable.size);
          } else {
            setSelectedSize(response.data.product.sizes[0].size);
          }
        } else {
          setSelectedSize('N/A');
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
        showToast('Product not found.', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const activeSizeConfig = product?.sizes?.find(s => s.size === selectedSize);
  const maxAvailableStock = selectedSize === 'N/A' ? product?.availableQuantity || 0 : (activeSizeConfig ? activeSizeConfig.stock : 0);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= maxAvailableStock) {
      setQuantity(newQty);
    }
  };

  // Reset quantity if size changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  const handleAddToCart = (shouldRedirect = false) => {
    if (!selectedSize) {
      showToast('Please select a size first.', 'warning');
      return;
    }

    if (maxAvailableStock === 0) {
      showToast('This size configuration is currently out of stock.', 'error');
      return;
    }

    setAdding(true);
    
    setTimeout(() => {
      dispatch(addToCart({
        productId: product.id,
        productName: product.productName,
        brand: product.brand,
        size: selectedSize,
        quantity: quantity,
        price: parseFloat(product.customerPrice),
        availableStock: maxAvailableStock
      }));

      showToast(`Added ${product.productName} (Size: ${selectedSize}, Qty: ${quantity}) to cart.`, 'success');
      setAdding(false);
      
      if (shouldRedirect) {
        navigate('/cart');
      }
    }, 400);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Products Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center min-h-[400px] h-[500px]">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'} 
            alt={product.productName} 
            className="h-full w-full object-cover"
          />
          <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-wider">
            {product.brand}
          </span>
        </div>

        {/* Product Controls */}
        <div className="space-y-6 flex flex-col justify-between py-2">
          
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                {product.category?.categoryName}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                {product.productName}
              </h1>
            </div>

            {/* Price block */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-100/30 dark:border-slate-800 dark:bg-slate-900/40">
              <span className="text-xs text-slate-450 block uppercase font-medium">Customer Price</span>
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                ₹{parseFloat(product.customerPrice).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">+18% GST applied at checkout</span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                {product.description || "No description provided for this premium sports item."}
              </p>
            </div>

            {/* Sizes selection */}
            {product.category?.categoryName !== 'Equipment' && product.sizes?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((sz) => {
                    const hasStock = sz.stock > 0;
                    const isSelected = selectedSize === sz.size;

                    return (
                      <button
                        key={sz.size}
                        onClick={() => hasStock && setSelectedSize(sz.size)}
                        disabled={!hasStock}
                        className={`
                          px-4 py-2 text-xs font-bold border rounded-xl transition-all
                          ${isSelected 
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' 
                            : hasStock 
                              ? 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900' 
                              : 'border-slate-100 dark:border-slate-950/20 text-slate-300 dark:text-slate-700 line-through cursor-not-allowed bg-slate-50/20'
                          }
                        `}
                      >
                        {sz.size} {hasStock ? `(${sz.stock})` : '(Out)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {maxAvailableStock > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                    <button 
                      onClick={() => handleQtyChange(-1)} 
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-colors disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-900/40">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => handleQtyChange(1)} 
                      disabled={quantity >= maxAvailableStock}
                      className="px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-colors disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    (Max: {maxAvailableStock} available)
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-150 dark:border-slate-800 mt-6">
            <button
              onClick={() => handleAddToCart(false)}
              disabled={adding || maxAvailableStock === 0}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-100 transition-colors disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} Add to Cart
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              disabled={adding || maxAvailableStock === 0}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              Buy It Now
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400 mt-4 border-t border-slate-100 dark:border-slate-850 pt-4">
            <div className="space-y-1">
              <Truck className="mx-auto h-4 w-4 text-slate-500" />
              <span>7-Day Expected Delivery</span>
            </div>
            <div className="space-y-1">
              <Award className="mx-auto h-4 w-4 text-slate-500" />
              <span>100% Genuine Brands</span>
            </div>
            <div className="space-y-1">
              <ShieldAlert className="mx-auto h-4 w-4 text-slate-500" />
              <span>Verified Secure Checkout</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;
