export default function WishCard({ nickname, message, photo }) {
  return (
    <div className="wish-card bg-white rounded-2xl px-4 py-3 shadow-sm border border-pink-soft">
      {photo && (
        <img src={photo} alt={`รูปจาก ${nickname}`} loading="lazy" className="mb-2 rounded-xl w-full max-h-72 object-cover" />
      )}
      <p className="text-plum text-[15px] leading-snug break-words whitespace-pre-line">{message}</p>
      <p className="mt-2 text-xs font-semibold text-pink-deep">— {nickname}</p>
    </div>
  );
}
