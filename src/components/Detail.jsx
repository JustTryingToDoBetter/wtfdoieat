import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareCard from './ShareCard';
import AdBanner from './AdBanner';
import { trackEvent } from '../lib/analytics';
import { recordBehavior } from '../lib/behavior';
import { buildShareImageDataUrl, downloadShareImage } from '../lib/shareImage';
import { BUDGETS, MOODS } from '../constants/options';
import { estimateTravelMinutes, formatDistance, formatEta } from '../lib/distance';
import { markShared } from '../lib/metrics';
import { usePremium } from '../hooks/usePremium';
import {
  IconArrowLeft,
  IconDownload,
  IconExternalMap,
  IconHeart,
  IconHeartFilled,
  IconHistory,
  IconShuffle,
  IconSparkles,
  IconThumbDown,
  IconThumbUp,
} from './ui/AppIcons';

function buildShareText(restaurant, personality) {
  const lines = [
    `WTF Do I Eat says: ${restaurant.name} (${restaurant.area})`,
    `"${restaurant.vibe}"`,
    '',
  ];
  if (personality) {
    lines.push(`My eating personality: ${personality.emoji} ${personality.title}`);
    lines.push(personality.desc);
    lines.push('');
  }
  lines.push('wtfdoieat.app');
  return lines.join('\n');
}

