export default function WishCard({ nickname, message }) {
  return (
    <div className="wish-card bg-white rounded-2xl px-4 py-3 shadow-sm border border-pink-soft">
      <p className="text-plum text-[15px] leading-snug break-words">{message}</p>
      <p className="mt-2 text-xs font-semibold text-pink-deep">— {nickname}</p>
    </div>
  );
}
