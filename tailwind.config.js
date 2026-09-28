/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // ============================================================
      // ธีมสี "ฟ้า + ม่วง" — ชื่อ key เดิม (cream/pink/gold/mint/plum)
      // ถูกคงไว้เพื่อไม่ต้องแก้ทุกไฟล์ที่อ้างอิง className เดิม
      // แต่เปลี่ยนค่าสีจริงเป็นโทนฟ้า-ม่วงทั้งหมดแล้ว
      // ============================================================
      colors: {
        cream: "#F3F1FF",        // พื้นหลังลาเวนเดอร์อ่อนมาก
        pink: {
          DEFAULT: "#6D5DF6",     // ม่วง-น้ำเงิน (สีหลัก)
          deep: "#4C3FD1",        // ม่วงเข้ม (hover/เงา)
          soft: "#E4E1FF",        // ม่วงอ่อนมาก (เส้นขอบ/พื้นหลังการ์ด)
        },
        gold: "#38BDF8",          // ฟ้าสด (สีรอง)
        mint: "#A5B4FC",          // ฟ้า-ม่วงพาสเทล (สีที่สาม)
        plum: "#241943",          // กรมท่าอมม่วง (ข้อความหลัก)
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        blob: "42% 58% 60% 40% / 45% 45% 55% 55%",
      },
      boxShadow: {
        pink: "0 8px 24px -6px rgba(109,93,246,0.35)",
        gold: "0 8px 24px -6px rgba(56,189,248,0.4)",
        mint: "0 8px 24px -6px rgba(99,102,241,0.25)",
      },
      backgroundImage: {
        "birthday-gradient": "linear-gradient(135deg, #60A5FA 0%, #8B5CF6 100%)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        popin: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        popin: "popin 0.35s cubic-bezier(.2,.9,.3,1.3) both",
      },
    },
  },
  plugins: [],
};
