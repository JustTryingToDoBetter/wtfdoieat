import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';
import LocationPrompt from './LocationPrompt';
import { trackEvent } from '../lib/analytics';

export default function Landing({ locationStatus, onRequestLocation, historyCount, canInstall, onInstall }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-1.5">
        <div className="animate-fadeUp">
          <div className="text-6xl animate-float mb-1">🍽️</div>
          <h1 className="font-display text-[clamp(2.2rem,9vw,3rem)] leading-[1.05] font-extrabold">
            WTF Do<br />I Eat<span className="text-accent">.</span>
          </h1>
          <p className="text-muted text-base max-w-[280px] mx-auto mt-3">
            Real Cape Town spots.<br />Picked for your mood. Under 10 seconds.
          </p>
        </div>

        {/* Social proof tags */}
        <div className="animate-fadeUp [animation-delay:0.1s] flex gap-1.5 mt-5 flex-wrap justify-center">
          {['50+ spots', 'Gatsby to fine dining', 'Near you first'].map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1.5 rounded-[20px] bg-accent/[0.08] text-accent"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Location */}
        <div className="animate-fadeUp [animation-delay:0.2s] mt-6 w-full max-w-[320px]">
          <LocationPrompt
            status={locationStatus}
            onRequest={() => {
              trackEvent('location_request', { source: 'landing' });
              onRequestLocation();
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fadeUp [animation-delay:0.25s] flex flex-col items-center gap-3 pb-2">
        <button
          onClick={() => {
            trackEvent('cta_find_spot_click');
            navigate('/flow');
          }}
          className="flex items-center justify-center gap-2 py-4 px-8 border-none rounded-pill bg-gradient-to-br from-accent to-[#FF8F5E] text-[#0C0C0F] font-display text-base font-bold cursor-pointer w-full max-w-[320px] select-none active:scale-[0.96] transition-transform animate-glow"
        >
          Find My Spot 🎯
        </button>
        <button
          onClick={() => {
            trackEvent('history_view_open');
            navigate('/history');
          }}
          className="inline-flex items-center justify-center gap-1.5 py-3 px-6 border-none rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none"
        >
          📜 Past Picks {historyCount > 0 && `(${historyCount})`}
        </button>
        {canInstall && (
          <button
            onClick={() => {
              trackEvent('install_prompt_open');
              onInstall();
            }}
            className="inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-border rounded-pill bg-transparent text-text font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
          >
            ⬇️ Add to Home Screen
          </button>
        )}
        <AdBanner size="banner" />
      </div>
    </div>
  );
}
