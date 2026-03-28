import { trackEvent } from '../lib/analytics';

const DISTANCE_OPTIONS = [3, 6, 10, 15, 25];
const DIETARY_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'halaal', label: 'Halaal' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
];

export default function PreferencesPanel({ prefs, onChange }) {
  return (
    <div className="rounded-[20px] border border-[#E8DED7] bg-[#FFFFFF] p-3 flex flex-col gap-3 shadow-[0_8px_18px_rgba(25,18,29,0.08)]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#7D768A]">Your Defaults</p>
        <p className="text-xs text-[#6C6677]">We use these to tune your daily picks.</p>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-[14px] bg-[#F3EEEA] px-3 py-2 border border-[#E8DED7]">
        <span className="text-xs text-[#2E2738] font-semibold">Open now only</span>
        <button
          onClick={() => {
            const next = !prefs.onlyOpenNow;
            trackEvent('prefs_open_now_toggle', { enabled: next });
            onChange({ onlyOpenNow: next });
          }}
          className={`w-12 h-7 rounded-full transition-colors ${
            prefs.onlyOpenNow ? 'bg-[#31B97A]' : 'bg-[#D7CEC8]'
          }`}
          aria-label="Toggle open now only"
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white transition-transform ${
              prefs.onlyOpenNow ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <p className="text-xs text-[#625B72] mb-1 font-semibold">Max distance</p>
        <div className="flex flex-wrap gap-1.5">
          {DISTANCE_OPTIONS.map((km) => (
            <button
              key={km}
              onClick={() => {
                trackEvent('prefs_max_distance_set', { km });
                onChange({ maxDistanceKm: km });
              }}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold border ${
                prefs.maxDistanceKm === km
                  ? 'bg-[#FF7A3E] border-[#FF7A3E] text-[#2A0D05]'
                  : 'bg-[#F4EFEB] border-[#E7DDD6] text-[#5F586F]'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#625B72] mb-1 font-semibold">Dietary mode</p>
        <div className="flex flex-wrap gap-1.5">
          {DIETARY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                trackEvent('prefs_dietary_set', { dietary: option.value });
                onChange({ dietary: option.value });
              }}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold border ${
                prefs.dietary === option.value
                  ? 'bg-[#FF7A3E] border-[#FF7A3E] text-[#2A0D05]'
                  : 'bg-[#F4EFEB] border-[#E7DDD6] text-[#5F586F]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
