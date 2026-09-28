"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/BottomNav";

const MAX_MESSAGE = 300;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 8; // ขนาดไฟล์ก่อนย่อ (หลังย่อจะเหลือไม่เกิน ~500KB)

// ย่อรูปให้กว้างไม่เกิน 1280px แล้วแปลงเป็น JPEG (โหลดเร็ว ประหยัดพื้นที่)
async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("อ่านรูปไม่ได้"));
      i.src = url;
    });
    const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob) throw new Error("ย่อรูปไม่สำเร็จ");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function WishPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorDetail, setErrorDetail] = useState("");
  const inputRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  function pickFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return setFileError("รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น");
    if (f.size > MAX_MB * 1024 * 1024) return setFileError(`ไฟล์ใหญ่เกินไป (สูงสุด ${MAX_MB} MB)`);
    setFileError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    setPreview("");
    setFileError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim() || !message.trim()) return;
    setStatus("sending");
    setErrorDetail("");

    let photoUrl = null;
    let path = null;
    try {
      if (file) {
        const blob = await shrinkImage(file);
        path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("wish-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (upErr) throw upErr;
        photoUrl = supabase.storage.from("wish-photos").getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from("wishes").insert({
        nickname: nickname.trim().slice(0, 60),
        message: message.trim().slice(0, MAX_MESSAGE),
        status: "approved", // แสดงบนหน้าแรกทันที
        photo_url: photoUrl,
        is_anonymous: anonymous, // ชื่อจริงเก็บภายใน แต่หน้าเว็บสาธารณะแสดงเป็น "ไม่ระบุชื่อ"
      });
      if (error) throw error;
    } catch (err) {
      console.error("[wish] ส่งไม่สำเร็จ:", err);
      if (path) supabase.storage.from("wish-photos").remove([path]);
      const raw = err?.message || "";
      let friendly = "ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้ง";
      if (/failed to fetch|network/i.test(raw)) friendly = "เชื่อมต่ออินเทอร์เน็ตไม่ได้ ตรวจสัญญาณแล้วลองใหม่";
      else if (/row-level security|violates|permission|photo_url|column/i.test(raw)) friendly = "ตั้งค่าฐานข้อมูลยังไม่ครบ แจ้งเจ้าของเว็บด้วยนะ";
      else if (/size|mime|too large/i.test(raw)) friendly = "รูปไม่ผ่านการตรวจสอบ ลองรูปอื่น";
      setErrorDetail(friendly);
      setStatus("error");
      return;
    }
    setStatus("sent");
    setTimeout(() => router.push("/"), 1800); // พาไปดูคำอวยพรบนหน้าแรก
  }

  return (
    <main className="px-5 pt-8">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="text-xl">←</Link>
        <h1 className="font-display font-bold text-2xl">💌 อวยพรวันเกิด</h1>
      </div>

      {status === "sent" ? (
        <div className="bg-mint/40 border border-mint rounded-2xl p-6 text-center animate-popin">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-semibold">ส่งคำอวยพรเรียบร้อย!</p>
          <p className="text-sm text-plum/60 mt-1">กำลังพาไปดูคำอวยพรของคุณบนหน้าแรก...</p>
          <Link href="/" className="inline-block mt-3 text-sm font-semibold text-pink-deep underline">ไปหน้าแรกเลย</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-plum/70">การแสดงชื่อบนหน้าเว็บ</span>
            <div className="grid grid-cols-2 gap-2">
              {[[false, "🙂 ระบุชื่อ"], [true, "🕶️ ไม่ระบุชื่อ"]].map(([v, label]) => (
                <button key={label} type="button" onClick={() => setAnonymous(v)}
                  className={`tap-target py-2.5 rounded-2xl text-sm font-semibold border ${anonymous === v ? "bg-pink text-white border-pink" : "bg-white text-plum/70 border-pink-soft"}`}>
                  {label}
                </button>
              ))}
            </div>
            {anonymous && <p className="text-xs text-plum/50">หน้าเว็บจะแสดงเป็น “ไม่ระบุชื่อ” ไม่โชว์ชื่อของคุณต่อสาธารณะ</p>}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-plum/70">ชื่อ / ชื่อเล่นของคุณ</span>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={60} required placeholder="เช่น ปูเป้"
              className="rounded-2xl border border-pink-soft px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-plum/70">คำอวยพร</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX_MESSAGE} required rows={5}
              placeholder="เขียนคำอวยพรน่ารัก ๆ ให้เจ้าของวันเกิดเลย ✨"
              className="rounded-2xl border border-pink-soft px-4 py-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-pink" />
            <span className="text-xs text-plum/40 text-right">{message.length}/{MAX_MESSAGE}</span>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-plum/70">รูปของคุณ (ไม่บังคับ)</span>
            {preview ? (
              <div className="relative self-start">
                <img src={preview} alt="ตัวอย่างรูป" className="max-h-56 rounded-2xl border border-pink-soft" />
                <button type="button" onClick={clearFile} aria-label="เอารูปออก"
                  className="tap-target absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm">×</button>
              </div>
            ) : (
              <button type="button" onClick={() => inputRef.current?.click()}
                className="tap-target self-start bg-white border border-dashed border-violet-300 text-pink-deep font-semibold text-sm px-4 py-3 rounded-2xl">
                📷 เลือกรูป (JPG / PNG / WebP ไม่เกิน {MAX_MB} MB)
              </button>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
            {fileError && <p className="text-sm text-red-500">❌ {fileError}</p>}
          </div>

          {status === "error" && <p className="text-sm text-red-500">❌ ส่งไม่สำเร็จ: {errorDetail}</p>}

          <button type="submit" disabled={status === "sending"}
            className="tap-target bg-pink text-white font-display font-bold py-3 rounded-full shadow-pink active:scale-[0.97] transition-transform disabled:opacity-60">
            {status === "sending" ? "กำลังส่ง..." : "ส่งคำอวยพร 💌"}
          </button>
          <p className="text-xs text-plum/40 text-center">คำอวยพรจะแสดงบนหน้าแรกทันทีหลังส่ง</p>
        </form>
      )}
      <BottomNav />
    </main>
  );
}
