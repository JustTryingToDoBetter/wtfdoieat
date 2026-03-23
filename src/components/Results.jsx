import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOODS, BUDGETS } from '../data/restaurants';
import { formatDistance } from '../lib/distance';
import { trackEvent } from '../lib/analytics';
import AdBanner from './AdBanner';

export default function Results({ results, personality, mood, onPick, onReroll }) {
  const navigate = useNavigate();
  const moodObj = MOODS.find((m) => m.value === mood);

  useEffect(() => {
    if (!results.length) {
      navigate('/flow');
    }
  }, [results.length, navigate]);

  if (!results.length) return null;

  return (
    <div className="min-h-dvh flex flex-col p-5 pb-[max(20px,env(safe-area-inset-bottom))] gap-3.5 animate-fadeUp">
      <button
        onClick={() => navigate('/flow')}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 border-none rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none"
      >
        ← back
      </button>

      {/* Personality card */}
      {personality && (
        <div
          className="animate-popIn border border-border rounded-card p-[18px] text-center"
          style={{ background: `${moodObj?.color || '#FF6B35'}08` }}
        >
          <div className="text-3xl mb-0.5">{personality.emoji}</div>
          <div
            className="font-display text-base font-bold mb-1"
            style={{ color: moodObj?.color || '#FF6B35' }}
          >
            {personality.title}
          </div>
          <p className="text-xs text-muted leading-relaxed">{personality.desc}</p>
        </div>
      )}

      <p className="font-display text-sm text-muted/60">3 spots for you 👇</p>

      {/* Restaurant cards */}
      {results.map((r, i) => (
        <div
          key={r.name}
          onClick={() => onPick(r)}
          className="bg-surface border border-border rounded-card p-4 cursor-pointer transition-all select-none active:scale-[0.98] active:border-accent animate-fadeUp"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[0.98rem] mb-0.5">{r.name}</div>
              <div className="text-xs text-muted">
                {r.area} · ⭐ {r.rating}
                {r._dist != null && <span> · {formatDistance(r._dist)}</span>}
              </div>
            </div>
            <span className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-accent/10 text-accent shrink-0">
              {BUDGETS.find((b) => b.value === r.price)?.label || r.price}
            </span>
          </div>
          <p className="text-[0.82rem] text-muted italic mb-1">"{r.vibe}"</p>
          <p className="text-xs">
            <span className="text-green font-semibold">Known for:</span> {r.knownFor}
          </p>
        </div>
      ))}

      <AdBanner />

      <div className="flex gap-2.5">
        <button
          onClick={() => {
            trackEvent('reroll_click', { screen: 'results' });
            onReroll();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          🎲 Reroll
        </button>
        <button
          onClick={() => {
            trackEvent('start_over_click', { screen: 'results' });
            navigate('/');
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          ↩ Start Over
        </button>
      </div>
    </div>
  );
}
