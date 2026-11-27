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
  { id: 'about', name: 'Our Story', href: '/about', active: true },
];

const DEFAULT_FOOTER_MENUS = [
  { id: 'track-order', name: 'Track Your Order', href: '/track-order', active: true },
  { id: 'shipping-policy', name: 'Shipping & Delivery Policy', href: '/policies?tab=shipping', active: true },
  { id: 'returns-policy', name: 'No Return & No Exchange Policy', href: '/policies?tab=returns', active: true },
  { id: 'video-booking', name: 'Video Call Shopping Booking', href: '/contact', active: true },
];

const DEFAULT_ANNOUNCEMENT =
  '• NEW ARRIVALS • FREE SHIPPING ON ORDERS ABOVE ₹999 • 100% AUTHENTIC PRODUCTS • SECURE PAYMENTS • FLAT 10% OFF FIRST ORDER: USE SWARADA10 •';

const sanitizeUploadUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/^https?:\/\/[^/]+(\/uploads\/)/i, '$1');
};

// In-memory cache for YouTube latest feed (cache for 10 minutes)
let youtubeCache = {
  data: null,
  timestamp: 0,
};

/**
 * Public Settings (Storefront identity, logo, active menus, contacts, announcement, orders count, footer menus)
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

  if (Array.isArray(menus)) {
    menus = menus.map((m) =>
      m.id === 'about' && (m.name === 'Our Kolhapur Story' || m.name === 'Our story')
        ? { ...m, name: 'Our Story' }
        : m
    );
  }

  let footerMenus = DEFAULT_FOOTER_MENUS;
  if (map.footer_menus) {
    try {
      footerMenus = JSON.parse(map.footer_menus);
    } catch (e) {
      footerMenus = DEFAULT_FOOTER_MENUS;
    }
  }

  // Calculate dynamic delivered orders count starting from 10,000 + actual orders
  const baseDelivered = parseInt(map.orders_delivered_base, 10) || 10000;
  let orderCount = 0;
  try {
    orderCount = await prisma.order.count({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    });
  } catch (err) {
    console.warn('Could not count orders for public settings:', err.message);
  }
  const ordersDeliveredCount = baseDelivered + orderCount;

  res.json({
    success: true,
    data: {
      storeName: map.store_name || 'Swarada Saree Center',
      tagline: map.store_tagline || "Kolhapur's Destination for Premium Sarees & Ethnic Fashion",
      logoUrl: sanitizeUploadUrl(map.store_logo_url) || null,
      phone: map.store_phone || '+91 98220 12345',
      whatsapp: map.store_whatsapp || '+91 98220 12345',
      email: map.store_email || 'orders@swaradasareecenter.com',
      address: map.store_address || 'Shop 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur - 416002',
      storeHours: map.store_hours || 'Mon - Sun: 10:00 AM - 9:00 PM',
      storeBio:
        map.store_bio ||
        'Rooted in the historic city of Kolhapur, Swarada Saree Center celebrates the timeless majesty of Indian handlooms. We curate certified Yeola Paithanis, royal Banarasi brocades, and festive designer apparel.',
      freeShippingThreshold:
        map.free_shipping_threshold !== undefined && !isNaN(parseFloat(map.free_shipping_threshold))
          ? parseFloat(map.free_shipping_threshold)
          : 2999,
      standardShippingFee:
        map.standard_shipping_charge !== undefined && !isNaN(parseFloat(map.standard_shipping_charge))
          ? parseFloat(map.standard_shipping_charge)
          : 150,
      codEnabled: map.cod_enabled !== 'false',
      courierPartner: map.courier_partner || 'Delhivery Express',
      announcementBarEnabled: map.announcement_bar_enabled !== 'false',
      announcementText: map.announcement_text || DEFAULT_ANNOUNCEMENT,
      ordersDeliveredCount,
      ordersDeliveredBase: baseDelivered,
      youtubeChannelUrl: map.youtube_channel_url || 'https://www.youtube.com/@swaradasareecentre776/',
      youtubeChannelId: map.youtube_channel_id || 'UCOTYLwpl0sy46Tjkvm9OrYQ',
      youtubeLivestreamUrl: map.youtube_livestream_url || '',
      socialInstagram: map.social_instagram || 'https://www.instagram.com/swarada_saree_center/',
      socialFacebook: map.social_facebook || 'https://www.facebook.com/swaradsareecenter',
      socialYoutube: map.social_youtube || 'https://www.youtube.com/@swaradasareecentre776/',
      // Our Story & Heritage Customizer
      storyTitle: map.story_title || 'The Swarada Story',
      storySubtitle: map.story_subtitle || 'Our Heritage & Roots',
      storyIntro:
        map.story_intro ||
        'Nestled in the historic city of Kolhapur, Maharashtra, Swarada Saree Center was established with a singular devotion: to preserve, nurture, and present the richest handloom traditions of India.',
      storyBody:
        map.story_body ||
        'Known affectionately as the city of Mahalaxmi, Kolhapur holds centuries of reverence for auspicious silks. At Swarada, we work closely with generation-old master weaver families across Yeola, Paithan, Varanasi, and Kanchipuram to bring hand-crafted sarees of unmatched authenticity to modern women across the globe.',
      storyExtended:
        map.story_extended ||
        'Every drape in our collection carries the signature precision of authentic weavers. From bridal Paithanis featuring delicate peacocks to pure Banarasi zari weaves, we take immense pride in adorning brides and handloom connoisseurs for their most cherished milestones.',
      storyBannerImage: sanitizeUploadUrl(map.story_banner_image) || null,
      storyArtisanImage: sanitizeUploadUrl(map.story_artisan_image) || null,
      storyStat1Number: map.story_stat1_number || '25+ Years',
      storyStat1Label: map.story_stat1_label || 'Heritage in Kolhapur',
      storyStat2Number: map.story_stat2_number || '50,000+',
      storyStat2Label: map.story_stat2_label || 'Brides & Families Adorned',
      storyStat3Number: map.story_stat3_number || 'Mahadwar Rd',
      storyStat3Label: map.story_stat3_label || 'Flagship Store Location',
      storyStat4Number: map.story_stat4_number || '100%',
      storyStat4Label: map.story_stat4_label || 'Authentic Handlooms',
      menus,
      footerMenus,
    },
  });
});

/**
 * Fetch latest YouTube livestream / latest video from channel RSS feed
 */
