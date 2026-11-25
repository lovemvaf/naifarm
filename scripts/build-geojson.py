#!/usr/bin/env python3
import concurrent.futures
import json
import math
import os
import sys
import urllib.request

BASE_URL = (
    "https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/"
    "master/json/geojson/75_dong_nai"
)
WARDS_API_URL = (
    "https://api.github.com/repos/thanglequoc/vietnamese-provinces-database/"
    "contents/json/geojson/75_dong_nai/wards"
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(ROOT, "scripts", ".geo-cache")
OUT_DIR = os.path.join(ROOT, "public", "geo")

TOLERANCE = 0.0005

FALLBACK_WARDS = [
    "26188_tan_trieu.geojson",
    "26080_long_khanh.geojson",
    "26347_xuan_duong.geojson",
    "26341_cam_my.geojson",
    "26206_dinh_quan.geojson",
    "26425_xuan_loc.geojson",
    "26041_tran_bien.geojson",
    "26068_bien_hoa.geojson",
]


def perp_dist(p, a, b):
    if a == b:
        return math.hypot(p[0] - a[0], p[1] - a[1])
    x, y = p
    x1, y1 = a
    x2, y2 = b
    dx, dy = x2 - x1, y2 - y1
    t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))


def rdp(points, tol):
    if len(points) < 3:
        return points
    dmax, index = 0.0, 0
    a, b = points[0], points[-1]
    for i in range(1, len(points) - 1):
        d = perp_dist(points[i], a, b)
        if d > dmax:
            dmax, index = d, i
    if dmax > tol:
        left = rdp(points[: index + 1], tol)
        right = rdp(points[index:], tol)
        return left[:-1] + right
    return [points[0], points[-1]]


def simplify_ring(ring):
    closed = ring[0] == ring[-1]
    pts = ring[:-1] if closed else ring[:]
    if len(pts) <= 4:
        return ring
    simplified = rdp(pts, TOLERANCE)
    if closed:
        simplified = simplified + [simplified[0]]
    return [[round(x, 5), round(y, 5)] for x, y in simplified]


def simplify_polygon(poly):
    return [simplify_ring(r) for r in poly]


def simplify_geometry(geom):
    if geom["type"] == "Polygon":
        return {"type": "Polygon", "coordinates": simplify_polygon(geom["coordinates"])}
    if geom["type"] == "MultiPolygon":
        return {
            "type": "MultiPolygon",
            "coordinates": [simplify_polygon(p) for p in geom["coordinates"]],
        }
    return geom


def ring_area(ring):
    area = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2.0


def centroid(geom):
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    elif geom["type"] == "MultiPolygon":
        polys = geom["coordinates"]
    else:
        return [0.0, 0.0]
    best = None
    for poly in polys:
        area = ring_area(poly[0])
        if best is None or area > best[0]:
            best = (area, poly[0])
    ring = best[1]
    sx = sum(p[0] for p in ring[:-1])
    sy = sum(p[1] for p in ring[:-1])
    n = max(1, len(ring) - 1)
    return [round(sx / n, 6), round(sy / n, 6)]


def fetch(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "NaiFarm-Geo-Builder"})
    with urllib.request.urlopen(req, timeout=20) as resp, open(dest, "wb") as fh:
        fh.write(resp.read())


def compute_bbox(geom):
    min_lng, min_lat = 180.0, 90.0
    max_lng, max_lat = -180.0, -90.0
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    for poly in polys:
        for ring in poly:
            for lng, lat in ring:
                min_lng = min(min_lng, lng)
                min_lat = min(min_lat, lat)
                max_lng = max(max_lng, lng)
                max_lat = max(max_lat, lat)
    return [round(min_lat, 5), round(min_lng, 5), round(max_lat, 5), round(max_lng, 5)]


