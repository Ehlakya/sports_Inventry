import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, ShoppingBag, ShieldCheck, Award, RefreshCw, Sparkles } from 'lucide-react';
import apiClient from '../../api/axios';
import { addToCart } from '../../store/cartSlice';
import { useToast } from '../../components/common/Toast';
import { CardSkeleton } from '../../components/common/Skeleton';

const Home = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products, we'll slice to display top 3 as featured
        const response = await apiClient.get('/products');
        setFeaturedProducts(response.data.products.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleQuickAdd = (product) => {
    if (!product.sizes || product.sizes.length === 0) {
      showToast('No sizes available for this product.', 'error');
      return;
    }
    
    // Select first size with stock, or default to first size
    const availableSize = product.sizes.find(s => s.stock > 0) || product.sizes[0];
    
    if (availableSize.stock === 0) {
      showToast('Product size is out of stock.', 'warning');
      return;
    }

    dispatch(addToCart({
      productId: product.id,
      productName: product.productName,
      brand: product.brand,
      size: availableSize.size,
      quantity: 1,
      price: parseFloat(product.customerPrice),
      availableStock: availableSize.stock
    }));

    showToast(`Added ${product.productName} (Size: ${availableSize.size}) to cart.`, 'success');
  };

  const categories = [
    { name: 'Footwear', desc: 'Running, training, and field boots', id: 1, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', bg: 'from-blue-600/20 to-indigo-600/10' },
    { name: 'Apparel', desc: 'Dry-fit jerseys, tights, and tracks', id: 2, img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80', bg: 'from-orange-500/20 to-amber-500/10' },
    { name: 'Equipment', desc: 'Bats, balls, rackets, and gears', id: 3, img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80', bg: 'from-emerald-500/20 to-teal-500/10' }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[500px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1600&q=80" 
            alt="Sports Hero background" 
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-start gap-6 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider animate-pulse-subtle">
            <Sparkles className="h-3.5 w-3.5" /> 2026 Collection Live
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight uppercase">
            UNLEASH THE <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">ATHLETE WITHIN</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Upgrade your game with professional-grade gear. Discover running footwear, dry-fit athletic apparel, and field equipment engineered for performance.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white transition-all shadow-lg shadow-orange-500/20"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BRANDS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur">
          <div className="flex flex-wrap items-center justify-around gap-8 text-center opacity-60">
            <span className="text-lg font-black tracking-widest uppercase italic text-slate-400 dark:text-slate-600">NIKE</span>
            <span className="text-lg font-black tracking-widest uppercase italic text-slate-400 dark:text-slate-600">ADIDAS</span>
            <span className="text-lg font-black tracking-widest uppercase italic text-slate-400 dark:text-slate-600">PUMA</span>
            <span className="text-lg font-black tracking-widest uppercase italic text-slate-400 dark:text-slate-600">WILSON</span>
            <span className="text-lg font-black tracking-widest uppercase italic text-slate-400 dark:text-slate-600">KOOKABURRA</span>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black uppercase tracking-tight">Shop by Sport Category</h2>
          <p className="text-xs text-slate-400 mt-1">Curated selections built for specific field disciplines</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/products?categoryId=${cat.id}`}
              className="relative overflow-hidden rounded-3xl group h-64 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              {/* Blur backdrop */}
              <div className="absolute inset-0 bg-slate-950 group-hover:scale-105 transition-transform duration-500">
                <img src={cat.img} alt={cat.name} className="h-full w-full object-cover opacity-60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 space-y-2 text-white">
                <h3 className="text-xl font-bold uppercase">{cat.name}</h3>
                <p className="text-xs text-slate-300">{cat.desc}</p>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 group-hover:underline">
                  Shop Category <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Featured Gear</h2>
            <p className="text-xs text-slate-400 mt-1">Top-reviewed equipment handpicked for you</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all"
              >
                {/* Image */}
                <Link to={`/products/${product.id}`} className="relative h-60 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'} 
                    alt={product.productName} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-2 py-0.5 rounded bg-slate-900/70 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider">
                    {product.brand}
                  </span>
                </Link>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <Link to={`/products/${product.id}`} className="block text-base font-bold text-slate-800 dark:text-slate-100 hover:text-orange-500 transition-colors line-clamp-1">
                      {product.productName}
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Price</span>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                        ₹{parseFloat(product.customerPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="inline-flex items-center justify-center p-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SERVICES ADVANTAGES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 rounded-3xl backdrop-blur">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-blue-100 text-blue-900 rounded-2xl dark:bg-blue-950/40 dark:text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase">100% Genuine Gear</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Direct associations with globally authorized brands like Nike, Adidas, Wilson, and Puma.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-orange-100 text-orange-950 rounded-2xl dark:bg-orange-950/40 dark:text-orange-400">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase">7-Day Free Delivery</h4>
              <p className="text-xs text-slate-400 leading-relaxed">All order checkouts are automatically calculated and expected within exactly 1 week.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-100 text-emerald-950 rounded-2xl dark:bg-emerald-950/40 dark:text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase">Professional Quality</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Approved by leading athletic coaches and professional leagues for matches and tournaments.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
