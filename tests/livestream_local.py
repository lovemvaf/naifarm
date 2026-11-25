"""Exercise the full app stack with actual Supabase and LiveKit, using virtual cameras."""
import json
import re
import sys

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, expect, sync_playwright


def login(page, email):
    page.get_by_role("button", name="Đăng nhập pilot").click()
    page.get_by_label("Email").fill(email)
    page.get_by_label("Mật khẩu").fill(config["password"])
    page.get_by_role("button", name="Đăng nhập", exact=True).click()
    expect(page.get_by_role("button", name="Đăng xuất")).to_be_visible()


def playing(page):
    try:
        page.wait_for_function("document.querySelector('video')?.videoWidth > 0", timeout=20000)
    except PlaywrightTimeoutError:
        print("Video state:", page.evaluate("""() => {
                  const video = document.querySelector('video');
                  return video && [video.readyState, video.paused, video.srcObject?.getVideoTracks().map(track => track.readyState)];
              }"""))
        raise


config = json.load(sys.stdin)
origin = config["origin"]
with sync_playwright() as pw:
    browser = pw.chromium.launch(args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream=device-count=4"])
    try:
        host = browser.new_page()
        host.goto(f"{origin}/live/studio")
        login(host, config["hostEmail"])
        host.get_by_label("Tiêu đề").fill(config["title"])
        host.locator('input[name="products"][value="P01"]').check()
        host.get_by_role("button", name="Tạo lịch").click()
        host.wait_for_url("**/live/studio/*")
        updated_title = f"{config['title']} đã sửa"
        host.get_by_label("Tiêu đề").fill(updated_title)
        host.get_by_role("button", name="Lưu lịch").click()
        expect(host.get_by_role("heading", name=updated_title)).to_be_visible()
        viewer_url = host.get_by_role("link", name="Mở trang xem").get_attribute("href")
        viewer = browser.new_page()
        with viewer.expect_response(f"{origin}/api/live", timeout=20000) as discovery:
            viewer.goto(f"{origin}/live")
        assert discovery.value.ok, f"Could not read public schedule (HTTP {discovery.value.status})"
        expect(viewer.get_by_text("Chủ phiên · host", exact=True)).to_be_visible(timeout=15000)
        expect(viewer.get_by_text("Ảnh minh họa", exact=True).first).to_be_visible()
        viewer.get_by_role("link", name=updated_title, exact=True).click()
        viewer.wait_for_url(origin + viewer_url)
        expect(viewer.get_by_text("Phiên đang chờ nhà vườn lên sóng")).to_be_visible()
        detail = viewer.request.get(f"{origin}/api{viewer_url}").json()["session"]
        assert detail["host_name"] == "host" and "owner_id" not in detail
        print("PASS public schedule shows farm thumbnail and organizer without exposing the owner ID")

        host.get_by_role("button", name="Xem trước camera").click()
        playing(host)
        devices = host.get_by_label("Thiết bị camera")
        # Chromium's second fake camera produces depth frames. Use the other color device.
        alternative = devices.get_by_role("option", name="fake_device_3", exact=True).get_attribute("value")
        assert alternative
        current_device = host.evaluate("document.querySelector('video').srcObject.getVideoTracks()[0].getSettings().deviceId")
        assert alternative != current_device
        devices.select_option(alternative)
        host.get_by_role("button", name="Xem trước camera").click()
        host.wait_for_function(
            "device => document.querySelector('video').srcObject?.getVideoTracks()[0]?.getSettings().deviceId === device",
            arg=alternative,
        )
        host.get_by_role("button", name="Kiểm tra mic").click()
        expect(host.get_by_role("meter", name="Mức tín hiệu mic")).to_be_visible()
        expect(host.get_by_label("Thiết bị mic")).to_be_visible()
        host.wait_for_function("document.querySelector('meter')?.value > 0", timeout=10000)
        host.get_by_role("button", name="Bắt đầu phát").click()
        expect(host.get_by_text("Đang phát", exact=True)).to_be_visible(timeout=35000)
        host.wait_for_function(
            "device => document.querySelector('video').srcObject?.getVideoTracks()[0]?.getSettings().deviceId === device",
            arg=alternative,
        )
        playing(viewer)
        expect(host.get_by_role("meter")).to_have_count(0)
        expect(host.get_by_text("Thời gian phát", exact=False)).to_be_visible()
        expect(host.get_by_text("Chất lượng kết nối", exact=False)).to_be_visible()
        print("PASS studio microphone preview, selected camera published and stream status")
        audio_track = viewer.wait_for_function("document.querySelector('audio')?.srcObject?.getAudioTracks()[0]?.id").json_value()
        assert viewer.evaluate("document.querySelector('audio').muted")
        viewer.get_by_role("button", name="Bật âm thanh").click()
        viewer.wait_for_function("!document.querySelector('audio').muted && !document.querySelector('audio').paused")
        viewer.get_by_role("button", name="Tắt âm thanh").click()
        assert viewer.evaluate("document.querySelector('audio').muted")
        viewer.get_by_role("button", name="Bật âm thanh").click()
        viewer.get_by_role("button", name="Toàn màn hình").click()
        viewer.wait_for_function("document.fullscreenElement?.tagName === 'VIDEO'")
        viewer.evaluate("document.exitFullscreen()")
        primary_track = viewer.evaluate("document.querySelector('video').srcObject.getVideoTracks()[0].id")
        chat = browser.new_page()
        chat.goto(origin + viewer_url)
        login(chat, config["chatEmail"])
        playing(chat)
        for page in (host, viewer, chat):
            expect(page.get_by_text("2 người xem", exact=False)).to_be_visible(timeout=20000)

        host.get_by_role("button", name="Tạo QR ghép camera").click()
        pairing_url = host.get_by_label("Đường dẫn ghép camera").input_value()
        denied = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        denied.add_init_script("""
          const media = navigator.mediaDevices;
          Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: new Proxy(media, {
            get(target, key) { return key === 'getUserMedia' ? () => Promise.reject(new DOMException('', 'NotAllowedError')) : Reflect.get(target, key, target); }
          }) });
        """)
        denied.goto(pairing_url)
        denied.get_by_role("button", name="Cho phép và xem trước").click()
        expect(denied.locator('p[role="alert"]')).to_contain_text("Bạn chưa cấp quyền camera")
        denied.close()
        camera = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        camera.goto(pairing_url)
        camera.get_by_role("button", name="Cho phép và xem trước").click()
        camera.get_by_role("button", name="Phát camera phụ").click()
        expect(camera.get_by_text("Đang phát video từ điện thoại.")).to_be_visible(timeout=20000)
        camera.get_by_role("button", name="Đổi camera trước/sau").click()
        camera.wait_for_function("document.querySelector('video')?.videoWidth > 0", timeout=15000)
        expect(camera.get_by_text("Đang phát video từ điện thoại.")).to_be_visible()
        expect(host.get_by_text("Camera phụ · Đang phát")).to_be_visible(timeout=15000)
        invalid_angle = viewer.request.post(f"{origin}/api{viewer_url}/camera-angle",
                                            data=json.dumps({"identity": "camera-not-paired"}),
                                            headers={"Content-Type": "application/json"})
        assert invalid_angle.status == 409, f"Unpaired camera selection should be rejected (HTTP {invalid_angle.status})"
        viewer.get_by_role("button", name="Camera điện thoại").click()
        expect(viewer.get_by_role("button", name="Camera điện thoại")).to_have_attribute("aria-pressed", "true")
        expect(chat.get_by_role("button", name="Camera điện thoại")).to_have_attribute("aria-pressed", "true", timeout=15000)
        viewer.wait_for_function(
            "(primary) => { const track = document.querySelector('video').srcObject?.getVideoTracks()[0]; return track && track.id !== primary; }",
            arg=primary_track,
        )
        playing(viewer)
        expect(chat.get_by_role("button", name="Camera điện thoại")).to_have_attribute("aria-pressed", "true")
        assert viewer.evaluate("document.querySelector('audio').srcObject.getAudioTracks()[0].id") == audio_track
        chat.get_by_role("button", name="Camera chính").click()
        expect(viewer.get_by_role("button", name="Camera chính")).to_have_attribute("aria-pressed", "true", timeout=15000)
        camera.get_by_role("button", name="Ngắt camera").click()
        expect(host.get_by_text("Camera phụ · Không phát")).to_be_visible(timeout=15000)
        expect(viewer.get_by_role("button", name="Camera chính")).to_have_attribute("aria-pressed", "true", timeout=20000)
        expect(chat.get_by_role("button", name="Camera chính")).to_have_attribute("aria-pressed", "true", timeout=20000)

        message_url = f"{origin}/api{viewer_url}/messages?"
        try:
            with viewer.expect_request(lambda request: request.method == "GET" and request.url.startswith(message_url), timeout=10000):
                pass
        except PlaywrightTimeoutError:
            print("PASS no chat GET during a 10-second idle window")
        else:
            raise AssertionError("Unexpected chat refresh while the viewer was idle")

        message = "Tin nhắn từ Supabase Auth thật"
        chat.get_by_role("textbox", name="Tin nhắn").fill(message)
        chat.get_by_role("button", name="Gửi", exact=True).click()
        expect(host.get_by_text(message, exact=False)).to_be_visible(timeout=15000)
        guest_message = viewer.get_by_role("listitem").filter(has_text=message)
        expect(guest_message.locator("time")).to_be_visible(timeout=15000)
        expect(guest_message.get_by_text("Chủ phiên", exact=True)).to_have_count(0)
        host.get_by_role("button", name="Ẩn tin nhắn").click()
        expect(viewer.get_by_text(message, exact=False)).to_have_count(0)
        host_message = "Chào mọi người từ nhà vườn"
        host.get_by_role("textbox", name="Tin nhắn").fill(host_message)
        host.get_by_role("button", name="Gửi", exact=True).click()
        host_row = viewer.get_by_role("listitem").filter(has_text=host_message)
        expect(host_row.get_by_text("Chủ phiên", exact=True)).to_be_visible(timeout=15000)
        expect(host_row.locator("time")).to_have_attribute("datetime", re.compile(r"^\d{4}-\d{2}-\d{2}T"))

        pin = host.get_by_label("Sản phẩm đang ghim")
        pin_url = f"{origin}/api{viewer_url}/pin"
        with host.expect_response(pin_url) as response:
            pin.select_option("P01")
        assert response.value.ok, f"Could not pin product (HTTP {response.value.status})"
        expect(pin).to_have_value("P01")
        for page in (viewer, chat):
            expect(page.get_by_role("button", name="Thêm vào giỏ demo")).to_be_visible(timeout=15000)
        late_viewer = browser.new_page()
        late_viewer.goto(f"{origin}/live")
        expect(late_viewer.get_by_role("link", name=updated_title, exact=True)).to_be_visible(timeout=15000)
        expect(late_viewer.get_by_role("button", name="Thêm vào giỏ demo")).to_be_visible(timeout=15000)
        playing(late_viewer)
        expect(late_viewer.get_by_role("link", name="Chôm chôm Java Long Khánh", exact=True)).to_have_attribute("href", re.compile(r"^/products/"))
        late_viewer.get_by_role("button", name="Đặt nhanh (COD Demo)").click()
        late_viewer.wait_for_url("**/checkout")
        expect(late_viewer.get_by_text("Chôm chôm Java Long Khánh", exact=True)).to_be_visible()
        late_viewer.close()
        print("PASS late viewer receives video and the pinned product, then opens demo checkout with that product")
        viewer.context.set_offline(True)
        with host.expect_response(pin_url) as response:
            pin.select_option("")
        assert response.value.ok, f"Could not unpin product (HTTP {response.value.status})"
        expect(chat.get_by_role("button", name="Thêm vào giỏ demo")).to_have_count(0, timeout=15000)
        expect(viewer.get_by_role("button", name="Thêm vào giỏ demo")).to_be_visible()
        viewer.context.set_offline(False)
        expect(viewer.get_by_role("button", name="Thêm vào giỏ demo")).to_have_count(0, timeout=15000)
        playing(viewer)
        print("PASS viewer recovers pinned state after being offline")

        host.reload()
        expect(host.get_by_text("Đang kết nối lại", exact=True)).to_be_visible(timeout=20000)
        host.get_by_role("button", name="Kết nối camera chính").click()
        expect(host.get_by_text("Đang phát", exact=True)).to_be_visible(timeout=25000)
        playing(viewer)
        expect(chat.get_by_role("button", name="Camera chính")).to_have_attribute("aria-pressed", "true")
        print("PASS host returns to the same broadcast after reloading studio")

        host.once("dialog", lambda dialog: dialog.accept())
        host.get_by_role("button", name="Kết thúc phiên").click()
        expect(viewer.get_by_text("Phiên đã kết thúc")).to_be_visible(timeout=15000)
        host.get_by_role("link", name="Tạo phiên mới").click()
        host.get_by_label("Tiêu đề").fill(f"{config['title']} hủy lịch")
        host.get_by_role("button", name="Tạo lịch").click()
        host.wait_for_url("**/live/studio/*")
        host.once("dialog", lambda dialog: dialog.accept())
        host.get_by_role("button", name="Hủy lịch").click()
        expect(host.get_by_text("Đã hủy", exact=True)).to_be_visible()
        print("PASS schedule updates and cancellation through the real studio API")
        print("PASS viewer audio toggle and browser fullscreen")
        print("PASS unmocked studio, pilot Auth, two viewers, QR, media, Realtime chat, moderation and pinning")
    finally:
        browser.close()