def list_remote_ward_files():
    try:
        req = urllib.request.Request(WARDS_API_URL, headers={"User-Agent": "NaiFarm-Geo-Builder"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            items = json.loads(resp.read().decode("utf-8"))
        names = sorted(it["name"] for it in items if it.get("name", "").endswith(".geojson"))
        if names:
            return names
    except Exception as exc:
        print(f"Warning: could not list GitHub wards directory ({exc}), using fallback subset")
    return FALLBACK_WARDS


def main():
    os.makedirs(CACHE_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    ward_filenames = list_remote_ward_files()

    def download_one(fname):
        src = os.path.join(CACHE_DIR, fname)
        fetch(f"{BASE_URL}/wards/{fname}", src)
        return fname, src

    downloaded = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for res in pool.map(download_one, ward_filenames):
            downloaded.append(res)

    features = []
    centroids = {}
    for fname, src in downloaded:
        data = json.load(open(src, encoding="utf-8"))
        feature = data["features"][0]
        geometry = simplify_geometry(feature["geometry"])
        props = feature["properties"]
        name_val = props.get("name", "")
        full_name = props.get("fullName") or props.get("name_with_type") or name_val
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "code": str(props.get("code", fname.split("_")[0])),
                    "name": name_val,
                    "fullName": full_name,
                    "level": "Phường" if str(full_name).startswith("Phường") else "Xã",
                    "areaKm2": props.get("areaKm2"),
                },
                "geometry": geometry,
            }
        )
        centroids[str(props.get("code", fname.split("_")[0]))] = centroid(geometry)

    wards_out = {"type": "FeatureCollection", "features": features}
    wards_path = os.path.join(OUT_DIR, "dong-nai-wards.json")
    with open(wards_path, "w", encoding="utf-8") as fh:
        json.dump(wards_out, fh, ensure_ascii=False, separators=(",", ":"))

    prov_src = os.path.join(CACHE_DIR, "75_dong_nai.geojson")
    fetch(f"{BASE_URL}/75_dong_nai.geojson", prov_src)
    prov_data = json.load(open(prov_src, encoding="utf-8"))
    prov_feature = prov_data["features"][0]
    outline_geom = simplify_geometry(prov_feature["geometry"])
    outline_bbox = compute_bbox(outline_geom)
    outline_out = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "code": "75",
                    "fullName": "Thành phố Đồng Nai",
                    "level": "Thành phố",
                },
                "geometry": outline_geom,
            }
        ],
    }
    outline_path = os.path.join(OUT_DIR, "dong-nai-outline.json")
    prov_compat_path = os.path.join(OUT_DIR, "dong-nai-province.json")
    with open(outline_path, "w", encoding="utf-8") as fh:
        json.dump(outline_out, fh, ensure_ascii=False, separators=(",", ":"))
    with open(prov_compat_path, "w", encoding="utf-8") as fh:
        json.dump(outline_out, fh, ensure_ascii=False, separators=(",", ":"))

    manifest = {
        "sourceRepo": "https://github.com/thanglequoc/vietnamese-provinces-database",
        "sourcePath": "json/geojson/75_dong_nai",
        "license": "MIT (Community Open Data)",
        "retrievedAt": "2026-11-25",
        "boundaryStatus": "community_reference_not_legal_boundary",
        "wardPolygonCount": len(features),
        "expectedAdminUnitCount": 95,
        "coverageRatio": round(len(features) / 95, 4),
        "bbox": {
            "south": outline_bbox[0],
            "west": outline_bbox[1],
            "north": outline_bbox[2],
            "east": outline_bbox[3],
        },
        "outlineBytes": os.path.getsize(outline_path),
        "wardsBytes": os.path.getsize(wards_path),
    }
    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)

    print(
        f"Generated {len(features)}/95 ward polygons ({os.path.getsize(wards_path)} bytes) "
        f"+ outline ({os.path.getsize(outline_path)} bytes) bbox={outline_bbox}"
    )


if __name__ == "__main__":
    sys.exit(main())
