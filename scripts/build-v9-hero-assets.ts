import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images", "hero");
fs.mkdirSync(OUT_DIR, { recursive: true });

interface HeroAssetJob {
  id: string;
  sourceRel: string;
  desktopPos: string;
  mobilePos: string;
}

const JOBS: HeroAssetJob[] = [
  {
    id: "festival-orchard",
    sourceRel: "public/images/hero/dong-nai-orchard-hero.jpg",
    desktopPos: "center",
    mobilePos: "attention",
  },
  {
    id: "harvest-basket",
    sourceRel: "public/images/products/ocop-gift-basket.jpg",
    desktopPos: "center",
    mobilePos: "center",
  },
  {
    id: "agritourism-ba-tu",
    sourceRel: "public/media/studio-samples/tour-01-ba-tu-orchard-en.jpg",
    desktopPos: "center",
    mobilePos: "attention",
  },
  {
    id: "summer-mango",
    sourceRel: "public/images/products/fresh-mango.jpg",
    desktopPos: "center",
    mobilePos: "center",
  },
  {
    id: "pomelo-craft",
    sourceRel: "public/images/products/pomelo-peel-jam.jpg",
    desktopPos: "center",
    mobilePos: "center",
  },
  {
    id: "longan-orchard",
    sourceRel: "public/images/products/fresh-longan.jpg",
    desktopPos: "center",
    mobilePos: "center",
  },
];

async function run() {
  const results: Array<{ id: string; desktop: string; mobile: string; desktopBytes: number; mobileBytes: number }> = [];

  for (const job of JOBS) {
    const src = path.join(ROOT, job.sourceRel);
    if (!fs.existsSync(src)) {
      throw new Error(`Missing source asset: ${src}`);
    }
    const desktopOut = path.join(OUT_DIR, `v9-${job.id}-desktop.webp`);
    const mobileOut = path.join(OUT_DIR, `v9-${job.id}-mobile.webp`);

    await sharp(src)
      .resize({
        width: 1440,
        height: 500,
        fit: "cover",
        position: job.desktopPos,
        withoutEnlargement: false,
      })
      .webp({ quality: 82, effort: 4 })
      .toFile(desktopOut);

    await sharp(src)
      .resize({
        width: 720,
        height: 680,
        fit: "cover",
        position: job.mobilePos,
        withoutEnlargement: false,
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(mobileOut);

    results.push({
      id: job.id,
      desktop: `/images/hero/v9-${job.id}-desktop.webp`,
      mobile: `/images/hero/v9-${job.id}-mobile.webp`,
      desktopBytes: fs.statSync(desktopOut).size,
      mobileBytes: fs.statSync(mobileOut).size,
    });
  }

  console.log(JSON.stringify({ status: "OK", generated: results }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
