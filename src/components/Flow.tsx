import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUDGETS, MOODS } from '../constants/options';
import { trackEvent } from '../lib/analytics';
import { trackMetricEvent } from '../lib/metrics';
import FoodSprites from './ui/FoodSprites';
import { BudgetIcons, IconArrowLeft, IconSparkles, MoodIcons } from './ui/AppIcons';
import type { BudgetValue, MoodValue } from '../types/domain';

interface FlowProps {
  onComplete: (mood: MoodValue, budget: BudgetValue) => void;
}

export default function Flow({ onComplete }: FlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [budget, setBudget] = useState<BudgetValue | null>(null);
  const submittedRef = useRef(false);
  const stepRef = useRef(0);
  const moodRef = useRef<MoodValue | null>(null);
  const budgetRef = useRef<BudgetValue | null>(null);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    budgetRef.current = budget;
  }, [budget]);

  useEffect(() => {
    void trackMetricEvent('flow_started', { source: 'flow_screen' });
  }, []);

  useEffect(() => {
    return () => {
      if (!submittedRef.current) {
        trackEvent('flow_dropoff', {
          step: stepRef.current === 0 ? 'mood' : 'budget',
          mood: moodRef.current,
          budget: budgetRef.current,
        });
      }
    };
  }, []);

  const handleNext = () => {
    if (step === 0 && mood) {
      trackEvent('flow_step_advance', { step: 'mood_to_budget', mood });
      setStep(1);
    } else if (step === 1 && budget && mood) {
      trackEvent('flow_submit', { mood, budget });
      submittedRef.current = true;
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
    <div className="min-h-dvh flex flex-col p-4 pb-[max(20px,env(safe-area-inset-bottom))]">
      <div className="flex gap-1 mb-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`flex-1 h-[3px] rounded-[3px] transition-all duration-300 ${
              i <= step ? 'bg-[#FF7A3E]' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <button
        onClick={handleBack}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 rounded-pill bg-white/10 border border-white/20 text-white font-body text-sm cursor-pointer select-none mb-3"
      >
        <IconArrowLeft className="w-4 h-4" />
        back
      </button>

      <div
        className="relative flex-1 flex flex-col animate-fadeUp rounded-[30px] border border-white/15 bg-[#F6F2EE] text-[#1F1B2E] p-4 shadow-[0_24px_60px_rgba(7,6,14,0.35)] overflow-hidden"
        key={step}
      >
        <FoodSprites />
        <div className="relative z-[1] inline-flex self-start px-2.5 py-1 rounded-pill bg-[#1F1B2E] text-white text-[11px] font-semibold mb-2">
          Step {step + 1} of 2
        </div>
        {step === 0 && (
          <>
            <h2 className="relative z-[1] font-display text-[clamp(1.4rem,5.5vw,1.8rem)] leading-tight font-bold mb-1 inline-flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-[#FFE7D7] items-center justify-center text-[#E7652D]">
                <IconSparkles className="w-4 h-4" />
              </span>
              Choose your mood
            </h2>
            <p className="relative z-[1] text-[#7D768A] text-sm mb-4">
              Pick the vibe you are craving right now so we can narrow options fast.
            </p>
            <div className="relative z-[1] grid grid-cols-2 gap-2.5">
              {MOODS.map((m) => (
                <div
                  key={m.value}
                  onClick={() => {
                    setMood(m.value);
                    trackEvent('mood_selected', { mood: m.value });
                  }}
                  className="flex flex-col items-center gap-1.5 py-[16px] px-2.5 rounded-[18px] cursor-pointer border-2 bg-white transition-all select-none active:scale-[0.96]"
                  style={{
                    borderColor: mood === m.value ? m.color : '#ECE1D9',
                    background: mood === m.value ? `${m.color}1f` : '#FFFFFF',
                  }}
                >
                  {MoodIcons[m.value] ? (
                    <span
                      className="w-11 h-11 rounded-full inline-flex items-center justify-center"
                      style={{
                        background: mood === m.value ? `${m.color}29` : '#F4EFE9',
                        color: m.color,
                      }}
                    >
                      {(() => {
                        const MoodIcon = MoodIcons[m.value];
                        return <MoodIcon className="w-5 h-5" />;
                      })()}
                    </span>
                  ) : (
                    <span className="text-[1.6rem] leading-none">{m.emoji}</span>
                  )}
                  <span className="text-xs font-semibold text-[#2F2942]">{m.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="relative z-[1] font-display text-[clamp(1.4rem,5.5vw,1.8rem)] leading-tight font-bold mb-1 inline-flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-[#FFE7D7] items-center justify-center text-[#E7652D]">
                <IconSparkles className="w-4 h-4" />
              </span>
              Set your budget
            </h2>
            <p className="relative z-[1] text-[#7D768A] text-sm mb-4">
              Choose spend level per person and we will match spots that make sense.
            </p>
            <div className="relative z-[1] flex flex-col gap-2">
              {BUDGETS.map((b) => (
                <div
                  key={b.value}
                  onClick={() => {
                    setBudget(b.value);
                    trackEvent('budget_selected', { budget: b.value });
                  }}
                  className="flex items-center gap-3.5 py-3.5 px-[18px] rounded-[18px] cursor-pointer border-2 bg-white transition-all select-none active:scale-[0.98]"
                  style={{
                    borderColor: budget === b.value ? '#FF7A3E' : '#ECE1D9',
                    background: budget === b.value ? 'rgba(255,122,62,0.12)' : '#FFFFFF',
                  }}
                >
                  {BudgetIcons[b.value] ? (
                    <span
                      className="w-10 h-10 rounded-full inline-flex items-center justify-center"
                      style={{
                        background: budget === b.value ? 'rgba(255,122,62,0.18)' : '#F4EFE9',
                        color: '#DE5F20',
                      }}
                    >
                      {(() => {
                        const BudgetIcon = BudgetIcons[b.value];
                        return <BudgetIcon className="w-5 h-5" />;
                      })()}
                    </span>
                  ) : (
                    <span className="text-[1.4rem]">{b.emoji}</span>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-[0.9rem] text-[#2F2942]">{b.label}</div>
                    <div className="text-xs text-[#7D768A]">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pt-3 flex justify-center">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center justify-center gap-2 py-4 px-8 border-none rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] font-display text-base font-bold cursor-pointer w-full max-w-[320px] select-none active:scale-[0.96] transition-transform disabled:opacity-30 disabled:pointer-events-none"
        >
          {step === 1 ? 'Show My 3 Best Picks' : 'Lock Mood & Continue'}
        </button>
      </div>

      <p className="text-center text-xs text-white/70 mt-2 nudge-in">
        {step === 0
          ? 'Tap one mood to unlock budget options.'
          : 'Tap one budget to reveal live picks.'}
      </p>
    </div>
  );
}
