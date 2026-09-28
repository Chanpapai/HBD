"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const KEYS = [
  "hero_title",
  "hero_subtitle",
  "hero_photo_url",
  "qr_url",
  "payment_note",
  "owner_full_name",
  "owner_nickname",
  "owner_birth_year_be",
];

export default function SettingsManager() {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function load() {
    const { data } = await supabase
      .from("settings")
      .select("key,value")
      .in("key", KEYS);
    const merged = {};
    (data || []).forEach((row) => (merged[row.key] = row.value));
    setValues(merged);
  }

  useEffect(() => {
    load();
  }, []);

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAll() {
    setSaving(true);
    setSavedMsg("");
    const rows = KEYS.map((key) => ({ key, value: values[key] ?? "" }));
    const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    setSavedMsg(error ? "บันทึกไม่สำเร็จ" : "บันทึกเรียบร้อย ✅");
  }

  async function uploadTo(bucket, file, key) {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
    });
    if (error) {
      setSavedMsg("อัปโหลดไม่สำเร็จ: " + error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setField(key, data.publicUrl);
  }

  return (
    <section className="bg-white rounded-2xl p-4 border border-pink-soft flex flex-col gap-4">
      <h2 className="font-display font-bold text-lg">⚙️ เนื้อหาหน้าแรก & QR</h2>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-plum/70">หัวข้อหน้าแรก</span>
        <input
          value={values.hero_title || ""}
          onChange={(e) => setField("hero_title", e.target.value)}
          className="rounded-xl border border-pink-soft px-3 py-2"
          placeholder="Happy Birthday to Me 🎂"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-plum/70">ข้อความรอง</span>
        <textarea
          value={values.hero_subtitle || ""}
          onChange={(e) => setField("hero_subtitle", e.target.value)}
          rows={2}
          className="rounded-xl border border-pink-soft px-3 py-2 resize-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-plum/70">ชื่อจริงเจ้าของวันเกิด</span>
          <input
            value={values.owner_full_name || ""}
            onChange={(e) => setField("owner_full_name", e.target.value)}
            className="rounded-xl border border-pink-soft px-3 py-2"
            placeholder="นาย ปรเมศ ชาญป่าไพร"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-plum/70">ชื่อเล่น</span>
          <input
            value={values.owner_nickname || ""}
            onChange={(e) => setField("owner_nickname", e.target.value)}
            className="rounded-xl border border-pink-soft px-3 py-2"
            placeholder="9"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-plum/70">ปีเกิด (พ.ศ.)</span>
        <input
          value={values.owner_birth_year_be || ""}
          onChange={(e) => setField("owner_birth_year_be", e.target.value)}
          className="rounded-xl border border-pink-soft px-3 py-2 max-w-[140px]"
          placeholder="2552"
          inputMode="numeric"
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-plum/70">รูปหน้าปก (วงกลม)</span>
        <div className="flex items-center gap-3">
          {values.hero_photo_url && (
            <img
              src={values.hero_photo_url}
              alt=""
              className="w-14 h-14 rounded-full object-cover border border-pink-soft"
            />
          )}
          <label className="tap-target text-xs font-semibold bg-pink-soft px-3 py-2 rounded-full cursor-pointer">
            เลือกรูป
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && uploadTo("gallery", e.target.files[0], "hero_photo_url")
              }
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-plum/70">QR Code รับของขวัญ</span>
        <div className="flex items-center gap-3">
          {values.qr_url && (
            <img
              src={values.qr_url}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-pink-soft"
            />
          )}
          <label className="tap-target text-xs font-semibold bg-pink-soft px-3 py-2 rounded-full cursor-pointer">
            เลือกรูป QR
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && uploadTo("qr", e.target.files[0], "qr_url")
              }
            />
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-plum/70">
          หมายเหตุการรับของขวัญ (เช่น ชื่อบัญชี พร้อมเพย์ / TrueMoney)
        </span>
        <textarea
          value={values.payment_note || ""}
          onChange={(e) => setField("payment_note", e.target.value)}
          rows={3}
          className="rounded-xl border border-pink-soft px-3 py-2 resize-none"
          placeholder="พร้อมเพย์: 08x-xxx-xxxx ชื่อ ..."
        />
      </label>

      <button
        onClick={saveAll}
        disabled={saving}
        className="tap-target bg-pink text-white font-display font-bold py-3 rounded-full shadow-pink disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
      </button>
      {savedMsg && <p className="text-sm text-center text-plum/60">{savedMsg}</p>}
    </section>
  );
}
