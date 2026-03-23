import { MOODS, BUDGETS } from '../data/restaurants';
import { formatDistance } from '../lib/distance';

export default function ShareCard({ restaurant, personality, mood, budget }) {
  const moodObj = MOODS.find((m) => m.value === mood);
  const budgetObj = BUDGETS.find((b) => b.value === budget);

  return (
    <div className="bg-surface border border-border rounded-lg p-7 w-full max-w-[380px] relative overflow-hidden animate-popIn">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent via-accent2 to-green" />

      <div className="text-center">
        <div className="text-[0.6rem] uppercase tracking-[3px] text-muted/60 mb-3.5">
          WTF DO I EAT
        </div>

        {/* Tags */}
        <div className="flex justify-center gap-1.5 mb-3.5 flex-wrap">
          {moodObj && (
            <span
              className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap"
              style={{ background: `${moodObj.color}15`, color: moodObj.color }}
            >
              {moodObj.emoji} {moodObj.label}
            </span>
          )}
          {budgetObj && (
            <span className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-white/[0.04] text-muted">
              {budgetObj.emoji} {budgetObj.label}
            </span>
          )}
          {restaurant._dist != null && (
            <span className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-green/10 text-green">
              {formatDistance(restaurant._dist)}
            </span>
          )}
        </div>

        <h2 className="font-display text-[clamp(1.4rem,5.5vw,1.8rem)] leading-tight font-bold mb-0.5">
          {restaurant.name}
        </h2>
        <div className="text-muted text-sm mb-3.5">
          {restaurant.area} · ⭐ {restaurant.rating}
        </div>
        <p className="text-sm italic text-muted mb-3.5 leading-relaxed">
          "{restaurant.vibe}"
        </p>

        {/* Known for */}
        <div className="bg-surface2 rounded-sm p-3.5 mb-2.5 text-left">
          <div className="text-[0.65rem] uppercase tracking-[1.5px] text-muted/60 mb-1.5">
            Known for
          </div>
          <div className="text-sm font-medium">{restaurant.knownFor}</div>
        </div>

        {/* Personality */}
        {personality && (
          <div className="bg-surface2 rounded-sm p-3.5 text-left">
            <div className="text-[0.65rem] uppercase tracking-[1.5px] text-muted/60 mb-1.5">
              Your eating personality
            </div>
            <div
              className="font-display text-[0.95rem] font-bold mb-1"
              style={{ color: moodObj?.color || '#FF6B35' }}
            >
              {personality.emoji} {personality.title}
            </div>
            <p className="text-xs text-muted leading-snug">{personality.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
