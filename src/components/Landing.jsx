import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';
import LocationPrompt from './LocationPrompt';
import PreferencesPanel from './PreferencesPanel';
import SocialHub from './SocialHub';
import { trackEvent } from '../lib/analytics';
import FoodSprites from './ui/FoodSprites';
import {
  FoodCategoryIcons,
  IconHeart,
  IconHistory,
  IconMic,
  IconPin,
  IconSearch,
  IconSparkles,
} from './ui/AppIcons';

const QUICK_TAGS = [
  { key: 'burger', label: 'Burger', Icon: FoodCategoryIcons.burger },
  { key: 'pizza', label: 'Pizza', Icon: FoodCategoryIcons.pizza },
  { key: 'comfort', label: 'Comfort', Icon: FoodCategoryIcons.comfort },
  { key: 'healthy', label: 'Healthy', Icon: FoodCategoryIcons.healthy },
  { key: 'local', label: 'Local', Icon: FoodCategoryIcons.local },
];

export default function Landing({
  locationStatus,
  onRequestLocation,
  historyCount,
  favouritesCount,
  canInstall,
  onInstall,
  onSurpriseMe,
  onStartGroupMode,
  isPlacesReady,
  trendingPicks,
  onTrackMetric,
  dailyState,
  lastSelection,
  onRepeatLastSelection,
  prefs,
  onPrefsChange,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col p-4 pb-[max(20px,env(safe-area-inset-bottom))] gap-3">
      <div className="relative flex-1 rounded-[30px] border border-white/15 bg-[#F6F2EE] text-[#1F1B2E] p-4 animate-fadeUp shadow-[0_24px_60px_rgba(7,6,14,0.35)] overflow-hidden">
        <FoodSprites />
        <div className="flex items-center justify-between">
          <div className="relative z-[1]">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7D768A]">Current area</p>
            <p className="font-display text-lg font-bold">Cape Town</p>
          </div>
          <button
            onClick={() => {
              trackEvent('location_request', { source: 'landing' });
              onRequestLocation();
            }}
            className="relative z-[1] w-10 h-10 rounded-full bg-white border border-[#E6DED8] inline-flex items-center justify-center"
            aria-label="Refresh location"
          >
            <IconPin className="w-5 h-5 text-[#E7652D]" />
          </button>
        </div>

        <div className="relative z-[1] mt-3 rounded-pill bg-white border border-[#EEE4DE] px-4 py-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[#8C8598] text-sm">
            <IconSearch className="w-4 h-4" />
            Search Cape Town eats
          </span>
          <span className="w-8 h-8 rounded-full bg-[#FFEDE3] inline-flex items-center justify-center text-[#E7652D]">
            <IconMic className="w-4 h-4" />
          </span>
        </div>

        <div className="relative z-[1] mt-3 rounded-[24px] bg-gradient-to-br from-[#FF5722] via-[#FF4D13] to-[#FF7B3A] text-white p-4 overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/80">
            Tonight's mood fix
          </p>
          <span className="mt-1 inline-flex w-9 h-9 rounded-full bg-black/20 items-center justify-center">
            <IconSparkles className="w-5 h-5 text-white" />
          </span>
          <h1 className="font-display text-[28px] leading-[1.06] font-extrabold mt-1 max-w-[220px]">
            Hungry?
            <br />
            Get 3 local picks.
          </h1>
          <p className="text-xs text-white/85 mt-2 max-w-[240px]">
            Tap once, choose mood + budget, then lock your spot in under 10 seconds.
          </p>
          <button
            onClick={() => {
              trackEvent('cta_find_spot_click');
              navigate('/flow');
            }}
            className="mt-3 inline-flex items-center justify-center rounded-pill bg-black text-white px-5 py-2.5 font-semibold text-sm cta-glow"
          >
            Start My Food Mission
          </button>
        </div>

        <div className="relative z-[1] mt-3 rounded-[18px] border border-[#ECE1D9] bg-white/80 p-2.5 nudge-in">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#7D768A] mb-1">
            How it works
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <span className="shrink-0 px-2.5 py-1 rounded-pill bg-[#18161F] text-white text-[11px] font-semibold">
              1. Pick mood
            </span>
            <span className="shrink-0 px-2.5 py-1 rounded-pill bg-[#18161F] text-white text-[11px] font-semibold">
              2. Pick budget
            </span>
            <span className="shrink-0 px-2.5 py-1 rounded-pill bg-[#18161F] text-white text-[11px] font-semibold">
              3. Tap a result
            </span>
          </div>
        </div>

        <div className="relative z-[1] mt-3 flex gap-2 overflow-x-auto pb-1">
          {QUICK_TAGS.map(({ key, label, Icon }) => (
            <span
              key={key}
              className="shrink-0 px-3 py-2 rounded-[14px] bg-[#18161F] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>

        <div className="relative z-[1] mt-3">
          <LocationPrompt
            status={locationStatus}
            onRequest={() => {
              trackEvent('location_request', { source: 'landing' });
              onRequestLocation();
            }}
          />
        </div>

        <div className="relative z-[1] mt-3 rounded-[20px] border border-[#DDD4CC] bg-[#ECE7E2] p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7D768A]">Daily Mode</p>
              <p className="text-sm font-semibold text-[#2E2738]">
                {dailyState?.streak || 1}-day streak
              </p>
            </div>
            {lastSelection?.mood && lastSelection?.budget && (
              <button
                onClick={() => {
                  trackEvent('daily_repeat_cta_click', {
                    mood: lastSelection.mood,
                    budget: lastSelection.budget,
                  });
                  onRepeatLastSelection();
                }}
                className="inline-flex items-center justify-center rounded-pill bg-[#1F1B2E] text-white px-3 py-1.5 font-semibold text-xs"
              >
                Repeat Yesterday
              </button>
            )}
          </div>
          <p className="text-xs text-[#615A70] mt-1">
            Come back daily and we will tune picks around your habits and fresh spots.
          </p>
        </div>

        <div className="relative z-[1] mt-3">
          <PreferencesPanel prefs={prefs} onChange={onPrefsChange} />
        </div>

        <div className="relative z-[1] mt-3">
          <SocialHub
            trending={trendingPicks}
            onStartGroupMode={onStartGroupMode}
            onTrackMetric={onTrackMetric}
          />
        </div>

        <p className="relative z-[1] text-xs text-[#7D768A] mt-3">
          {isPlacesReady
            ? 'We use your location to surface live nearby restaurants.'
            : 'Enable server API keys and VITE_ENABLE_GOOGLE_PROXY / VITE_ENABLE_SERP_PROXY for live nearby results.'}
        </p>
      </div>

      <div className="animate-fadeUp [animation-delay:0.12s] grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            trackEvent('surprise_me_click', { source: 'landing' });
            onSurpriseMe();
          }}
          className="rounded-pill bg-white/15 backdrop-blur border border-white/20 text-white py-3.5 font-semibold inline-flex items-center justify-center gap-2"
        >
          <IconSparkles className="w-4 h-4" />
          Quick Surprise
        </button>
        <button
          onClick={() => {
            trackEvent('history_view_open');
            navigate('/history');
          }}
          className="rounded-pill bg-white/15 backdrop-blur border border-white/20 text-white py-3.5 font-semibold inline-flex items-center justify-center gap-2"
        >
          <IconHistory className="w-4 h-4" />
          History {historyCount > 0 && `(${historyCount})`}
        </button>
        <button
          onClick={() => {
            trackEvent('favourites_view_open');
            navigate('/favourites');
          }}
          className="rounded-pill bg-white/15 backdrop-blur border border-white/20 text-white py-3.5 font-semibold inline-flex items-center justify-center gap-2"
        >
          <IconHeart className="w-4 h-4" />
          Saved {favouritesCount > 0 && `(${favouritesCount})`}
        </button>
        <button
          onClick={() => {
            trackEvent('cta_find_spot_click');
            navigate('/flow');
          }}
          className="rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] py-3.5 font-display font-bold cta-glow"
        >
          Find My Next Meal
        </button>

        {canInstall && (
          <button
            onClick={() => {
              trackEvent('install_prompt_open');
              onInstall();
            }}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-white/25 rounded-pill bg-white/10 text-white font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
          >
            Add to Home Screen
          </button>
        )}

        <div className="col-span-2">
          <AdBanner size="banner" placement="landing" />
        </div>
      </div>
    </div>
  );
}
