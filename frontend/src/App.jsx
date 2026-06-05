import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/index';
import { ToastProvider } from './components/common/Toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import SupplierLayout from './layouts/SupplierLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Customer Pages
import Home from './pages/customer/Home';
import ProductListing from './pages/customer/ProductListing';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminInventory from './pages/admin/AdminInventory';
import AdminReports from './pages/admin/AdminReports';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierBulkOrder from './pages/supplier/SupplierBulkOrder';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierProfile from './pages/supplier/SupplierProfile';

// Loading spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-blue-900 border-t-transparent animate-spin" />
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading…</span>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Customer Routes (public + auth-optional) */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Supplier Routes */}
              <Route path="/supplier" element={<SupplierLayout />}>
                <Route index element={<SupplierDashboard />} />
                <Route path="products" element={<SupplierProducts />} />
                <Route path="bulk-order" element={<SupplierBulkOrder />} />
                <Route path="orders" element={<SupplierOrders />} />
                <Route path="profile" element={<SupplierProfile />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;
