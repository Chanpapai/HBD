"use client";

import { useState } from "react";
import { downloadImage, canShareImages, shareImage, makeFilename } from "@/lib/download";

// ดูรูปเต็มจอ + ปุ่ม "ดาวน์โหลดรูป" ที่บันทึกไฟล์จริงโดยไม่ออกจากหน้า
export default function PhotoLightbox({ photo, index = 0, onClose }) {
  const [state, setState] = useState({ busy: false, msg: "", ok: true });
  if (!photo) return null;

  const filename = makeFilename(photo.url, index);

  async function handleDownload(e) {
    e.stopPropagation();
    setState({ busy: true, msg: "", ok: true });
    try {
      const name = await downloadImage(photo.url, filename);
      setState({ busy: false, ok: true, msg: `✅ ดาวน์โหลดแล้ว: ${name}` });
    } catch (err) {
      console.error(err);
      setState({
        busy: false,
        ok: false,
        msg: "❌ ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้ง หรือกดค้างที่รูปแล้วเลือกบันทึกรูปภาพ",
      });
    }
  }

  async function handleShare(e) {
    e.stopPropagation();
    setState({ busy: true, msg: "", ok: true });
    try {
      const done = await shareImage(photo.url, filename);
      setState({ busy: false, ok: true, msg: done ? "✅ เปิดเมนูบันทึก/แชร์แล้ว" : "" });
    } catch (err) {
      console.error(err);
      setState({ busy: false, ok: false, msg: "❌ แชร์ไม่สำเร็จ ลองปุ่มดาวน์โหลดแทน" });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-popin px-4"
      onClick={onClose}
    >
      <button
        aria-label="ปิด"
        className="tap-target absolute top-4 right-4 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center"
        onClick={onClose}
      >
        ×
      </button>

      <img
        src={photo.url}
        alt="รูปแฮปวันเกิด"
        className="max-h-[68vh] max-w-[92vw] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="mt-5 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={state.busy}
            className="tap-target bg-gradient-to-r from-sky-400 to-violet-600 text-white font-display font-bold px-6 py-3 rounded-full shadow-pink disabled:opacity-60"
          >
            {state.busy ? "กำลังดาวน์โหลด..." : "⬇️ ดาวน์โหลดรูป"}
          </button>
          {canShareImages() && (
            <button
              onClick={handleShare}
              disabled={state.busy}
              className="tap-target bg-white/15 text-white font-display font-bold px-5 py-3 rounded-full disabled:opacity-60"
            >
              📲 บันทึก/แชร์
            </button>
          )}
        </div>
        {state.msg && (
          <p className={`text-sm text-center max-w-xs ${state.ok ? "text-emerald-300" : "text-red-300"}`}>
            {state.msg}
          </p>
        )}
      </div>
    </div>
  );
}
