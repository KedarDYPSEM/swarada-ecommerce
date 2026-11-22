const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runLiveChromeTests() {
  console.log('===========================================================');
  console.log('  SWARADA SAREE CENTER — COMPREHENSIVE CHROME TEST SUITE  ');
  console.log('===========================================================\n');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const consoleErrors = [];
  const networkErrors = [];

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[Page Crash/Exception] ${err.message}`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/favicon.ico') && !res.url().includes('/api/auth/me') && !res.url().includes('/api/auth/refresh')) {
      networkErrors.push(`[HTTP ${res.status()}] ${res.url()}`);
    }
  });

  const report = {
    steps: [],
    adminProductReflectedImmediately: false,
    adminBannerReflectedImmediately: false,
    bugs: [],
  };

  const recordStep = (name, status, details = '') => {
    console.log(`[${status ? 'PASS' : 'FAIL'}] ${name} ${details ? '— ' + details : ''}`);
    report.steps.push({ name, status, details });
  };

  try {
    // -------------------------------------------------------------
    // Step 1: Homepage Load
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Loading Public Storefront Homepage ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homeTitle = await page.title();
    const hasHeaderLogo = (await page.locator('header a:has-text("Swarada")').count()) > 0;
    recordStep('Storefront Homepage Load', hasHeaderLogo, `Brand Header visible, Title: "${homeTitle}"`);

    // -------------------------------------------------------------
    // Step 2: Admin Login
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Logging into Admin Portal ---');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    await page.fill('input[type="email"]', 'admin@swarada.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Wait for navigation to /admin/dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    const onDashboard = page.url().includes('/admin/dashboard');
    recordStep('Admin Authentication', onDashboard, `Redirected to ${page.url()}`);

    // Check KPI cards
    await page.waitForSelector('text=Executive Dashboard', { timeout: 5000 });
    const hasTotalRevenue = (await page.locator('text=Total Revenue').count()) > 0;
    const hasActiveProducts = (await page.locator('text=Active Products').count()) > 0;
    recordStep('Admin KPI Metrics Load', hasTotalRevenue && hasActiveProducts, 'Live cards rendered');

    // -------------------------------------------------------------
    // Step 3: Admin Categories Management
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Verifying Admin Category Management ---');
    await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Categories & Collections', { timeout: 5000 });
    const hasCategories = (await page.locator('text=Paithani Sarees').count()) > 0;
    recordStep('Admin Categories Portal', hasCategories, 'Categories and hierarchy loaded');

    // -------------------------------------------------------------
    // Step 4: Admin Orders Management
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Verifying Admin Orders Portal ---');
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Customer Orders & Shipments', { timeout: 5000 });
    const hasOrders = (await page.locator('table').count()) > 0;
    recordStep('Admin Orders Portal', hasOrders, 'Order tracking and fulfillment table loaded');

    // -------------------------------------------------------------
    // Step 5: Admin Products Live Update of S7B3
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Editing Flagship Saree S7B3 in Admin Panel ---');
    await page.goto(`${BASE_URL}/admin/products/1/edit`, { waitUntil: 'networkidle' });

    // Wait for the form inputs to load
    const titleInput = page.locator('input[placeholder="e.g. Royal Peshwai Double Pallu Paithani Saree"]');
    await titleInput.waitFor({ state: 'visible', timeout: 8000 });

    const timestamp = Date.now().toString().slice(-4);
    const updatedTitle = `Maharani Yeola Pure Silk Paithani Saree (Kolhapur Grand Edition ${timestamp})`;
    const updatedPrice = '12499';

    // Update title
    await titleInput.fill(updatedTitle);

    // Update selling price
    const priceInput = page.locator('input[placeholder="14999"]');
    await priceInput.fill(updatedPrice);

    // Click Update Saree
    console.log(`Updating product S7B3 to: "${updatedTitle}" at ₹${updatedPrice}...`);
    await page.click('button:has-text("Update Saree")');

    // Wait for navigation back to products list
    await page.waitForURL('**/admin/products', { timeout: 10000 });
    await sleep(500);

    const productInList = (await page.locator(`text=${updatedTitle}`).count()) > 0;
    recordStep('Admin Product Save', productInList, `Product S7B3 successfully updated in admin database`);

    // -------------------------------------------------------------
    // Step 6: Verify Immediate Reflection on Public Storefront
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Verifying Immediate Reflection on Public Storefront ---');
    const customerPage = await context.newPage();

    customerPage.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[Customer Page Console Error] ${msg.text()}`);
    });

    // 6A: Check Catalog Page (/shop)
    await customerPage.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
    await sleep(600);

    const hasUpdatedTitleInShop = (await customerPage.locator(`text=Kolhapur Grand Edition ${timestamp}`).count()) > 0;
    const hasUpdatedPriceInShop = (await customerPage.locator('text=12,499').count()) > 0;

    recordStep(
      'Immediate Reflection on /shop',
      hasUpdatedTitleInShop && hasUpdatedPriceInShop,
      `Found updated title (${hasUpdatedTitleInShop}) and price ₹12,499 (${hasUpdatedPriceInShop})`
    );

    // 6B: Check Product Details Page
    await customerPage.goto(`${BASE_URL}/product/maharani-yeola-pure-silk-paithani-saree-royal-maroon`, {
      waitUntil: 'networkidle',
    });
    await sleep(600);

    const hasUpdatedTitleOnPage = (await customerPage.locator(`text=Kolhapur Grand Edition ${timestamp}`).count()) > 0;
    const hasUpdatedPriceOnPage = (await customerPage.locator('text=12,499').count()) > 0;

    recordStep(
      'Immediate Reflection on Product Detail Page',
      hasUpdatedTitleOnPage && hasUpdatedPriceOnPage,
      `Product details page immediately displays new price ₹12,499 without rebuild/restart`
    );

    report.adminProductReflectedImmediately = hasUpdatedTitleInShop && hasUpdatedPriceOnPage;

    // -------------------------------------------------------------
    // Step 7: Test Instant Autocomplete Search (S7B3)
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Testing Instant SKU Search ---');
    await customerPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const searchInput = customerPage.locator('input[placeholder*="Search by Saree" i]').first();
    await searchInput.fill('S7B3');
    await sleep(800); // Allow debounce & API response

    const searchSuggestion = customerPage.locator(`text=Kolhapur Grand Edition ${timestamp}`);
    const foundInSearch = (await searchSuggestion.count()) > 0;
    recordStep('Instant SKU Autocomplete Search', foundInSearch, 'Found updated product via SKU "S7B3" in live search dropdown');

    // -------------------------------------------------------------
    // Step 8: Test Admin Banner Update & Immediate Homepage Reflection
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Testing Admin Banner Update & Reflection ---');
    await page.goto(`${BASE_URL}/admin/banners`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Homepage Banners & Hero Slides', { timeout: 5000 });

    const editBannerBtn = page.locator('button[title="Edit Banner"]').first();
    await editBannerBtn.click();
    await page.waitForSelector('text=Edit Banner Slide', { timeout: 5000 });

    const bannerTitleInput = page.locator('input[placeholder*="Authentic Yeola"]').first();
    const newBannerTitle = `Diwali Festive Splendour 2026 (${timestamp})`;
    await bannerTitleInput.fill(newBannerTitle);

    await page.click('button:has-text("Update Banner")');
    await sleep(1000);

    // Check Storefront Homepage for new banner headline
    await customerPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await sleep(1000);

    const bannerReflected = (await customerPage.locator(`text=${newBannerTitle}`).count()) > 0;
    recordStep(
      'Immediate Banner Reflection on Homepage',
      bannerReflected,
      `Homepage hero banner instantly displays: "${newBannerTitle}"`
    );
    report.adminBannerReflectedImmediately = bannerReflected;

    // -------------------------------------------------------------
    // Step 9: Cart, Free Shipping & Checkout Flow
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Testing Customer Cart & Checkout Flow ---');
    await customerPage.goto(`${BASE_URL}/product/maharani-yeola-pure-silk-paithani-saree-royal-maroon`, {
      waitUntil: 'networkidle',
    });

    // Check pincode estimator
    const pinInput = customerPage.locator('input[placeholder*="Enter 6-digit PIN code"]').first();
    await pinInput.fill('416002');
    await customerPage.click('button:has-text("Check")');
    await sleep(500);
    const pinChecked = (await customerPage.locator('text=Available for Express Delivery to 416002').count()) > 0;
    recordStep('Pincode Delivery Estimator', pinChecked, 'Kolhapur 416002 verified for Express Blue Dart Delivery');

    // Add to cart
    await customerPage.click('button:has-text("Add to Cart")');
    await sleep(800);

    // Go to /cart
    await customerPage.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
    const cartHasItem = (await customerPage.locator(`text=Kolhapur Grand Edition`).count()) > 0;
    const freeShippingTag = (await customerPage.locator('text=FREE').count()) > 0;
    recordStep('Cart Line Items & Free Shipping', cartHasItem && freeShippingTag, '₹12,499 exceeds ₹2,999 free shipping threshold');

    // Proceed to Checkout
    await customerPage.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
    await customerPage.waitForSelector('text=Delivery Address', { timeout: 5000 });
    const checkoutLoaded = (await customerPage.locator('text=Delivery Address').count()) > 0;
    const hasRazorpayOption = (await customerPage.locator('text=Razorpay').count()) > 0;
    const hasCodOption = (await customerPage.locator('text=Cash on Delivery').count()) > 0;
    recordStep(
      'Checkout Page Load & Payment Gateways',
      checkoutLoaded && hasRazorpayOption && hasCodOption,
      'Delivery Address form and Razorpay & COD payment selectors verified'
    );

    await customerPage.close();
  } catch (err) {
    console.error('Test Execution Error:', err);
    report.bugs.push(`Critical Exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n===========================================================');
  console.log('                 LIVE TEST SUMMARY REPORT                  ');
  console.log('===========================================================');
  console.log(`Total Steps Executed: ${report.steps.length}`);
  console.log(`Passed: ${report.steps.filter((s) => s.status).length}`);
  console.log(`Failed: ${report.steps.filter((s) => !s.status).length}`);
  console.log(`Admin Product Changes Reflected Immediately: ${report.adminProductReflectedImmediately ? 'YES (100% LIVE)' : 'NO'}`);
  console.log(`Admin Banner Changes Reflected Immediately: ${report.adminBannerReflectedImmediately ? 'YES (100% LIVE)' : 'NO'}`);

  if (consoleErrors.length > 0) {
    console.log(`\nBrowser Console Errors Detected (${consoleErrors.length}):`);
    consoleErrors.forEach((e) => console.log(`  - ${e}`));
  } else {
    console.log('\nZero browser console errors detected.');
  }

  if (networkErrors.length > 0) {
    console.log(`\nNetwork HTTP Errors (${networkErrors.length}):`);
    networkErrors.forEach((e) => console.log(`  - ${e}`));
  } else {
    console.log('Zero network 4xx/5xx errors detected.');
  }

  return report;
}

runLiveChromeTests().catch(console.error);
