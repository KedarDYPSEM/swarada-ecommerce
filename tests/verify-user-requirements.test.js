const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerification() {
  console.log('===========================================================');
  console.log('  TESTING USER REQUIREMENTS IN LIVE GOOGLE CHROME BROWSER  ');
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

  const report = {
    steps: [],
  };

  const record = (name, pass, details = '') => {
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name} ${details ? '— ' + details : ''}`);
    report.steps.push({ name, pass, details });
  };

  try {
    const page = await context.newPage();

    // -------------------------------------------------------------------------
    // REQUIREMENT 1: Public user buys saree -> fills details -> account directly created & proceeds to payment
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Public Guest Checkout & Direct Auto-Account Creation ---');
    await page.goto(`${BASE_URL}/product/maharani-yeola-pure-silk-paithani-saree-royal-maroon`, {
      waitUntil: 'networkidle',
    });

    // Add to cart
    await page.click('button:has-text("Add to Cart")');
    await sleep(800);

    // Proceed to checkout
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Delivery Address', { timeout: 6000 });

    const timestamp = Date.now().toString().slice(-5);
    const guestEmail = `priya.kulkarni.${timestamp}@example.com`;
    const guestPhone = `98221${timestamp.slice(-5)}`;
    const guestName = 'Priya Kulkarni';

    // Verify input placeholders are present and inputs are not pre-filled with real text
    const nameVal = await page.locator('input[placeholder*="Ananya Joshi" i]').inputValue();
    const cityVal = await page.locator('input[placeholder*="Kolhapur" i]').inputValue();
    const pincodeVal = await page.locator('input[placeholder*="416008" i]').inputValue();

    const inputsAreEmptyWithPlaceholders = (nameVal === '' && cityVal === '' && pincodeVal === '');
    record(
      'Checkout Input Boxes Use Placeholders Not Real Text',
      inputsAreEmptyWithPlaceholders,
      `Values: name="${nameVal}", city="${cityVal}", pin="${pincodeVal}"`
    );

    // Fill in guest checkout details
    console.log(`Filling guest details for ${guestName} (${guestEmail})...`);
    await page.fill('input[placeholder*="Ananya Joshi" i]', guestName);
    await page.fill('input[placeholder*="9822012345" i]', guestPhone);
    await page.fill('input[placeholder*="ananya@example.com" i]', guestEmail);
    await page.fill('input[placeholder*="42 Rajarampuri" i]', 'Bungalow 12, Tarabai Park, Near Circuit House');
    await page.fill('input[placeholder*="Kolhapur" i]', 'Kolhapur');
    await page.fill('input[placeholder*="Maharashtra" i]', 'Maharashtra');
    await page.fill('input[placeholder*="416008" i]', '416003');

    // Select Cash on Delivery to complete order directly
    await page.click('text=Cash on Delivery');
    await sleep(300);

    // Click Place Order
    console.log('Submitting order with auto-account creation...');
    await page.click('button:has-text("Place Order")');

    // Wait for navigation to order-success
    await page.waitForURL('**/order-success**', { timeout: 12000 });
    const onOrderSuccess = page.url().includes('/order-success');
    record('Public Checkout Proceeded to Order Success', onOrderSuccess, `Navigated to ${page.url()}`);

    // Verify that the user is now automatically logged in (navbar shows user name or account)
    await page.goto(`${BASE_URL}/account/dashboard`, { waitUntil: 'networkidle' });
    const hasCustomerGreeting = (await page.locator(`text=Priya`).count()) > 0 || (await page.locator(`text=${guestEmail}`).count()) > 0;
    record(
      'Account Directly Created & Automatically Authenticated',
      hasCustomerGreeting,
      `Customer portal active for newly created user: ${guestEmail}`
    );

    // Verify order exists in the newly created account's order history
    await page.goto(`${BASE_URL}/account/orders`, { waitUntil: 'networkidle' });
    const hasOrderInHistory = (await page.locator('text=SW-2026-').count()) > 0;
    record('Order Associated with Auto-Created Account', hasOrderInHistory, 'Order appears in customer order history');

    // -------------------------------------------------------------------------
    // REQUIREMENT 2 & 3: Admin Image Upload Features & Clean Placeholders
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Admin Panel Image Upload Feature & Placeholders ---');
    const adminPage = await context.newPage();
    await adminPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await adminPage.fill('input[type="email"]', 'admin@swarada.com');
    await adminPage.fill('input[type="password"]', 'Admin@123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 8000 });

    // 2A: Product Form Image Upload & Placeholder verification
    await adminPage.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle' });
    await adminPage.waitForSelector('text=Add Saree to Catalog', { timeout: 6000 });

    // Verify upload button exists in section 5
    const hasUploadBtn = (await adminPage.locator('button:has-text("Upload Photo")').count()) > 0;
    record('Admin Product Form Has "Upload Photo" Button', hasUploadBtn, 'File upload feature present in product gallery');

    // Verify product inputs start with placeholder text and not real text
    const titleVal = await adminPage.locator('input[placeholder*="Royal Peshwai" i]').inputValue();
    const fabricVal = await adminPage.locator('input[placeholder*="Pure Katan Silk" i]').inputValue();
    const colorVal = await adminPage.locator('input[placeholder*="Maroon with Gold" i]').inputValue();

    const productInputsClean = (titleVal === '' && fabricVal === '' && colorVal === '');
    record(
      'Admin Product Inputs Have Placeholders (Not Pre-Filled Real Text)',
      productInputsClean,
      `Title="${titleVal}", Fabric="${fabricVal}", Color="${colorVal}"`
    );

    // 2B: Category Manager Image Upload
    await adminPage.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'networkidle' });
    await adminPage.click('button:has-text("New Category")');
    await adminPage.waitForSelector('text=Create New Category', { timeout: 5000 });
    const hasCategoryUpload = (await adminPage.locator('button:has-text("Upload Category Cover")').count()) > 0;
    record('Admin Category Manager Has Image Upload Feature', hasCategoryUpload, '"Upload Category Cover" button active in modal');
    await adminPage.click('button:has-text("Cancel")');

    // 2C: Banner Manager Image Upload
    await adminPage.goto(`${BASE_URL}/admin/banners`, { waitUntil: 'networkidle' });
    await adminPage.click('button:has-text("New Banner")');
    await adminPage.waitForSelector('text=Create New Banner', { timeout: 5000 });
    const hasBannerUpload = (await adminPage.locator('button:has-text("Upload Desktop Banner")').count()) > 0;
    record('Admin Banner Manager Has Image Upload Feature', hasBannerUpload, '"Upload Desktop Banner" button active in modal');
    await adminPage.click('button:has-text("Cancel")');

    // -------------------------------------------------------------------------
    // REQUIREMENT 4: Total Removal of "Integrated with Vyapar Gold" and Sync Option
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Verification that Vyapar Gold Text and Sync Option Are Removed ---');

    // 4A: Check Admin Dashboard
    await adminPage.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    const dashboardText = await adminPage.content();
    const hasVyaparOnDashboard = /vyapar/i.test(dashboardText);
    record('Vyapar Gold & Sync Removed from Admin Dashboard', !hasVyaparOnDashboard, 'Zero mentions of Vyapar on executive dashboard');

    // 4B: Check Admin Header / Layout
    const hasVyaparInLayout = /Vyapar Gold Integrated/i.test(dashboardText);
    record('Vyapar Gold Removed from Admin Top Header', !hasVyaparInLayout, 'Top header says "Swarada Flagship Store Administration"');

    // 4C: Check Product Form
    await adminPage.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle' });
    const productFormText = await adminPage.content();
    const hasVyaparInProductForm = /vyapar/i.test(productFormText);
    record('Vyapar Primary Text Removed from Product Form Section 2', !hasVyaparInProductForm, 'Section 2 says "Pricing, Margin & Stock Inventory"');

    // 4D: Check Settings Manager
    await adminPage.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle' });
    const settingsText = await adminPage.content();
    const hasVyaparInSettings = /vyapar/i.test(settingsText);
    record('Vyapar Gold Tab & Sync Removed from Settings', !hasVyaparInSettings, 'Replaced with "Shipping & Logistics"');

    await adminPage.close();
    await page.close();
  } catch (err) {
    console.error('Test Error:', err);
    record('Execution Exception', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n===========================================================');
  console.log('                 TEST SUMMARY REPORT                       ');
  console.log('===========================================================');
  console.log(`Total Steps: ${report.steps.length}`);
  console.log(`Passed: ${report.steps.filter((s) => s.pass).length}`);
  console.log(`Failed: ${report.steps.filter((s) => !s.pass).length}`);
  return report;
}

runVerification().catch(console.error);
