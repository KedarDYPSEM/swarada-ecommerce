import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  ChevronDown,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import SearchBar from './SearchBar';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCartDrawer } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const defaultNavLinks = [
    { id: 'home', name: 'Home', href: '/', active: true },
    {
      id: 'sarees',
      name: 'Sarees',
      href: '/shop?category=sarees',
      active: true,
      subcategories: [
        { name: 'All Sarees', href: '/shop?category=sarees' },
        { name: 'Yeola Paithani Sarees', href: '/shop?category=paithani-sarees' },
        { name: 'Banarasi Katan Silk', href: '/shop?category=banarasi-silk' },
        { name: 'Traditional Nauvari Kashta', href: '/shop?category=nauvari-sarees' },
        { name: 'Bridal Silk Sarees', href: '/shop?category=bridal' },
      ],
    },
    { id: 'dresses', name: 'Dresses', href: '/shop?category=dresses', active: true },
    { id: 'kurtis', name: 'Kurtis', href: '/shop?category=kurtis', active: true },
    { id: 'handbags', name: 'Handbags & Potlis', href: '/shop?category=handbags', active: true },
    { id: 'accessories', name: 'Accessories', href: '/shop?category=accessories', active: true },
    { id: 'festive_sale', name: 'Festive Sale', href: '/shop?sale=true', highlight: true, active: true },
    { id: 'about', name: 'Our Kolhapur Story', href: '/about', active: true },
  ];

  // Only active menu pages will be displayed
  const activeNavLinks = (settings?.menus || defaultNavLinks).filter((m) => m.active !== false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#C5A05A]/30 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-[#FFF9F0] border-b border-neutral-100 hidden md:block py-1.5 px-6 text-xs text-[#594E4E]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A05A]" />
              <span>Flagship Store: Mahadwar Road, Kolhapur</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-[#C5A05A]" />
              <span>Orders & Video Shopping: +91 98220 12345</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/track-order" className="hover:text-[#641B32] transition-colors">
              Track Order
            </Link>
            <span className="text-neutral-300">|</span>
            <Link to="/contact" className="hover:text-[#641B32] transition-colors">
              Customer Support
            </Link>
            {isAdmin && (
              <>
                <span className="text-neutral-300">|</span>
                <Link
                  to="/admin/dashboard"
                  className="text-[#641B32] font-semibold flex items-center space-x-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin Dashboard</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#292323] hover:text-[#641B32] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#292323] hover:text-[#641B32] transition-colors ml-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block group">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName || 'Swarada Saree Center'}
                  className="h-12 sm:h-14 w-auto max-w-[200px] sm:max-w-[240px] object-contain mx-auto lg:mx-0"
                />
              ) : (
                <>
                  <span className="font-heading text-2xl sm:text-3xl font-bold tracking-wider text-[#641B32] uppercase group-hover:text-[#7B1E35] transition-colors">
                    Swarada
                  </span>
                  <span className="block text-[9px] sm:text-[10px] tracking-[0.25em] font-medium text-[#C5A05A] uppercase -mt-1 font-sans">
                    Saree Center • Kolhapur
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Account Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center space-x-1.5 p-2 text-[#292323] hover:text-[#641B32] transition-colors"
                  >
                    <User className="w-5 h-5 text-[#641B32]" />
                    <span className="hidden sm:inline text-xs font-medium">
                      {user.profile?.firstName || 'My Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {accountMenuOpen && (
                    <div
                      onMouseLeave={() => setAccountMenuOpen(false)}
                      className="absolute right-0 mt-2 w-48 bg-white border border-[#C5A05A]/30 rounded-sm shadow-lg py-2 z-50 text-xs"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="font-semibold text-[#292323]">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </p>
                        <p className="text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FFF9F0] text-[#292323]"
                      >
                        Dashboard & Orders
                      </Link>
                      <Link
                        to="/account/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FFF9F0] text-[#292323]"
                      >
                        My Wishlist
                      </Link>
                      <Link
                        to="/account/addresses"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FFF9F0] text-[#292323]"
                      >
                        Saved Addresses
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2 hover:bg-[#FFF9F0] text-[#641B32] font-semibold border-t border-neutral-100"
                        >
                          Admin Portal
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2 border-t border-neutral-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/account/login"
                  className="flex items-center space-x-1.5 p-2 text-[#292323] hover:text-[#641B32] transition-colors"
                >
                  <User className="w-5 h-5 text-[#641B32]" />
                  <span className="hidden sm:inline text-xs font-medium">Sign In</span>
                </Link>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              to="/account/wishlist"
              className="p-2 text-[#292323] hover:text-[#641B32] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCartDrawer}
              className="flex items-center space-x-2 p-2 text-[#292323] hover:text-[#641B32] transition-colors relative cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#641B32]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#641B32] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {searchOpen && (
          <div className="pb-4 lg:hidden">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Desktop Main Navigation Menu */}
      <nav className="hidden lg:block border-t border-neutral-150 bg-[#FFF9F0]/60">
        <div className="max-w-7xl mx-auto px-8">
          <ul className="flex items-center justify-center space-x-8 text-xs font-medium tracking-wider uppercase py-3">
            {activeNavLinks.map((link) => (
              <li key={link.id || link.name} className="relative group">
                <Link
                  to={link.href}
                  className={`py-2 transition-colors flex items-center space-x-1 ${
                    link.highlight
                      ? 'text-[#C5A05A] font-bold'
                      : 'text-[#292323] hover:text-[#641B32]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.subcategories && <ChevronDown className="w-3 h-3 opacity-60" />}
                </Link>

                {/* Dropdown Menu */}
                {link.subcategories && (
                  <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-white border border-[#C5A05A]/30 shadow-xl py-2 rounded-xs z-50 normal-case">
                    {link.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className="block px-4 py-2 text-xs text-[#292323] hover:bg-[#FFF9F0] hover:text-[#641B32] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-[#641B32] text-white">
              <div>
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.storeName || 'Swarada Saree Center'}
                    className="h-10 w-auto max-w-[180px] object-contain brightness-0 invert"
                  />
                ) : (
                  <>
                    <span className="font-heading text-xl font-bold uppercase tracking-wider">
                      Swarada
                    </span>
                    <span className="block text-[9px] tracking-widest text-[#C5A05A] uppercase">
                      Saree Center • Kolhapur
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-white hover:text-[#C5A05A]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="p-4 flex-1">
              <ul className="space-y-3">
                {activeNavLinks.map((link) => (
                  <li key={link.id || link.name} className="border-b border-neutral-100 pb-2">
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-sm font-medium ${
                        link.highlight ? 'text-[#C5A05A] font-bold' : 'text-[#292323]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 bg-[#FFF9F0] border-t border-[#C5A05A]/30 text-xs space-y-2 text-[#594E4E]">
              <p className="font-semibold text-[#641B32]">Kolhapur Flagship Store</p>
              <p>Shop 12, Mahadwar Road, Kolhapur</p>
              <p>Helpline: +91 98220 12345</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
