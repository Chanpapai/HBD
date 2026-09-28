"use client";

// รูปบุคคล PNG พื้นหลังโปร่งใส 2 รูป วางกึ่งกลาง เรียงคู่กัน ไม่มีวงกลม/กรอบ และไม่ทับกัน
export default function ProfileCutouts({ images = [] }) {
  const list = images.slice(0, 2);
  if (list.length === 0) return null;
  return (
    <div className="flex items-end justify-center gap-3 w-full" aria-label="เจ้าของวันเกิด">
      {list.map((src, i) => (
        <div key={src} className="w-[44%] max-w-[210px] flex justify-center">
          <img
            src={src}
            alt=""
            draggable={false}
            decoding="async"
            className="w-full h-auto max-h-[230px] object-contain animate-floaty select-none pointer-events-none"
            style={{ animationDelay: `${i * 0.9}s`, filter: "drop-shadow(0 8px 10px rgba(76,63,209,0.28))" }}
          />
        </div>
      ))}
    </div>
  );
}
