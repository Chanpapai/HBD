"use client";

export default function PhotoLightbox({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-popin"
      onClick={onClose}
    >
      <button
        aria-label="ปิด"
        className="tap-target absolute top-4 right-4 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={photo.url}
        alt="รูปแฮปวันเกิด"
        className="max-h-[75vh] max-w-[92vw] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
      <a
        href={photo.url}
        download
        onClick={(e) => e.stopPropagation()}
        className="tap-target mt-6 bg-pink text-white font-display font-bold px-6 py-3 rounded-full shadow-pink"
      >
        ⬇️ ดาวน์โหลดรูปนี้
      </a>
    </div>
  );
}
