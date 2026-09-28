// การ์ดคำอวยพร: กดเพื่อเปิดดูเต็ม (รูปแสดงครบทุกอัตราส่วนด้วย object-contain)
export default function WishCard({ name, message, photo, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="wish-card tap-target text-left w-full bg-white rounded-2xl px-4 py-3 shadow-sm border border-pink-soft active:scale-[0.99] transition-transform"
    >
      {photo && (
        <img src={photo} alt="" loading="lazy" className="mb-2 rounded-xl w-full max-h-56 object-contain bg-pink-soft/40" />
      )}
      <p className="text-plum text-[15px] leading-snug break-words whitespace-pre-line line-clamp-4">{message}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-pink-deep">💌 {name}</span>
        <span className="text-[11px] text-plum/40">แตะเพื่อดูเต็ม</span>
      </div>
    </button>
  );
}
