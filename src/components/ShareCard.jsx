import { MOODS, BUDGETS } from '../constants/options';
import { formatDistance } from '../lib/distance';
import { BudgetIcons, IconPin, MoodIcons } from './ui/AppIcons';

export default function ShareCard({ restaurant, personality, mood, budget }) {
  const moodObj = MOODS.find((m) => m.value === mood);
  const budgetObj = BUDGETS.find((b) => b.value === budget);
  const MoodIcon = mood ? MoodIcons[mood] : null;
  const BudgetIcon = budget ? BudgetIcons[budget] : null;

  return (
    <div className="bg-[#F6F2EE] border border-white/20 rounded-[28px] p-6 w-full max-w-[380px] relative overflow-hidden animate-popIn text-[#1F1B2E] shadow-[0_18px_36px_rgba(0,0,0,0.28)]">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#FF7A3E] via-[#FF9D50] to-[#FFD06B]" />

      <div className="text-center">
        <div className="text-[0.6rem] uppercase tracking-[3px] text-[#7D768A] mb-3.5">
          WTF DO I EAT
        </div>

        {/* Tags */}
        <div className="flex justify-center gap-1.5 mb-3.5 flex-wrap">
          {moodObj && (
            <span
              className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap inline-flex items-center gap-1"
              style={{ background: `${moodObj.color}15`, color: moodObj.color }}
            >
              {MoodIcon ? <MoodIcon className="w-3.5 h-3.5" /> : null}
              {moodObj.label}
            </span>
          )}
          {budgetObj && (
            <span className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-[#ECE4DE] text-[#7D768A] inline-flex items-center gap-1">
              {BudgetIcon ? <BudgetIcon className="w-3.5 h-3.5" /> : null}
              {budgetObj.label}
            </span>
          )}
          {restaurant._dist != null && (
            <span className="text-[0.68rem] px-2.5 py-[3px] rounded-[20px] font-semibold whitespace-nowrap bg-[#E2F4EA] text-[#1E8D5B] inline-flex items-center gap-1">
              <IconPin className="w-3.5 h-3.5" />
              {formatDistance(restaurant._dist)}
            </span>
          )}
        </div>

        <h2 className="font-display text-[clamp(1.4rem,5.5vw,1.8rem)] leading-tight font-bold mb-0.5">
          {restaurant.name}
        </h2>
        <div className="text-[#7D768A] text-sm mb-3.5">
          {restaurant.area} · ⭐ {restaurant.rating}
        </div>
        <p className="text-sm italic text-[#7D768A] mb-3.5 leading-relaxed">"{restaurant.vibe}"</p>

        {/* Known for */}
        <div className="bg-white rounded-[14px] p-3.5 mb-2.5 text-left border border-[#EFE5DE]">
          <div className="text-[0.65rem] uppercase tracking-[1.5px] text-[#7D768A] mb-1.5">
            Known for
          </div>
          <div className="text-sm font-medium">{restaurant.knownFor}</div>
        </div>

        {/* Personality */}
        {personality && (
          <div className="bg-white rounded-[14px] p-3.5 text-left border border-[#EFE5DE]">
            <div className="text-[0.65rem] uppercase tracking-[1.5px] text-[#7D768A] mb-1.5">
              Your eating personality
            </div>
            <div
              className="font-display text-[0.95rem] font-bold mb-1"
              style={{ color: moodObj?.color || '#FF6B35' }}
            >
              {MoodIcon ? <MoodIcon className="w-4 h-4 inline-block mr-1 align-[-2px]" /> : null}
              {personality.title}
            </div>
            <p className="text-xs text-[#6E677E] leading-snug">{personality.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
