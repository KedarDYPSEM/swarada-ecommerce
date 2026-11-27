import React, { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminService';

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
  { id: 'about', name: 'Our Story', href: '/about', active: true },
];

const CACHE_KEY = 'swarada_public_settings_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const SettingsContext = createContext({
  settings: {
    storeName: 'Swarada Saree Center',
    logoUrl: null,
    menus: DEFAULT_MENUS,
  },
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) {
          return parsed.data;
        }
      }
    } catch (e) {}
    return {
      storeName: 'Swarada Saree Center',
      logoUrl: null,
      menus: DEFAULT_MENUS,
    };
  });

  const fetchSettings = async (force = false) => {
    if (!force) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS)) {
            return; // Cache is fresh, skip network request entirely
          }
        }
      } catch (e) {}
    }

    try {
      const res = await adminService.getPublicSettings();
      if (res && res.data) {
        const rawLogo = res.data.logoUrl || '';
        const normalizedLogo = rawLogo ? rawLogo.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1') : null;
        const newSettings = {
          ...res.data,
          logoUrl: normalizedLogo,
          menus: res.data.menus && res.data.menus.length > 0 ? res.data.menus : DEFAULT_MENUS,
        };
        setSettings(newSettings);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: newSettings,
            timestamp: Date.now(),
          }));
        } catch (e) {}
      }
    } catch (err) {
      // Graceful fallback to defaults
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Dynamically synchronize favicon with logo uploaded from Admin Panel
  useEffect(() => {
    if (settings?.logoUrl) {
      try {
        const rawUrl = settings.logoUrl;
        const cleanUrl = rawUrl.startsWith('http')
          ? rawUrl
          : rawUrl.startsWith('/')
          ? rawUrl
          : `/${rawUrl}`;
        const cacheBusted = cleanUrl.includes('?')
          ? `${cleanUrl}&v=${encodeURIComponent(rawUrl)}`
          : `${cleanUrl}?v=${encodeURIComponent(rawUrl)}`;

        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.type = 'image/x-icon';
        link.href = cacheBusted;

        let appleTouch = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleTouch) {
          appleTouch = document.createElement('link');
          appleTouch.rel = 'apple-touch-icon';
          document.getElementsByTagName('head')[0].appendChild(appleTouch);
        }
        appleTouch.href = cacheBusted;
      } catch (e) {
        // Silently preserve standard favicon
      }
    }
  }, [settings?.logoUrl]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: () => fetchSettings(true) }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
