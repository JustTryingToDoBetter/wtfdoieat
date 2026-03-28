import { useNavigate } from 'react-router-dom';
import { BUDGETS } from '../constants/options';
import { trackEvent } from '../lib/analytics';

export default function Favourites({ favourites, onToggleFav }) {
  const navigate = useNavigate();

  const handleRemove = (restaurant) => {
    trackEvent('favourite_toggle', {
      name: restaurant.name,
      action: 'remove',
      source: 'favourites',
    });
    onToggleFav(restaurant);
  };

  return (
    <div className="min-h-dvh flex flex-col p-5 pb-[max(20px,env(safe-area-inset-bottom))] gap-4 animate-fadeUp">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">❤️ Saved Spots</h2>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-transparent text-muted cursor-pointer select-none text-base"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Empty state */}
      {favourites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-16 rounded-card border border-border bg-surface/70">
          <div className="text-5xl">🤍</div>
          <p className="font-display text-base font-bold">Nothing saved yet</p>
          <p className="text-muted text-sm max-w-[240px]">
            Tap the heart on any restaurant to save it here for later.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 flex items-center justify-center gap-2 py-3.5 px-7 rounded-pill bg-gradient-to-br from-accent to-[#FF8F5E] text-[#0C0C0F] font-display text-sm font-bold cursor-pointer select-none active:scale-[0.96] transition-transform"
          >
            Find a spot 🎯
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted">
            {favourites.length} saved spot{favourites.length !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-col gap-3">
            {favourites.map((r) => {
              const budgetLabel = BUDGETS.find((b) => b.value === r.price)?.label ?? r.price;
              const searchQuery = encodeURIComponent(`${r.name} ${r.area} Cape Town`);
              const mapsUrl = r.placeId
                ? `https://www.google.com/maps/search/?api=1&query=${searchQuery}&query_place_id=${r.placeId}`
                : `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

              return (
                <div
                  key={r.favId || `${r.name}-${r.area}`}
                  className="bg-surface border border-border rounded-card p-4 animate-fadeUp shadow-[0_10px_26px_rgba(0,0,0,0.2)]"
                >
                  {/* Row: name/meta + remove button */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[0.98rem] mb-0.5 truncate">{r.name}</div>
                      <div className="text-xs text-muted">
                        {r.area} · ⭐ {r.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-accent/10 text-accent">
                        {budgetLabel}
                      </span>
                      <button
                        onClick={() => handleRemove(r)}
                        aria-label="Remove from favourites"
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-90 select-none text-lg"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>

                  <p className="text-[0.82rem] text-muted italic mb-1.5">"{r.vibe}"</p>
                  <p className="text-xs mb-3">
                    <span className="text-green font-semibold">Known for:</span> {r.knownFor}
                  </p>

                  {/* Maps deep link */}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent('maps_open_click', { restaurant: r.name, source: 'favourites' })
                    }
                    className="inline-flex items-center gap-1 text-green text-xs font-semibold"
                  >
                    📍 Open in Maps →
                  </a>
                </div>
              );
            })}
          </div>

          {/* Clear all — destructive, visually subtle */}
          <button
            onClick={() => {
              trackEvent('favourites_clear_all');
              favourites.forEach((r) => onToggleFav(r));
            }}
            className="self-center inline-flex items-center gap-1.5 py-2.5 px-5 border border-border rounded-pill bg-transparent text-muted font-body text-xs cursor-pointer select-none mt-2"
          >
            Clear all saved spots
          </button>
        </>
      )}
    </div>
  );
}
