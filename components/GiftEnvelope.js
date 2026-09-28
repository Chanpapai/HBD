"use client";

import { useState } from "react";
import { downloadImage } from "@/lib/download";

// การ์ด QR 1 ใบ (ใช้ซ้ำสำหรับ "สแกนธนาคาร" และ "สแกน TrueMoney")
function QrCard({ title, icon, qrUrl, text, filename, accent }) {
  const [msg, setMsg] = useState({ text: "", ok: true });

  async function save() {
    setMsg({ text: "", ok: true });
    try {
      await downloadImage(qrUrl, filename);
      setMsg({ text: "✅ บันทึก QR แล้ว", ok: true });
    } catch (e) {
      console.error(e);
      setMsg({ text: "❌ บันทึกไม่สำเร็จ ลองกดค้างที่ QR แล้วเลือกบันทึกรูปภาพ", ok: false });
    }
  }

  return (
    <div className={`bg-white rounded-3xl p-5 border-2 ${accent} shadow-pink flex flex-col items-center text-center`}>
      <p className="font-display font-bold text-lg mb-3">
        {icon} {title}
      </p>
      {qrUrl ? (
        <img
          src={qrUrl}
          alt={title}
          className="w-full max-w-[260px] object-contain rounded-xl border border-pink-soft"
        />
      ) : (
        <div className="w-56 h-56 flex items-center justify-center text-sm text-plum/50 border border-dashed border-pink-soft rounded-xl">
          ยังไม่ได้ตั้งค่า QR Code
        </div>
      )}
      {text && (
        <p className="mt-4 text-sm font-semibold text-plum whitespace-pre-line break-words">
          {text}
        </p>
      )}
      {qrUrl && (
        <button
          onClick={save}
          className="tap-target mt-4 bg-gradient-to-r from-sky-400 to-violet-600 text-white font-display font-bold text-sm px-5 py-2.5 rounded-full shadow-pink"
        >
          ⬇️ บันทึก QR
        </button>
      )}
      {msg.text && (
        <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-600" : "text-red-500"}`}>{msg.text}</p>
      )}
    </div>
  );
}

export default function GiftEnvelope({ bank, truemoney }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center mt-6">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="tap-target relative w-64 h-44 group"
          aria-label="เปิดซองของขวัญ"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-600 shadow-pink" />
          <div
            className="absolute top-0 left-0 right-0 h-24 bg-violet-700 origin-top transition-transform duration-500 group-active:-rotate-6"
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
        <div className="animate-popin w-full flex flex-col gap-4">
          <p className="font-display font-bold text-lg text-center">ขอบคุณที่คิดถึงกันนะ 💕</p>
          <QrCard
            title="สแกนธนาคาร"
            icon="🏦"
            qrUrl={bank.url}
            text={bank.text}
            filename="qr-bank.png"
            accent="border-violet-200"
          />
          <QrCard
            title="สแกน TrueMoney"
            icon="🧡"
            qrUrl={truemoney.url}
            text={truemoney.text}
            filename="qr-truemoney.png"
            accent="border-sky-200"
          />
        </div>
      )}
    </div>
  );
}
