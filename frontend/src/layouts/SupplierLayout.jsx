import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import SportsBackground from '../components/common/SportsBackground';

const SupplierLayout = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // Route Guarding: Protect Supplier layout
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'SUPPLIER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SportsBackground variant="supplier" />
      {/* Navbar handles all supplier navigation via profile dropdown */}
      <Navbar />

      {/* Full-width content — no sidebar */}
      <main className="flex-grow p-6 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SupplierLayout;
