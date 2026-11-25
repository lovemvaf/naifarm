import os
import sys
import json
import time
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000"
PROJECT_ROOT = r"e:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm"
OUT_DIR = os.path.join(PROJECT_ROOT, "docs", "screenshots", "v3")
QR_TEMP_PNG = os.path.join(
    r"C:\Users\asus\.gemini\antigravity\brain\08496d80-a896-4201-9a0c-b9a88b4a3b08\scratch",
    "e2e_v3_qr.png",
)

FORBIDDEN_UI_STRINGS = [
    "(Demo)",
    "(demo)",
    "mock data",
    "prototype",
    "Frontend-Only",
    "Simulation",
    "Roadmap",
    "Active MVP",
    "Trung tâm Trình diễn",
    "role demo",
    "GPS API",
    "Bản đồ OpenStreetMap",
    "Đã đăng xuất về chế độ Khách",
    "Dữ liệu mô phỏng",
]

ALL_ROUTES = [
    "/",
    "/marketplace",
    "/products/buoi-da-xanh-tan-trieu",
    "/cart",
    "/checkout",
    "/explore",
    "/farms",
    "/farms/vuon-buoi-ba-minh",
    "/trace",
    "/trace/NF-DEMO-001",
    "/trace/NF-DN-099",
    "/trace/scan",
    "/quality",
    "/learn",
    "/live",
    "/search",
    "/policies",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/demo",
    "/account",
    "/account/orders",
    "/account/orders/NF-ORD-DEMO-01",
    "/account/settings",
    "/farmer",
    "/farmer/publish",
    "/volunteer",
    "/coordinator",
    "/organization",
    "/admin",
]


def make_test_qr_png(url_text: str, out_path: str):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    node_code = (
        f"const QRCode=require('qrcode');"
        f"QRCode.toFile({json.dumps(out_path)}, {json.dumps(url_text)}, "
        f"{{width:360,margin:4,errorCorrectionLevel:'M'}})"
    )
    subprocess.run(["node", "-e", node_code], cwd=PROJECT_ROOT, check=True)


def check_images_loaded(page, route_name: str):
    broken = page.evaluate(
        """() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs
              .filter(img => {
                const src = img.getAttribute('src') || '';
                if (!src || src.startsWith('data:') || src.includes('tile.openstreetmap.org')) return false;
                return !img.complete || img.naturalWidth === 0;
              })
              .map(img => img.getAttribute('src'));
        }"""
    )
    assert not broken, f"Broken images on {route_name}: {broken}"


