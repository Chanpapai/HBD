"use client";

import { useEffect, useState } from "react";

// ฝนรูป PNG ค่อย ๆ ลอย/หล่นลงมาช้า ๆ
// - สุ่มตำแหน่งแนวนอน ขนาด ความเร็ว ความเอียง และการแกว่งของแต่ละรูป
// - อยู่ "ด้านหลัง" เนื้อหา (z-0 เทียบกับเนื้อหา z-10) และ pointer-events-none
//   จึงไม่บังข้อความ ไม่บังปุ่ม และกดทะลุได้
// - ใช้แค่ transform (ลื่นบน GPU) จำนวนน้อยบนมือถือ เพื่อไม่ให้เว็บช้า
// - ปิดอัตโนมัติถ้าผู้ใช้ตั้งค่า "ลดการเคลื่อนไหว" ในเครื่อง

const rand = (min, max) => min + Math.random() * (max - min);

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function FallingPhotos({ images = [], count = 10 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (images.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const total = window.innerWidth < 640 ? Math.min(count, 7) : count;
    const pool = shuffle(images);

    // สุ่มหลังโหลดเสร็จ (ฝั่งเบราว์เซอร์เท่านั้น) เพื่อไม่ให้ HTML ฝั่งเซิร์ฟเวอร์ไม่ตรงกัน
    setItems(
      Array.from({ length: total }).map((_, i) => ({
        id: i,
        src: pool[i % pool.length],
        left: rand(1, 93), // % ของความกว้างหน้าจอ
        height: rand(44, 92), // px
        duration: rand(20, 38), // วินาที/รอบ — ยิ่งมากยิ่งช้า
        delay: -rand(0, 38), // ค่าติดลบ = เริ่มกลางทาง กระจายทั้งหน้าจอตั้งแต่แรก
        sway: rand(-40, 40), // แกว่งซ้าย-ขวาระหว่างตก (px)
        rotStart: rand(-16, 16),
        rotEnd: rand(-16, 16),
        opacity: rand(0.28, 0.5), // จางลง เพื่อให้ข้อความอ่านง่ายเสมอ
      }))
    );
  }, [images, count]);

  if (items.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="falling-layer fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {items.map((it) => (
        <img
          key={it.id}
          src={it.src}
          alt=""
          draggable={false}
          decoding="async"
          className="falling-photo"
          style={{
            left: `${it.left}%`,
            height: it.height,
            opacity: it.opacity,
            "--dur": `${it.duration}s`,
            "--delay": `${it.delay}s`,
            "--sway": `${it.sway}px`,
            "--rot-start": `${it.rotStart}deg`,
            "--rot-end": `${it.rotEnd}deg`,
          }}
        />
      ))}
    </div>
  );
}
