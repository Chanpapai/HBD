"use client";

import { useEffect } from "react";

function fmt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" }) +
    " เวลา " +
    d.toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false }) +
    " น."
  );
}

// เปิดดูคำอวยพรเต็ม: ชื่อ/ไม่ระบุชื่อ + ข้อความ + รูป (พอดีจอ ไม่ถูกตัด) + วันเวลา
export default function WishModal({ wish, onClose }) {
  useEffect(() => {
    if (!wish) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [wish, onClose]);

  if (!wish) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 animate-popin" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="ปิด" className="tap-target absolute top-3 right-3 w-8 h-8 rounded-full bg-pink-soft text-plum text-lg leading-none">×</button>
        <p className="font-display font-bold text-lg pr-8">💌 {wish.display_name}</p>
        {wish.photo_url && (
          <img src={wish.photo_url} alt="" className="mt-3 w-full max-h-[55vh] object-contain rounded-2xl bg-pink-soft/40" />
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-plum break-words whitespace-pre-line">{wish.message}</p>
        <p className="mt-4 text-xs text-plum/50">🕒 {fmt(wish.created_at)}</p>
      </div>
    </div>
  );
}
