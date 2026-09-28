"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BigButton from "@/components/BigButton";
import WishCard from "@/components/WishCard";
import ConfettiBurst from "@/components/ConfettiBurst";
import WishModal from "@/components/WishModal";
import BottomNav from "@/components/BottomNav";
import ProfileCutouts from "@/components/ProfileCutouts";
import FallingPhotos from "@/components/FallingPhotos";

const DEFAULT_TITLE = "Happy Birthday to Me 🎂";
const DEFAULT_SUBTITLE = "ขอบคุณทุกคนที่แวะมาฉลองวันพิเศษนี้ด้วยกันนะ 🎉";

// ============================================================
// ข้อมูลเจ้าของวันเกิด — ค่าเริ่มต้น (แก้ไขได้ภายหลังผ่านหน้า Admin
// เพราะดึงมาจากตาราง settings เหมือนข้อมูลอื่น ๆ ของหน้าแรก)
// ============================================================
const DEFAULT_OWNER_NAME = "นาย ปรเมศ ชาญป่าไพร";
const DEFAULT_OWNER_NICKNAME = "9";
const DEFAULT_OWNER_BIRTH_YEAR_BE = "2552"; // พ.ศ. 2552 = ค.ศ. 2009

export default function HomePage() {
  const [settings, setSettings] = useState({
    hero_title: DEFAULT_TITLE,
    hero_subtitle: DEFAULT_SUBTITLE,
    owner_full_name: DEFAULT_OWNER_NAME,
    owner_nickname: DEFAULT_OWNER_NICKNAME,
    owner_birth_year_be: DEFAULT_OWNER_BIRTH_YEAR_BE,
  });
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openWish, setOpenWish] = useState(null);
  // รูปบุคคลพื้นหลังโปร่งใสจากโฟลเดอร์ /public/profile (สแกนอัตโนมัติตอน build)
  const [profileImages, setProfileImages] = useState([]);

  // รูปบุคคลพื้นหลังโปร่งใสจาก /public/profile — โหลดแยก ไม่รอฐานข้อมูล
  useEffect(() => {
    fetch("/profile-manifest.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setProfileImages((list || []).map((m) => m.url)))
      .catch(() => setProfileImages([]));
  }, []);

  useEffect(() => {
    async function load() {
      const [{ data: settingsRows }, { data: wishRows }] = await Promise.all([
        supabase.from("settings").select("key,value"),
        supabase
          .from("public_wishes") // view สาธารณะ: ไม่มีชื่อจริงของคนที่เลือกไม่ระบุชื่อ
          .select("id,display_name,message,photo_url,created_at")
          .order("created_at", { ascending: false })
          .limit(60),
      ]);

      if (settingsRows) {
        const merged = {};
        settingsRows.forEach((row) => {
          merged[row.key] = row.value;
        });
        setSettings((prev) => ({ ...prev, ...merged }));
      }
      setWishes(wishRows || []);

      setLoading(false);
    }
    load();
  }, []);

  // คำนวณอายุปีนี้จากปีเกิด พ.ศ. (โดยประมาณ นับจากปีปฏิทินไทยปัจจุบัน)
  const currentBEYear = new Date().getFullYear() + 543;
  const birthYear = parseInt(settings.owner_birth_year_be, 10);
  const age = Number.isFinite(birthYear) ? currentBEYear - birthYear : null;

  return (
    <main className="relative">
      {/* ฝนรูป PNG ลอยลงมาช้า ๆ อยู่ด้านหลังเนื้อหา ไม่บังข้อความ/ปุ่ม */}
      <FallingPhotos images={profileImages} />
      <ConfettiBurst />
      <div className="relative z-10">

      <section className="pt-10 px-6 flex flex-col items-center text-center">
        <ProfileCutouts images={profileImages.slice(0, 2)} />

        <h1 className="font-display font-extrabold text-3xl mt-6 leading-tight">
          {settings.hero_title || DEFAULT_TITLE}
        </h1>
        <p className="mt-2 text-sm text-plum/70 max-w-xs">
          {settings.hero_subtitle || DEFAULT_SUBTITLE}
        </p>

        {/* การ์ดแนะนำเจ้าของวันเกิด */}
        <div className="mt-5 bg-white/80 border border-pink-soft rounded-2xl px-5 py-3 text-sm">
          <p className="font-display font-bold text-plum">
            {settings.owner_full_name || DEFAULT_OWNER_NAME}
          </p>
          <p className="text-plum/60 text-xs mt-0.5">
            ชื่อเล่น “{settings.owner_nickname || DEFAULT_OWNER_NICKNAME}” · เกิด พ.ศ.{" "}
            {settings.owner_birth_year_be || DEFAULT_OWNER_BIRTH_YEAR_BE}
            {age !== null && ` · อายุครบ ${age} ปี`}
          </p>
        </div>
      </section>

      <section className="px-6 mt-8 flex flex-col gap-3">
        <BigButton
          href="/gallery"
          icon="📸"
          label="โหลดภาพมาแฮป"
          sub="ดูรูปเต็มจอ + ดาวน์โหลดไปโพสต์"
          tone="pink"
        />
        <BigButton
          href="/gift"
          icon="🎁"
          label="ให้ของขวัญ"
          sub="สแกน QR พร้อมเพย์ / TrueMoney"
          tone="gold"
        />
        <BigButton
          href="/wish"
          icon="💌"
          label="อวยพรวันเกิด"
          sub="เขียนคำอวยพรขึ้นกำแพงด้านล่าง"
          tone="mint"
        />
      </section>

      <section className="mt-10 px-6">
        <h2 className="font-display font-bold text-xl mb-3">
          💌 กำแพงคำอวยพร
        </h2>

        {loading && (
          <p className="text-sm text-plum/50">กำลังโหลดคำอวยพร...</p>
        )}

        {!loading && wishes.length === 0 && (
          <div className="bg-white/70 rounded-2xl p-5 text-center text-sm text-plum/60 border border-dashed border-pink-soft">
            ยังไม่มีคำอวยพรที่แสดง — เป็นคนแรกที่อวยพรสิ! 💕
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {wishes.map((w) => (
            <WishCard key={w.id} name={w.display_name} message={w.message} photo={w.photo_url} onOpen={() => setOpenWish(w)} />
          ))}
        </div>
      </section>

      </div>

      <WishModal wish={openWish} onClose={() => setOpenWish(null)} />
      <BottomNav />
    </main>
  );
}
