"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { safeStoragePath } from "@/lib/storagePath";

const KEYS = [
  "hero_title",
  "hero_subtitle",
  "qr_bank_url",
  "qr_truemoney_url",
  "gift_bank_text",
  "gift_truemoney_text",
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
    setSavedMsg(error ? "❌ บันทึกไม่สำเร็จ: " + error.message : "✅ บันทึกเรียบร้อย");
  }

  async function uploadTo(bucket, file, key) {
    const path = safeStoragePath(file);
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
    });
    if (error) {
      setSavedMsg("อัปโหลดไม่สำเร็จ: " + error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setField(key, data.publicUrl);
    setSavedMsg("อัปโหลดรูปแล้ว — กด “บันทึกทั้งหมด” เพื่อใช้งานจริง");
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

      {/* ===== ของขวัญ: QR 2 รายการแยกกัน ===== */}
      <div className="rounded-2xl border border-pink-soft p-3 flex flex-col gap-3">
        <p className="font-display font-bold text-sm">🏦 QR สแกนธนาคาร</p>
        <div className="flex items-center gap-3">
          <img
            src={values.qr_bank_url || "/qr/bank-qr.jpeg"}
            alt=""
            className="w-16 h-16 rounded-lg object-cover border border-pink-soft bg-white"
          />
          <label className="tap-target text-xs font-semibold bg-pink-soft px-3 py-2 rounded-full cursor-pointer">
            เปลี่ยนรูป QR ธนาคาร
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && uploadTo("qr", e.target.files[0], "qr_bank_url")
              }
            />
          </label>
        </div>
        <textarea
          value={values.gift_bank_text || ""}
          onChange={(e) => setField("gift_bank_text", e.target.value)}
          rows={2}
          className="rounded-xl border border-pink-soft px-3 py-2 text-sm resize-none"
          placeholder="พร้อมเพย์ / TrueMoney: 0645742422"
        />
      </div>

      <div className="rounded-2xl border border-pink-soft p-3 flex flex-col gap-3">
        <p className="font-display font-bold text-sm">🧡 QR สแกน TrueMoney</p>
        <div className="flex items-center gap-3">
          <img
            src={values.qr_truemoney_url || "/qr/truemoney-qr.png"}
            alt=""
            className="w-16 h-16 rounded-lg object-cover border border-pink-soft bg-white"
          />
          <label className="tap-target text-xs font-semibold bg-pink-soft px-3 py-2 rounded-full cursor-pointer">
            เปลี่ยนรูป QR TrueMoney
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && uploadTo("qr", e.target.files[0], "qr_truemoney_url")
              }
            />
          </label>
        </div>
        <textarea
          value={values.gift_truemoney_text || ""}
          onChange={(e) => setField("gift_truemoney_text", e.target.value)}
          rows={2}
          className="rounded-xl border border-pink-soft px-3 py-2 text-sm resize-none"
          placeholder="พร้อมเพย์ / TrueMoney: 0645742422"
        />
      </div>
      <p className="text-xs text-plum/50 -mt-2">
        ถ้ายังไม่เปลี่ยนรูป เว็บจะใช้ QR เริ่มต้นที่ใส่ไว้ในโปรเจกต์ให้อัตโนมัติ
      </p>

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
