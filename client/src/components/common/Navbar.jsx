import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCartDrawer } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#D4AF37]/25 shadow-xs transition-all duration-300">
      {/* 1. Top Scrolling Announcement Marquee Bar (Editable via Admin Panel) */}
      {settings?.announcementBarEnabled !== false && (
        <div className="bg-[#0F0C0D] text-[#FAF7F2] border-b border-[#D4AF37]/25 py-2 overflow-hidden select-none relative z-50">
          <div className="flex w-full overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center shrink-0">
              <span className="text-[11px] sm:text-xs tracking-[0.22em] font-medium uppercase text-[#F3E2B8] mx-6">
                {settings?.announcementText || '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS •'}
              </span>
              <span className="text-[11px] sm:text-xs tracking-[0.22em] font-medium uppercase text-[#F3E2B8] mx-6">
                {settings?.announcementText || '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS •'}
              </span>
            </div>
            <div className="animate-marquee whitespace-nowrap flex items-center shrink-0" aria-hidden="true">
              <span className="text-[11px] sm:text-xs tracking-[0.22em] font-medium uppercase text-[#F3E2B8] mx-6">
                {settings?.announcementText || '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS •'}
              </span>
              <span className="text-[11px] sm:text-xs tracking-[0.22em] font-medium uppercase text-[#F3E2B8] mx-6">
                {settings?.announcementText || '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS •'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Utility Bar */}
      <div className="bg-[#FAF7F2] border-b border-amber-900/10 hidden md:block py-2 px-6 text-xs text-[#5A4E51]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Flagship Store: Mahadwar Road, Kolhapur</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Orders & Video Shopping: +91 98220 12345</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/track-order" className="hover:text-[#641B32] transition-colors font-medium">
              Track Order
            </Link>
            <span className="text-amber-900/20">|</span>
            <Link to="/contact" className="hover:text-[#641B32] transition-colors font-medium">
              Customer Support
            </Link>
            {isAdmin && (
              <>
                <span className="text-amber-900/20">|</span>
                <Link
                  to="/admin/dashboard"
                  className="text-[#641B32] font-semibold flex items-center space-x-1 bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40"
                >
                  <Shield className="w-3 h-3 text-[#D4AF37]" />
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
              className="p-2 text-[#1E1719] hover:text-[#641B32] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#1E1719] hover:text-[#641B32] transition-colors ml-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block group py-1">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName || 'Swarada Saree Center'}
                  className="h-12 sm:h-14 w-auto max-w-[200px] sm:max-w-[240px] object-contain mx-auto lg:mx-0 transition-transform duration-300 group-hover:scale-102"
                />
              ) : (
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-royal text-2xl sm:text-3xl font-bold tracking-[0.08em] text-[#641B32] uppercase group-hover:text-[#851C3B] transition-colors">
                    Swarada
                  </span>
                  <span className="block text-[8px] sm:text-[9px] tracking-[0.3em] font-medium text-[#D4AF37] uppercase -mt-0.5 font-royal">
                    Saree Center • Kolhapur
                  </span>
                </div>
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
                    className="flex items-center space-x-1.5 p-2 rounded-full hover:bg-neutral-100 text-[#1E1719] hover:text-[#641B32] transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#641B32]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#641B32]">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold">
                      {user.profile?.firstName || 'My Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {accountMenuOpen && (
                    <div
                      onMouseLeave={() => setAccountMenuOpen(false)}
                      className="absolute right-0 mt-2 w-52 bg-white/98 backdrop-blur-md border border-[#D4AF37]/35 rounded-xl shadow-2xl py-2 z-50 text-xs"
                    >
                      <div className="px-4 py-2.5 border-b border-neutral-100 bg-[#FAF7F2]">
                        <p className="font-semibold text-[#1E1719]">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FAF7F2] text-[#1E1719] transition-colors"
                      >
                        My Dashboard
                      </Link>
                      <Link
                        to="/account/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FAF7F2] text-[#1E1719] transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FAF7F2] text-[#1E1719] transition-colors"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FAF7F2] text-[#1E1719] transition-colors"
                      >
                        My Wishlist
                      </Link>
                      <Link
                        to="/account/addresses"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FAF7F2] text-[#1E1719] transition-colors"
                      >
                        Saved Addresses
                      </Link>
                      <Link
                        to="/account/password"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-[#FAF7F2] text-[#1E1719] transition-colors"
                      >
                        Change Password
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#641B32] font-semibold border-t border-neutral-100"
                        >
                          Admin Portal
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 border-t border-neutral-100 cursor-pointer"
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
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-full hover:bg-neutral-100 text-[#1E1719] hover:text-[#641B32] transition-colors"
                >
                  <User className="w-5 h-5 text-[#641B32]" />
                  <span className="hidden sm:inline text-xs font-semibold">Sign In</span>
                </Link>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              to="/account/wishlist"
              className="p-2.5 rounded-full hover:bg-neutral-100 text-[#1E1719] hover:text-[#641B32] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCartDrawer}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#641B32] to-[#7A1A31] hover:from-[#7A1A31] hover:to-[#480C1E] text-white shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer active:scale-95 group"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#F3E2B8] group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#D4AF37] text-[#1E1719] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide">Bag</span>
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

      {/* Desktop Main Navigation Menu - Matching Brand Logo Red */}
      <nav className="hidden lg:block bg-[#C4121A] border-t border-b border-[#a10e15] shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <ul className="flex items-center justify-center space-x-8 text-xs font-semibold tracking-widest uppercase py-3">
            {activeNavLinks.map((link) => (
              <li key={link.id || link.name} className="relative group">
                <Link
                  to={link.href}
                  className={`py-2 transition-all flex items-center space-x-1.5 relative ${
                    link.highlight
                      ? 'text-[#F3E2B8] font-bold'
                      : 'text-white hover:text-[#F3E2B8]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.subcategories && (
                    <ChevronDown className="w-3 h-3 text-white/80 group-hover:text-[#F3E2B8] group-hover:rotate-180 transition-transform duration-200" />
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F3E2B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                {/* Dropdown Menu */}
                {link.subcategories && (
                  <div className="absolute left-0 top-full hidden group-hover:block w-64 bg-white/98 backdrop-blur-md border border-[#D4AF37]/40 shadow-2xl py-3 rounded-xl z-50 normal-case animate-in fade-in zoom-in-95">
                    <div className="px-4 py-1 mb-1 border-b border-neutral-100">
                      <span className="text-[10px] font-royal uppercase tracking-widest text-[#C4121A] font-bold">
                        Curated Collections
                      </span>
                    </div>
                    {link.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className="block px-4 py-2 text-xs text-[#1E1719] hover:bg-[#C4121A] hover:text-white transition-colors font-medium rounded-md mx-1"
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

      {/* Mobile Drawer Menu Mounted via Portal to document.body */}
      {mobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
              {/* Drawer Header */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-[#641B32] text-white shrink-0">
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
                  className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Account Quick Status Strip */}
              <div className="px-5 py-3 bg-[#FFF9F0] border-b border-neutral-200/60 flex items-center justify-between text-xs shrink-0">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#641B32]" />
                    <span className="font-medium text-[#292323]">
                      Namaste, {user.profile?.firstName || 'Customer'}
                    </span>
                  </div>
                ) : (
                  <Link
                    to="/account/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-[#641B32] font-semibold"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In / Register</span>
                  </Link>
                )}
                {isAuthenticated && (
                  <Link
                    to="/account/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#641B32] font-semibold underline text-[11px]"
                  >
                    My Account
                  </Link>
                )}
              </div>

              {/* Navigation links with expandable submenus */}
              <div className="p-4 flex-1">
                <ul className="space-y-1">
                  {activeNavLinks.map((link) => (
                    <li key={link.id || link.name} className="border-b border-neutral-100/80 pb-2 pt-1">
                      <div className="flex items-center justify-between">
                        <Link
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`text-sm font-semibold flex-1 py-1.5 ${
                            link.highlight ? 'text-[#C5A05A] font-bold' : 'text-[#292323] hover:text-[#641B32]'
                          }`}
                        >
                          {link.name}
                        </Link>
                        {link.subcategories && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSubmenu(expandedSubmenu === link.id ? null : link.id)
                            }
                            className="p-2 text-neutral-400 hover:text-[#641B32]"
                            aria-label={`Expand ${link.name} categories`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                expandedSubmenu === link.id ? 'rotate-180 text-[#641B32]' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expandable Subcategories */}
                      {link.subcategories && expandedSubmenu === link.id && (
                        <ul className="mt-1 ml-3 pl-3 border-l-2 border-[#C5A05A]/40 space-y-1.5 py-1">
                          {link.subcategories.map((sub) => (
                            <li key={sub.name}>
                              <Link
                                to={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1 text-xs text-neutral-600 hover:text-[#641B32]"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>

                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-[11px] font-bold text-[#C5A05A] uppercase tracking-wider mb-2">
                      My Account
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      <li>
                        <Link
                          to="/account/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[#292323] hover:text-[#641B32] block py-1 font-medium"
                        >
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[#292323] hover:text-[#641B32] block py-1 font-medium"
                        >
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/addresses"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[#292323] hover:text-[#641B32] block py-1 font-medium"
                        >
                          Saved Addresses
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/password"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[#292323] hover:text-[#641B32] block py-1 font-medium"
                        >
                          Change Password
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="text-red-600 hover:text-red-700 block py-1 text-left w-full cursor-pointer font-medium"
                        >
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-5 bg-[#FFF9F0] border-t border-[#C5A05A]/30 text-xs space-y-2 text-[#594E4E] shrink-0">
                <p className="font-semibold text-[#641B32]">Kolhapur Flagship Store</p>
                <p>Shop 12, Mahadwar Road, Kolhapur</p>
                <p className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C5A05A]" />
                  <span>Orders & Video: +91 98220 12345</span>
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};

export default Navbar;
