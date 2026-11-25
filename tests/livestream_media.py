"""Drive the real viewer and camera pages with disposable LiveKit Cloud media.

The fixture supplies NaiFarm API responses so this test isolates RTC and rendered media.
Provider tokens arrive over stdin and are never written to disk or printed.
"""
import json
import os
import sys
import time
from urllib.parse import urlparse

from playwright.sync_api import expect, sync_playwright

base = os.environ.get("NAIFARM_E2E_URL", "http://127.0.0.1:3097").rstrip("/")
fixture = json.load(sys.stdin)
session_id = fixture["id"]
session = {
    "id": session_id,
    "farm_id": "farm-ba-tu-demo",
    "title": "Kiểm thử LiveKit",
    "description": "",
    "scheduled_at": None,
    "status": "live",
    "product_ids": ["P01"],
    "pinned_product_id": None,
    "selected_camera_identity": None,
    "revision": 1,
    "room_ready": True,
}
studio_session = {"sessions": [{**session, "status": "scheduled", "room_ready": False}], "farms": [session["farm_id"]]}
pilot_token = "fixture-access-token"
used_camera = False
messages = []
subscriptions = []
pairing_code = "A" * 43


def realtime(socket):
    def receive(raw):
        join, ref, topic, event, payload = json.loads(raw)
        response = {}
        if event == "phx_join":
            binding = payload["config"]["postgres_changes"][0]
            subscriptions.append((socket, join, topic))
            response["postgres_changes"] = [{"id": 1, **binding}]
        if event == "phx_leave":
            subscriptions[:] = [item for item in subscriptions if item[0] != socket or item[2] != topic]
        if event in ("phx_join", "heartbeat", "phx_leave"):
            socket.send(json.dumps([join, ref, topic, "phx_reply", {"status": "ok", "response": response}]))
    socket.on_message(receive)


def revision(number):
    for socket, join, topic in subscriptions:
        socket.send(json.dumps([join, None, topic, "postgres_changes", {"ids": [1], "data": {
            "schema": "public", "table": "live_updates", "type": "UPDATE",
            "columns": [{"name": "session_id", "type": "uuid"}, {"name": "session_revision", "type": "int8"}, {"name": "chat_revision", "type": "int8"}],
            "record": {"session_id": session_id, "session_revision": session["revision"], "chat_revision": number},
        }}]))


def respond(route, viewer_token=None):
    global used_camera
    path = urlparse(route.request.url).path.removeprefix("/api/live")
    if path == "/config":
        route.fulfill(json={"url": os.environ.get("NEXT_PUBLIC_SUPABASE_URL", base), "key": "sb_publishable_media_fixture"})
    elif path == "":
        assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
        route.fulfill(json=studio_session)
    elif path == f"/{session_id}/start":
        assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
        studio_session["sessions"] = [session]
        route.fulfill(json={"status": "starting", "ready": True})
    elif path == f"/{session_id}/token":
        assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
        route.fulfill(json={"url": fixture["url"], "token": fixture["host"]})
    elif path == f"/{session_id}/cameras/pair":
        assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
        route.fulfill(json={"code": pairing_code, "expiresAt": "2026-11-25T01:00:00Z"})
    elif path == f"/{session_id}/pin":
        assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
        session.update({"pinned_product_id": route.request.post_data_json["productId"], "revision": 2})
        route.fulfill(json={"ok": True})
        revision(3)
    elif path == f"/{session_id}/camera-angle":
        identity = route.request.post_data_json["identity"]
        assert identity.startswith("camera-")
        session.update({"selected_camera_identity": identity, "revision": session["revision"] + 1})
        route.fulfill(json={"ok": True})
        revision(0)
    elif path == f"/{session_id}/end":
        assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
        session.update({"status": "ended", "room_ready": False, "revision": 3})
        route.fulfill(json={"status": "ended"})
        revision(4)
    elif path == f"/{session_id}/viewer-token":
        route.fulfill(json={"url": fixture["url"], "token": viewer_token})
    elif path == f"/{session_id}":
        route.fulfill(json={"session": session})
    elif path == f"/{session_id}/messages":
        if route.request.method == "POST":
            assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
            messages.append({"id": "fixture-message", "sender_name": "Nhà vườn",
                             "body": route.request.post_data_json["body"], "created_at": "2026-11-25T00:00:00Z",
                             "is_host": True})
            route.fulfill(json={"ok": True})
            revision(1)
        elif route.request.method == "DELETE":
            assert route.request.headers.get("authorization") == f"Bearer {pilot_token}"
            assert route.request.post_data_json["messageId"] == "fixture-message"
            messages.clear()
            route.fulfill(json={"ok": True})
            revision(2)
        else:
            route.fulfill(json={"messages": messages})
    elif path == "/cameras/redeem":
        if used_camera:
            route.fulfill(status=410, json={"error": "Mã đã dùng."})
        else:
            assert route.request.post_data_json["code"] == pairing_code
            used_camera = True
            route.fulfill(json={"url": fixture["url"], "token": fixture["camera"]})
    else:
        route.fulfill(status=404, json={"error": "Unexpected fixture API"})


