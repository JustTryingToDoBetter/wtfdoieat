import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUDGETS, MOODS } from '../constants/options';
import { estimateTravelMinutes, formatDistance, formatEta } from '../lib/distance';
import { trackEvent } from '../lib/analytics';
import { recordBehavior } from '../lib/behavior';
import { usePremium } from '../hooks/usePremium';
import AdBanner from './AdBanner';
import FoodSprites from './ui/FoodSprites';
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconHistory,
  IconSparkles,
  IconShuffle,
  MoodIcons,
} from './ui/AppIcons';
import type { LiveState, MoodValue, Personality, Restaurant } from '../types/domain';

interface ResultsProps {
  results: Restaurant[];
  personality: Personality | null;
  mood: MoodValue | null;
  onPick: (restaurant: Restaurant) => void;
  onReroll: () => void;
  isFav: (restaurant: Restaurant) => boolean;
  onToggleFav: (restaurant: Restaurant) => boolean;
  liveState: LiveState;
}

export default function Results({
  results,
  personality,
  mood,
  onPick,
  onReroll,
  isFav,
  onToggleFav,
  liveState,
}: ResultsProps) {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const moodObj = MOODS.find((m) => m.value === mood);
  const [favToast, setFavToast] = useState('');

  useEffect(() => {
    if (!results.length) navigate('/flow');
  }, [results.length, navigate]);

  const handleFavToggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>, restaurant: Restaurant) => {
      e.stopPropagation();
      const isNowFav = onToggleFav(restaurant);
      trackEvent('favourite_toggle', {
        name: restaurant.name,
        action: isNowFav ? 'add' : 'remove',
        source: 'results',
      });
      if (isNowFav) {
        recordBehavior('favourite', { restaurant });
      }
      setFavToast(isNowFav ? 'Saved ❤️' : 'Removed');
      setTimeout(() => setFavToast(''), 1800);
    },
    [onToggleFav]
  );

  if (!results.length) return null;

  return (
    <div className="min-h-dvh flex flex-col p-4 pb-[max(20px,env(safe-area-inset-bottom))] gap-3 animate-fadeUp">
      {favToast && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-surface2 border border-border text-text py-3 px-6 rounded-pill font-semibold text-sm z-50 pointer-events-none animate-fadeUp">
          {favToast}
        </div>
      )}

      <button
        onClick={() => navigate('/flow')}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 rounded-pill bg-white/10 border border-white/20 text-white font-body text-sm cursor-pointer select-none"
      >
        <IconArrowLeft className="w-4 h-4" />
        back
      </button>

      <div className="rounded-[24px] border border-white/20 bg-[#F6F2EE] px-3.5 py-3 text-[#1F1B2E]">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-[#7D768A]">Top picks near you</span>
          <span
            className={`font-semibold ${
              liveState?.status === 'loading'
                ? 'text-[#E56B2F]'
                : liveState?.status === 'ready'
                  ? 'text-[#1E8D5B]'
                  : 'text-[#7D768A]'
            }`}
          >
            {liveState?.status === 'loading' && 'Refreshing live spots...'}
            {liveState?.status === 'ready' && `Live Places: ${liveState.count}`}
            {(!liveState || liveState.status === 'idle') && 'Static local list'}
            {liveState?.status === 'error' && 'Live sync failed'}
          </span>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/15 bg-white/10 px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="text-xs text-white/85">
          <p className="font-semibold">{isPremium ? 'Premium Active' : 'Premium Locked'}</p>
          <p className="text-white/65 mt-0.5">
            {isPremium
              ? 'Smart rerolls stay diverse and avoid repeats.'
              : 'Unlock ad-free mode and smarter rerolls.'}
          </p>
        </div>
        <button
          onClick={() => {
            if (isPremium) {
              trackEvent('premium_smart_reroll', { screen: 'results' });
              onReroll();
              return;
            }
            trackEvent('premium_lock_click', { screen: 'results' });
            navigate('/premium');
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white"
        >
          <IconSparkles className="w-3.5 h-3.5" />
          {isPremium ? 'Smart Reroll' : 'Unlock'}
        </button>
      </div>

      {personality && (
        <div
          className="animate-popIn border border-white/20 rounded-[24px] p-4 text-center bg-white/10 backdrop-blur"
          style={{ background: `${moodObj?.color || '#FF6B35'}20` }}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/15 mb-1 text-white">
            {mood && MoodIcons[mood] ? (
              (() => {
                const MoodIcon = MoodIcons[mood];
                return <MoodIcon className="w-6 h-6" />;
              })()
            ) : (
              <span className="text-3xl leading-none">{personality.emoji}</span>
            )}
          </div>
          <div className="font-display text-base font-bold mb-1" style={{ color: '#FFF6F1' }}>
            {personality.title}
          </div>
          <p className="text-xs text-white/80 leading-relaxed">{personality.desc}</p>
        </div>
      )}

      <div className="rounded-[16px] border border-[#FFD7A8]/30 bg-[#FFAA3C]/15 px-3 py-2.5 nudge-in">
        <p className="text-xs text-[#FFF5E6] font-semibold">
          Your move: tap any card to open full actions (maps, share, delivery, call).
        </p>
      </div>

      <p className="font-display text-sm text-white/85 px-1">Your top picks</p>

      {results.map((r, i) => (
        <div
          key={r.name}
          onClick={() => onPick(r)}
          className="bg-[#F6F2EE] border border-white/20 rounded-[24px] p-3 cursor-pointer transition-all select-none active:scale-[0.98] active:border-[#FF7A3E] animate-fadeUp shadow-[0_14px_36px_rgba(0,0,0,0.28)]"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className="rounded-[18px] bg-gradient-to-br from-[#2A201F] to-[#120D0F] h-36 mb-3 relative overflow-hidden">
            <FoodSprites />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,_rgba(255,121,62,0.3),_transparent_50%)]" />
            <div className="absolute bottom-2 left-2 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-pill bg-black/45">
              {r._dist != null ? formatDistance(r._dist) : 'Cape Town'}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              {r._fromApi && (
                <span className="text-[0.62rem] px-2 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-[#31B97A]/20 text-[#31B97A]">
                  LIVE
                </span>
              )}
              <button
                onClick={(e) => handleFavToggle(e, r)}
                aria-label={isFav(r) ? 'Remove from favourites' : 'Save to favourites'}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/85 text-[#DE5F20] transition-transform active:scale-90 select-none"
              >
                {isFav(r) ? (
                  <IconHeartFilled className="w-4.5 h-4.5" />
                ) : (
                  <IconHeart className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-start gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[1.06rem] text-[#1F1B2E] mb-0.5">{r.name}</div>
              <div className="text-xs text-[#7D768A]">
                {r.area} · ⭐ {r.rating}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`text-[0.66rem] px-2 py-[3px] rounded-[20px] font-semibold ${
                    r._openStatus === 'open'
                      ? 'bg-[#DDF5E8] text-[#1E8D5B]'
                      : r._openStatus === 'closed'
                        ? 'bg-[#F8E1DE] text-[#B64731]'
                        : 'bg-[#ECE4DE] text-[#7D768A]'
                  }`}
                >
                  {r._hoursText ||
                    (r._openStatus === 'unknown' ? 'Hours unknown' : 'Status unknown')}
                </span>
                {r._dist != null && (
                  <span className="text-[0.66rem] px-2 py-[3px] rounded-[20px] font-semibold bg-[#EFE8FF] text-[#5C4BA8]">
                    {formatEta(estimateTravelMinutes(r._dist))}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[0.68rem] px-2.5 py-[5px] rounded-[20px] font-semibold whitespace-nowrap bg-[#FFE8D8] text-[#DE5F20]">
                {BUDGETS.find((b) => b.value === r.price)?.label || r.price}
              </span>
            </div>
          </div>

          <p className="text-[0.82rem] text-[#7D768A] italic mb-1">"{r.vibe}"</p>
          <p className="text-xs text-[#363141]">
            <span className="text-[#1E8D5B] font-semibold">Known for:</span> {r.knownFor}
          </p>
        </div>
      ))}

      <AdBanner placement="results" />

      <div className="flex gap-2.5">
        <button
          onClick={() => {
            trackEvent('reroll_click', { screen: 'results' });
            onReroll();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          <IconShuffle className="w-4 h-4" />
          Give Me New Picks
        </button>
        <button
          onClick={() => {
            trackEvent('start_over_click', { screen: 'results' });
            navigate('/');
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          <IconHistory className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
}
