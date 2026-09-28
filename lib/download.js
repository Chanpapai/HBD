// ============================================================
// ระบบดาวน์โหลดไฟล์ — ทำงานบน Android / iPhone / คอมพิวเตอร์
//
// ทำไมปุ่มเดิมกดแล้วไม่ดาวน์โหลด:
//   <a href="..." download> ใช้ไม่ได้กับไฟล์ต่างโดเมน (รูปที่อัปโหลดไว้ใน
//   Supabase Storage อยู่คนละโดเมนกับเว็บ) เบราว์เซอร์จะเมินแอตทริบิวต์ download
//   แล้วพาไปเปิดรูปแทน
//
// วิธีที่ใช้ตอนนี้: fetch ไฟล์มาเป็น Blob → สร้าง blob URL → สั่งดาวน์โหลดด้วยชื่อไฟล์
// ที่กำหนดเอง โดยไม่ออกจากหน้าเว็บ
// ============================================================

import { createZipBlob } from "./zip";

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extFromUrl(url) {
  const clean = url.split("?")[0].split("#")[0];
  const match = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : null;
}

/** ตั้งชื่อไฟล์ที่อ่านง่าย เช่น birthday-photo-03.jpg */
export function makeFilename(url, index = 0, blobType = "") {
  const ext = EXT_BY_TYPE[blobType] || extFromUrl(url) || "jpg";
  return `birthday-photo-${String(index + 1).padStart(2, "0")}.${ext}`;
}

function triggerSave(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  // หน่วงก่อนล้าง เพื่อให้มือถือ (โดยเฉพาะ iOS) เริ่มดาวน์โหลดได้ทัน
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }, 5000);
}

async function fetchBlob(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`โหลดไฟล์ไม่ได้ (HTTP ${res.status})`);
  return res.blob();
}

/**
 * ดาวน์โหลดรูปเดียวลงเครื่องโดยตรง (ไม่เปลี่ยนหน้า)
 * @returns {Promise<string>} ชื่อไฟล์ที่บันทึก
 */
export async function downloadImage(url, filename) {
  try {
    const blob = await fetchBlob(url);
    const name = filename || makeFilename(url, 0, blob.type);
    triggerSave(blob, name);
    return name;
  } catch (err) {
    // สำรอง: Supabase Storage รองรับ ?download=ชื่อไฟล์ (เซิร์ฟเวอร์ส่ง
    // Content-Disposition: attachment ให้) จึงดาวน์โหลดได้โดยไม่ต้องเปลี่ยนหน้า
    if (url.includes(".supabase.co/storage/")) {
      const name = filename || makeFilename(url, 0);
      const link = document.createElement("a");
      link.href = `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(name)}`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
      return name;
    }
    throw err;
  }
}

/**
 * ดาวน์โหลดหลายรูปเป็นไฟล์ ZIP ไฟล์เดียว (ไม่เปลี่ยนหน้า)
 * @param {string[]} urls
 * @param {string} zipName เช่น "birthday-photos.zip"
 * @param {(done:number, total:number) => void} [onProgress]
 * @returns {Promise<{ zipName: string, count: number, failed: number }>}
 */
export async function downloadImagesAsZip(urls, zipName = "birthday-photos.zip", onProgress) {
  const files = [];
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    try {
      const blob = await fetchBlob(urls[i]);
      const data = new Uint8Array(await blob.arrayBuffer());
      files.push({ name: makeFilename(urls[i], i, blob.type), data });
    } catch (err) {
      console.error("[download] โหลดรูปไม่สำเร็จ:", urls[i], err);
      failed++;
    }
    onProgress?.(i + 1, urls.length);
  }

  if (files.length === 0) {
    throw new Error("ไม่สามารถโหลดรูปใดได้เลย ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
  }

  triggerSave(createZipBlob(files), zipName);
  return { zipName, count: files.length, failed };
}

/** เครื่องนี้แชร์ไฟล์รูปได้ไหม (มือถือส่วนใหญ่ — ใช้บันทึกลงอัลบั้มบน iPhone ได้) */
export function canShareImages() {
  try {
    if (typeof navigator === "undefined" || !navigator.canShare) return false;
    const probe = new File([new Blob(["x"])], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function shareImage(url, filename) {
  const blob = await fetchBlob(url);
  const name = filename || makeFilename(url, 0, blob.type);
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });
  try {
    await navigator.share({ files: [file], title: "Happy Birthday" });
    return true;
  } catch (err) {
    if (err && err.name === "AbortError") return false; // ผู้ใช้ปิดหน้าต่างแชร์เอง
    throw err;
  }
}