const getYouTubeLiveInfo = catchAsync(async (req, res) => {
  const channelId = req.query.channelId || 'UCOTYLwpl0sy46Tjkvm9OrYQ';
  const now = Date.now();

  if (youtubeCache.data && now - youtubeCache.timestamp < 10 * 60 * 1000) {
    return res.json({
      success: true,
      data: youtubeCache.data,
      cached: true,
    });
  }

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!response.ok) {
      throw new Error(`YouTube RSS returned status ${response.status}`);
    }

    const xml = await response.text();
    const videoMatches = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)];
    const titleMatches = [...xml.matchAll(/<title>([^<]+)<\/title>/g)];

    const latestVideoId = videoMatches.length > 0 ? videoMatches[0][1] : 'ztDEvXrLaR4';
    const latestTitle = titleMatches.length > 1 ? titleMatches[1][1] : 'Latest Live Showcase';

    const result = {
      channelId,
      latestVideoId,
      latestTitle,
      liveEmbedUrl: `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}`,
      videoEmbedUrl: `https://www.youtube-nocookie.com/embed/${latestVideoId}`,
      channelUrl: 'https://www.youtube.com/@swaradasareecentre776/',
      isLiveConfigured: true,
    };

    youtubeCache = {
      data: result,
      timestamp: now,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.warn('Failed to fetch YouTube RSS, using fallback:', err.message);
    const fallback = {
      channelId,
      latestVideoId: 'ztDEvXrLaR4',
      latestTitle: 'Swarada Saree Center Live Showcase',
      liveEmbedUrl: `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}`,
      videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/ztDEvXrLaR4',
      channelUrl: 'https://www.youtube.com/@swaradasareecentre776/',
      isLiveConfigured: true,
    };
    res.json({
      success: true,
      data: fallback,
      fallback: true,
    });
  }
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

  if (map.store_logo_url) {
    map.store_logo_url = sanitizeUploadUrl(map.store_logo_url);
  }

  if (!map.nav_menus) {
    map.nav_menus = JSON.stringify(DEFAULT_MENUS);
  }

  if (!map.footer_menus) {
    map.footer_menus = JSON.stringify(DEFAULT_FOOTER_MENUS);
  }

  if (!map.announcement_text) {
    map.announcement_text = DEFAULT_ANNOUNCEMENT;
  }

  if (!map.announcement_bar_enabled) {
    map.announcement_bar_enabled = 'true';
  }

  if (!map.orders_delivered_base) {
    map.orders_delivered_base = '10000';
  }

  if (!map.youtube_channel_url) {
    map.youtube_channel_url = 'https://www.youtube.com/@swaradasareecentre776/';
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
  const updates = req.body;

  if (updates.store_logo_url) {
    updates.store_logo_url = sanitizeUploadUrl(updates.store_logo_url);
  }
  if (updates.story_banner_image) {
    updates.story_banner_image = sanitizeUploadUrl(updates.story_banner_image);
  }
  if (updates.story_artisan_image) {
    updates.story_artisan_image = sanitizeUploadUrl(updates.story_artisan_image);
  }

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

  if (map.store_logo_url) {
    map.store_logo_url = sanitizeUploadUrl(map.store_logo_url);
  }

  res.json({
    success: true,
    message: 'Settings updated successfully.',
    data: map,
  });
});

module.exports = {
  getPublicSettings,
  getYouTubeLiveInfo,
  getAdminSettings,
  updateSettings,
};
