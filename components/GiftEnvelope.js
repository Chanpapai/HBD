"use client";

import { useState } from "react";

export default function GiftEnvelope({ qrUrl, note }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center mt-6">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="tap-target relative w-64 h-44 group"
          aria-label="เปิดซองของขวัญ"
        >
          {/* ตัวซอง */}
          <div className="absolute inset-0 rounded-2xl bg-pink shadow-pink" />
          {/* ฝาซองรูปสามเหลี่ยม */}
          <div
            className="absolute top-0 left-0 right-0 h-24 bg-pink-deep origin-top transition-transform duration-500 group-active:-rotate-6"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 70%)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-floaty">🎁</span>
          </div>
          <p className="absolute -bottom-8 left-0 right-0 text-sm font-semibold text-plum">
            แตะเพื่อเปิดซอง
          </p>
        </button>
      )}

      {open && (
        <div className="animate-popin flex flex-col items-center bg-white rounded-3xl p-6 shadow-pink w-full max-w-xs">
          <p className="font-display font-bold text-lg mb-3">
            ขอบคุณที่คิดถึงกันนะ 💕
          </p>
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="QR รับของขวัญ"
              className="w-56 h-56 object-contain rounded-xl border border-pink-soft"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-sm text-plum/50 border border-dashed border-pink-soft rounded-xl">
              ยังไม่ได้ตั้งค่า QR Code
            </div>
          )}
          {note && (
            <p className="mt-4 text-sm text-plum/70 text-center whitespace-pre-line">
              {note}
            </p>
          )}
          <a
            href={qrUrl}
            download
            className="tap-target mt-5 bg-gold text-plum font-display font-bold px-6 py-3 rounded-full shadow-gold"
          >
            ⬇️ บันทึก QR
          </a>
        </div>
      )}
    </div>
  );
}
