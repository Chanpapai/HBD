"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ConfettiBurst from "./ConfettiBurst";

// ===== ตั้งค่า =====
const BIRTH_MONTH = 9; // กันยายน
const BIRTH_DAY = 29;
const WINDOW_MS = 30 * 864e5; // แสดง Countdown เฉพาะช่วง 30 วันก่อนวันเกิด
const CELEBRATE_MS = 7000; // ความยาวช่วงพลุ

const bkkYear = (ms) =>
  Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Bangkok", year: "numeric" }).format(ms));
// 00:00 เวลาไทย (UTC+7) ของวันเกิดในปีนั้น
const targetOf = (y) => Date.UTC(y, BIRTH_MONTH - 1, BIRTH_DAY) - 7 * 36e5;

// เวลาอ้างอิง = เวลาเซิร์ฟเวอร์ (Date header) ไม่ใช้นาฬิกาเครื่องผู้ใช้ตรง ๆ
async function serverOffset() {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 2500);
    const t0 = Date.now();
    const r = await fetch("/", { method: "HEAD", cache: "no-store", signal: ctl.signal });
    const t1 = Date.now();
    clearTimeout(timer);
    const d = Date.parse(r.headers.get("date") || "");
    return Number.isNaN(d) ? 0 : d + 500 - (t0 + t1) / 2; // header ละเอียดระดับวินาที จึงบวก 0.5 วินาที
  } catch {
    return 0;
  }
}

// โหมดทดสอบใช้ได้เฉพาะคนที่ล็อกอินเป็นแอดมินจริง (ตรวจฝั่งฐานข้อมูลด้วย RLS) — ไม่มีรหัสลับฝังในหน้าเว็บ
async function isAdmin() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

const pad = (n) => String(n).padStart(2, "0");

export default function BirthdayGate({ children }) {
  const [phase, setPhase] = useState("loading"); // loading | countdown | celebrate | open
  const [left, setLeft] = useState(0);
  const [bursts, setBursts] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const ref = useRef({ target: 0, offset: 0, demo: false });

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return setPhase("open");
    (async () => {
      const sec = Number(new URLSearchParams(location.search).get("countdown_demo"));
      if (sec > 0 && (await isAdmin())) {
        ref.current = { target: Date.now() + Math.min(sec, 600) * 1000, offset: 0, demo: true };
        setLeft(sec * 1000);
        return setPhase("countdown");
      }
      const offset = await serverOffset();
      const now = Date.now() + offset;
      const target = targetOf(bkkYear(now));
      ref.current = { target, offset, demo: false };
      const rem = target - now;
      if (rem > 0 && rem <= WINDOW_MS) { setLeft(rem); setPhase("countdown"); }
      else setPhase("open"); // เลยเวลาแล้ว/ยังอีกไกล = เข้าเว็บปกติ ไม่วนกลับ Countdown
    })();
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;
    const id = setInterval(() => {
      const rem = ref.current.target - (Date.now() + ref.current.offset);
      if (rem <= 0) { clearInterval(id); setLeft(0); setPhase("celebrate"); }
      else setLeft(rem);
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "celebrate") return;
    const b = setInterval(() => setBursts((n) => n + 1), 1400);
    const done = setTimeout(() => {
      if (ref.current.demo) history.replaceState(null, "", location.pathname);
      setFadeIn(true);
      setPhase("open");
    }, CELEBRATE_MS);
    return () => { clearInterval(b); clearTimeout(done); };
  }, [phase]);

  if (phase === "open") return <div className={fadeIn ? "gate-in" : ""}>{children}</div>;

  const s = Math.max(0, Math.ceil(left / 1000));
  const units = [
    ["วัน", Math.floor(s / 86400)],
    ["ชั่วโมง", Math.floor((s % 86400) / 3600)],
    ["นาที", Math.floor((s % 3600) / 60)],
    ["วินาที", s % 60],
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-birthday-page flex flex-col items-center justify-center px-5 text-center overflow-hidden">
      {phase === "celebrate" ? (
        <>
          {Array.from({ length: Math.min(bursts, 5) }).map((_, i) => <ConfettiBurst key={i} count={70} />)}
          <p className="text-6xl animate-popin">🎂</p>
          <h1 className="font-display font-extrabold text-4xl mt-4 animate-popin">Happy Birthday 🎂🎉</h1>
        </>
      ) : phase === "countdown" ? (
        <>
          <p className="text-5xl animate-floaty">🎂</p>
          <h1 className="font-display font-bold text-2xl mt-4">ยังไม่ถึงเวลานะจ๊ะ 🎂</h1>
          <p className="text-sm text-plum/60 mt-1">รออีกนิดเดียว วันเกิดของ 9 กำลังจะมาถึง</p>
          <div className="mt-6 grid grid-cols-4 gap-2 w-full max-w-sm">
            {units.map(([label, v]) => (
              <div key={label} className="bg-white rounded-2xl py-3 border border-pink-soft shadow-pink">
                <p className="font-display font-extrabold text-3xl text-pink-deep tabular-nums">{pad(v)}</p>
                <p className="text-xs text-plum/60">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-plum/40">นับถอยหลังถึง 00:00 น. (เวลาประเทศไทย)</p>
        </>
      ) : null}
    </div>
  );
}
