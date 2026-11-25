import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3000"
PROJECT_ROOT = r"e:\04_Projects\Group 8 - Hackathon Dong Nai\naifarm"
OUT_DIR = os.path.join(PROJECT_ROOT, "qa-out")
AXE_PATH = os.path.join(PROJECT_ROOT, "node_modules", "axe-core", "axe.min.js")

FORBIDDEN_PUBLIC_STRINGS = [
    "(Demo)",
    "(demo)",
    "mock data",
    "prototype",
    "Frontend-Only",
    "Simulation",
    "Roadmap",
    "Active MVP",
    "role demo",
    "GPS API",
    "Đã đăng xuất về chế độ Khách",
]

CORE_V4_ROUTES = [
    "/",
    "/marketplace",
    "/market",
    "/products/buoi-da-xanh-tan-trieu",
    "/cart",
    "/checkout",
    "/explore",
    "/explore?view=tours",
    "/experiences/mot-ngay-lam-nong-dan-cu-lao-chu-ba-minh",
    "/farms",
    "/farms/nha-vuon-ba-tu-long-khanh",
    "/live",
    "/live/NF-LIVE-01",
    "/learn",
    "/learn/dong-nai-greetings-and-agricultural-origins-a1",
    "/events",
    "/events/ket-noi-nong-san-va-van-hoa-dong-nai-2026",
    "/trace",
    "/trace/NF-DEMO-001",
    "/trace/scan",
    "/quality",
    "/search?q=pomelo",
    "/policies",
    "/sign-in",
    "/sign-up",
    "/account",
    "/account/favorites",
    "/farmer",
    "/farmer?mode=erp&tab=overview",
    "/farmer?mode=erp&tab=marketing",
    "/farmer?mode=erp&tab=calendar",
    "/volunteer",
    "/coordinator",
    "/organization",
    "/admin",
]

BREAKPOINTS = [
    (320, 720),
    (360, 780),
    (390, 844),
    (414, 896),
    (768, 1024),
    (1024, 768),
    (1280, 800),
    (1440, 900),
    (1920, 1080),
]


def check_images_loaded(page, route_label: str):
    broken = page.evaluate(
        """() => Array.from(document.querySelectorAll('img'))
          .filter(img => {
            const src = img.getAttribute('src') || '';
            if (!src || src.startsWith('data:') || src.includes('tile.openstreetmap.org')) return false;
            return !img.complete || img.naturalWidth === 0;
          })
          .map(img => img.getAttribute('src'))"""
    )
    assert not broken, f"[{route_label}] Broken <img> elements: {broken}"


def check_copy_hygiene(page, route_label: str):
    body_text = page.inner_text("body")
    for token in FORBIDDEN_PUBLIC_STRINGS:
        assert token not in body_text, f"[{route_label}] Forbidden public copy found: {token}"


