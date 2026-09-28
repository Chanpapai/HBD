import Link from "next/link";

const tones = {
  // ปุ่มหลัก: ไล่เฉดฟ้า → ม่วง (ธีมของเว็บ)
  pink: "bg-gradient-to-r from-sky-400 to-violet-600 text-white shadow-pink active:shadow-none",
  gold: "bg-gold text-white shadow-gold active:shadow-none",
  mint: "bg-mint text-plum shadow-mint active:shadow-none",
};

export default function BigButton({ href, icon, label, sub, tone = "pink" }) {
  return (
    <Link
      href={href}
      className={`tap-target flex items-center gap-4 rounded-3xl px-5 py-4 w-full transition-transform active:scale-[0.97] ${tones[tone]}`}
    >
      <span className="text-3xl leading-none">{icon}</span>
      <span className="flex flex-col text-left">
        <span className="font-display font-bold text-lg leading-tight">{label}</span>
        {sub && <span className="text-sm opacity-80 leading-tight">{sub}</span>}
      </span>
    </Link>
  );
}
