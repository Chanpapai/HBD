"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="px-6 pt-16 flex flex-col items-center">
      <span className="text-4xl mb-3">🔐</span>
      <h1 className="font-display font-bold text-2xl mb-6">เข้าสู่ระบบแอดมิน</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="email"
          required
          placeholder="อีเมลแอดมิน"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-pink-soft px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink"
        />
        <input
          type="password"
          required
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border border-pink-soft px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="tap-target bg-pink text-white font-display font-bold py-3 rounded-full shadow-pink disabled:opacity-60"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}
