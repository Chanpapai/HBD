"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#6D5DF6", "#38BDF8", "#A5B4FC", "#4C3FD1", "#FFFFFF"];

// คอนเฟตตี้เบา ๆ ยิงครั้งเดียวตอนโหลดหน้า ไม่วนลูปตลอดเพื่อไม่ให้เว็บหนัก
export default function ConfettiBurst({ count = 60 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pieces = Array.from({ length: count }).map(() => ({
      x: width / 2 + (Math.random() - 0.5) * 40,
      y: height * 0.15,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -6 - 3,
      size: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 10,
      gravity: 0.18 + Math.random() * 0.08,
    }));

    let frame = 0;
    const maxFrames = 130;
    let raf;

    function tick() {
      frame++;
      ctx.clearRect(0, 0, width, height);
      pieces.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (frame < maxFrames) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full z-20"
    />
  );
}
