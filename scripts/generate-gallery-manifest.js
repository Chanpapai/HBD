// ============================================================
// สร้างรายการรูปภาพจากโฟลเดอร์ /public/gallery โดยอัตโนมัติ
// รันทุกครั้งก่อน build (ดูใน package.json สคริปต์ "prebuild")
// เจ้าของเว็บแค่ก็อปรูปใส่โฟลเดอร์นี้แล้ว deploy ใหม่ — ไม่ต้องแก้โค้ดเอง
// ============================================================
const fs = require("fs");
const path = require("path");

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");
const OUTPUT_FILE = path.join(process.cwd(), "public", "gallery-manifest.json");
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];

function main() {
  if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(GALLERY_DIR)
    .filter((f) => ALLOWED_EXT.includes(path.extname(f).toLowerCase()))
    .sort();

  const manifest = files.map((filename) => ({
    filename,
    url: `/gallery/${encodeURIComponent(filename)}`,
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(
    `[gallery-manifest] พบรูป ${manifest.length} ไฟล์ในโฟลเดอร์ /public/gallery — เขียนไฟล์ ${OUTPUT_FILE}`
  );
}

main();
