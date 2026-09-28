"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PhotoLightbox from "@/components/PhotoLightbox";
import BottomNav from "@/components/BottomNav";
import { downloadImagesAsZip } from "@/lib/download";
import Link from "next/link";

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null); // เปิดดูเต็มจอ
  const [selectMode, setSelectMode] = useState(false);
  const [picked, setPicked] = useState(() => new Set());
  const [zipState, setZipState] = useState({ busy: false, done: 0, total: 0, msg: "", ok: true });

  // รูปจากโฟลเดอร์ /public/gallery โหลดทันที (ไม่รอฐานข้อมูล) แล้วต่อด้วยรูปที่แอดมินอัปโหลด
  const [staticPhotos, setStaticPhotos] = useState([]);
  const [dbPhotos, setDbPhotos] = useState([]);
  const [staticDone, setStaticDone] = useState(false);
  const [dbDone, setDbDone] = useState(false);

  useEffect(() => {
    fetch("/gallery-manifest.json")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((list) => {
        setStaticPhotos((list || []).map((m) => ({ id: `static-${m.filename}`, url: m.url })));
        setStaticDone(true);
      });

    supabase
      .from("photos")
      .select("id,url,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDbPhotos(data || []);
        setDbDone(true);
      })
      .catch(() => setDbDone(true));
  }, []);

  useEffect(() => {
    setPhotos([...staticPhotos, ...dbPhotos]);
    setLoading(!(staticDone && dbDone));
  }, [staticPhotos, dbPhotos, staticDone, dbDone]);

  function toggle(id) {
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setPicked(new Set());
  }

  const allSelected = photos.length > 0 && picked.size === photos.length;

  async function runZip(list, label) {
    if (list.length === 0 || zipState.busy) return;
    setZipState({ busy: true, done: 0, total: list.length, msg: "", ok: true });
    try {
      const { count, failed } = await downloadImagesAsZip(
        list.map((p) => p.url),
        "birthday-photos.zip",
        (done, total) => setZipState((s) => ({ ...s, done, total }))
      );
      setZipState({
        busy: false,
        done: 0,
        total: 0,
        ok: true,
        msg:
          failed > 0
            ? `✅ ดาวน์โหลด birthday-photos.zip แล้ว (${count} รูป, โหลดไม่ได้ ${failed} รูป)`
            : `✅ ดาวน์โหลด birthday-photos.zip แล้ว (${label} ${count} รูป)`,
      });
    } catch (err) {
      console.error(err);
      setZipState({
        busy: false,
        done: 0,
        total: 0,
        ok: false,
        msg: `❌ ${err.message || "ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้ง"}`,
      });
    }
  }

  const pickedPhotos = photos.filter((p) => picked.has(p.id));

  return (
    <main className="px-5 pt-8 pb-40">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="text-xl">←</Link>
        <h1 className="font-display font-bold text-2xl">📸 แกลเลอรีรูปแฮป</h1>
      </div>
      <p className="text-sm text-plum/60 mb-4">
        แตะรูปเพื่อดูเต็มจอและกดดาวน์โหลด หรือกด “เลือกหลายรูป” เพื่อโหลดเป็นไฟล์ ZIP
        รองรับ JPG, PNG, WebP
      </p>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {!selectMode ? (
            <>
              <button
                onClick={() => setSelectMode(true)}
                className="tap-target text-sm font-semibold bg-white border border-pink-soft text-pink-deep px-4 py-2 rounded-full"
              >
                ☑️ เลือกหลายรูป
              </button>
              <button
                onClick={() => runZip(photos, "ทั้งหมด")}
                disabled={zipState.busy}
                className="tap-target text-sm font-semibold bg-gradient-to-r from-sky-400 to-violet-600 text-white px-4 py-2 rounded-full shadow-pink disabled:opacity-60"
              >
                📦 ดาวน์โหลดทั้งหมด ({photos.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  setPicked(allSelected ? new Set() : new Set(photos.map((p) => p.id)))
                }
                className="tap-target text-sm font-semibold bg-white border border-pink-soft text-pink-deep px-4 py-2 rounded-full"
              >
                {allSelected ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
              </button>
              <button
                onClick={exitSelectMode}
                className="tap-target text-sm font-semibold text-plum/60 px-3 py-2"
              >
                ยกเลิก
              </button>
            </>
          )}
        </div>
      )}

      {zipState.busy && (
        <div className="mb-4 bg-white border border-pink-soft rounded-2xl px-4 py-3 text-sm">
          <p className="font-semibold text-plum">
            กำลังเตรียมไฟล์ ZIP... {zipState.done}/{zipState.total}
          </p>
          <div className="mt-2 h-2 bg-pink-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-violet-600 transition-all"
              style={{ width: `${zipState.total ? (zipState.done / zipState.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {zipState.msg && !zipState.busy && (
        <p
          className={`mb-4 text-sm rounded-2xl px-4 py-3 border ${
            zipState.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {zipState.msg}
        </p>
      )}

      {loading && <p className="text-sm text-plum/50">กำลังโหลดรูป...</p>}

      {!loading && photos.length === 0 && (
        <div className="bg-white/70 rounded-2xl p-6 text-center text-sm text-plum/60 border border-dashed border-pink-soft">
          ยังไม่มีรูปในแกลเลอรี รอเจ้าของวันเกิดอัปโหลดก่อนนะ 🙏
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, i) => {
          const isPicked = picked.has(photo.id);
          return (
            <button
              key={photo.id}
              onClick={() => (selectMode ? toggle(photo.id) : setSelectedIndex(i))}
              className={`tap-target relative aspect-square rounded-2xl overflow-hidden border bg-white active:scale-[0.97] transition-transform ${
                isPicked ? "border-violet-500 ring-2 ring-violet-500" : "border-pink-soft"
              }`}
            >
              <img
                src={photo.url}
                alt="รูปแฮปวันเกิด"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {selectMode && (
                <span
                  className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    isPicked
                      ? "bg-violet-600 border-white text-white"
                      : "bg-white/80 border-violet-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* แถบดาวน์โหลดรูปที่เลือก (ลอยเหนือเมนูล่าง) */}
      {selectMode && (
        <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-40">
          <button
            onClick={() => runZip(pickedPhotos, "ที่เลือก")}
            disabled={picked.size === 0 || zipState.busy}
            className="tap-target w-full bg-gradient-to-r from-sky-400 to-violet-600 text-white font-display font-bold py-3 rounded-full shadow-pink disabled:opacity-50"
          >
            {picked.size === 0
              ? "แตะรูปเพื่อเลือก"
              : `⬇️ ดาวน์โหลดรูปที่เลือก (${picked.size})`}
          </button>
        </div>
      )}

      <PhotoLightbox
        photo={selectedIndex !== null ? photos[selectedIndex] : null}
        index={selectedIndex ?? 0}
        onClose={() => setSelectedIndex(null)}
      />
      <BottomNav />
    </main>
  );
}
