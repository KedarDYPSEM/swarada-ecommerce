import React, { useState } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  Truck,
  Smartphone,
  Save,
  CheckCircle,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Swarada Saree Center',
    tagline: 'Pure Handloom Paithani, Banarasi & Ethnic Fashion',
    location: 'Mahadwar Road, Kolhapur, Maharashtra 416002',
    phone: '+91 98220 12345',
    email: 'contact@swaradasarees.com',
    gstin: '27AAAAA0000A1Z5',
    currency: 'INR (₹)',
    freeShippingThreshold: '2999',
    standardShippingFee: '150',
  });

  // Razorpay Settings
  const [razorpaySettings, setRazorpaySettings] = useState({
    keyId: 'rzp_test_swarada2026',
    keySecret: '••••••••••••••••••••••••',
    webhookSecret: '••••••••••••••••',
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

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A05A]">
          Platform Preferences
        </span>
        <h1 className="text-2xl font-heading font-bold text-[#292323]">
          Store Settings & Integrations
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure business details, payment gateway credentials, and billing software sync
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully into database!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-neutral-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'general'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          General Store Info
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
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

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-5 text-xs">
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#292323]">
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

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">Store Physical Location (Kolhapur)</label>
                <input
                  type="text"
                  value={storeSettings.location}
                  onChange={(e) => setStoreSettings({ ...storeSettings, location: e.target.value })}
                  placeholder="e.g. Mahadwar Road, Kolhapur, Maharashtra 416002"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Free Shipping Min Amount (₹)</label>
                <input
                  type="number"
                  value={storeSettings.freeShippingThreshold}
                  onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })}
                  placeholder="e.g. 2999"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-bold text-[#641B32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Standard Shipping Flat Fee (₹)</label>
                <input
                  type="number"
                  value={storeSettings.standardShippingFee}
                  onChange={(e) => setStoreSettings({ ...storeSettings, standardShippingFee: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Razorpay */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#641B32]">
              <CreditCard className="w-5 h-5" />
              <h3 className="font-heading font-bold text-sm text-[#292323]">
                Razorpay Payment Gateway Integration
              </h3>
            </div>
            <p className="text-neutral-500 text-xs">
              Supports UPI (Google Pay, PhonePe, Paytm), NetBanking, Credit/Debit Cards, and Wallets.
            </p>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpaySettings.keyId}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keyId: e.target.value })}
                  placeholder="e.g. rzp_test_..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Razorpay Key Secret (Server-Only)</label>
                <input
                  type="password"
                  value={razorpaySettings.keySecret}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keySecret: e.target.value })}
                  placeholder="e.g. Enter Razorpay Key Secret"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Webhook Secret (Idempotent Webhooks)</label>
                <input
                  type="password"
                  value={razorpaySettings.webhookSecret}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, webhookSecret: e.target.value })}
                  placeholder="e.g. Enter Webhook Secret"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Environment Mode</label>
                <select
                  value={razorpaySettings.mode}
                  onChange={(e) => setRazorpaySettings({ ...razorpaySettings, mode: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded bg-white"
                >
                  <option value="test">Test Mode (Sandbox / Mock)</option>
                  <option value="live">Live Production Mode</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping & Logistics */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#641B32]">
              <Truck className="w-5 h-5" />
              <h3 className="font-heading font-bold text-sm text-[#292323]">
                Express Delivery & Shipping Logistics
              </h3>
            </div>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Configure free shipping thresholds, integrated courier delivery partners, and Cash on Delivery rules for all 28 Indian states.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={shippingSettings.freeShippingThreshold}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
                  placeholder="2999"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-semibold text-[#641B32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Standard Shipping Fee (₹)
                </label>
                <input
                  type="number"
                  value={shippingSettings.standardShippingFee}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, standardShippingFee: e.target.value })}
                  placeholder="150"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Primary Integrated Courier
              </label>
              <input
                type="text"
                value={shippingSettings.courierPartner}
                onChange={(e) => setShippingSettings({ ...shippingSettings, courierPartner: e.target.value })}
                placeholder="e.g. Blue Dart & Delhivery Express"
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
                <span className="font-semibold text-neutral-800">Enable Cash on Delivery (COD) for Indian PIN Codes</span>
              </label>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <Button type="submit" variant="primary" size="sm" className="bg-[#641B32] hover:bg-[#7B1E35]">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;
