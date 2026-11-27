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

export const SettingsContext = createContext({
  settings: {
    storeName: 'Swarada Saree Center',
    logoUrl: null,
    menus: DEFAULT_MENUS,
  },
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Swarada Saree Center',
    logoUrl: null,
    menus: DEFAULT_MENUS,
  });

  const fetchSettings = async () => {
    try {
      const res = await adminService.getPublicSettings();
      if (res && res.data) {
        const rawLogo = res.data.logoUrl || '';
        const normalizedLogo = rawLogo ? rawLogo.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1') : null;
        setSettings({
          ...res.data,
          logoUrl: normalizedLogo,
          menus: res.data.menus && res.data.menus.length > 0 ? res.data.menus : DEFAULT_MENUS,
        });
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

        // Remove existing icon links to force browser to refresh tab icon
        const existingIcons = document.querySelectorAll(
          "link[rel*='icon'], link[rel='apple-touch-icon']"
        );
        existingIcons.forEach((el) => el.parentNode?.removeChild(el));

        // Create fresh icon link elements
        const icon = document.createElement('link');
        icon.rel = 'icon';
        icon.type = 'image/png';
        icon.href = cacheBusted;
        document.head.appendChild(icon);

        const shortcut = document.createElement('link');
        shortcut.rel = 'shortcut icon';
        shortcut.type = 'image/png';
        shortcut.href = cacheBusted;
        document.head.appendChild(shortcut);

        const apple = document.createElement('link');
        apple.rel = 'apple-touch-icon';
        apple.href = cleanUrl;
        document.head.appendChild(apple);
      } catch (e) {
        console.warn('Favicon synchronization error:', e);
      }
    }
  }, [settings?.logoUrl]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
