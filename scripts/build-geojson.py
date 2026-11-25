#!/usr/bin/env python3
import json
import math
import os
import sys
import urllib.request

BASE_URL = (
    "https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/"
    "master/json/geojson/75_dong_nai"
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(ROOT, "scripts", ".geo-cache")
OUT_DIR = os.path.join(ROOT, "public", "geo")

TOLERANCE = 0.00035

WARD_FILES = {
    "26188_tan_trieu": "Phường Tân Triều",
    "26080_long_khanh": "Phường Long Khánh",
    "26347_xuan_duong": "Xã Xuân Đường",
    "26341_cam_my": "Xã Cẩm Mỹ",
    "26206_dinh_quan": "Xã Định Quán",
    "26425_xuan_loc": "Phường Xuân Lộc",
    "26041_tran_bien": "Phường Trấn Biên",
    "26068_bien_hoa": "Phường Biên Hoà",
}


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
    with urllib.request.urlopen(url) as resp, open(dest, "wb") as fh:
        fh.write(resp.read())


def main():
    os.makedirs(CACHE_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    features = []
    centroids = {}
    for key, full_name in WARD_FILES.items():
        src = os.path.join(CACHE_DIR, f"{key}.geojson")
        fetch(f"{BASE_URL}/wards/{key}.geojson", src)
        data = json.load(open(src, encoding="utf-8"))
        feature = data["features"][0]
        geometry = simplify_geometry(feature["geometry"])
        props = feature["properties"]
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "code": props["code"],
                    "name": props["name"],
                    "fullName": full_name,
                    "level": "Phường" if full_name.startswith("Phường") else "Xã",
                    "areaKm2": props.get("areaKm2"),
                },
                "geometry": geometry,
            }
        )
        centroids[full_name] = centroid(geometry)

    wards_out = {"type": "FeatureCollection", "features": features}
    with open(os.path.join(OUT_DIR, "dong-nai-wards.json"), "w", encoding="utf-8") as fh:
        json.dump(wards_out, fh, ensure_ascii=False, separators=(",", ":"))

    prov_src = os.path.join(CACHE_DIR, "75_dong_nai.geojson")
    fetch(f"{BASE_URL}/75_dong_nai.geojson", prov_src)
    prov_data = json.load(open(prov_src, encoding="utf-8"))
    prov_feature = prov_data["features"][0]
    province_out = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "code": "75",
                    "fullName": "Thành phố Đồng Nai",
                    "level": "Thành phố",
                },
                "geometry": simplify_geometry(prov_feature["geometry"]),
            }
        ],
    }
    with open(os.path.join(OUT_DIR, "dong-nai-province.json"), "w", encoding="utf-8") as fh:
        json.dump(province_out, fh, ensure_ascii=False, separators=(",", ":"))

    print("Đã ghi public/geo/dong-nai-wards.json và public/geo/dong-nai-province.json")
    for name, center in centroids.items():
        print(f"  {name}: lat {center[1]}, lng {center[0]}")


if __name__ == "__main__":
    sys.exit(main())
