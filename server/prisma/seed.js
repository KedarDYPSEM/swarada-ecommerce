const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Swarada Saree Center...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.integrationLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.paymentWebhook.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.couponUsage.deleteMany({});
  await prisma.couponProduct.deleteMany({});
  await prisma.couponCategory.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.productReview.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.customerAddress.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.setting.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Seed Users
  const adminPassword = await hashPassword('Admin@123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@swarada.com',
      phone: '+919822012345',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Swarada',
          lastName: 'Admin',
          displayName: 'Swarada Saree Center Admin',
          gender: 'FEMALE',
        },
      },
    },
  });

  const customerPassword = await hashPassword('Customer@123');
  const customer = await prisma.user.create({
    data: {
      email: 'ananya.joshi@example.com',
      phone: '+919850123456',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Ananya',
          lastName: 'Joshi',
          displayName: 'Ananya Joshi',
          gender: 'FEMALE',
        },
      },
      addresses: {
        create: [
          {
            label: 'Home',
            fullName: 'Ananya Joshi',
            phone: '+919850123456',
            addressLine1: 'Plot 42, Rajarampuri 5th Lane',
            addressLine2: 'Near Mahalaxmi Temple Area',
            landmark: 'Opposite Bank of Maharashtra',
            city: 'Kolhapur',
            state: 'Maharashtra',
            pincode: '416008',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('👤 Users seeded (Admin & Customer).');

  // 3. Seed Categories
  const sareesCat = await prisma.category.create({
    data: {
      name: 'Sarees',
      slug: 'sarees',
      description: 'Handcrafted authentic Maharashtrian Paithani, Banarasi Silk, Kanjivaram, and Nauvari Sarees.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
      isActive: true,
    },
  });

  const paithaniSub = await prisma.category.create({
    data: {
      name: 'Paithani Sarees',
      slug: 'paithani-sarees',
      parentId: sareesCat.id,
      description: 'Heritage Yeola & Munigala Paithani with authentic peacock pallu and rich gold zari borders.',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      displayOrder: 1,
      isActive: true,
    },
  });

  const banarasiSub = await prisma.category.create({
    data: {
      name: 'Banarasi Silk',
      slug: 'banarasi-silk',
      parentId: sareesCat.id,
      description: 'Royal Banarasi silk sarees with intricate brocade and floral jaal work.',
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
      isActive: true,
    },
  });

  const nauvariSub = await prisma.category.create({
    data: {
      name: 'Nauvari Sarees',
      slug: 'nauvari-sarees',
      parentId: sareesCat.id,
      description: 'Traditional 9-yard Maharashtrian Kashta sarees for weddings and festive grandeur.',
      imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
      isActive: true,
    },
  });

  const dressesCat = await prisma.category.create({
    data: {
      name: 'Dresses',
      slug: 'dresses',
      description: 'Designer festive gowns, Anarkali suits, and Indo-western ethnic wear.',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      displayOrder: 2,
      isActive: true,
    },
  });

  const kurtisCat = await prisma.category.create({
    data: {
      name: 'Kurtis',
      slug: 'kurtis',
      description: 'Elegant straight-cut, flared, and Chanderi kurtis crafted with fine embroidery.',
      imageUrl: 'https://images.unsplash.com/photo-1596783049187-57351606bb40?auto=format&fit=crop&w=800&q=80',
      displayOrder: 3,
      isActive: true,
    },
  });

  const handbagsCat = await prisma.category.create({
    data: {
      name: 'Handbags',
      slug: 'handbags',
      description: 'Handcrafted Zardozi potli bags, embellished ethnic clutches, and tote bags.',
      imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
      displayOrder: 4,
      isActive: true,
    },
  });

  const accessoriesCat = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Traditional Kolhapuri Saaj inspired jewellery, temple brooches, and designer dupattas.',
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      displayOrder: 5,
      isActive: true,
    },
  });

  console.log('📁 Categories seeded.');

  // 4. Products Data
  const sampleProducts = [
    {
      name: 'Maharani Yeola Pure Silk Paithani Saree in Royal Maroon',
      slug: 'maharani-yeola-pure-silk-paithani-saree-royal-maroon',
      sku: 'S7B3',
      barcode: 'SW-890123001',
      description: 'Handwoven in pure mulberry silk with rich Tested Gold Zari. Features an elaborate Mayur (Peacock) and Asawali motif on the heavy pallu with signature Narali borders. A timeless heirloom piece from Swarada Saree Center.',
      shortDescription: 'Pure Silk Yeola Paithani in Regal Maroon with Gold Zari Mor Pallu.',
      mrp: 18500.00,
      sellingPrice: 14999.00,
      purchasePrice: 9800.00,
      gstRate: 5.00,
      fabric: 'Pure Mulberry Silk',
      colour: 'Royal Maroon & Antique Gold',
      sareeLength: '6.3 Meters (Includes 0.8m Blouse Piece)',
      blouseDetails: 'Unstitched Running Brocade Silk Blouse Piece with Zari Border',
      washingInstructions: 'Strictly Dry Clean Only. Store wrapped in pure cotton or muslin cloth.',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      stockQuantity: 12,
      lowStockThreshold: 3,
      categoryIds: [sareesCat.id, paithaniSub.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Maroon Paithani Saree Front' },
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', isPrimary: false, altText: 'Maroon Paithani Pallu Detail' },
      ],
      attributes: [
        { name: 'Weave Type', value: 'Handloom Yeola Weave' },
        { name: 'Zari Type', value: 'Tested Antique Gold Zari' },
        { name: 'Occasion', value: 'Bridal, Weddings, Maharashtrian Festivals' },
      ],
    },
    {
      name: 'Peshwai Kathpadar Double Pallu Paithani in Emerald Green',
      slug: 'peshwai-kathpadar-double-pallu-paithani-emerald-green',
      sku: 'S8C4',
      barcode: 'SW-890123002',
      description: 'Graceful emerald green body draped with contrasting red-and-gold Kath borders. Decorated with delicate buttis across the body and a dramatic double pallu.',
      shortDescription: 'Heritage Emerald Green Paithani with Red Border and Double Peacock Pallu.',
      mrp: 22000.00,
      sellingPrice: 17499.00,
      purchasePrice: 11500.00,
      gstRate: 5.00,
      fabric: '100% Pure Katan Silk',
      colour: 'Emerald Green & Ruby Red',
      sareeLength: '6.3 Meters with Blouse Piece',
      blouseDetails: 'Contrast Red Pure Silk Blouse with matching border',
      washingInstructions: 'Dry Clean Only. Avoid direct sunlight drying.',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      stockQuantity: 8,
      lowStockThreshold: 2,
      categoryIds: [sareesCat.id, paithaniSub.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Emerald Green Paithani Saree' },
      ],
      attributes: [
        { name: 'Weave Type', value: 'Double Pallu Jacquard Silk' },
        { name: 'Zari Type', value: 'Gold Zari' },
        { name: 'Occasion', value: 'Weddings & Reception' },
      ],
    },
    {
      name: 'Regal Banarasi Katan Silk Brocade Saree in Deep Burgundy',
      slug: 'regal-banarasi-katan-silk-brocade-saree-deep-burgundy',
      sku: 'B101',
      barcode: 'SW-890123003',
      description: 'An ode to Varanasi royalty. This saree showcases all-over intricate Kadwa floral jaal woven with silver and gold (Ganga-Jamuna) zari on a rich burgundy silk base.',
      shortDescription: 'Deep Burgundy Banarasi Katan Silk with Kadwa Floral Brocade.',
      mrp: 16900.00,
      sellingPrice: 12950.00,
      purchasePrice: 8500.00,
      gstRate: 5.00,
      fabric: 'Katan Silk',
      colour: 'Burgundy & Antique Gold',
      sareeLength: '6.3 Meters',
      blouseDetails: 'Brocade woven unstitched silk blouse piece',
      washingInstructions: 'Dry Clean Only.',
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      stockQuantity: 15,
      lowStockThreshold: 4,
      categoryIds: [sareesCat.id, banarasiSub.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Burgundy Banarasi Brocade Saree' },
      ],
      attributes: [
        { name: 'Craft', value: 'Kadwa Handloom Brocade' },
        { name: 'Occasion', value: 'Festivals, Sangeet & Weddings' },
      ],
    },
    {
      name: 'Traditional Kolhapuri Nauvari Silk Saree in Mustard Yellow',
      slug: 'traditional-kolhapuri-nauvari-silk-saree-mustard-yellow',
      sku: 'N901',
      barcode: 'SW-890123004',
      description: 'The authentic 9-yard Maharashtrian Nauvari (Kashta) saree crafted specially for Kolhapuri brides and festive rituals. Features traditional Khan style borders.',
      shortDescription: 'Authentic 9-Yard Pure Silk Nauvari in auspicious Mustard Yellow.',
      mrp: 14500.00,
      sellingPrice: 11200.00,
      purchasePrice: 7200.00,
      gstRate: 5.00,
      fabric: 'Semi-Paithani Silk Weave',
      colour: 'Mustard Yellow & Maroon Border',
      sareeLength: '8.4 Meters (Nauvari 9-Yard Drape)',
      blouseDetails: 'Separate matching maroon unstitched blouse piece',
      washingInstructions: 'Dry clean recommended.',
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      stockQuantity: 10,
      lowStockThreshold: 2,
      categoryIds: [sareesCat.id, nauvariSub.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Mustard Nauvari Saree' },
      ],
      attributes: [
        { name: 'Drape Type', value: 'Nauvari / 9 Yards' },
        { name: 'Occasion', value: 'Gauri Ganpati, Weddings, Haldi' },
      ],
    },
    {
      name: 'Royal Magenta Zari Woven Silk Saree with Temple Border',
      slug: 'royal-magenta-zari-woven-silk-saree-temple-border',
      sku: 'S5A2',
      barcode: 'SW-890123005',
      description: 'Vibrant magenta silk illuminated by rich gold zari temple borders (Gopuram motifs). Lightweight drape with high shine and grand appearance.',
      shortDescription: 'Vibrant Magenta Silk with Traditional Temple Border.',
      mrp: 9500.00,
      sellingPrice: 6999.00,
      purchasePrice: 4200.00,
      gstRate: 5.00,
      fabric: 'Art Silk / Poly Silk Blend',
      colour: 'Royal Magenta & Gold',
      sareeLength: '6.3 Meters',
      blouseDetails: 'Running blouse piece included',
      washingInstructions: 'Gentle hand wash in cold water or dry clean.',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      stockQuantity: 20,
      lowStockThreshold: 5,
      categoryIds: [sareesCat.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Magenta Temple Border Saree' },
      ],
      attributes: [
        { name: 'Border', value: 'Traditional Temple Zari' },
        { name: 'Weight', value: '620 grams' },
      ],
    },
    {
      name: 'Crimson Red Bridal Anarkali Suit Set with Zardozi Work',
      slug: 'crimson-red-bridal-anarkali-suit-set-zardozi',
      sku: 'D301',
      barcode: 'SW-890123006',
      description: 'Floor-length flared Anarkali gown in rich georgette, embellished with hand-crafted Zardozi and pearl embroidery. Paired with churidar and heavy dupatta.',
      shortDescription: 'Crimson Red Floor-Length Anarkali Suit with Zardozi Embroidery.',
      mrp: 12500.00,
      sellingPrice: 9450.00,
      purchasePrice: 5800.00,
      gstRate: 12.00,
      fabric: 'Pure Georgette & Shantoon',
      colour: 'Crimson Red',
      sareeLength: null,
      blouseDetails: null,
      washingInstructions: 'Dry clean only.',
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      stockQuantity: 7,
      lowStockThreshold: 2,
      categoryIds: [dressesCat.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Crimson Anarkali Suit' },
      ],
      attributes: [
        { name: 'Work', value: 'Hand Zardozi & Moti' },
        { name: 'Set Includes', value: 'Anarkali Kurta, Churidar, Dupatta' },
      ],
    },
    {
      name: 'Chanderi Silk Embroidered Straight Kurti with Pants',
      slug: 'chanderi-silk-embroidered-straight-kurti-pants',
      sku: 'K201',
      barcode: 'SW-890123007',
      description: 'Graceful festive wear straight kurti in handwoven Chanderi silk with delicate thread embroidery on yoke and sleeves. Paired with cigarette trousers.',
      shortDescription: 'Pastel Peach Chanderi Silk Kurti Set with Thread Embroidery.',
      mrp: 4800.00,
      sellingPrice: 3499.00,
      purchasePrice: 1900.00,
      gstRate: 12.00,
      fabric: 'Chanderi Silk',
      colour: 'Pastel Peach & Gold',
      sareeLength: null,
      blouseDetails: null,
      washingInstructions: 'Hand wash separately in cold water.',
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      stockQuantity: 18,
      lowStockThreshold: 4,
      categoryIds: [kurtisCat.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1596783049187-57351606bb40?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Chanderi Kurti Set' },
      ],
      attributes: [
        { name: 'Neckline', value: 'Mandarin with V-notch' },
        { name: 'Sleeve Length', value: '3/4th Sleeves' },
      ],
    },
    {
      name: 'Handcrafted Velvet Zardozi Bridal Potli Handbag',
      slug: 'handcrafted-velvet-zardozi-bridal-potli-handbag',
      sku: 'H101',
      barcode: 'SW-890123008',
      description: 'Exquisite maroon micro-velvet potli bag with traditional golden dabka, sequin and bead work. Finished with pearl handle and heavy tassel drawstrings.',
      shortDescription: 'Maroon Velvet Potli with Gold Zardozi & Pearl Handle.',
      mrp: 2800.00,
      sellingPrice: 1999.00,
      purchasePrice: 950.00,
      gstRate: 18.00,
      fabric: 'Micro Velvet & Satin Lining',
      colour: 'Maroon & Antique Gold',
      sareeLength: null,
      blouseDetails: null,
      washingInstructions: 'Spot clean with dry cloth only.',
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      stockQuantity: 25,
      lowStockThreshold: 5,
      categoryIds: [handbagsCat.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Velvet Bridal Potli Bag' },
      ],
      attributes: [
        { name: 'Closure', value: 'Drawstring with Tassels' },
        { name: 'Handle', value: 'Handmade Pearl String' },
      ],
    },
    {
      name: 'Kolhapuri Saaj Inspired 24K Gold Plated Necklace Set',
      slug: 'kolhapuri-saaj-inspired-24k-gold-plated-necklace-set',
      sku: 'A401',
      barcode: 'SW-890123009',
      description: 'The iconic traditional Maharashtrian ornament containing 21 auspicious leaves/avtars in 24k micro gold polish. Paired with matching jhumkas.',
      shortDescription: 'Traditional 21-Pan Kolhapuri Saaj Necklace Set.',
      mrp: 5200.00,
      sellingPrice: 3850.00,
      purchasePrice: 2100.00,
      gstRate: 3.00,
      fabric: 'Copper Brass with 24k Gold Polish',
      colour: 'Antique Gold & Ruby Stones',
      sareeLength: null,
      blouseDetails: null,
      washingInstructions: 'Keep away from water, perfumes and chemicals.',
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      stockQuantity: 14,
      lowStockThreshold: 3,
      categoryIds: [accessoriesCat.id],
      images: [
        { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80', isPrimary: true, altText: 'Kolhapuri Saaj Jewellery Set' },
      ],
      attributes: [
        { name: 'Origin', value: 'Crafted by Kolhapur Artisans' },
        { name: 'Plating', value: '1 Micron 24K Gold Polish' },
      ],
    },
  ];

  for (const item of sampleProducts) {
    const { categoryIds, images, attributes, ...productData } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        inventory: {
          create: {
            quantity: productData.stockQuantity,
            reservedQuantity: 0,
            lastRestockAt: new Date(),
          },
        },
        inventoryMovements: {
          create: {
            movementType: 'STOCK_IN',
            quantity: productData.stockQuantity,
            balanceAfter: productData.stockQuantity,
            referenceType: 'INITIAL_STOCK',
            notes: 'Initial inventory setup from seed',
            createdById: admin.id,
          },
        },
        categories: {
          create: categoryIds.map((catId) => ({ categoryId: catId })),
        },
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            displayOrder: idx + 1,
          })),
        },
        attributes: {
          create: attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
        },
      },
    });

    console.log(`👗 Created product: ${createdProduct.sku} - ${createdProduct.name}`);
  }

  // 5. Seed Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Authentic Yeola Paithani Sarees',
        subtitle: 'Crafted with Pure Mulberry Silk & Antique Gold Zari from Kolhapur',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        linkUrl: '/category/paithani-sarees',
        type: 'HERO',
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'Maharashtrian Wedding & Festive Splendour',
        subtitle: 'Explore Handpicked Nauvari, Banarasi Brocades & Bridal Collections',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        linkUrl: '/shop',
        type: 'HERO',
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'Festive Season Special — Flat 10% Off',
        subtitle: 'Use code SWARADA10 on your first order. Free shipping across India.',
        imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1920&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
        linkUrl: '/shop',
        type: 'PROMOTIONAL',
        displayOrder: 3,
        isActive: true,
      },
    ],
  });

  console.log('🖼️ Banners seeded.');

  // 6. Seed Coupons
  await prisma.coupon.create({
    data: {
      code: 'FIRST10',
      description: 'Flat 10% off on your first order above ₹2,999',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      minOrderValue: 2999.00,
      maxDiscount: 1500.00,
      usageLimit: 500,
      perUserLimit: 1,
      isFirstOrderOnly: true,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'PAITHANI500',
      description: 'Flat ₹500 off on pure silk Paithani sarees',
      discountType: 'FIXED',
      discountValue: 500.00,
      minOrderValue: 9999.00,
      usageLimit: 200,
      isActive: true,
    },
  });

  console.log('🏷️ Coupons seeded.');

  // 7. Seed Settings
  const settingsData = [
    { key: 'store_name', value: 'Swarada Saree Center', group: 'general' },
    { key: 'store_tagline', value: "Kolhapur's Destination for Premium Sarees & Ethnic Fashion", group: 'general' },
    { key: 'store_currency', value: 'INR', group: 'general' },
    { key: 'currency_symbol', value: '₹', group: 'general' },
    { key: 'store_address', value: 'Shop No. 12, Mahadwar Road, Near Mahalaxmi Mandir, Kolhapur, Maharashtra 416002', group: 'general' },
    { key: 'store_phone', value: '+91 98220 12345', group: 'general' },
    { key: 'store_whatsapp', value: '+91 98220 12345', group: 'general' },
    { key: 'store_email', value: 'contact@swaradasareecenter.com', group: 'general' },
    { key: 'free_shipping_threshold', value: '2999', group: 'shipping' },
    { key: 'standard_shipping_charge', value: '150', group: 'shipping' },
    { key: 'gst_number', value: '27AAAAA0000A1Z5', group: 'tax' },
    { key: 'announcement_text', value: '✨ Free All-India Express Shipping on Orders Above ₹2,999 | Use Code FIRST10 for 10% Off', group: 'storefront' },
    { key: 'vyapar_sync_enabled', value: 'false', group: 'integrations' },
    { key: 'shiprocket_enabled', value: 'false', group: 'integrations' },
  ];

  for (const s of settingsData) {
    await prisma.setting.create({ data: s });
  }

  console.log('⚙️ Settings seeded.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
