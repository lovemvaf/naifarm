import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import type { AdministrativeMetadata, DongNaiAdministrativeUnit } from "../src/lib/geography/types";

function main() {
  const root = process.cwd();
  const unitsPath = path.join(root, "src", "data", "geography", "dong-nai-administrative-units.json");
  const metaPath = path.join(root, "src", "data", "geography", "administrative-metadata.json");

  assert(fs.existsSync(unitsPath), "Missing dong-nai-administrative-units.json");
  assert(fs.existsSync(metaPath), "Missing administrative-metadata.json");

  const units = JSON.parse(fs.readFileSync(unitsPath, "utf8")) as DongNaiAdministrativeUnit[];
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as AdministrativeMetadata;

  assert.equal(units.length, 95, `Expected 95 administrative units, got ${units.length}`);
  assert.equal(meta.totalUnits, 95);
  assert.equal(meta.phuongCount, 33, `Expected 33 Phường, got ${meta.phuongCount}`);
  assert.equal(meta.xaCount, 62, `Expected 62 Xã, got ${meta.xaCount}`);
  assert.equal(meta.upgradedXaToPhuong2026Count, 10, "Expected 10 xã -> phường upgrades in 2026");

  const codeSet = new Set(units.map((u) => u.maDvhc));
  assert.equal(codeSet.size, 95, "All ma_dvhc must be unique");

  const uniqueSlugSet = new Set(units.map((u) => u.uniqueSlug));
  assert.equal(uniqueSlugSet.size, 95, "All uniqueSlug values must be unique");

  for (const unit of units) {
    assert.equal(unit.maCapTren, "75", `${unit.maDvhc} must have ma_cap_tren = 75`);
    assert.equal(unit.tenCapTren, "Thành phố Đồng Nai", `${unit.maDvhc} parent name mismatch`);
    assert.equal(unit.trangThai, "active", `${unit.maDvhc} must be active`);
    assert.equal(unit.viDoWgs84, null, `${unit.maDvhc} must NOT have fabricated vi_do_wgs84`);
    assert.equal(unit.kinhDoWgs84, null, `${unit.maDvhc} must NOT have fabricated kinh_do_wgs84`);
    assert.equal(unit.geometryWkt, null, `${unit.maDvhc} must NOT have fabricated geometry_wkt`);
    assert.equal(
      unit.trangThaiGis,
      "chua_xac_minh_toa_do_va_polygon",
      `${unit.maDvhc} GIS status mismatch`,
    );
  }

  // Verify duplicate slug resolution (Lộc Thạnh 25280 vs Lộc Thành 25294)
  const locThanhNorth = units.find((u) => u.maDvhc === "25280");
  const locThanhSouth = units.find((u) => u.maDvhc === "25294");
  assert(locThanhNorth && locThanhSouth, "Missing 25280 or 25294");
  assert.equal(locThanhNorth.slug, "xa-loc-thanh");
  assert.equal(locThanhSouth.slug, "xa-loc-thanh");
  assert.notEqual(locThanhNorth.uniqueSlug, locThanhSouth.uniqueSlug);

  // Verify Phước Sơn (25420) official status vs proposed expansion
  const phuocSon = units.find((u) => u.maDvhc === "25420");
  assert(phuocSon, "Missing Xã Phước Sơn (25420)");
  assert.equal(phuocSon.dienTichKm2DeAn2026, 386.56);
  assert.equal(phuocSon.dienTichHienTrangTheoToTrinh112026, 386.56);
  assert.equal(phuocSon.dienTichDeXuatKm2, 659.163);
  assert.equal(
    phuocSon.trangThaiDieuChinhDiaGioi,
    "chu_truong_da_thong_qua_cho_quyet_dinh_cap_co_tham_quyen",
  );

  // Verify Golden units exist
  assert(units.some((u) => u.maDvhc === "26080" && u.tenDayDu === "Phường Long Khánh"));
  assert(units.some((u) => u.maDvhc === "26188" && u.tenDayDu === "Phường Tân Triều"));

  // Verify every historical alias candidateCode maps cleanly to an existing unit
  const aliasesPath = path.join(root, "src", "data", "geography", "historical-aliases.json");
  const aliases = JSON.parse(fs.readFileSync(aliasesPath, "utf8")) as {
    alias: string;
    candidateCodes: string[];
  }[];
  for (const entry of aliases) {
    assert(entry.candidateCodes.length > 0, `Alias ${entry.alias} has empty candidateCodes`);
    for (const c of entry.candidateCodes) {
      assert(codeSet.has(c), `Alias ${entry.alias} references unknown code ${c}`);
    }
  }

  console.log(
    `VALIDATED_ADMIN_DATA PASS: 95 units (33 Phường, 62 Xã), 10 upgraded 2026, 0 fabricated GIS coords, Phước Sơn 386.56 vs 659.163 proposed verified.`,
  );
}

main();
