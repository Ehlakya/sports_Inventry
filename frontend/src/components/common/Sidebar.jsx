import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, FolderTree, Package, Users, Truck, 
  History, User, ClipboardList, TrendingUp, LogOut, X,
  ShoppingBag
} from 'lucide-react';
import { logout } from '../../store/authSlice';

const Sidebar = ({ role, isOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Admin Navigation Config
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="h-5 w-5" /> },
    { name: 'Products', path: '/admin/products', icon: <Package className="h-5 w-5" /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree className="h-5 w-5" /> },
    { name: 'Suppliers', path: '/admin/suppliers', icon: <Truck className="h-5 w-5" /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users className="h-5 w-5" /> },
    { name: 'Inventory Logs', path: '/admin/inventory', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Sales Summary', path: '/admin/reports', icon: <TrendingUp className="h-5 w-5" /> }
  ];

  // Supplier Navigation Config
  const supplierLinks = [
    { name: 'Dashboard', path: '/supplier/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Product Catalog', path: '/supplier/products', icon: <Package className="h-5 w-5" /> },
    { name: 'Bulk Orders', path: '/supplier/bulk-orders', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Order History', path: '/supplier/order-history', icon: <History className="h-5 w-5" /> },
    { name: 'Profile', path: '/supplier/profile', icon: <User className="h-5 w-5" /> }
  ];

  const links = role === 'ADMIN' ? adminLinks : supplierLinks;

  const baseSidebarStyle = `
    fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950
    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-[64px] lg:h-[calc(100vh-64px)]
  `;

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={`${baseSidebarStyle} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 lg:hidden border-b border-slate-100 dark:border-slate-900">
          <span className="font-extrabold text-sm tracking-wider uppercase text-slate-800 dark:text-slate-100">
            Navigation Menu
          </span>
        </div>

        {/* Console Header for Large Screens */}
        <div className="hidden lg:flex flex-col py-4 px-6 border-b border-slate-100 dark:border-slate-900">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Control Console
          </span>
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase mt-0.5">
            {role === 'ADMIN' ? 'Admin Center' : 'Supplier Portal'}
          </span>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-grow space-y-1 py-4 px-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              onClick={() => isOpen && toggleSidebar()}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-900 text-white shadow-md shadow-blue-900/10 dark:bg-blue-600 dark:shadow-blue-600/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout section */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-950">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
