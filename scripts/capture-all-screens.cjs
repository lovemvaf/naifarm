/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node script, CommonJS intentional */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve('.');
const BASE_URL = 'http://127.0.0.1:3000';

const DESKTOP_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'desktop');
const MOBILE_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'mobile');
const TABLET_DIR = path.join(ROOT_DIR, 'docs', 'screenshots', 'tablet');

fs.mkdirSync(DESKTOP_DIR, { recursive: true });
fs.mkdirSync(MOBILE_DIR, { recursive: true });
fs.mkdirSync(TABLET_DIR, { recursive: true });

const SCREENS = [
  { name: '01_home', route: '/', desc: 'Trang chủ NaiFarm' },
  { name: '02_marketplace', route: '/marketplace', desc: 'Chợ OCOP trực tuyến' },
  { name: '03_product_buoi_3d', route: '/products/buoi-da-xanh-tan-trieu', desc: 'Chi tiết sản phẩm Bưởi da xanh & 3D Viewer' },
  { name: '04_farms', route: '/farms', desc: 'Danh bạ nhà vườn OCOP sinh thái Đồng Nai' },
  { name: '05_farm_detail', route: '/farms/vuon-buoi-chu-ba-minh', desc: 'Chi tiết Vườn Bưởi Chú Ba Minh & Đặt lịch' },
  { name: '06_explore_map', route: '/explore', desc: 'Bản đồ số vùng trồng & Tour trải nghiệm' },
  { name: '07_trace_gateway', route: '/trace', desc: 'Cổng tra cứu truy xuất nguồn gốc QR' },
  { name: '08_trace_nf_demo_001', route: '/trace/NF-DEMO-001', desc: 'Hộ chiếu QR số NF-DEMO-001 & Minh bạch tự khai' },
  { name: '09_cart', route: '/cart', desc: 'Giỏ hàng nông sản & Tóm tắt thanh toán' },
  { name: '10_checkout', route: '/checkout', desc: 'Thanh toán COD Demo & Cam kết vận chuyển mát' },
  { name: '11_account_orders', route: '/account/orders', desc: 'Theo dõi đơn hàng & Đồng bộ trạng thái W01/W02' },
  { name: '12_farmer_w02', route: '/farmer', desc: 'Bàn làm việc Nhà nông U50+ (Chữ lớn >=18px, Nút >=56px)' },
  { name: '13_farmer_publish', route: '/farmer/publish', desc: 'Đăng bán nông sản 3 bước AI giọng nói' },
  { name: '14_volunteer_w03', route: '/volunteer', desc: 'Thanh niên số hóa & Youth Impact Pass 2 lớp giờ' },
  { name: '15_learn_open', route: '/learn', desc: 'Học mở OCOP & Quiz tương tác Hạt điều Đồng Nai' },
  { name: '16_coordinator_w04', route: '/coordinator', desc: 'Điều phối viên HTX & Khóa duyệt giờ 2 lớp' },
  { name: '17_organization_w05', route: '/organization', desc: 'Không gian Tổ chức & Đối tác (3 chế độ)' },
  { name: '18_admin_w06', route: '/admin', desc: 'Quản trị hệ thống & Ma trận phân quyền RBAC' },
  { name: '19_live_room', route: '/live', desc: 'Phòng OCOP Live 3 góc máy tương tác' },
  { name: '20_demo_hub', route: '/demo', desc: 'Trung tâm trình diễn Giám khảo & 8 luồng Flows A-H' },
  { name: '21_auth_login', route: '/login', desc: 'Đăng nhập phân quyền theo 6 vai trò W01-W06' }
];

async function run() {
  console.log('Launching browser via Playwright...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined
  });

  // 1. Reset demo state first if possible
  console.log('Resetting demo state on /demo...');
  const setupCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const setupPage = await setupCtx.newPage();
  try {
    await setupPage.goto(`${BASE_URL}/demo`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await setupPage.waitForTimeout(600);
    const resetBtn = setupPage.getByRole('button', { name: /Khôi phục Dữ liệu Mẫu/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await setupPage.waitForTimeout(500);
      console.log('Demo state reset successfully.');
    }
  } catch (err) {
    console.warn('Notice on reset:', err.message);
  }
  await setupCtx.close();

  // Viewports
  const viewports = [
    { type: 'desktop', width: 1440, height: 900, dir: DESKTOP_DIR },
    { type: 'mobile', width: 390, height: 844, dir: MOBILE_DIR },
    { type: 'tablet', width: 768, height: 1024, dir: TABLET_DIR }
  ];

  for (const vp of viewports) {
    console.log(`\n=== Capturing ${vp.type.toUpperCase()} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1.5
    });
    const page = await context.newPage();

    for (const item of SCREENS) {
      const url = `${BASE_URL}${item.route}`;
      process.stdout.write(`Capturing [${vp.type}] ${item.name} (${item.route})... `);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(700);

        // If product 3d page and button exists, open 3d viewer
        if (item.name === '03_product_buoi_3d') {
          try {
            const btn3d = page.getByRole('button', { name: /Xem 3D Bưởi/i });
            if (await btn3d.isVisible()) {
              await btn3d.click();
              await page.waitForTimeout(1000);
            }
          } catch (_) {}
        }

        const filePath = path.join(vp.dir, `${item.name}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`OK (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
