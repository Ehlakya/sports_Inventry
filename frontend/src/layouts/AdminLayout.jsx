import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import SportsBackground from '../components/common/SportsBackground';

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

  useEffect(() => {
    let wheelAccumulator = 0;
    let touchStartX = null;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        wheelAccumulator += e.deltaX;
        if (wheelAccumulator < -100) {
          setIsSidebarOpen(true);
          wheelAccumulator = 0;
        } else if (wheelAccumulator > 100) {
          setIsSidebarOpen(false);
          wheelAccumulator = 0;
        }
      } else {
        wheelAccumulator = 0;
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && touchStartX !== null) {
        const currentX = e.touches[0].clientX;
        const diff = currentX - touchStartX;
        if (diff > 50) {
          setIsSidebarOpen(true);
          touchStartX = null;
        } else if (diff < -50) {
          setIsSidebarOpen(false);
          touchStartX = null;
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartX = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <SportsBackground variant="admin" />
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
