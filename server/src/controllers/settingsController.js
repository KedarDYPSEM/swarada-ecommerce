const prisma = require('../config/database');
const { catchAsync } = require('../middleware/errorHandler');

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

/**
 * Public Settings (Storefront identity, logo, active menus, contacts)
 */
const getPublicSettings = catchAsync(async (req, res) => {
  const settings = await prisma.setting.findMany();
  const map = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });

  let menus = DEFAULT_MENUS;
  if (map.nav_menus) {
    try {
      menus = JSON.parse(map.nav_menus);
    } catch (e) {
      menus = DEFAULT_MENUS;
    }
  }

  res.json({
    success: true,
    data: {
      storeName: map.store_name || 'Swarada Saree Center',
      tagline: map.store_tagline || "Kolhapur's Destination for Premium Sarees",
      logoUrl: map.store_logo_url || null,
      phone: map.store_phone || '+91 98220 12345',
      whatsapp: map.store_whatsapp || '+91 98220 12345',
      email: map.store_email || 'contact@swaradasarees.com',
      address: map.store_address || 'Mahadwar Road, Kolhapur',
      freeShippingThreshold: parseFloat(map.free_shipping_threshold) || 2999,
      standardShippingFee: parseFloat(map.standard_shipping_charge) || 150,
      announcementText: map.announcement_text || '',
      menus,
    },
  });
});

/**
 * Admin Settings (Full key-value view)
 */
const getAdminSettings = catchAsync(async (req, res) => {
  const settings = await prisma.setting.findMany();
  const map = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });

  if (!map.nav_menus) {
    map.nav_menus = JSON.stringify(DEFAULT_MENUS);
  }

  res.json({
    success: true,
    data: map,
  });
});

/**
 * Update Settings (Bulk upsert)
 */
const updateSettings = catchAsync(async (req, res) => {
  const updates = req.body; // e.g. { store_logo_url: '...', nav_menus: '...', ... }

  const operations = Object.entries(updates).map(([key, value]) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    return prisma.setting.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });
  });

  await prisma.$transaction(operations);

  const updatedSettings = await prisma.setting.findMany();
  const map = {};
  updatedSettings.forEach((s) => {
    map[s.key] = s.value;
  });

  res.json({
    success: true,
    message: 'Settings updated successfully.',
    data: map,
  });
});

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
};
