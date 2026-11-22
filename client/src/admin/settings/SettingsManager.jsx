import React, { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Truck,
  CheckCircle,
  Save,
  Menu as MenuIcon,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import ImageUploader from '../components/ImageUploader';
import adminService from '../../services/adminService';
import { useSettings } from '../../context/SettingsContext';

const DEFAULT_MENUS = [
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

export const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const { refreshSettings } = useSettings();

  // Store & Branding Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Swarada Saree Center',
    tagline: 'Pure Handloom Paithani, Banarasi & Ethnic Fashion',
    logoUrl: '',
    location: 'Mahadwar Road, Kolhapur, Maharashtra 416002',
    phone: '+91 98220 12345',
    email: 'contact@swaradasarees.com',
    gstin: '27AAAAA0000A1Z5',
    currency: 'INR (₹)',
    freeShippingThreshold: '2999',
    standardShippingFee: '150',
  });

  // Navigation Menus State
  const [menus, setMenus] = useState(DEFAULT_MENUS);
  const [showKeySecret, setShowKeySecret] = useState(false);

  // Razorpay Settings
  const [razorpaySettings, setRazorpaySettings] = useState({
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    mode: 'test',
  });

  // Shipping & Logistics Settings
  const [shippingSettings, setShippingSettings] = useState({
    courierPartner: 'Blue Dart & Delhivery Express',
    freeShippingThreshold: '2999',
    standardShippingFee: '150',
    estimatedDeliveryDays: '3 to 5 business days',
    codAvailable: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      setFetching(true);
      try {
        const res = await adminService.getSettings();
        if (res && res.data) {
          const map = res.data;
          setStoreSettings((prev) => ({
            ...prev,
            storeName: map.store_name || prev.storeName,
            tagline: map.store_tagline || prev.tagline,
            logoUrl: map.store_logo_url || '',
            phone: map.store_phone || prev.phone,
            email: map.store_email || prev.email,
            location: map.store_address || prev.location,
            gstin: map.gst_number || prev.gstin,
            freeShippingThreshold: map.free_shipping_threshold || prev.freeShippingThreshold,
            standardShippingFee: map.standard_shipping_charge || prev.standardShippingFee,
          }));

          setRazorpaySettings({
            keyId: map.razorpay_key_id || '',
            keySecret: map.razorpay_key_secret || '',
            webhookSecret: map.razorpay_webhook_secret || '',
            mode: map.razorpay_mode || 'test',
          });

          if (map.nav_menus) {
            try {
              const parsed = JSON.parse(map.nav_menus);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setMenus(parsed);
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setFetching(false);
      }
    };

    loadSettings();
  }, []);

  const toggleMenu = (index) => {
    setMenus((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        active: !updated[index].active,
      };
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminService.updateSettings({
        store_name: storeSettings.storeName,
        store_tagline: storeSettings.tagline,
        store_logo_url: storeSettings.logoUrl,
        store_phone: storeSettings.phone,
        store_email: storeSettings.email,
        store_address: storeSettings.location,
        gst_number: storeSettings.gstin,
        free_shipping_threshold: storeSettings.freeShippingThreshold,
        standard_shipping_charge: storeSettings.standardShippingFee,
        nav_menus: JSON.stringify(menus),
        razorpay_key_id: razorpaySettings.keyId?.trim() || '',
        razorpay_key_secret: razorpaySettings.keySecret?.trim() || '',
        razorpay_webhook_secret: razorpaySettings.webhookSecret?.trim() || '',
        razorpay_mode: razorpaySettings.mode || 'test',
      });

      setSaveSuccess(true);
      if (refreshSettings) {
        await refreshSettings();
      }
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-sm text-neutral-500 animate-pulse">Loading platform settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
          Platform Preferences
        </span>
        <h1 className="text-2xl font-heading font-bold text-[#292323]">
          Store Settings & Navigation
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Upload custom store logo, toggle navigation menus, and configure business details
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Settings and navigation menus successfully updated!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <X className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-neutral-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'general'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          General & Logo
        </button>

        <button
          onClick={() => setActiveTab('menus')}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'menus'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Storefront Menus
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Razorpay Gateway
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Shipping & Logistics
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6 text-xs">
        {/* Tab 1: General & Logo */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Custom Logo Upload Section */}
            <div className="p-5 border border-[#C5A05A]/30 bg-[#FFF9F0]/60 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#641B32] flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-[#C5A05A]" />
                    <span>Store Logo (Client Storefront Header & Footer)</span>
                  </h3>
                  <p className="text-[11px] text-[#594E4E] mt-0.5">
                    Upload your official brand logo file. When uploaded, this replaces the plain text "Swarada Saree Center" on the website header and footer.
                  </p>
                </div>
                {storeSettings.logoUrl && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Active Logo Set
                  </span>
                )}
              </div>

              <div className="max-w-md pt-2">
                <ImageUploader
                  value={storeSettings.logoUrl}
                  onChange={(url) => setStoreSettings({ ...storeSettings, logoUrl: url })}
                  aspectRatio="video"
                  placeholder="Upload Brand Logo"
                />
              </div>

              {storeSettings.logoUrl && (
                <div className="mt-3 p-3 bg-white border border-neutral-200 rounded flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={storeSettings.logoUrl}
                      alt="Logo Preview"
                      className="h-10 max-w-[140px] object-contain border border-neutral-100 p-1 rounded"
                    />
                    <div>
                      <p className="font-semibold text-[#292323]">Current Storefront Logo</p>
                      <p className="text-[10px] text-neutral-400 truncate max-w-xs">{storeSettings.logoUrl}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStoreSettings({ ...storeSettings, logoUrl: '' })}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
            </div>

            {/* Store Text Details */}
            <h3 className="font-heading font-bold text-sm text-[#292323] pt-2">
              Store Identity & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  placeholder="e.g. Swarada Saree Center"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={storeSettings.tagline}
                  onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                  placeholder="e.g. Pure Handloom Paithani, Banarasi & Ethnic Fashion"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Store GSTIN</label>
                <input
                  type="text"
                  value={storeSettings.gstin}
                  onChange={(e) => setStoreSettings({ ...storeSettings, gstin: e.target.value })}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Customer Support Phone</label>
                <input
                  type="text"
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  placeholder="e.g. +91 98220 12345"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={storeSettings.email}
                  onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  placeholder="e.g. contact@swaradasarees.com"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Physical Store Location</label>
                <input
                  type="text"
                  value={storeSettings.location}
                  onChange={(e) => setStoreSettings({ ...storeSettings, location: e.target.value })}
                  placeholder="e.g. Mahadwar Road, Kolhapur, Maharashtra 416002"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Navigation Menus Toggle Center */}
        {activeTab === 'menus' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
                  <MenuIcon className="w-4 h-4 text-[#641B32]" />
                  <span>Storefront Navigation Menu Visibility</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Toggle menu items on or off. Only active menu pages will be displayed on the website navigation bar across all screen sizes.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#641B32]/10 text-[#641B32] rounded">
                {menus.filter((m) => m.active).length} of {menus.length} Active
              </span>
            </div>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
              {menus.map((menu, idx) => (
                <div
                  key={menu.id || menu.name}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    menu.active ? 'bg-white' : 'bg-neutral-50/70 opacity-75'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        menu.active ? 'bg-[#641B32]/10 text-[#641B32]' : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {menu.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-[#292323]">{menu.name}</span>
                        {menu.highlight && (
                          <span className="text-[10px] font-bold text-[#C5A05A] uppercase bg-[#C5A05A]/10 px-1.5 py-0.5 rounded">
                            Highlight
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{menu.href}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        menu.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {menu.active ? 'Active (Visible)' : 'Disabled (Hidden)'}
                    </span>

                    {/* Toggle Button Switch */}
                    <button
                      type="button"
                      onClick={() => toggleMenu(idx)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        menu.active ? 'bg-[#641B32]' : 'bg-neutral-300'
                      }`}
                      role="switch"
                      aria-checked={menu.active}
                      aria-label={`Toggle ${menu.name} menu`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          menu.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Razorpay */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#C5A05A]" />
                <span>Razorpay Payment Gateway Credentials</span>
              </h3>
              {razorpaySettings.keyId && razorpaySettings.keyId.startsWith('rzp_') ? (
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Live Credentials Linked
                </span>
              ) : (
                <span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Test Sandbox Simulation Mode
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-500">
              Enter your official Razorpay Test Key ID & Key Secret below to process real test cards and UPI. If left blank, checkout automatically uses smooth local sandbox simulation so testing never breaks.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Key ID</label>
                <input
                  type="text"
                  value={razorpaySettings.keyId}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keyId: e.target.value })}
                  placeholder="e.g. rzp_test_..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-neutral-700">Key Secret</label>
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="text-[11px] text-[#641B32] hover:underline flex items-center space-x-1"
                  >
                    {showKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showKeySecret ? 'Hide Secret' : 'Show Secret'}</span>
                  </button>
                </div>
                <input
                  type={showKeySecret ? 'text' : 'password'}
                  value={razorpaySettings.keySecret}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keySecret: e.target.value })}
                  placeholder="Paste your Razorpay Key Secret here"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Webhook Secret</label>
                <input
                  type="password"
                  value={razorpaySettings.webhookSecret}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, webhookSecret: e.target.value })}
                  placeholder="e.g. ••••••••••••••••"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Gateway Mode</label>
                <select
                  value={razorpaySettings.mode}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, mode: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded bg-white"
                >
                  <option value="test">Test / Sandbox Mode</option>
                  <option value="live">Production / Live Mode</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Shipping & Logistics */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#C5A05A]" />
              <span>Express Logistics & Courier Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Free Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.freeShippingThreshold}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })
                  }
                  placeholder="e.g. 2999"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Standard Shipping Fee (₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.standardShippingFee}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, standardShippingFee: e.target.value })
                  }
                  placeholder="e.g. 150"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Primary Logistics Courier
              </label>
              <input
                type="text"
                value={shippingSettings.courierPartner}
                onChange={(e) => setShippingSettings({ ...shippingSettings, courierPartner: e.target.value })}
                placeholder="e.g. Blue Dart, Delhivery Express"
                className="w-full px-3 py-2 border border-neutral-200 rounded"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shippingSettings.codAvailable}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, codAvailable: e.target.checked })}
                  className="rounded text-[#641B32] focus:ring-[#641B32]"
                />
                <span className="font-semibold text-neutral-700">
                  Allow Cash on Delivery (COD) for eligible pincodes
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="flex items-center space-x-2 px-6"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;
