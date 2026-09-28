"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "🏠", label: "หน้าแรก" },
  { href: "/gallery", icon: "📸", label: "แกลเลอรี" },
  { href: "/gift", icon: "🎁", label: "ของขวัญ" },
  { href: "/wish", icon: "💌", label: "อวยพร" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/90 backdrop-blur border-t border-pink-soft flex justify-around py-2 z-30">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`tap-target flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
              active ? "text-pink-deep" : "text-plum/60"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
