"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PhotoLightbox from "@/components/PhotoLightbox";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      // โหลดพร้อมกัน 2 แหล่ง: (1) รูปที่แอดมินอัปโหลดผ่านหน้า Admin (Supabase)
      // (2) รูปที่ก็อปใส่โฟลเดอร์ /public/gallery โดยตรง (สแกนอัตโนมัติตอน build
      //     เป็นไฟล์ /gallery-manifest.json — ดู scripts/generate-gallery-manifest.js)
      const [{ data: dbPhotos }, manifest] = await Promise.all([
        supabase
          .from("photos")
          .select("id,url,created_at")
          .order("created_at", { ascending: false }),
        fetch("/gallery-manifest.json")
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ]);

      const staticPhotos = (manifest || []).map((m) => ({
        id: `static-${m.filename}`,
        url: m.url,
      }));

      // รูปจากโฟลเดอร์ /public/gallery ขึ้นก่อน ตามด้วยรูปที่แอดมินอัปโหลดผ่าน Supabase
      setPhotos([...staticPhotos, ...(dbPhotos || [])]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="px-5 pt-8">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="text-xl">←</Link>
        <h1 className="font-display font-bold text-2xl">📸 แกลเลอรีรูปแฮป</h1>
      </div>
      <p className="text-sm text-plum/60 mb-4">
        แตะรูปเพื่อดูเต็มจอ แล้วกดดาวน์โหลดไปใช้แฮปได้เลย รองรับ JPG, PNG, WebP
      </p>

      {loading && <p className="text-sm text-plum/50">กำลังโหลดรูป...</p>}

      {!loading && photos.length === 0 && (
        <div className="bg-white/70 rounded-2xl p-6 text-center text-sm text-plum/60 border border-dashed border-pink-soft">
          ยังไม่มีรูปในแกลเลอรี รอเจ้าของวันเกิดอัปโหลดก่อนนะ 🙏
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pb-24">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="tap-target aspect-square rounded-2xl overflow-hidden border border-pink-soft bg-white active:scale-[0.97] transition-transform"
          >
            <img
              src={photo.url}
              alt="รูปแฮปวันเกิด"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <PhotoLightbox photo={selected} onClose={() => setSelected(null)} />
      <BottomNav />
    </main>
  );
}
