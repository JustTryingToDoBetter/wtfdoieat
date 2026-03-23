import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareCard from './ShareCard';
import AdBanner from './AdBanner';
import { trackEvent } from '../lib/analytics';

export default function Detail({ restaurant, personality, mood, budget, onReroll }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!restaurant) {
      navigate('/');
    }
  }, [restaurant, navigate]);

  if (!restaurant) return null;

  const handleShare = () => {
    trackEvent('share_click', { restaurant: restaurant.name, area: restaurant.area });
    const txt = `🍽️ WTF Do I Eat says: ${restaurant.name} (${restaurant.area})\n"${restaurant.vibe}"\n\n${
      personality ? `My eating personality: ${personality.emoji} ${personality.title}\n${personality.desc}` : ''
    }\n\nwtfdoieat.app`;

    if (navigator.share) {
      navigator.share({ text: txt }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
    }
    setToast('Copied!');
    setTimeout(() => setToast(''), 2000);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    restaurant.name + ' Cape Town'
  )}&query_place_id=${restaurant.placeId}`;

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center p-5 pb-[max(20px,env(safe-area-inset-bottom))] gap-4 animate-fadeUp">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-green text-[#0C0C0F] py-3 px-6 rounded-pill font-semibold text-sm z-50 pointer-events-none animate-fadeUp">
          {toast}
        </div>
      )}

      <button
        onClick={() => navigate('/results')}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 border-none rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none"
      >
        ← other options
      </button>

      <ShareCard
        restaurant={restaurant}
        personality={personality}
        mood={mood}
        budget={budget}
      />

      <div className="flex gap-2.5 w-full max-w-[380px]">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-8 border-none rounded-pill bg-gradient-to-br from-accent to-[#FF8F5E] text-[#0C0C0F] font-display text-base font-bold cursor-pointer select-none active:scale-[0.96] transition-transform"
        >
          📤 Share
        </button>
        <button
          onClick={() => {
            trackEvent('reroll_click', { screen: 'detail' });
            onReroll();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          🎲 Reroll
        </button>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('maps_open_click', { restaurant: restaurant.name })}
        className="inline-flex items-center gap-1.5 text-green text-sm font-semibold no-underline"
      >
        📍 Open in Google Maps →
      </a>

      <AdBanner size="large" />

      <button
        onClick={() => {
          trackEvent('start_over_click', { screen: 'detail' });
          navigate('/');
        }}
        className="inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        ↩ Start Over
      </button>
    </div>
  );
}