def playing(page):
    page.wait_for_function("document.querySelector('video')?.videoWidth > 0", timeout=15000)

def for_viewer(token):
    return lambda route: respond(route, token)

def sign_in(route):
    route.fulfill(json={
        "access_token": pilot_token, "refresh_token": "fixture-refresh-token",
        "expires_in": 3600, "expires_at": int(time.time()) + 3600,
        "token_type": "bearer", "user": {"id": session_id, "aud": "authenticated"},
    })


with sync_playwright() as browser_tools:
    browser = browser_tools.chromium.launch(args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"])
    try:
        host = browser.new_page()
        host.route("**/api/live**", respond)
        host.route("**/auth/v1/token?*", sign_in)
        host.route("**/rest/v1/profiles**", lambda route: route.fulfill(json={
            "id": session_id, "role": "farmer", "full_name": "Nhà vườn kiểm thử",
            "farm_id": session["farm_id"], "phone": None,
        }))
        host.route_web_socket("**/realtime/v1/websocket?*", realtime)
        host.goto(f"{base}/live/studio/{session_id}", wait_until="domcontentloaded")
        host.goto(f"{base}/sign-in", wait_until="domcontentloaded")
        host.get_by_label("Email").fill("host@example.test")
        host.get_by_label("Mật khẩu").fill("fixture-password")
        host.get_by_role("button", name="Đăng nhập", exact=True).click()
        host.wait_for_url(lambda url: "/sign-in" not in str(url), timeout=20000)
        host.goto(f"{base}/live/studio/{session_id}", wait_until="domcontentloaded")
        host.get_by_role("button", name="Xem trước camera").click()
        playing(host)
        host.get_by_role("button", name="Bắt đầu phát").click()
        expect(host.get_by_role("button", name="Tắt camera")).to_be_visible(timeout=15000)
        playing(host)
        host.get_by_role("button", name="Tạo QR ghép camera").click()
        expect(host.get_by_role("img", name="QR ghép camera phụ")).to_be_visible()
        pairing_url = host.get_by_label("Đường dẫn ghép camera").input_value()

        camera = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        camera.route("**/api/live/**", lambda route: respond(route))
        camera.goto(pairing_url, wait_until="domcontentloaded")
        camera.get_by_role("button", name="Cho phép và xem trước").click()
        playing(camera)
        assert "#" not in camera.url
        camera.get_by_role("button", name="Phát camera phụ").click()
        expect(camera.get_by_text("Đang phát video từ điện thoại.")).to_be_visible(timeout=15000)

        viewers = []
        for token in fixture["viewers"]:
            page = browser.new_page()
            page.route_web_socket("**/realtime/v1/websocket?*", realtime)
            page.route("**/api/live/**", for_viewer(token))
            page.goto(f"{base}/live/{session_id}", wait_until="domcontentloaded")
            expect(page.get_by_role("button", name="Camera chính")).to_be_visible(timeout=15000)
            playing(page)
            viewers.append(page)
        for page in viewers:
            expect(page.get_by_text("2 người xem", exact=False)).to_be_visible(timeout=15000)
            expect(page.get_by_text("Chưa có tin nhắn.")).to_be_visible()
        assert len(subscriptions) >= 4, "Expected independent session and chat WebSocket subscriptions"
        host.get_by_role("textbox", name="Tin nhắn").fill("Kiểm thử chat realtime")
        host.get_by_role("button", name="Gửi", exact=True).click()
        for page in viewers:
            expect(page.get_by_text("Kiểm thử chat realtime", exact=False)).to_be_visible()
        host.get_by_role("button", name="Ẩn tin nhắn").click()
        host.get_by_label("Sản phẩm đang ghim").select_option("P01")
        for page in viewers:
            expect(page.get_by_text("Kiểm thử chat realtime", exact=False)).to_have_count(0)
            expect(page.get_by_role("button", name="Thêm vào giỏ demo")).to_be_visible()
        viewers[0].get_by_role("button", name="Camera điện thoại").click()
        expect(viewers[0].get_by_role("button", name="Camera điện thoại")).to_have_attribute("aria-pressed", "true")
        expect(viewers[1].get_by_role("button", name="Camera điện thoại")).to_have_attribute("aria-pressed", "true")
        playing(viewers[0])
        viewers[0].get_by_role("button", name="Bật âm thanh").click()
        viewers[0].wait_for_function("document.querySelector('audio')?.srcObject?.getAudioTracks().length === 1")
        camera.get_by_role("button", name="Ngắt camera").click()
        expect(viewers[0].get_by_role("button", name="Camera chính")).to_have_attribute("aria-pressed", "true", timeout=12000)
        playing(viewers[0])
        host.once("dialog", lambda dialog: dialog.accept())
        host.get_by_role("button", name="Kết thúc phiên").click()
        for page in viewers:
            expect(page.get_by_text("Phiên đã kết thúc")).to_be_visible()
        print("PASS real LiveKit video, mobile-shaped camera page, viewer count, shared angle selection, host audio, camera fallback")
        print("PASS WebSocket-driven chat delivery, hide, and pin with fixture Supabase events")
    finally:
        browser.close()
