import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOODS, BUDGETS } from '../data/restaurants';
import { trackEvent } from '../lib/analytics';

export default function Flow({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [budget, setBudget] = useState(null);

  const handleNext = () => {
    if (step === 0 && mood) {
      trackEvent('flow_step_advance', { step: 'mood_to_budget', mood });
      setStep(1);
    } else if (step === 1 && budget) {
      trackEvent('flow_submit', { mood, budget });
      onComplete(mood, budget);
      navigate('/results');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(0);
    } else {
      navigate('/');
    }
  };

  const canProceed = step === 0 ? !!mood : !!budget;

  return (
    <div className="min-h-dvh flex flex-col p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
      {/* Progress bar */}
      <div className="flex gap-1 mb-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`flex-1 h-[3px] rounded-[3px] transition-all duration-300 ${
              i <= step ? 'bg-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <button
        onClick={handleBack}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 border-none rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none mb-3"
      >
        ← back
      </button>

      <div className="flex-1 flex flex-col animate-fadeUp" key={step}>
        {step === 0 && (
          <>
            <h2 className="font-display text-[clamp(1.4rem,5.5vw,1.8rem)] leading-tight font-bold mb-1">
              What's the vibe?
            </h2>
            <p className="text-muted text-sm mb-5">Pick your mood right now</p>
            <div className="grid grid-cols-2 gap-2.5">
              {MOODS.map((m) => (
                <div
                  key={m.value}
                  onClick={() => {
                    setMood(m.value);
                    trackEvent('mood_selected', { mood: m.value });
                  }}
                  className="flex flex-col items-center gap-1.5 py-[18px] px-2.5 rounded-card cursor-pointer border-2 bg-[#111118] transition-all select-none active:scale-[0.96]"
                  style={{
                    borderColor: mood === m.value ? m.color : '#1E1E28',
                    background: mood === m.value ? `${m.color}12` : '#111118',
                  }}
                >
                  <span className="text-[1.6rem] leading-none">{m.emoji}</span>
                  <span className="text-xs font-semibold">{m.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display text-[clamp(1.4rem,5.5vw,1.8rem)] leading-tight font-bold mb-1">
              What's the budget?
            </h2>
            <p className="text-muted text-sm mb-5">Per person — all good, no judgment</p>
            <div className="flex flex-col gap-2">
              {BUDGETS.map((b) => (
                <div
                  key={b.value}
                  onClick={() => {
                    setBudget(b.value);
                    trackEvent('budget_selected', { budget: b.value });
                  }}
                  className="flex items-center gap-3.5 py-3.5 px-[18px] rounded-card cursor-pointer border-2 bg-[#111118] transition-all select-none active:scale-[0.98]"
                  style={{
                    borderColor: budget === b.value ? '#FF6B35' : '#1E1E28',
                    background: budget === b.value ? 'rgba(255,107,53,0.06)' : '#111118',
                  }}
                >
                  <span className="text-[1.4rem]">{b.emoji}</span>
                  <div className="text-left">
                    <div className="font-semibold text-[0.9rem]">{b.label}</div>
                    <div className="text-xs text-muted">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pt-4 flex justify-center">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center justify-center gap-2 py-4 px-8 border-none rounded-pill bg-gradient-to-br from-accent to-[#FF8F5E] text-[#0C0C0F] font-display text-base font-bold cursor-pointer w-full max-w-[320px] select-none active:scale-[0.96] transition-transform disabled:opacity-30 disabled:pointer-events-none"
        >
          {step === 1 ? 'Find My Spot 🎯' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