export default function Detail({
  restaurant,
  personality,
  mood,
  budget,
  onReroll,
  onOpenDestination,
  isFav,
  onToggleFav,
}) {
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!restaurant) navigate('/');
  }, [restaurant, navigate]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  if (!restaurant) return null;

  const shareText = buildShareText(restaurant, personality);
  const moodLabel = MOODS.find((m) => m.value === mood)?.label || 'Mood';
  const budgetLabel = BUDGETS.find((b) => b.value === budget)?.label || budget;
  const distanceLabel = restaurant?._dist != null ? formatDistance(restaurant._dist) : null;
  const etaLabel =
    restaurant?._dist != null ? formatEta(estimateTravelMinutes(restaurant._dist)) : null;

  // ── Share handlers ──────────────────────────────────────────────────────────
  const handleNativeShare = () => {
    trackEvent('share_click', { method: 'native', restaurant: restaurant.name });
    recordBehavior('share', { mood, budget, restaurant });
    markShared({ method: 'native', restaurant: restaurant.name, mood, budget });
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => handleCopyFallback());
    } else {
      handleCopyFallback();
    }
  };

  const handleCopyFallback = () => {
    navigator.clipboard?.writeText(shareText);
    showToast('Copied to clipboard!');
  };

  const handleWhatsApp = () => {
    trackEvent('share_click', { method: 'whatsapp', restaurant: restaurant.name });
    recordBehavior('share', { mood, budget, restaurant });
    markShared({ method: 'whatsapp', restaurant: restaurant.name, mood, budget });
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = () => {
    const dataUrl = buildShareImageDataUrl({
      restaurant,
      personality,
      moodLabel,
      budgetLabel,
      distanceLabel,
    });
    const safeName = (restaurant?.name || 'wtfdoieat').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    downloadShareImage(`${safeName}-story-card.png`, dataUrl);
    trackEvent('share_image_download', { restaurant: restaurant.name });
    recordBehavior('share', { mood, budget, restaurant });
    markShared({ method: 'image_download', restaurant: restaurant.name, mood, budget });
    showToast('Story card downloaded');
  };

  const handleRecommendationFeedback = async (rating) => {
    trackEvent('recommendation_feedback', {
      rating,
      restaurant: restaurant.name,
      mood,
      budget,
    });
    recordBehavior('feedback', { mood, budget, restaurant, rating });

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          restaurantName: restaurant.name,
          restaurantArea: restaurant.area,
          mood,
          budget,
        }),
      });

      if (res.ok) {
        showToast(rating === 'up' ? 'Thanks for the thumbs up!' : 'Feedback saved');
      } else if (res.status === 401) {
        showToast('Sign in to save feedback');
      } else {
        showToast('Could not save feedback');
      }
    } catch {
      showToast('Could not save feedback');
    }
  };

  // ── Favourite ───────────────────────────────────────────────────────────────
  const handleFavToggle = () => {
    const isNowFav = onToggleFav(restaurant);
    trackEvent('favourite_toggle', {
      name: restaurant.name,
      action: isNowFav ? 'add' : 'remove',
      source: 'detail',
    });
    if (isNowFav) {
      recordBehavior('favourite', { mood, budget, restaurant });
    }
    showToast(isNowFav ? 'Saved to favourites' : 'Removed from favourites');
  };

  const searchQuery = encodeURIComponent(`${restaurant.name} ${restaurant.area} Cape Town`);
  const mapsUrl = restaurant.placeId
    ? `https://www.google.com/maps/search/?api=1&query=${searchQuery}&query_place_id=${restaurant.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  const callSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${restaurant.name} ${restaurant.area} phone number`)}`;
  const deliveryUrl = `https://www.ubereats.com/za/search?q=${encodeURIComponent(restaurant.name)}`;
  const parkingUrl = `https://www.google.com/maps/search/parking+near+${encodeURIComponent(`${restaurant.name} ${restaurant.area}`)}`;

  const hour = new Date().getHours();
  const queueHint =
    hour >= 12 && hour <= 14
      ? 'Likely busy lunch window'
      : hour >= 18 && hour <= 20
        ? 'Likely busy dinner window'
        : 'Usually quieter right now';

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center p-4 pb-[max(20px,env(safe-area-inset-bottom))] gap-3 animate-fadeUp">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-green text-[#0C0C0F] py-3 px-6 rounded-pill font-semibold text-sm z-50 pointer-events-none animate-fadeUp whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Back nav + favourite button in the same row */}
      <div className="self-stretch flex items-center justify-between">
        <button
          onClick={() => navigate('/results')}
          className="inline-flex items-center gap-1.5 py-2 px-2.5 rounded-pill bg-white/10 border border-white/20 text-white font-body text-sm cursor-pointer select-none"
        >
          <IconArrowLeft className="w-4 h-4" />
          back to picks
        </button>
        <button
          onClick={handleFavToggle}
          aria-label={isFav ? 'Remove from favourites' : 'Save to favourites'}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#FFAF87] transition-transform active:scale-90 select-none"
        >
          {isFav ? <IconHeartFilled className="w-5 h-5" /> : <IconHeart className="w-5 h-5" />}
        </button>
      </div>

      {/* Shareable result card */}
      <ShareCard restaurant={restaurant} personality={personality} mood={mood} budget={budget} />

      <div className="w-full max-w-[380px] rounded-[18px] border border-white/15 bg-white/10 px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="text-xs text-white/85">
          <p className="font-semibold">{isPremium ? 'Premium Active' : 'Premium Locked'}</p>
          <p className="text-white/65 mt-0.5">
            {isPremium
              ? 'Smart reroll keeps your picks fresh.'
              : 'Upgrade for ad-free mode and smart reroll.'}
          </p>
        </div>
        <button
          onClick={() => {
            if (isPremium) {
              trackEvent('premium_smart_reroll', { screen: 'detail' });
              onReroll();
              return;
            }
            trackEvent('premium_lock_click', { screen: 'detail' });
            navigate('/premium');
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white"
        >
          <IconSparkles className="w-3.5 h-3.5" />
          {isPremium ? 'Smart Reroll' : 'Unlock'}
        </button>
      </div>

      {/* Primary actions */}
      <div className="flex gap-2.5 w-full max-w-[380px]">
        <button
          onClick={handleNativeShare}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] font-display text-base font-bold cursor-pointer select-none active:scale-[0.96] transition-transform"
        >
          <IconSparkles className="w-4 h-4" />
          Share
        </button>
        {/* WhatsApp — massive in SA, deserves its own button */}
        <button
          onClick={handleWhatsApp}
          aria-label="Share on WhatsApp"
          className="flex items-center justify-center gap-1.5 py-4 px-5 rounded-pill border border-white/20 bg-white/10 text-white font-body text-sm font-semibold cursor-pointer select-none active:scale-[0.96] transition-transform"
        >
          <WhatsAppIcon />
        </button>
        <button
          onClick={() => {
            trackEvent('reroll_click', { screen: 'detail' });
            onReroll();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          <IconShuffle className="w-4 h-4" />
          Reroll
        </button>
      </div>

      <button
        onClick={handleDownloadImage}
        className="inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        <IconDownload className="w-4 h-4" />
        Download Story Card
      </button>

      <div className="flex items-center gap-2 w-full max-w-[380px]">
        <button
          onClick={() => handleRecommendationFeedback('up')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm font-semibold cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          <IconThumbUp className="w-4 h-4" />
          Good Rec
        </button>
        <button
          onClick={() => handleRecommendationFeedback('down')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm font-semibold cursor-pointer select-none active:scale-[0.98] transition-transform"
        >
          <IconThumbDown className="w-4 h-4" />
          Not For Me
        </button>
      </div>

      <div className="w-full max-w-[380px] rounded-[18px] border border-white/15 bg-white/10 p-3 grid grid-cols-2 gap-2 text-xs">
        <a
          href={callSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[12px] border border-white/20 bg-black/20 text-white px-3 py-2 text-center font-semibold"
        >
          Call Venue
        </a>
        <a
          href={deliveryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[12px] border border-white/20 bg-black/20 text-white px-3 py-2 text-center font-semibold"
        >
          Delivery
        </a>
        <a
          href={parkingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[12px] border border-white/20 bg-black/20 text-white px-3 py-2 text-center font-semibold"
        >
          Parking Tips
        </a>
        <div className="rounded-[12px] border border-white/20 bg-black/20 text-white px-3 py-2 text-center">
          <p className="font-semibold">Queue Hint</p>
          <p className="text-[11px] text-white/80 mt-0.5">{queueHint}</p>
        </div>
      </div>

      {(distanceLabel || etaLabel) && (
        <div className="w-full max-w-[380px] rounded-[14px] border border-white/20 bg-black/25 px-3 py-2 text-xs text-white/85 flex items-center justify-between">
          <span>{distanceLabel ? `Distance: ${distanceLabel}` : 'Distance unavailable'}</span>
          <span>{etaLabel ? `Trip: ${etaLabel}` : 'Trip ETA unavailable'}</span>
        </div>
      )}

      {/* Google Maps link */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackEvent('maps_open_click', { restaurant: restaurant.name });
          recordBehavior('maps', { mood, budget, restaurant });
          onOpenDestination?.(restaurant);
        }}
        className="inline-flex items-center gap-1.5 text-[#7FF3B5] text-sm font-semibold"
      >
        <IconExternalMap className="w-4 h-4" />
        Open in Google Maps
      </a>

      <AdBanner size="large" placement="detail" />

      <button
        onClick={() => {
          trackEvent('start_over_click', { screen: 'detail' });
          navigate('/');
        }}
        className="inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-white/20 rounded-pill bg-white/10 text-white/85 font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        <IconHistory className="w-4 h-4" />
        Start Over
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
      style={{ color: '#25D366' }}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
