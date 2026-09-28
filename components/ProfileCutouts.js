"use client";

// แสดงรูปบุคคล PNG/WebP พื้นหลังโปร่งใสแบบ "ไม่มีวงกลม ไม่มีกรอบ"
// เรียงต่อกันในแถวเดียว ซ้อนทับกันเล็กน้อย และลอยขึ้นลงไม่พร้อมกัน
// (ใช้ drop-shadow ตามเงาของตัวคนจริง ไม่ใช่กล่องสี่เหลี่ยม)

// สัดส่วนความสูงต่างกันเล็กน้อยให้ดูเป็นธรรมชาติ (คูณกับหน่วยที่ปรับตามความกว้างจอ)
const HEIGHT_FACTORS = [1.0, 1.08, 0.96, 1.04, 0.98];
const MAX_VISIBLE = 5;

export default function ProfileCutouts({ images = [] }) {
  const list = images.slice(0, MAX_VISIBLE);
  if (list.length === 0) return null;

  return (
    <div
      className="flex items-end justify-center w-full max-w-full overflow-visible"
      // หน่วยความสูงปรับตามความกว้างจอ (สูงสุด ~120px) ให้ทั้ง 5 รูปพอดีจอมือถือเสมอ
      style={{ "--u": "min(25vw, 118px)", minHeight: "calc(var(--u) * 1.1)" }}
      aria-label="รูปเจ้าของวันเกิด"
    >
      {list.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          className="w-auto object-contain animate-floaty select-none pointer-events-none"
          style={{
            height: `calc(var(--u) * ${HEIGHT_FACTORS[i % HEIGHT_FACTORS.length]})`,
            marginLeft: i === 0 ? 0 : "calc(var(--u) * -0.16)",
            zIndex: i % 2 === 0 ? 2 : 1,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${4.6 + (i % 3) * 0.7}s`,
            filter: "drop-shadow(0 8px 10px rgba(76,63,209,0.28))",
          }}
        />
      ))}
    </div>
  );
}
