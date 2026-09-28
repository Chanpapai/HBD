"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAdminSession } from "@/lib/useAdminSession";
import PhotoManager from "@/components/admin/PhotoManager";
import WishManager from "@/components/admin/WishManager";
import SettingsManager from "@/components/admin/SettingsManager";

export default function AdminDashboard() {
  const router = useRouter();
  const { loading, session, isAdmin } = useAdminSession();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/admin/login");
    }
  }, [loading, session, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="px-6 pt-16 text-center text-sm text-plum/50">
        กำลังตรวจสอบสิทธิ์...
      </main>
    );
  }

  if (session && !isAdmin) {
    return (
      <main className="px-6 pt-16 text-center">
        <p className="text-3xl mb-2">🚫</p>
        <p className="font-semibold">บัญชีนี้ไม่มีสิทธิ์แอดมิน</p>
        <p className="text-sm text-plum/60 mt-1">
          ต้องเพิ่มบัญชีนี้ในตาราง admin_users ก่อนถึงจะเข้าใช้งานได้
        </p>
        <button
          onClick={handleLogout}
          className="tap-target mt-4 text-sm font-semibold text-pink-deep underline"
        >
          ออกจากระบบ
        </button>
      </main>
    );
  }

  return (
    <main className="px-5 pt-8 pb-16 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">🛠️ แผงควบคุมแอดมิน</h1>
        <button
          onClick={handleLogout}
          className="tap-target text-xs font-semibold text-pink-deep underline"
        >
          ออกจากระบบ
        </button>
      </div>

      <a href="/?countdown_demo=10"
        className="tap-target block bg-white border border-dashed border-violet-300 rounded-2xl px-4 py-3 text-sm font-semibold text-pink-deep">
        🧪 ทดสอบ Countdown (เหลือ 10 วินาที → พลุ → หน้าเว็บปกติ) — เห็นเฉพาะแอดมิน
      </a>

      <SettingsManager />
      <PhotoManager />
      <WishManager />
    </main>
  );
}
