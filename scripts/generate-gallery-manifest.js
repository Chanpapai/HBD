// ============================================================
// สแกนโฟลเดอร์รูปภาพอัตโนมัติ แล้วสร้างไฟล์รายการ (manifest) ให้หน้าเว็บอ่าน
// รันทุกครั้งก่อน build (ผูกไว้กับสคริปต์ "prebuild" ใน package.json)
//
//   public/gallery/  → public/gallery-manifest.json  (หน้า Gallery)
//   public/profile/  → public/profile-manifest.json  (รูปบุคคล PNG พื้นหลังโปร่งใส
//                                                     หน้าแรก + ฝนรูปลอยลงมา)
//
// เจ้าของเว็บแค่ก็อปรูปใส่โฟลเดอร์แล้ว deploy ใหม่ — ไม่ต้องแก้โค้ดเอง
// ============================================================
const fs = require("fs");
const path = require("path");

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const collator = new Intl.Collator("en", { numeric: true });

function scan(folderName, manifestName) {
  const dir = path.join(process.cwd(), "public", folderName);
  const output = path.join(process.cwd(), "public", manifestName);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const files = fs
    .readdirSync(dir)
    .filter((f) => ALLOWED_EXT.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => collator.compare(a, b));

  const manifest = files.map((filename) => ({
    filename,
    url: `/${folderName}/${encodeURIComponent(filename)}`,
  }));

  fs.writeFileSync(output, JSON.stringify(manifest, null, 2));
  console.log(`[manifest] /public/${folderName}: พบรูป ${manifest.length} ไฟล์ → ${manifestName}`);
}

scan("gallery", "gallery-manifest.json");
scan("profile", "profile-manifest.json");
