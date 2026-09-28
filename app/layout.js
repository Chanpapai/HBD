import "./globals.css";

export const metadata = {
  title: "Happy Birthday to Me 🎂",
  description: "เว็บไซต์วันเกิดส่วนตัว — ดูรูป ส่งของขวัญ และอวยพร",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        {/* โหลดฟอนต์ผ่านลิงก์ตรง ไม่ใช้ next/font/google เพื่อไม่ให้ build
            ต้องพึ่งเน็ตดาวน์โหลดฟอนต์ตอน build (เคยทำให้ build ล้มเหลวมาก่อน) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mali:wght@500;600;700&family=Kanit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body text-plum min-h-screen bg-gradient-birthday-page"
        style={{ "--font-baloo": "'Mali', sans-serif", "--font-inter": "'Kanit', sans-serif" }}
      >
        <div className="mx-auto max-w-[480px] min-h-screen relative pb-10">
          {children}
        </div>
      </body>
    </html>
  );
}
