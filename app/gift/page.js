"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GiftEnvelope from "@/components/GiftEnvelope";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

// ค่าเริ่มต้น: รูป QR ที่ใส่ไว้ในโปรเจกต์ (/public/qr/) — Admin เปลี่ยนรูปได้ภายหลัง
// ถ้า Admin อัปโหลดรูปใหม่ จะใช้รูปจาก Supabase แทนค่าเริ่มต้นนี้ทันที
const DEFAULTS = {
  qr_bank_url: "/qr/bank-qr.jpeg",
  qr_truemoney_url: "/qr/truemoney-qr.png",
  gift_bank_text: "พร้อมเพย์ / TrueMoney: 0645742422",
  gift_truemoney_text: "พร้อมเพย์ / TrueMoney: 0645742422",
};

export default function GiftPage() {
  const [values, setValues] = useState(DEFAULTS);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("settings")
        .select("key,value")
        .in("key", Object.keys(DEFAULTS));
      const next = { ...DEFAULTS };
      (data || []).forEach((row) => {
        if (row.value && row.value.trim()) next[row.key] = row.value; // ค่าว่าง = ใช้ค่าเริ่มต้น
      });
      setValues(next);
    }
    load();
  }, []);

  return (
    <main className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="text-xl">←</Link>
        <h1 className="font-display font-bold text-2xl">🎁 ให้ของขวัญ</h1>
      </div>
      <p className="text-sm text-plum/60 text-center">
        ไม่สะดวกซื้อของก็ส่งกำลังใจผ่าน QR ได้เลยนะ 🥰
      </p>

      <GiftEnvelope
        bank={{ url: values.qr_bank_url, text: values.gift_bank_text }}
        truemoney={{ url: values.qr_truemoney_url, text: values.gift_truemoney_text }}
      />

      <p className="mt-8 text-xs text-plum/40 px-4 text-center">
        🔒 หน้านี้ใช้ QR Code เป็นเพียงช่องทางรับของขวัญเท่านั้น
        เว็บไซต์นี้ไม่มีการเก็บข้อมูลบัตร รหัสผ่าน หรือข้อมูลการชำระเงินใด ๆ
      </p>

      <BottomNav />
    </main>
  );
}
