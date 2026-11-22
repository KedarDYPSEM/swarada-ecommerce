import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Image,
  Star,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons & Discounts', path: '/admin/coupons', icon: Tag },
    { label: 'Banners & Hero', path: '/admin/banners', icon: Image },
    { label: 'Product Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Sales Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings & Integrations', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#292323] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div className="p-5 border-b border-neutral-700 flex items-center justify-between bg-[#641B32]">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#C5A05A]" />
            <div>
              <span className="font-heading text-lg font-bold tracking-wide uppercase">
                Swarada
              </span>
              <span className="block text-[9px] tracking-widest text-[#C5A05A] uppercase">
                Admin Center
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-neutral-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#641B32] text-white border-l-4 border-[#C5A05A]'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-[#C5A05A]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-700 bg-neutral-850 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-neutral-700 hover:text-black"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-medium text-neutral-500 hidden sm:inline">
              Swarada Flagship Store Administration
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#292323]">
                {user?.profile?.displayName || 'Administrator'}
              </p>
              <p className="text-[10px] text-[#C5A05A] font-semibold uppercase tracking-wider">
                {user?.role || 'SUPER_ADMIN'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#641B32] text-white flex items-center justify-center text-xs font-bold font-heading">
              A
            </div>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
