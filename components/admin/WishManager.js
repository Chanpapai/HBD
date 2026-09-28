"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function WishManager() {
  const [wishes, setWishes] = useState([]);
  const [filter, setFilter] = useState("pending");

  async function load() {
    const { data } = await supabase
      .from("wishes")
      .select("id,nickname,message,status,created_at")
      .order("created_at", { ascending: false });
    setWishes(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await supabase.from("wishes").update({ status }).eq("id", id);
    load();
  }

  async function remove(id) {
    if (!confirm("ลบคำอวยพรนี้ใช่ไหม?")) return;
    await supabase.from("wishes").delete().eq("id", id);
    load();
  }

  const filtered = wishes.filter((w) =>
    filter === "all" ? true : w.status === filter
  );

  return (
    <section className="bg-white rounded-2xl p-4 border border-pink-soft">
      <h2 className="font-display font-bold text-lg mb-3">💌 จัดการคำอวยพร</h2>

      <div className="flex gap-2 mb-3">
        {[
          { key: "pending", label: "รอตรวจ" },
          { key: "approved", label: "อนุมัติแล้ว" },
          { key: "all", label: "ทั้งหมด" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`tap-target text-xs font-semibold px-3 py-1.5 rounded-full ${
              filter === f.key
                ? "bg-pink text-white"
                : "bg-pink-soft text-plum/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((w) => (
          <div
            key={w.id}
            className="border border-pink-soft rounded-xl p-3 flex flex-col gap-2"
          >
            <p className="text-sm">{w.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-pink-deep">
                — {w.nickname}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  w.status === "approved"
                    ? "bg-mint/50 text-plum"
                    : "bg-gold/40 text-plum"
                }`}
              >
                {w.status === "approved" ? "อนุมัติแล้ว" : "รอตรวจ"}
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              {w.status !== "approved" && (
                <button
                  onClick={() => updateStatus(w.id, "approved")}
                  className="tap-target text-xs font-semibold bg-mint/50 px-3 py-1.5 rounded-full"
                >
                  ✅ อนุมัติ
                </button>
              )}
              {w.status === "approved" && (
                <button
                  onClick={() => updateStatus(w.id, "pending")}
                  className="tap-target text-xs font-semibold bg-gold/40 px-3 py-1.5 rounded-full"
                >
                  ↩️ ซ่อนกลับ
                </button>
              )}
              <button
                onClick={() => remove(w.id)}
                className="tap-target text-xs font-semibold bg-red-100 text-red-500 px-3 py-1.5 rounded-full"
              >
                🗑️ ลบ
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-plum/50">ไม่มีคำอวยพรในหมวดนี้</p>
        )}
      </div>
    </section>
  );
}
