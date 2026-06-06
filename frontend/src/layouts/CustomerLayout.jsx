import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import SportsBackground from '../components/common/SportsBackground';

const CustomerLayout = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // Route Guarding: Protect all customer routes
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect Admin and Supplier to their respective dashboards
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (role === 'SUPPLIER') {
    return <Navigate to="/supplier" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SportsBackground variant="customer" />
      {/* Customer Header */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Layout Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                FULL SPORTS
              </span>
              <p className="text-xs leading-relaxed text-slate-500">
                Premium sports apparel, professional accessories, footwear, and equipment. Serving athletes and suppliers worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Shop Categories</h3>
              <ul className="space-y-2 text-xs">
                <li><a href="/products?categoryId=1" className="hover:text-white transition-colors">Footwear & Running</a></li>
                <li><a href="/products?categoryId=2" className="hover:text-white transition-colors">Apparel & Shirts</a></li>
                <li><a href="/products?categoryId=3" className="hover:text-white transition-colors">Equipment & Balls</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Customer Support</h3>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Track Your Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Corporate Office</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full Sports Inc.<br />
                Vasant Kunj Executive Hub,<br />
                New Delhi, 110070
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
            <p>&copy; {new Date().getFullYear()} Full Sports. All rights reserved.</p>
            <p>Made with premium glassmorphic React components.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
