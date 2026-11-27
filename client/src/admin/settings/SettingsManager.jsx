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
  Volume2,
  Video,
  PackageCheck,
  Clock,
  FileText,
  Plus,
  Trash2,
  List,
  BookOpen,
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

const DEFAULT_FOOTER_MENUS = [
  { id: 'track-order', name: 'Track Your Order', href: '/track-order', active: true },
  { id: 'shipping-policy', name: 'Shipping & Delivery Policy', href: '/policies?tab=shipping', active: true },
  { id: 'returns-policy', name: 'No Return & No Exchange Policy', href: '/policies?tab=returns', active: true },
  { id: 'video-booking', name: 'Video Call Shopping Booking', href: '/contact', active: true },
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
    location: 'Shop 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur - 416002',
    phone: '+91 98220 12345',
    email: 'orders@swaradasareecenter.com',
    storeHours: 'Mon - Sun: 10:00 AM - 9:00 PM',
    storeBio:
      'Rooted in the historic city of Kolhapur, Swarada Saree Center celebrates the timeless majesty of Indian handlooms. We curate certified Yeola Paithanis, royal Banarasi brocades, and festive designer apparel.',
    gstin: '27AAAAA0000A1Z5',
    currency: 'INR (₹)',
    freeShippingThreshold: '2999',
    standardShippingFee: '150',
  });

  // Top Announcement Bar & Trust Badges
  const [announcementSettings, setAnnouncementSettings] = useState({
    enabled: true,
    text: '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS • FLAT 10% OFF FIRST ORDER: USE SWARADA10 •',
    ordersBase: '10000',
  });

  // YouTube Live Stream
  const [youtubeSettings, setYoutubeSettings] = useState({
    channelUrl: 'https://www.youtube.com/@swaradasareecentre776/',
    channelId: 'UCOTYLwpl0sy46Tjkvm9OrYQ',
    livestreamUrl: '',
  });

  // Navigation Menus State
  const [menus, setMenus] = useState(DEFAULT_MENUS);

  // Footer Menus & Policies State
  const [footerMenus, setFooterMenus] = useState(DEFAULT_FOOTER_MENUS);
  const [newFooterLink, setNewFooterLink] = useState({ name: '', href: '' });

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

  // Our Story & Heritage Page Customizer
  const [storySettings, setStorySettings] = useState({
    title: 'The Swarada Story',
    subtitle: 'Our Heritage & Roots',
    intro:
      'Nestled in the historic city of Kolhapur, Maharashtra, Swarada Saree Center was established with a singular devotion: to preserve, nurture, and present the richest handloom traditions of India.',
    body:
      'Known affectionately as the city of Mahalaxmi, Kolhapur holds centuries of reverence for auspicious silks. At Swarada, we work closely with generation-old master weaver families across Yeola, Paithan, Varanasi, and Kanchipuram to bring hand-crafted sarees of unmatched authenticity to modern women across the globe.',
    extended:
      'Every drape in our collection carries the signature precision of authentic weavers. From bridal Paithanis featuring delicate peacocks to pure Banarasi zari weaves, we take immense pride in adorning brides and handloom connoisseurs for their most cherished milestones.',
    bannerImage: '',
    artisanImage: '',
    stat1Number: '25+ Years',
    stat1Label: 'Heritage in Kolhapur',
    stat2Number: '50,000+',
    stat2Label: 'Brides & Families Adorned',
    stat3Number: 'Mahadwar Rd',
    stat3Label: 'Flagship Store Location',
    stat4Number: '100%',
    stat4Label: 'Authentic Handlooms',
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
            logoUrl: (map.store_logo_url || '').replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1'),
            phone: map.store_phone || prev.phone,
            email: map.store_email || prev.email,
            location: map.store_address || prev.location,
            storeHours: map.store_hours || prev.storeHours,
            storeBio: map.store_bio || prev.storeBio,
            gstin: map.gst_number || prev.gstin,
            freeShippingThreshold: map.free_shipping_threshold || prev.freeShippingThreshold,
            standardShippingFee: map.standard_shipping_charge || prev.standardShippingFee,
          }));

          setAnnouncementSettings({
            enabled: map.announcement_bar_enabled !== 'false',
            text:
              map.announcement_text ||
              '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS • FLAT 10% OFF FIRST ORDER: USE SWARADA10 •',
            ordersBase: map.orders_delivered_base || '10000',
          });

          setYoutubeSettings({
            channelUrl: map.youtube_channel_url || 'https://www.youtube.com/@swaradasareecentre776/',
            channelId: map.youtube_channel_id || 'UCOTYLwpl0sy46Tjkvm9OrYQ',
            livestreamUrl: map.youtube_livestream_url || '',
          });

          setRazorpaySettings({
            keyId: map.razorpay_key_id || '',
            keySecret: map.razorpay_key_secret || '',
            webhookSecret: map.razorpay_webhook_secret || '',
            mode: map.razorpay_mode || 'test',
          });

          setShippingSettings({
            courierPartner: map.courier_partner || 'Blue Dart & Delhivery Express',
            freeShippingThreshold: map.free_shipping_threshold !== undefined ? map.free_shipping_threshold : '2999',
            standardShippingFee: map.standard_shipping_charge !== undefined ? map.standard_shipping_charge : '150',
            estimatedDeliveryDays: map.estimated_delivery_days || '3 to 5 business days',
            codAvailable: map.cod_enabled !== 'false',
          });

          setStorySettings({
            title: map.story_title || 'The Swarada Story',
            subtitle: map.story_subtitle || 'Our Heritage & Roots',
            intro:
              map.story_intro ||
              'Nestled in the historic city of Kolhapur, Maharashtra, Swarada Saree Center was established with a singular devotion: to preserve, nurture, and present the richest handloom traditions of India.',
            body:
              map.story_body ||
              'Known affectionately as the city of Mahalaxmi, Kolhapur holds centuries of reverence for auspicious silks. At Swarada, we work closely with generation-old master weaver families across Yeola, Paithan, Varanasi, and Kanchipuram to bring hand-crafted sarees of unmatched authenticity to modern women across the globe.',
            extended:
              map.story_extended ||
              'Every drape in our collection carries the signature precision of authentic weavers. From bridal Paithanis featuring delicate peacocks to pure Banarasi zari weaves, we take immense pride in adorning brides and handloom connoisseurs for their most cherished milestones.',
            bannerImage: (map.story_banner_image || '').replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1'),
            artisanImage: (map.story_artisan_image || '').replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1'),
            stat1Number: map.story_stat1_number || '25+ Years',
            stat1Label: map.story_stat1_label || 'Heritage in Kolhapur',
            stat2Number: map.story_stat2_number || '50,000+',
            stat2Label: map.story_stat2_label || 'Brides & Families Adorned',
            stat3Number: map.story_stat3_number || 'Mahadwar Rd',
            stat3Label: map.story_stat3_label || 'Flagship Store Location',
            stat4Number: map.story_stat4_number || '100%',
            stat4Label: map.story_stat4_label || 'Authentic Handlooms',
          });

          if (map.nav_menus) {
            try {
              const parsed = JSON.parse(map.nav_menus);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setMenus(parsed);
              }
            } catch (e) {}
          }

          if (map.footer_menus) {
            try {
              const parsed = JSON.parse(map.footer_menus);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setFooterMenus(parsed);
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

  const toggleFooterMenu = (index) => {
    setFooterMenus((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        active: !updated[index].active,
      };
      return updated;
    });
  };

  const handleAddFooterLink = () => {
    if (!newFooterLink.name.trim() || !newFooterLink.href.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: newFooterLink.name.trim(),
      href: newFooterLink.href.trim(),
      active: true,
    };
    setFooterMenus((prev) => [...prev, newItem]);
    setNewFooterLink({ name: '', href: '' });
  };

  const handleDeleteFooterLink = (index) => {
    setFooterMenus((prev) => prev.filter((_, idx) => idx !== index));
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
        store_hours: storeSettings.storeHours,
        store_bio: storeSettings.storeBio,
        gst_number: storeSettings.gstin,
        free_shipping_threshold: storeSettings.freeShippingThreshold,
        standard_shipping_charge: storeSettings.standardShippingFee,
        cod_enabled: shippingSettings.codAvailable ? 'true' : 'false',
        courier_partner: shippingSettings.courierPartner || 'Delhivery Express',
        estimated_delivery_days: shippingSettings.estimatedDeliveryDays || '3 to 5 business days',
        announcement_bar_enabled: announcementSettings.enabled ? 'true' : 'false',
        announcement_text: announcementSettings.text,
        orders_delivered_base: announcementSettings.ordersBase,
        youtube_channel_url: youtubeSettings.channelUrl,
        youtube_channel_id: youtubeSettings.channelId,
        youtube_livestream_url: youtubeSettings.livestreamUrl,
        nav_menus: JSON.stringify(menus),
        footer_menus: JSON.stringify(footerMenus),
        razorpay_key_id: razorpaySettings.keyId?.trim() || '',
        razorpay_key_secret: razorpaySettings.keySecret?.trim() || '',
        razorpay_webhook_secret: razorpaySettings.webhookSecret?.trim() || '',
        razorpay_mode: razorpaySettings.mode || 'test',
        story_title: storySettings.title,
        story_subtitle: storySettings.subtitle,
        story_intro: storySettings.intro,
        story_body: storySettings.body,
        story_extended: storySettings.extended,
        story_banner_image: storySettings.bannerImage,
        story_artisan_image: storySettings.artisanImage,
        story_stat1_number: storySettings.stat1Number,
        story_stat1_label: storySettings.stat1Label,
        story_stat2_number: storySettings.stat2Number,
        story_stat2_label: storySettings.stat2Label,
        story_stat3_number: storySettings.stat3Number,
        story_stat3_label: storySettings.stat3Label,
        story_stat4_number: storySettings.stat4Number,
        story_stat4_label: storySettings.stat4Label,
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
          Store Settings & Merchandising
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage header marquee, footer policies/menus, YouTube live streaming, order counter, shop details, and branding
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully updated across storefront!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <X className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'general'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          General & Shop Details
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'announcement'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Header Marquee & Orders Counter
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'youtube'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          YouTube Live Showcase
        </button>

        <button
          onClick={() => setActiveTab('menus')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'menus'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Storefront Menus
        </button>

        <button
          onClick={() => setActiveTab('footer-menus')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'footer-menus'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Footer Menus & Policies
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Razorpay Gateway
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Shipping & Logistics
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'story'
              ? 'bg-white text-[#641B32] border-t-2 border-l border-r border-[#641B32] font-semibold -mb-px'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Our Story & Heritage Page
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6 text-xs">
        {/* Tab 1: General & Shop Details */}
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
                    Upload your official brand logo. Replaces plain text brand name on header and footer.
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
                      src={storeSettings.logoUrl?.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1')}
                      alt="Logo Preview"
                      className="h-10 max-w-[140px] object-contain border border-neutral-100 p-1 rounded bg-neutral-50"
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
              Store Identity, Location & Operating Hours
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

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">About Store / Footer Bio</label>
                <textarea
                  rows={3}
                  value={storeSettings.storeBio}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeBio: e.target.value })}
                  placeholder="Write your brand legacy narrative for the footer..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Flagship Store Address</label>
                <input
                  type="text"
                  value={storeSettings.location}
                  onChange={(e) => setStoreSettings({ ...storeSettings, location: e.target.value })}
                  placeholder="e.g. Shop 12, Mahadwar Road, Kolhapur"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Store Hours</label>
                <input
                  type="text"
                  value={storeSettings.storeHours}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeHours: e.target.value })}
                  placeholder="e.g. Mon - Sun: 10:00 AM - 9:00 PM"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
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
                  placeholder="e.g. orders@swaradasareecenter.com"
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
            </div>
          </div>
        )}

        {/* Tab 2: Header Marquee & Orders Counter */}
        {activeTab === 'announcement' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#641B32] flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Top Scrolling Marquee Announcement Bar</span>
                  </h3>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Continuous scrolling text strip displayed at the very top of every page.
                  </p>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementSettings.enabled}
                    onChange={(e) =>
                      setAnnouncementSettings({ ...announcementSettings, enabled: e.target.checked })
                    }
                    className="rounded text-[#641B32] focus:ring-[#641B32]"
                  />
                  <span className="font-semibold text-xs text-neutral-700">Enable Marquee</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Announcement Text</label>
                <textarea
                  rows={3}
                  value={announcementSettings.text}
                  onChange={(e) =>
                    setAnnouncementSettings({ ...announcementSettings, text: e.target.value })
                  }
                  placeholder="e.g. • NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS •"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono text-xs"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Tip: Separate messages with bullets (•) or stars (★) for clear scrolling readability.
                </p>
              </div>
            </div>

            {/* Total Orders Delivered Counter */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-lg space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#0D5C46] flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Total Orders Delivered Trust Counter</span>
              </h3>
              <p className="text-[11px] text-neutral-600">
                Displayed in the footer and homepage trust badges (e.g. 10,000+ Orders Delivered). This automatically increments on every completed order.
              </p>

              <div className="max-w-xs">
                <label className="block font-semibold text-neutral-700 mb-1">Starting Base Count</label>
                <input
                  type="number"
                  value={announcementSettings.ordersBase}
                  onChange={(e) =>
                    setAnnouncementSettings({ ...announcementSettings, ordersBase: e.target.value })
                  }
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-bold text-[#0D5C46]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: YouTube Live */}
        {activeTab === 'youtube' && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
              <Video className="w-4 h-4 text-red-600" />
              <span>YouTube Channel & Live Showcase Integration</span>
            </h3>
            <p className="text-[11px] text-neutral-500">
              Link your official YouTube channel. The website automatically fetches your latest broadcast from your channel feed.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Official YouTube Channel URL</label>
                <input
                  type="text"
                  value={youtubeSettings.channelUrl}
                  onChange={(e) => setYoutubeSettings({ ...youtubeSettings, channelUrl: e.target.value })}
                  placeholder="https://www.youtube.com/@swaradasareecentre776/"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">YouTube Channel ID (Internal)</label>
                <input
                  type="text"
                  value={youtubeSettings.channelId}
                  onChange={(e) => setYoutubeSettings({ ...youtubeSettings, channelId: e.target.value })}
                  placeholder="UCOTYLwpl0sy46Tjkvm9OrYQ"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Custom / Direct Live Video Link (Optional Override)
                </label>
                <input
                  type="text"
                  value={youtubeSettings.livestreamUrl}
                  onChange={(e) => setYoutubeSettings({ ...youtubeSettings, livestreamUrl: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/watch?v=... (Leave blank to use automatic channel feed)"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  When left blank, the platform automatically streams your channel's latest live or recorded video.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Navigation Menus Toggle Center */}
        {activeTab === 'menus' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
                  <MenuIcon className="w-4 h-4 text-[#641B32]" />
                  <span>Storefront Navigation Menu Visibility</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Toggle menu items on or off. Only active menu pages will be displayed on the top navigation bar.
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

        {/* Tab 5: Footer Menus & Policies (Admin Configurable) */}
        {activeTab === 'footer-menus' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
                  <List className="w-4 h-4 text-[#641B32]" />
                  <span>Footer Customer Care, Policies & Menus</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Control the links displayed under "Customer Care & Policies" in the footer. Toggle visibility or add your own custom links.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#641B32]/10 text-[#641B32] rounded">
                {footerMenus.filter((m) => m.active).length} of {footerMenus.length} Active
              </span>
            </div>

            {/* List of current footer links */}
            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
              {footerMenus.map((link, idx) => (
                <div
                  key={link.id || link.name}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    link.active ? 'bg-white' : 'bg-neutral-50/70 opacity-75'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        link.active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {link.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#292323]">{link.name}</span>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{link.href}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        link.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {link.active ? 'Active' : 'Disabled'}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleFooterMenu(idx)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        link.active ? 'bg-[#641B32]' : 'bg-neutral-300'
                      }`}
                      role="switch"
                      aria-checked={link.active}
                      aria-label={`Toggle ${link.name} footer link`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          link.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Delete Custom Link */}
                    {link.id?.startsWith('custom-') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFooterLink(idx)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove custom link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Footer Link Section */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
              <h4 className="font-heading font-bold text-xs text-[#292323] flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-[#641B32]" />
                <span>Add New Footer Link / Policy</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Link Title / Label
                  </label>
                  <input
                    type="text"
                    value={newFooterLink.name}
                    onChange={(e) => setNewFooterLink({ ...newFooterLink, name: e.target.value })}
                    placeholder="e.g. Terms of Service, Size Guide, Wholesale"
                    className="w-full px-3 py-2 border border-neutral-200 rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    URL or Path
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newFooterLink.href}
                      onChange={(e) => setNewFooterLink({ ...newFooterLink, href: e.target.value })}
                      placeholder="e.g. /terms or https://..."
                      className="w-full px-3 py-2 border border-neutral-200 rounded bg-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddFooterLink}
                      className="bg-[#641B32] hover:bg-[#851C3B] text-white px-4 py-2 rounded font-semibold text-xs shrink-0 cursor-pointer transition-colors"
                    >
                      Add Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Razorpay */}
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
              Enter your official Razorpay Test Key ID & Key Secret below to process real test cards and UPI.
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

        {/* Tab 7: Shipping & Logistics */}
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

            <div className="pt-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-neutral-800 text-xs block">
                    Cash on Delivery (COD) Payment Option
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    When enabled, customers can choose COD at checkout. When disabled, only Razorpay online payment is offered.
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      shippingSettings.codAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {shippingSettings.codAvailable ? 'COD ACTIVE' : 'COD DISABLED'}
                  </span>
                  <input
                    type="checkbox"
                    checked={shippingSettings.codAvailable}
                    onChange={(e) =>
                      setShippingSettings({ ...shippingSettings, codAvailable: e.target.checked })
                    }
                    className="w-5 h-5 rounded text-[#641B32] focus:ring-[#641B32] cursor-pointer"
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 8: Our Story & Heritage Customizer */}
        {activeTab === 'story' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#292323] flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#C5A05A]" />
                  <span>Our Story & Kolhapur Heritage Page Customizer</span>
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Customize the text, photos, milestones, and brand narrative shown on the public /about page.
                </p>
              </div>
            </div>

            {/* Story Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Page Headline / Title
                </label>
                <input
                  type="text"
                  value={storySettings.title}
                  onChange={(e) => setStorySettings({ ...storySettings, title: e.target.value })}
                  placeholder="e.g. The Swarada Story"
                  className="w-full px-3 py-2 border border-neutral-200 rounded font-semibold text-neutral-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Badge / Subtitle Tagline
                </label>
                <input
                  type="text"
                  value={storySettings.subtitle}
                  onChange={(e) => setStorySettings({ ...storySettings, subtitle: e.target.value })}
                  placeholder="e.g. Our Heritage & Roots"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>
            </div>

            {/* Photos Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-[#FFFDF9] border border-[#D4AF37]/30 rounded-xl">
              <div>
                <label className="block font-semibold text-[#641B32] mb-1">
                  Flagship Store / Boutique Photo
                </label>
                <p className="text-[10px] text-neutral-500 mb-2">
                  Hero photo showcasing your Kolhapur boutique or grand storefront.
                </p>
                <ImageUploader
                  value={storySettings.bannerImage}
                  onChange={(url) => setStorySettings({ ...storySettings, bannerImage: url })}
                  aspectRatio="video"
                  placeholder="Upload Storefront Image"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#641B32] mb-1">
                  Handloom Artisan / Weaving Photo
                </label>
                <p className="text-[10px] text-neutral-500 mb-2">
                  Photo celebrating authentic handloom weaving or boutique silk displays.
                </p>
                <ImageUploader
                  value={storySettings.artisanImage}
                  onChange={(url) => setStorySettings({ ...storySettings, artisanImage: url })}
                  aspectRatio="video"
                  placeholder="Upload Artisan / Weaving Image"
                />
              </div>
            </div>

            {/* Story Narrative Paragraphs */}
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Opening Story Paragraph (Paragraph 1)
                </label>
                <textarea
                  rows={3}
                  value={storySettings.intro}
                  onChange={(e) => setStorySettings({ ...storySettings, intro: e.target.value })}
                  placeholder="Describe how Swarada Saree Center was founded in Kolhapur..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Master Weavers & Craftsmanship (Paragraph 2)
                </label>
                <textarea
                  rows={3}
                  value={storySettings.body}
                  onChange={(e) => setStorySettings({ ...storySettings, body: e.target.value })}
                  placeholder="Describe your master weavers, Paithani, Banarasi, and silk heritage..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Extended Narrative & Brand Philosophy (Paragraph 3 - Optional)
                </label>
                <textarea
                  rows={3}
                  value={storySettings.extended}
                  onChange={(e) => setStorySettings({ ...storySettings, extended: e.target.value })}
                  placeholder="Additional details about your bridal curation, wedding collections, or service..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded leading-relaxed text-xs"
                />
              </div>
            </div>

            {/* 4 Highlight Milestone Cards */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <h4 className="font-bold text-neutral-800 text-xs">
                Key Milestones & Highlight Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#641B32] uppercase">Metric 1</span>
                  <input
                    type="text"
                    value={storySettings.stat1Number}
                    onChange={(e) => setStorySettings({ ...storySettings, stat1Number: e.target.value })}
                    placeholder="e.g. 25+ Years"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={storySettings.stat1Label}
                    onChange={(e) => setStorySettings({ ...storySettings, stat1Label: e.target.value })}
                    placeholder="e.g. Heritage in Kolhapur"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-[11px]"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#641B32] uppercase">Metric 2</span>
                  <input
                    type="text"
                    value={storySettings.stat2Number}
                    onChange={(e) => setStorySettings({ ...storySettings, stat2Number: e.target.value })}
                    placeholder="e.g. 50,000+"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={storySettings.stat2Label}
                    onChange={(e) => setStorySettings({ ...storySettings, stat2Label: e.target.value })}
                    placeholder="e.g. Brides & Families Adorned"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-[11px]"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#641B32] uppercase">Metric 3</span>
                  <input
                    type="text"
                    value={storySettings.stat3Number}
                    onChange={(e) => setStorySettings({ ...storySettings, stat3Number: e.target.value })}
                    placeholder="e.g. Mahadwar Rd"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={storySettings.stat3Label}
                    onChange={(e) => setStorySettings({ ...storySettings, stat3Label: e.target.value })}
                    placeholder="e.g. Flagship Store Location"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-[11px]"
                  />
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#641B32] uppercase">Metric 4</span>
                  <input
                    type="text"
                    value={storySettings.stat4Number}
                    onChange={(e) => setStorySettings({ ...storySettings, stat4Number: e.target.value })}
                    placeholder="e.g. 100%"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={storySettings.stat4Label}
                    onChange={(e) => setStorySettings({ ...storySettings, stat4Label: e.target.value })}
                    placeholder="e.g. Authentic Handlooms"
                    className="w-full px-2 py-1 border border-neutral-200 rounded text-[11px]"
                  />
                </div>
              </div>
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
