import os
import sys
import json
import subprocess
from playwright.sync_api import sync_playwright

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000"
PROJECT_ROOT = r"e:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm"
AFTER_DIR = os.path.join(PROJECT_ROOT, "docs", "screenshots", "after")
QR_TEMP_PNG = os.path.join(
    r"C:\Users\asus\.gemini\antigravity\brain\08496d80-a896-4201-9a0c-b9a88b4a3b08\scratch",
    "e2e_test_qr.png",
)


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


def main():
    os.makedirs(os.path.join(AFTER_DIR, "desktop"), exist_ok=True)
    os.makedirs(os.path.join(AFTER_DIR, "mobile"), exist_ok=True)
    make_test_qr_png(f"{BASE_URL}/trace/NF-DEMO-001", QR_TEMP_PNG)

    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ------------------------------------------------------------------
        # Main Desktop Context (1440x900)
        # ------------------------------------------------------------------
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            locale="vi-VN",
        )
        page = ctx.new_page()
        page_errors = []
        console_errors = []
        failed_local_requests = []
        failed_external_hosts = set()
        bad_local_responses = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on(
            "requestfailed",
            lambda req: failed_local_requests.append((req.url, req.failure))
            if req.url.startswith(BASE_URL) and not ("_rsc=" in req.url and req.failure == "net::ERR_ABORTED")
            else failed_external_hosts.add(req.url.split("/")[2] if "/" in req.url else req.url),
        )
        page.on(
            "response",
            lambda res: bad_local_responses.append((res.url, res.status))
            if res.url.startswith(BASE_URL) and res.status >= 400
            else None,
        )
        page.on(
            "console",
            lambda msg: console_errors.append(msg.text)
            if msg.type == "error" and "Failed to load resource: net::ERR_" not in msg.text
            else None,
        )

        # FLOW 1: Guest Header, No exposed W01..W06 switcher, No 3D text, 4-col Footer
        page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        body_text = page.locator("body").inner_text()
        assert "Đăng nhập" in body_text and "Đăng ký" in body_text, "Guest Auth CTA missing in header"
        assert "W01 · Cá nhân" not in body_text, "Raw W01 selector leaked in guest header"
        assert "PomeloViewer" not in body_text and "Mô hình 3D" not in body_text and "Học & 3D" not in body_text, "Forbidden 3D label found on /"
        footer_text = page.locator("footer").inner_text()
        assert "25/11/2026" in footer_text and "95 Phường/Xã" in footer_text, "Footer missing dataset provenance"
        check_images_loaded(page, "/")
        page.screenshot(path=os.path.join(AFTER_DIR, "desktop", "home.png"))
        results["flow1_guest_header_footer"] = "PASS"

        # FLOW 2: Global Search (Unaccented Vietnamese + Phuoc Son + Zero Admin leakage)
        search_box = page.locator('header input[type="search"]').first
        search_box.fill("buoi tan trieu")
        search_box.press("Enter")
        page.wait_for_url("**/search?q=*", timeout=15000)
        page.wait_for_timeout(700)
        s_text = page.locator("main").inner_text()
        assert "Bưởi da xanh Tân Triều" in s_text, "Unaccented search failed to match Bưởi Tân Triều"

        page.goto(f"{BASE_URL}/search?q=Phuoc%20Son", wait_until="domcontentloaded")
        page.wait_for_timeout(700)
        ps_text = page.locator("main").inner_text()
        assert "Xã Phước Sơn" in ps_text and "25420" in ps_text, "Search failed to match Xã Phước Sơn (25420)"
        assert "PROTOTYPE_AUDIT_INIT" not in ps_text and "GR-01" not in ps_text, "Private admin/audit data leaked in search"
        page.screenshot(path=os.path.join(AFTER_DIR, "desktop", "search_phuoc_son.png"))
        results["flow2_global_search"] = "PASS"

        # FLOW 3: Auth Demo, Public Sign-Up Security, Signed-in Avatar & Sign-out
        page.goto(f"{BASE_URL}/sign-up", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        role_options = page.locator("#signup-role option").all_text_contents()
        assert all(x not in " ".join(role_options) for x in ["W04", "W05", "W06"]), f"Restricted roles leaked: {role_options}"

        page.goto(f"{BASE_URL}/sign-in", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(AFTER_DIR, "desktop", "sign_in.png"))
        page.get_by_role("button", name="Trải nghiệm tài khoản demo").first.click()
        page.wait_for_url("**/account", timeout=15000)
        page.wait_for_timeout(600)
        avatar_btn = page.locator('header button[aria-haspopup="menu"]').first
        assert avatar_btn.is_visible(), "Signed-in Avatar button not visible"
        avatar_btn.click()
        page.wait_for_timeout(300)
        assert page.get_by_role("button", name="Đăng xuất").is_visible(), "Avatar menu missing Đăng xuất"
        page.get_by_role("button", name="Đăng xuất").click()
        page.wait_for_timeout(400)
        assert page.locator('header a[href="/sign-in"]').first.is_visible(), "Sign-out failed to restore Guest header"
        results["flow3_auth_avatar_security"] = "PASS"

        # FLOW 4: Marketplace 10 Categories & 103 Products + Product Detail 2D (NO 3D/WebGL Canvas)
        page.goto(f"{BASE_URL}/marketplace", wait_until="domcontentloaded")
        page.wait_for_timeout(700)
        mkt_text = page.locator("main").inner_text()
        assert "10 Danh mục" in mkt_text and "103" in mkt_text, "Marketplace missing 10 categories / 103 products"
        check_images_loaded(page, "/marketplace")

        page.goto(f"{BASE_URL}/products/buoi-da-xanh-tan-trieu", wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        pd_text = page.locator("main").inner_text()
        assert "Thẻ giải phẫu nông sản 2D" in pd_text, "Missing ProduceAnatomy2D on product detail"
        assert "không có giá trị chứng nhận pháp lý" in pd_text, "Missing cert disclaimer"
        assert page.locator("canvas").count() == 0, "Unexpected WebGL/Three <canvas> element found on product detail"
        check_images_loaded(page, "/products/buoi-da-xanh-tan-trieu")
        page.screenshot(path=os.path.join(AFTER_DIR, "desktop", "product_detail.png"))
        results["flow4_marketplace_and_2d"] = "PASS"

        # FLOW 5: Add to Cart & COD Checkout Flow
        page.get_by_role("button", name="Thêm vào giỏ").first.click()
        page.wait_for_timeout(400)
        page.goto(f"{BASE_URL}/checkout", wait_until="domcontentloaded")
        page.wait_for_timeout(500)
        page.get_by_role("button", name="Xác nhận đặt hàng (Demo)").click()
        page.wait_for_url("**/account/orders/**", timeout=15000)
        page.wait_for_timeout(500)
        assert "NF-ORD-DEMO" in page.url, f"Unexpected order URL: {page.url}"
        results["flow5_cart_checkout"] = "PASS"

        # FLOW 6: W02 Farmer Season Diary -> Live Sync on QR Passport
        page.goto(f"{BASE_URL}/farmer", wait_until="domcontentloaded")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(AFTER_DIR, "desktop", "farmer.png"))
        page.locator('button:visible:has-text("Mùa vụ & Nhật ký")').first.click()
        page.wait_for_timeout(500)
        page.locator("#diary-title").fill("Thu hoạch mẫu E2E kiểm tra đồng bộ QR")
        page.locator('#diary button[type="submit"]').first.click()
        page.wait_for_timeout(500)
        page.goto(f"{BASE_URL}/trace/NF-DEMO-001", wait_until="domcontentloaded")
        page.wait_for_timeout(700)
        assert "Thu hoạch mẫu E2E kiểm tra đồng bộ QR" in page.locator("main").inner_text(), "Diary entry did not sync to QR Passport"
        results["flow6_farmer_diary_qr_sync"] = "PASS"

        # FLOW 7: Real QR PNG Upload Decode & Security Rejection on /trace/scan
        page.goto(f"{BASE_URL}/trace/scan", wait_until="domcontentloaded")
        page.wait_for_timeout(600)
        page.screenshot(path=os.path.join(AFTER_DIR, "desktop", "trace_scan.png"))
        # Malicious payload test
        scan_input = page.locator('input[aria-label="Nhập mã lô hoặc URL QR"]')
        scan_input.fill("javascript:alert(1)")
        scan_input.press("Enter")
        page.wait_for_timeout(400)
        assert "không an toàn" in page.locator('main [role="alert"]').first.inner_text(), "Security validator did not reject javascript: payload"

        # Real PNG file upload test
        page.set_input_files("#qr-file-upload", QR_TEMP_PNG)
        page.wait_for_url("**/trace/NF-DEMO-001", timeout=15000)
        page.wait_for_timeout(700)
        assert page.locator('svg').count() > 0, "Real QR SVG missing on trace page"
        results["flow7_qr_scanner_security"] = "PASS"

        # FLOW 8: Real Leaflet OSM + Mocked GPS Granted / Outside Dong Nai / Denied
        ctx_gps_in = browser.new_context(
            viewport={"width": 1440, "height": 900},
            locale="vi-VN",
            permissions=["geolocation"],
            geolocation={"latitude": 10.946, "longitude": 106.8235, "accuracy": 25},
        )
        p_in = ctx_gps_in.new_page()
        p_in.goto(f"{BASE_URL}/explore", wait_until="domcontentloaded")
        p_in.wait_for_timeout(1500)
        leaflet_box = p_in.locator(".leaflet-container").first.bounding_box()
        assert leaflet_box and leaflet_box["width"] > 300 and leaflet_box["height"] > 300, f"Leaflet failed to size: {leaflet_box}"
        p_in.get_by_role("button", name="Vị trí của tôi").click()
        p_in.wait_for_timeout(800)
        explore_txt = p_in.locator("main").inner_text()
        assert "đường chim bay" in explore_txt, "Turf straight-line distance did not render after GPS grant"
        p_in.get_by_role("button", name="Xem chi tiết 25/11/2026").click()
        p_in.wait_for_timeout(400)
        assert "386.56 km²" in p_in.locator("main").inner_text() and "659.163 km²" in p_in.locator("main").inner_text(), "Phước Sơn details missing"
        p_in.screenshot(path=os.path.join(AFTER_DIR, "desktop", "explore.png"))
        ctx_gps_in.close()

        # Outside Dong Nai GPS (Hanoi)
        ctx_gps_out = browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="vi-VN",
            permissions=["geolocation"],
            geolocation={"latitude": 21.0285, "longitude": 105.8542, "accuracy": 40},
        )
        p_out = ctx_gps_out.new_page()
        p_out.goto(f"{BASE_URL}/explore", wait_until="domcontentloaded")
        p_out.wait_for_timeout(1000)
        p_out.get_by_role("button", name="Vị trí của tôi").click()
        p_out.wait_for_timeout(700)
        assert "ngoài Thành phố Đồng Nai" in p_out.locator("main").inner_text(), "Outside Dong Nai notice missing"
        ctx_gps_out.close()

        # Denied GPS context
        ctx_gps_denied = browser.new_context(viewport={"width": 1280, "height": 800}, locale="vi-VN")
        p_den = ctx_gps_denied.new_page()
        p_den.goto(f"{BASE_URL}/explore", wait_until="domcontentloaded")
        p_den.wait_for_timeout(1000)
        p_den.get_by_role("button", name="Vị trí của tôi").click()
        p_den.wait_for_timeout(700)
        assert p_den.locator("main").inner_text(), "Denied GPS crashed explore page"
        ctx_gps_denied.close()
        results["flow8_leaflet_osm_gps"] = "PASS"

        # FLOW 9-12: Workspaces + Learn (12 lessons, 2D Anatomy) + Live (12) + Demo Hub
        for name, route in [
            ("volunteer", "/volunteer"),
            ("learn", "/learn"),
            ("live", "/live"),
            ("coordinator", "/coordinator"),
            ("organization", "/organization"),
            ("admin", "/admin"),
            ("demo", "/demo"),
        ]:
            page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded")
            page.wait_for_timeout(800)
            check_images_loaded(page, route)
            if name in ("volunteer", "learn", "demo"):
                page.screenshot(path=os.path.join(AFTER_DIR, "desktop", f"{name}.png"))
        results["flow9_to_12_workspaces"] = "PASS"

        # FLOW 13: Responsive Matrix (320, 375, 390, 768, 1024, 1280, 1440) + Mobile Screenshots
        widths = [320, 375, 390, 768, 1024, 1280, 1440]
        check_routes = ["/", "/explore", "/marketplace", "/products/buoi-da-xanh-tan-trieu", "/farmer", "/trace/scan", "/sign-in"]
        overflow_failures = []
        for w in widths:
            page.set_viewport_size({"width": w, "height": 844})
            for route in check_routes:
                page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded")
                page.wait_for_timeout(450)
                metrics = page.evaluate("() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth })")
                if metrics["sw"] > metrics["iw"] + 1:
                    overflow_failures.append(f"{route}@{w}: {metrics['sw']} > {metrics['iw']}")
        assert not overflow_failures, f"Horizontal overflow detected: {overflow_failures}"

        # Capture clean 390x844 mobile after screenshots
        page.set_viewport_size({"width": 390, "height": 844})
        for name, route in [
            ("home", "/"),
            ("explore", "/explore"),
            ("product_detail", "/products/buoi-da-xanh-tan-trieu"),
            ("farmer", "/farmer"),
            ("volunteer", "/volunteer"),
            ("learn", "/learn"),
            ("demo", "/demo"),
            ("trace_scan", "/trace/scan"),
        ]:
            page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded")
            page.wait_for_timeout(900)
            page.screenshot(path=os.path.join(AFTER_DIR, "mobile", f"{name}.png"))

        results["flow13_responsive_and_screenshots"] = "PASS"
        assert not page_errors, f"Uncaught page errors: {page_errors}"
        assert not console_errors, f"Console errors: {console_errors}"
        assert not failed_local_requests, f"Failed local requests: {failed_local_requests}"
        assert not bad_local_responses, f"HTTP >=400 local responses: {bad_local_responses}"

        ctx.close()
        browser.close()

    print(
        json.dumps(
            {
                "status": "ALL_E2E_PASS",
                "results": results,
                "failedExternalHostsObserved": sorted(failed_external_hosts),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
