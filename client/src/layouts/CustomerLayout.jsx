import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Lock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'My Dashboard', path: '/account/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', path: '/account/orders', icon: ShoppingBag },
    { label: 'Wishlist', path: '/account/wishlist', icon: Heart },
    { label: 'Saved Addresses', path: '/account/addresses', icon: MapPin },
    { label: 'My Profile', path: '/account/profile', icon: User },
    { label: 'Change Password', path: '/account/password', icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Customer Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-[#C5A05A]/30 rounded-sm p-6 shadow-xs">
            {/* User Greeting */}
            <div className="flex items-center space-x-3 pb-6 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-full bg-[#641B32] text-white flex items-center justify-center font-heading text-lg font-bold">
                {user?.profile?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Hello,</p>
                <h3 className="text-sm font-semibold text-[#292323] truncate">
                  {user?.profile?.displayName || user?.profile?.firstName || user?.email}
                </h3>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-xs text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#641B32] text-white font-semibold'
                          : 'text-[#292323] hover:bg-[#FFF9F0] hover:text-[#641B32]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-xs transition-colors mt-4 border-t border-neutral-100"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          <div className="bg-white border border-[#C5A05A]/30 rounded-sm p-6 sm:p-8 shadow-xs min-h-[500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
