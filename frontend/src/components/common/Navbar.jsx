import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingCart, Search, User, LogOut, Sun, Moon,
  Package, List, Menu, ClipboardList,
  LayoutDashboard, History, Store, UserCircle, ChevronDown
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { selectCartTotalQuantity } from '../../store/cartSlice';

// Supplier nav links shown inside the dropdown
const SUPPLIER_NAV = [
  { label: 'Dashboard',      path: '/supplier/dashboard',    icon: LayoutDashboard },
  { label: 'Product Catalog', path: '/supplier/products',   icon: Package },
  { label: 'Bulk Orders',    path: '/supplier/bulk-orders',  icon: ClipboardList },
  { label: 'Order History',  path: '/supplier/order-history', icon: History },
  { label: 'Profile',        path: '/supplier/profile',      icon: UserCircle },
];

const Navbar = ({ toggleMobileSidebar }) => {
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const cartQuantity = useSelector(selectCartTotalQuantity);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [isProfileOpen,  setIsProfileOpen]  = useState(false);
  const [isDark,         setIsDark]         = useState(false);

  const profileRef = useRef(null);

  // ── Theme init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark  = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(dark);
    document.body.classList.toggle('dark', dark);
  }, []);

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const targetPath = role === 'SUPPLIER' ? '/supplier/products' : '/products';
      navigate(`${targetPath}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  const isSupplier = role === 'SUPPLIER';

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={isSupplier ? '/supplier/dashboard' : '/'} className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-orange-400">
                FULL<span className="text-slate-800 dark:text-slate-200">SPORTS</span>
              </span>
            </Link>
          </div>



          {/* Search Bar */}
          <div className="hidden md:flex flex-grow max-w-lg">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium sports gear..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </form>
          </div>

          {/* Categories shortcut */}
          {role !== 'ADMIN' && (
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium mr-4 text-slate-600 dark:text-slate-300">
              <Link to={role === 'SUPPLIER' ? '/supplier/products' : '/products'} className="hover:text-orange-500 transition-colors">All Products</Link>
              <Link to={role === 'SUPPLIER' ? '/supplier/products?categoryId=1' : '/products?categoryId=1'} className="hover:text-orange-500 transition-colors">Footwear</Link>
              <Link to={role === 'SUPPLIER' ? '/supplier/products?categoryId=2' : '/products?categoryId=2'} className="hover:text-orange-500 transition-colors">Apparel</Link>
              <Link to={role === 'SUPPLIER' ? '/supplier/products?categoryId=3' : '/products?categoryId=3'} className="hover:text-orange-500 transition-colors">Equipment</Link>
            </div>
          )}

          {/* ── Right-side actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart (customer only) */}
            {(!role || role === 'CUSTOMER') && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-pulse-subtle">
                    {cartQuantity}
                  </span>
                )}
              </Link>
            )}

            {/* ── Profile Dropdown ── */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold dark:bg-blue-600">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold pr-0.5 text-slate-700 dark:text-slate-200">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50 animate-fade-in">

                    {/* User info header */}
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user?.name}</p>
                      <p className="text-xs truncate text-slate-400">{user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-bold tracking-wider uppercase dark:bg-blue-900/40 dark:text-blue-300">
                        {role}
                      </span>
                    </div>

                    {/* ── SUPPLIER: full navigation links ── */}
                    {isSupplier && (
                      <div className="py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Navigation</p>
                        {SUPPLIER_NAV.map(({ label, path, icon: Icon }) => (
                          <NavLink
                            key={path}
                            to={path}
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-800 font-semibold dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                              }`
                            }
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {label}
                          </NavLink>
                        ))}
                      </div>
                    )}

                    {/* ADMIN shortcut */}
                    {role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-700 dark:text-slate-300"
                      >
                        <Package className="h-4 w-4" /> Admin Console
                      </Link>
                    )}

                    {/* CUSTOMER shortcuts */}
                    {role === 'CUSTOMER' && (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <ClipboardList className="h-4 w-4" /> My Orders
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <List className="h-4 w-4" /> Dashboard
                        </Link>
                      </>
                    )}

                    {/* Sign Out */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-900 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 transition-all"
              >
                <User className="h-4 w-4" /> Log In
              </Link>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
