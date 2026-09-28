"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/BottomNav";

const MAX_MESSAGE = 300;

export default function WishPage() {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim() || !message.trim()) return;

    setStatus("sending");
    const { error } = await supabase.from("wishes").insert({
      nickname: nickname.trim().slice(0, 60),
      message: message.trim().slice(0, MAX_MESSAGE),
      status: "pending",
    });

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }
    setStatus("sent");
    setNickname("");
    setMessage("");
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
          <p className="text-sm text-plum/60 mt-1">
            คำอวยพรของคุณจะขึ้นกำแพงหน้าแรกหลังแอดมินตรวจสอบและอนุมัติ
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="tap-target mt-4 text-sm font-semibold text-pink-deep underline"
          >
            เขียนอีกครั้ง
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-plum/70">
              ชื่อ / ชื่อเล่นของคุณ
            </span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={60}
              required
              placeholder="เช่น ปูเป้"
              className="rounded-2xl border border-pink-soft px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-plum/70">
              คำอวยพร
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE}
              required
              rows={5}
              placeholder="เขียนคำอวยพรน่ารัก ๆ ให้เจ้าของวันเกิดเลย ✨"
              className="rounded-2xl border border-pink-soft px-4 py-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-pink"
            />
            <span className="text-xs text-plum/40 text-right">
              {message.length}/{MAX_MESSAGE}
            </span>
          </label>

          {status === "error" && (
            <p className="text-sm text-red-500">
              ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="tap-target bg-pink text-white font-display font-bold py-3 rounded-full shadow-pink active:scale-[0.97] transition-transform disabled:opacity-60"
          >
            {status === "sending" ? "กำลังส่ง..." : "ส่งคำอวยพร 💌"}
          </button>

          <p className="text-xs text-plum/40 text-center">
            คำอวยพรจะต้องผ่านการอนุมัติจากแอดมินก่อนแสดงบนหน้าแรก
          </p>
        </form>
      )}

      <BottomNav />
    </main>
  );
}
