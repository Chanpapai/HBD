"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoManager() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadPhotos() {
    const { data } = await supabase
      .from("photos")
      .select("id,url,path,created_at")
      .order("created_at", { ascending: false });
    setPhotos(data || []);
  }

  useEffect(() => {
    loadPhotos();
  }, []);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setError("รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น");
        continue;
      }
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("อัปโหลดไม่สำเร็จ: " + uploadError.message);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(path);

      await supabase.from("photos").insert({
        url: publicUrlData.publicUrl,
        path,
      });
    }

    setUploading(false);
    loadPhotos();
  }

  async function handleDelete(photo) {
    if (!confirm("ลบรูปนี้ใช่ไหม?")) return;
    await supabase.storage.from("gallery").remove([photo.path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    loadPhotos();
  }

  return (
    <section className="bg-white rounded-2xl p-4 border border-pink-soft">
      <h2 className="font-display font-bold text-lg mb-3">📸 จัดการรูปแกลเลอรี</h2>

      <label className="tap-target inline-block bg-pink text-white text-sm font-semibold px-4 py-2 rounded-full cursor-pointer">
        {uploading ? "กำลังอัปโหลด..." : "+ อัปโหลดรูป"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      <div className="grid grid-cols-3 gap-2 mt-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-pink-soft">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => handleDelete(photo)}
              className="tap-target absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full"
              aria-label="ลบรูป"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {photos.length === 0 && (
        <p className="text-sm text-plum/50 mt-3">ยังไม่มีรูปในแกลเลอรี</p>
      )}
    </section>
  );
}
