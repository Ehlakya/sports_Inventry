import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const AdminLayout = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Route Guarding: Protect Admin layout
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Universal header */}
      <Navbar toggleMobileSidebar={toggleSidebar} />

      <div className="flex flex-grow items-stretch">
        {/* Admin Navigation Sidebar */}
        <Sidebar 
          role="ADMIN" 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />

        {/* Console Workspace Area */}
        <main className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