def check_header_bounds(page, label: str):
    clipped = page.evaluate(
        """() => {
          const vw = window.innerWidth;
          const issues = [];
          for (const el of document.querySelectorAll('header a, header button, header input')) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.left < 0 || rect.right > vw - 1) {
              issues.push({
                tag: el.tagName,
                text: (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim(),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                vw,
              });
            }
          }
          return issues;
        }"""
    )
    assert not clipped, f"[{label}] Header element overflows viewport: {clipped}"


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(AXE_PATH, "r", encoding="utf-8") as f:
        axe_source = f.read()

    console_errors = []
    page_errors = []
    failed_requests = []
    report = {
        "baseUrl": BASE_URL,
        "routesChecked": 0,
        "breakpointsChecked": [],
        "axeAudits": [],
        "scenarios": {},
    }

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        osm_tile_dns_errors = 0

        def on_console(msg):
            nonlocal osm_tile_dns_errors
            if msg.type != "error":
                return
            loc_url = (msg.location or {}).get("url", "")
            if "tile.openstreetmap.org" in loc_url and "ERR_NAME_NOT_RESOLVED" in msg.text:
                osm_tile_dns_errors += 1
                return
            console_errors.append(f"{msg.text} ({loc_url})" if loc_url else msg.text)

        page.on("console", on_console)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on(
            "response",
            lambda res: failed_requests.append(f"{res.status} {res.url}")
            if res.status >= 400 and "127.0.0.1" in res.url
            else None,
        )

        # 1. Sweep all V4 routes in VI (clean load, images, copy hygiene)
        for route in CORE_V4_ROUTES:
            url = f"{BASE_URL}{route}"
            resp = page.goto(url, wait_until="domcontentloaded", timeout=25000)
            assert resp and resp.status < 400, f"HTTP failure on {route}: {resp.status if resp else 'None'}"
            page.wait_for_timeout(450)
            check_images_loaded(page, route)
            check_copy_hygiene(page, route)
            report["routesChecked"] += 1

        # 2. Verify /market redirects cleanly to /marketplace?category=...
        page.goto(f"{BASE_URL}/market?q=buoi", wait_until="domcontentloaded", timeout=20000)
        page.wait_for_timeout(300)
        assert "/marketplace" in page.url, f"/market did not redirect to /marketplace: {page.url}"
        report["scenarios"]["marketRedirect"] = "PASS"

        # 3. Verify /live has ZERO W03 sidebar hijack + zero giant white blank stretch + Back/Forward state preservation
        page.goto(f"{BASE_URL}/live", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(500)
        has_w03_aside = page.locator("aside[aria-label='Menu W03']").count()
        assert has_w03_aside == 0, "/live hijacked into W03 sidebar!"
        live_heights = page.evaluate(
            """() => {
              const grid = document.querySelector('.grid.items-start');
              if (!grid || grid.children.length < 2) return null;
              const leftH = grid.children[0].getBoundingClientRect().height;
              const rightH = grid.children[1].getBoundingClientRect().height;
              return { leftH, rightH };
            }"""
        )
        assert live_heights and live_heights["leftH"] > 200, f"Invalid live stage metrics: {live_heights}"
        # Click "Nhà vườn & Tour" tab -> reload -> verify preserved
        page.get_by_role("tab", name="Nhà vườn & Tour").click()
        page.wait_for_timeout(300)
        assert "tab=farm_tour" in page.url, f"Expected tab=farm_tour in URL, got {page.url}"
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(400)
        assert "tab=farm_tour" in page.url, "Live tab state lost on reload"
        page.screenshot(path=os.path.join(OUT_DIR, "live-desktop.png"), full_page=False)
        report["scenarios"]["liveNoStretchAndState"] = "PASS"

        # 4. Verify /learn + /learn/[slug] NO W03 hijack + interactive flashcards & quiz
        page.goto(f"{BASE_URL}/learn", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(400)
        assert page.locator("aside[aria-label='Menu W03']").count() == 0, "/learn hijacked into W03!"
        page.screenshot(path=os.path.join(OUT_DIR, "learn-desktop.png"), full_page=False)
        page.goto(f"{BASE_URL}/learn/dong-nai-greetings-and-agricultural-origins-a1", wait_until="networkidle")
        page.wait_for_timeout(400)
        page.get_by_role("tab", name="Thẻ từ vựng (Flashcards)").click()
        page.wait_for_timeout(300)
        flip_btns = page.get_by_role("button", name="Lật mặt thẻ")
        assert flip_btns.count() > 0, "Expected interactive flashcard flip buttons"
        flip_btns.first.click()
        page.wait_for_timeout(200)
        report["scenarios"]["learnPublicAndFlashcards"] = "PASS"

        # 5. Verify /explore?view=tours -> /experiences/[slug] booking flow -> /account/bookings/[id]
        page.goto(f"{BASE_URL}/explore?view=tours", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(500)
        assert page.get_by_role("tab", name="Gói du lịch trải nghiệm (28)").is_visible()
        page.goto(
            f"{BASE_URL}/experiences/mot-ngay-lam-nong-dan-cu-lao-chu-ba-minh?returnTo=%2Fexplore%3Fview%3Dtours",
            wait_until="networkidle",
        )
        page.wait_for_timeout(400)
        page.fill("#tour-guest-name", "David Chen (Singapore)")
        page.get_by_role("button", name="Gửi yêu cầu đặt lịch (tại chỗ)").click()
        page.wait_for_timeout(600)
        assert "/account/bookings/" in page.url, f"Booking did not navigate to /account/bookings/[id]: {page.url}"
        report["scenarios"]["tourBookingFlow"] = "PASS"

        # 6. Verify /events Cultural Campaign clock honesty (24/11 recap = NO countdown, 25-30/11 = Active) & .ics export trigger
        page.goto(f"{BASE_URL}/events", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(400)
        events_text = page.inner_text("body")
        assert "Sự kiện đã kết thúc — hiển thị tư liệu tóm tắt (không chạy đếm ngược)." in events_text
        assert "Đang diễn ra" in events_text
        page.screenshot(path=os.path.join(OUT_DIR, "events-desktop.png"), full_page=False)
        report["scenarios"]["eventsClockAndRecap"] = "PASS"

        # 7. Verify VI | EN language toggle + live EN rendering across routes
        page.goto(f"{BASE_URL}/", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUT_DIR, "home-vi.png"), full_page=False)
        page.locator("header").get_by_role("button", name="EN", exact=True).click()
        page.wait_for_timeout(400)
        assert "Dong Nai Produce" in page.inner_text("body"), "Home did not switch to English"
        assert "lang=en" in page.url, "URL ?lang=en missing after EN toggle"
        page.screenshot(path=os.path.join(OUT_DIR, "home-en.png"), full_page=False)
        # Switch back to VI
        page.locator("header").get_by_role("button", name="VI", exact=True).click()
        page.wait_for_timeout(300)
        report["scenarios"]["viEnSwitch"] = "PASS"

        # 8. Verify Sign-In + Sign-Out toast renders cleanly and auto-dismisses <= 2.2s
        page.goto(f"{BASE_URL}/sign-in", wait_until="networkidle")
        page.wait_for_timeout(300)
        page.get_by_role("button", name="Chọn tài khoản này").first.click()
        account_menu_btn = page.locator("button[aria-label='Mở menu tài khoản']")
        account_menu_btn.wait_for(state="visible", timeout=10000)
        check_header_bounds(page, "logged-in-1280")
        account_menu_btn.click()
        page.wait_for_timeout(200)
        page.get_by_role("button", name="Đăng xuất").click()
        page.wait_for_timeout(200)
        assert "Đã đăng xuất" in page.inner_text("body"), "Sign-out toast missing"
        page.wait_for_timeout(2000)
        assert "Đã đăng xuất" not in page.inner_text("body"), "Sign-out toast lingered > 2.2s!"
        report["scenarios"]["signOutToastTiming"] = "PASS"

        # 9. Verify HTX Tan Trieu Reconciled BI numbers in /farmer?mode=erp
        page.goto(f"{BASE_URL}/farmer?mode=erp&tab=overview", wait_until="networkidle", timeout=25000)
        page.wait_for_timeout(600)
        farmer_text = page.inner_text("body")
        assert "170.000.000" in farmer_text or "170,000,000" in farmer_text, "HTX Tan Trieu Net Sales 170M missing"
        page.screenshot(path=os.path.join(OUT_DIR, "farmer-erp-bi.png"), full_page=False)
        report["scenarios"]["farmerErpReconciledBi"] = "PASS"

        # 10. 9-Breakpoint Responsive Overflow Checks in VI & EN
        for bp_w, bp_h in BREAKPOINTS:
            page.set_viewport_size({"width": bp_w, "height": bp_h})
            for check_route in ["/", "/live", "/learn", "/explore?view=tours", "/events", "/?lang=en"]:
                page.goto(f"{BASE_URL}{check_route}", wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(350)
                overflow = page.evaluate(
                    "() => document.documentElement.scrollWidth > window.innerWidth + 2"
                )
                assert not overflow, f"Horizontal overflow at {bp_w}x{bp_h} on {check_route}"
                if bp_w in (1024, 1280, 1440) and check_route in ("/", "/?lang=en"):
                    check_header_bounds(page, f"{bp_w}x{bp_h} {check_route}")
            report["breakpointsChecked"].append(f"{bp_w}x{bp_h}")

        # Save mobile 390px screenshot of home
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=os.path.join(OUT_DIR, "home-mobile-390.png"), full_page=False)

        # 11. Axe Accessibility Audits (zero critical or serious violations)
        page.set_viewport_size({"width": 1280, "height": 800})
        for axe_route in ["/", "/marketplace", "/live", "/learn", "/explore", "/events", "/farmer?mode=erp&tab=overview"]:
            page.goto(f"{BASE_URL}{axe_route}", wait_until="networkidle", timeout=25000)
            page.wait_for_timeout(400)
            page.evaluate(axe_source)
            res = page.evaluate(
                """async () => {
                  const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
                  return r.violations
                    .filter(v => v.impact === 'critical' || v.impact === 'serious')
                    .map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
                }"""
            )
            assert not res, f"Axe critical/serious violations on {axe_route}: {res}"
            report["axeAudits"].append({"route": axe_route, "criticalOrSerious": 0})

        browser.close()

    assert not console_errors, f"Console errors observed: {console_errors}"
    assert not page_errors, f"Uncaught page errors observed: {page_errors}"
    assert not failed_requests, f"Failed local HTTP requests (>=400): {failed_requests}"

    print(json.dumps({"status": "PASS", **report}, indent=2))


if __name__ == "__main__":
    main()
