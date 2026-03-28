import { useEffect } from 'react';
import { usePremium } from '../hooks/usePremium';
import { trackEvent } from '../lib/analytics';

export default function AdBanner({ size = 'banner', placement = 'unknown' }) {
  const { isPremium } = usePremium();

  useEffect(() => {
    if (!isPremium) {
      trackEvent('ad_banner_impression', { size, placement });
    }
  }, [isPremium, placement, size]);

  if (isPremium) {
    return null;
  }

  return (
    <div
      className={`bg-white/10 backdrop-blur border border-white/18 rounded-[20px] text-center my-2 ${
        size === 'large' ? 'py-7 px-4' : 'py-3.5 px-4'
      }`}
    >
      <div className="text-[10px] uppercase tracking-[2px] text-white/60 mb-1">sponsored</div>
      <div className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-white/80 font-medium`}>
        {size === 'large' ? 'Your ad here — reach hungry Cape Town locals' : 'Ad placement'}
      </div>
    </div>
  );
}
