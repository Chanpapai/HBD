// สร้างชื่อไฟล์ที่ปลอดภัยสำหรับ Supabase Storage
// (ชื่อไฟล์ภาษาไทย ช่องว่าง หรือวงเล็บ ทำให้ขึ้น "Invalid key" ได้)
export function safeStoragePath(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${rand}.${ext || "jpg"}`;
}
