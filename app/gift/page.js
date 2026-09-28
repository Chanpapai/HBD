"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GiftEnvelope from "@/components/GiftEnvelope";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function GiftPage() {
  const [qrUrl, setQrUrl] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("settings")
        .select("key,value")
        .in("key", ["qr_url", "payment_note"]);
      (data || []).forEach((row) => {
        if (row.key === "qr_url") setQrUrl(row.value);
        if (row.key === "payment_note") setNote(row.value);
      });
    }
    load();
  }, []);

  return (
    <main className="px-5 pt-8 text-center">
      <div className="flex items-center gap-2 mb-5 text-left">
        <Link href="/" className="text-xl">←</Link>
        <h1 className="font-display font-bold text-2xl">🎁 ให้ของขวัญ</h1>
      </div>
      <p className="text-sm text-plum/60">
        ไม่สะดวกซื้อของก็ส่งกำลังใจผ่าน QR ได้เลยนะ 🥰
      </p>

      <GiftEnvelope qrUrl={qrUrl} note={note} />

      <p className="mt-8 text-xs text-plum/40 px-4">
        🔒 หน้านี้ใช้ QR Code เป็นเพียงช่องทางรับของขวัญเท่านั้น
        เว็บไซต์นี้ไม่มีการเก็บข้อมูลบัตร รหัสผ่าน หรือข้อมูลการชำระเงินใด ๆ
      </p>

      <BottomNav />
    </main>
  );
}