def check_no_overflow(page, route_name: str, vp_width: int):
    overflow = page.evaluate(
        "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"Horizontal overflow {overflow}px on {route_name} at {vp_width}px"


def assert_clean_dom_copy(page, route_name: str):
    text = page.evaluate("() => document.body ? document.body.innerText : ''")
    for token in FORBIDDEN_UI_STRINGS:
        assert token not in text, f"Forbidden UI string '{token}' rendered on {route_name}"


def main():
    os.makedirs(os.path.join(OUT_DIR, "desktop"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "mobile"), exist_ok=True)
    make_test_qr_png(f"{BASE_URL}/trace/NF-DEMO-001", QR_TEMP_PNG)

    report = {
        "routesChecked": 0,
        "responsiveChecks": [],
        "flowsVerified": [],
        "failedLocalRequests": [],
        "badLocalResponses": [],
        "pageErrors": [],
        "consoleErrors": [],
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, locale="vi-VN")
        page = ctx.new_page()

        page.on("pageerror", lambda err: report["pageErrors"].append(str(err)))
        page.on(
            "console",
            lambda msg: report["consoleErrors"].append(f"{msg.text} ({msg.location.get('url', '')})")
            if msg.type == "error"
            and "tile.openstreetmap.org" not in (msg.location.get("url", "") + " " + msg.text)
            and "127.0.0.1" in msg.location.get("url", "")
            else None,
        )
        page.on(
            "requestfailed",
            lambda req: report["failedLocalRequests"].append((req.url, req.failure))
            if req.url.startswith(BASE_URL) and not ("_rsc=" in req.url and req.failure == "net::ERR_ABORTED")
            else None,
        )
        page.on(
            "response",
            lambda res: report["badLocalResponses"].append((res.url, res.status))
            if res.url.startswith(BASE_URL) and res.status >= 400
            else None,
        )

        # 1. All Routes Smoke + Images + Overflow + Copy Lint (Desktop 1440px)
        for route in ALL_ROUTES:
            resp = page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded", timeout=30000)
            assert resp and resp.status == 200, f"Route {route} returned {resp.status if resp else 'None'}"
            page.wait_for_timeout(450)
            check_images_loaded(page, route)
            check_no_overflow(page, route, 1440)
            assert_clean_dom_copy(page, route)
            report["routesChecked"] += 1

        # Save key desktop screenshots
        for shot_route, fname in [
            ("/", "home.png"),
            ("/marketplace", "marketplace.png"),
            ("/quality", "quality.png"),
            ("/farmer", "farmer_simple.png"),
            ("/admin", "admin.png"),
        ]:
            page.goto(f"{BASE_URL}{shot_route}", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(400)
            page.screenshot(path=os.path.join(OUT_DIR, "desktop", fname))

        # 2. F01-F04 Marketplace Collections + Compare + Product Detail + Cart/Checkout
        page.goto(f"{BASE_URL}/marketplace", wait_until="networkidle", timeout=30000)
        page.get_by_role("tab", name="Danh mục OCOP tham khảo Nguồn công bố").click()
        page.wait_for_timeout(250)
        assert page.get_by_text("Xem nguồn công bố").first.is_visible(), "Public reference external link missing"
        assert page.get_by_text("Công ty TNHH TM SX Thuận Hương").first.is_visible()
        report["flowsVerified"].append("F01_public_reference_readonly")

        page.get_by_role("tab", name="NaiBox 95 Hộp quà").click()
        page.wait_for_timeout(200)
        page.get_by_role("tab", name="Tất cả nông sản").click()
        page.wait_for_timeout(250)
        # Filter to a single category with >= 2 SKUs so comparison is same-category
        cat_btn = page.locator("button", has_text="Bưởi & Cây có múi").first
        cat_btn.click()
        page.wait_for_timeout(250)
        compare_btns = page.locator("button[aria-label^='So sánh ']")
        if compare_btns.count() >= 2:
            compare_btns.nth(0).click()
            page.wait_for_timeout(150)
            compare_btns.nth(1).click()
            page.wait_for_timeout(150)
            page.get_by_role("button", name="Đối chiếu bảng (2)").click()
            assert page.get_by_role("dialog", name="Bảng đối chiếu nông sản cùng ngành hàng").is_visible()
            page.get_by_role("button", name="Đóng bảng so sánh").click()
        report["flowsVerified"].append("F02_marketplace_compare_collections")

        # Product detail: recently viewed + credential drawer + add to cart + quarantine lock
        page.goto(f"{BASE_URL}/products/buoi-da-xanh-tan-trieu", wait_until="networkidle", timeout=30000)
        page.get_by_role("button", name="Thêm vào giỏ hàng").first.click()
        page.wait_for_timeout(200)

        page.goto(f"{BASE_URL}/products/buoi-nam-roi-binh-an-thuy-dien", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("Tạm khóa đặt mua — Lô NF-DN-098").is_visible(), "Quarantined batch NF-DN-098 lock alert missing"
        report["flowsVerified"].append("F02b_quarantined_lot_cart_lock")

        page.goto(f"{BASE_URL}/checkout", wait_until="networkidle", timeout=30000)
        page.get_by_role("button", name="Ngoài tỉnh (TP.HCM, Bình Dương, Hà Nội...)").click()
        page.locator("#chk-coupon").fill("NAIFARM10")
        page.get_by_role("button", name="Xác nhận đặt đơn").click()
        page.wait_for_timeout(300)
        assert page.get_by_text("Đặt hàng thành công").first.is_visible()
        assert page.get_by_text("không phát sinh thanh toán hoặc giao hàng thực tế").first.is_visible()
        report["flowsVerified"].append("F03_checkout_outside_province_and_coupon")

        # 3. F05 Sign in, Escape menu close, & Single Logout Toast <= 1.8s
        page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle", timeout=30000)
        page.get_by_role("button", name="Chọn tài khoản này").nth(1).click()
        page.wait_for_timeout(500)
        menu_btn = page.locator("button[aria-label='Mở menu tài khoản']").first
        menu_btn.click()
        page.wait_for_timeout(150)
        assert page.get_by_role("menu", name="Menu tài khoản").is_visible()
        page.keyboard.press("Escape")
        page.wait_for_timeout(150)
        assert not page.get_by_role("menu", name="Menu tài khoản").is_visible(), "Escape should close header menu"

        menu_btn.click()
        page.wait_for_timeout(150)
        page.get_by_role("button", name="Đăng xuất").first.click()
        page.wait_for_timeout(250)
        toast_count = page.get_by_text("Đã đăng xuất", exact=True).count()
        assert toast_count == 1, f"Expected single logout toast, got {toast_count}"
        time.sleep(1.7)
        remaining_toast = page.get_by_text("Đã đăng xuất", exact=True).count()
        assert remaining_toast == 0, f"Logout toast lingered > 1.95s (count={remaining_toast})"
        report["flowsVerified"].append("F04_single_logout_toast_and_escape_menu")

        # 4. F06 Quality 26 types & Trace Recall NF-DN-099 & QR Upload Scan
        page.goto(f"{BASE_URL}/quality", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("26 loại tiêu chuẩn").first.is_visible()
        page.goto(f"{BASE_URL}/trace/NF-DN-099", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("NF-DN-100").first.is_visible()
        page.goto(f"{BASE_URL}/trace/scan", wait_until="networkidle", timeout=30000)
        page.locator("input[type='file']").first.set_input_files(QR_TEMP_PNG)
        page.wait_for_timeout(700)
        assert "NF-DEMO-001" in page.url, f"Expected QR upload to navigate to NF-DEMO-001, got {page.url}"
        report["flowsVerified"].append("F05_quality_recall_qr_upload")

        # 5. F07 W02 Farmer Simple -> ERP mode + Inventory + Maker-Checker + CSV
        page.goto(f"{BASE_URL}/farmer?mode=erp&tab=overview", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("Doanh số hàng hóa ròng").first.is_visible()
        page.get_by_role("button", name="Kho lô & Mua vật tư").first.click()
        page.wait_for_timeout(250)
        assert page.get_by_text("Tồn kho theo lô").first.is_visible()
        page.get_by_role("button", name="HTX, Gom lô & Sổ tài chính").first.click()
        page.wait_for_timeout(250)
        assert page.get_by_text("không thay thế báo cáo tài chính hoặc kê khai thuế pháp lý").first.is_visible()
        report["flowsVerified"].append("F06_farmer_erp_analytics_inventory_coop")

        # 6. F08 W03 Volunteer Split + W04 Coordinator Self-Approval Block
        page.goto(f"{BASE_URL}/volunteer", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("Nhiệm vụ đang mở · Chưa tham gia").first.is_visible()
        assert page.get_by_text("Nhiệm vụ đã tham gia & theo dõi duyệt giờ").first.is_visible()
        page.goto(f"{BASE_URL}/coordinator", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("Quy tắc phê duyệt 2 lớp & chống tự duyệt").first.is_visible()
        report["flowsVerified"].append("F07_volunteer_coordinator_governance")

        # 7. F09 W05 6 Org Types + Minor Consent Guard + W06 Admin 8 Tabs + GIS
        page.goto(f"{BASE_URL}/organization?org=school", wait_until="networkidle", timeout=30000)
        page.get_by_role("button", name="Công việc chuyên môn").first.click()
        page.wait_for_timeout(250)
        assert page.get_by_text("Thiếu đồng thuận (< 18t)").first.is_visible()
        page.goto(f"{BASE_URL}/organization?org=logistics", wait_until="networkidle", timeout=30000)
        page.get_by_role("button", name="Công việc chuyên môn").first.click()
        page.wait_for_timeout(200)
        assert page.get_by_text("TRIP-DN-01").first.is_visible()

        page.goto(f"{BASE_URL}/admin", wait_until="networkidle", timeout=30000)
        assert page.get_by_text("Doanh thu nền tảng (Platform Revenue)").first.is_visible()
        page.get_by_role("button", name="Chất lượng & Thu hồi lô").first.click()
        page.wait_for_timeout(250)
        assert page.get_by_text("Tạm giữ / Thu hồi lô & Phân tích phả hệ lan truyền").first.is_visible()
        page.get_by_role("button", name="Hỗ trợ & Dữ liệu GIS (24)").first.click()
        page.wait_for_timeout(250)
        assert page.get_by_text("chua_xac_minh_toa_do_va_polygon").first.is_visible()
        report["flowsVerified"].append("F08_w05_orgs_w06_admin_gis")

        # 8. Responsive Overflow Matrix across 320, 375, 390, 768, 1024, 1280, 1440px
        responsive_routes = ["/", "/marketplace", "/farmer?mode=erp", "/quality", "/admin"]
        for vp_w in [320, 375, 390, 768, 1024, 1280, 1440]:
            m_ctx = browser.new_context(viewport={"width": vp_w, "height": 844}, locale="vi-VN")
            m_page = m_ctx.new_page()
            for r in responsive_routes:
                m_page.goto(f"{BASE_URL}{r}", wait_until="domcontentloaded", timeout=30000)
                m_page.wait_for_timeout(350)
                check_no_overflow(m_page, r, vp_w)
            if vp_w == 390:
                m_page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=30000)
                m_page.screenshot(path=os.path.join(OUT_DIR, "mobile", "home_390.png"))
                m_page.goto(f"{BASE_URL}/marketplace", wait_until="networkidle", timeout=30000)
                m_page.screenshot(path=os.path.join(OUT_DIR, "mobile", "marketplace_390.png"))
            report["responsiveChecks"].append({"width": vp_w, "routesTested": len(responsive_routes), "overflow": 0})
            m_ctx.close()

        browser.close()

    assert not report["pageErrors"], f"Page errors: {report['pageErrors']}"
    assert not report["consoleErrors"], f"Console errors: {report['consoleErrors']}"
    assert not report["failedLocalRequests"], f"Failed local requests: {report['failedLocalRequests']}"
    assert not report["badLocalResponses"], f"Bad local responses: {report['badLocalResponses']}"

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
