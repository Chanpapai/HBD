"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// แสดงวันที่/เวลาแบบไทย โซนเวลากรุงเทพฯ เช่น "28 ก.ย. 2569 เวลา 10:29 น."
function formatThaiDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const date = d.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} เวลา ${time} น.`;
}

export default function WishManager() {
  const [wishes, setWishes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ text: "", ok: true });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    // ดึงทุกสถานะ (pending + approved) — ต้องมี policy "wishes_admin_read" ใน Supabase
    // (รันไฟล์ supabase/fix_v2.sql ถ้ายังไม่เคยรัน)
    const { data, error: qError } = await supabase
      .from("wishes")
      .select("id,nickname,message,photo_url,status,created_at")
      .order("created_at", { ascending: false });

    if (qError) {
      console.error("[admin] โหลดคำอวยพรไม่สำเร็จ:", qError);
      setError(qError.message || "โหลดคำอวยพรไม่สำเร็จ");
      setWishes([]);
    } else {
      setWishes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text, ok = true) {
    setNotice({ text, ok });
    setTimeout(() => setNotice({ text: "", ok: true }), 4000);
  }

  async function updateStatus(id, status) {
    // .select() เพื่อเช็คว่ามีแถวถูกแก้จริง (ถ้าไม่มีสิทธิ์ Supabase จะไม่ error แต่ไม่แก้อะไรเลย)
    const { data, error: uError } = await supabase
      .from("wishes")
      .update({ status })
      .eq("id", id)
      .select("id");

    if (uError || !data || data.length === 0) {
      console.error(uError);
      flash("❌ เปลี่ยนสถานะไม่สำเร็จ — ตรวจสิทธิ์แอดมิน (ดู fix_v2.sql)", false);
      return;
    }
    flash(status === "approved" ? "👁️ แสดงแล้ว — ขึ้นหน้าเว็บทันที" : "✅ ซ่อนคำอวยพรแล้ว");
    load();
  }

  async function remove(id) {
    if (!confirm("ลบคำอวยพรนี้ใช่ไหม? (กู้คืนไม่ได้)")) return;
    const target = wishes.find((x) => x.id === id);
    const { data, error: dError } = await supabase
      .from("wishes")
      .delete()
      .eq("id", id)
      .select("id");

    if (dError || !data || data.length === 0) {
      console.error(dError);
      flash("❌ ลบไม่สำเร็จ — ตรวจสิทธิ์แอดมิน", false);
      return;
    }
    const key = target?.photo_url?.split("/wish-photos/")[1];
    if (key) await supabase.storage.from("wish-photos").remove([decodeURIComponent(key)]);
    flash("✅ ลบคำอวยพรแล้ว");
    load();
  }

  const pendingCount = wishes.filter((w) => w.status === "pending").length;
  const approvedCount = wishes.filter((w) => w.status === "approved").length;
  const filtered = wishes.filter((w) => (filter === "all" ? true : w.status === filter));

  const tabs = [
    { key: "pending", label: `ซ่อนอยู่ (${pendingCount})` },
    { key: "approved", label: `แสดงอยู่ (${approvedCount})` },
    { key: "all", label: `ทั้งหมด (${wishes.length})` },
  ];

  return (
    <section className="bg-white rounded-2xl p-4 border border-pink-soft">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-lg">💌 จัดการคำอวยพร</h2>
        <button
          onClick={load}
          disabled={loading}
          className="tap-target text-xs font-semibold text-pink-deep underline disabled:opacity-50"
        >
          {loading ? "กำลังโหลด..." : "🔄 รีเฟรช"}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm p-3">
          <p className="font-semibold">โหลดคำอวยพรไม่สำเร็จ</p>
          <p className="break-words mt-1">{error}</p>
          <p className="mt-1 text-xs text-red-500">
            แก้ไข: รันไฟล์ supabase/fix_v2.sql ใน Supabase → SQL Editor แล้วกดรีเฟรช
          </p>
        </div>
      )}

      {notice.text && (
        <p
          className={`mb-3 text-sm rounded-xl px-3 py-2 border ${
            notice.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`tap-target text-xs font-semibold px-3 py-1.5 rounded-full ${
              filter === t.key ? "bg-pink text-white" : "bg-pink-soft text-plum/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((w) => (
          <div key={w.id} className="border border-pink-soft rounded-xl p-3 flex flex-col gap-2">
            {w.photo_url && <img src={w.photo_url} alt="" className="rounded-lg max-h-40 object-cover self-start" />}
            <p className="text-sm whitespace-pre-line break-words">{w.message}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-pink-deep break-words">— {w.nickname}</span>
              <span
                className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${
                  w.status === "approved" ? "bg-mint/50 text-plum" : "bg-gold/40 text-plum"
                }`}
              >
                {w.status === "approved" ? "แสดงอยู่" : "ซ่อนอยู่"}
              </span>
            </div>
            <p className="text-[11px] text-plum/50">🕒 {formatThaiDateTime(w.created_at)}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {w.status !== "approved" && (
                <button
                  onClick={() => updateStatus(w.id, "approved")}
                  className="tap-target text-xs font-semibold bg-mint/50 px-3 py-1.5 rounded-full"
                >
                  👁️ แสดง
                </button>
              )}
              {w.status === "approved" && (
                <button
                  onClick={() => updateStatus(w.id, "pending")}
                  className="tap-target text-xs font-semibold bg-gold/40 px-3 py-1.5 rounded-full"
                >
                  🙈 ซ่อน
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
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-plum/50">ไม่มีคำอวยพรในหมวดนี้</p>
        )}
      </div>
    </section>
  );
}
