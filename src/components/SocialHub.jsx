import { useMemo, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import { markShared } from '../lib/metrics';

function buildPollText(options) {
  const top = options.slice(0, 3);
  const lines = ['WTF Do I Eat group poll:', ''];
  top.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.name}${item.area ? ` (${item.area})` : ''}`);
  });
  lines.push('');
  lines.push('Vote with 1, 2, or 3.');
  lines.push('wtfdoieat.app');
  return lines.join('\n');
}

export default function SocialHub({ trending = [], onStartGroupMode, onTrackMetric }) {
  const [toast, setToast] = useState('');

  const pollText = useMemo(() => buildPollText(trending), [trending]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 1600);
  };

  const handleSharePoll = async () => {
    trackEvent('group_poll_share_click', { source: 'landing' });
    markShared({ method: 'group_poll', source: 'landing', hasTrending: trending.length > 0 });

    if (navigator.share) {
      try {
        await navigator.share({ text: pollText });
        showToast('Poll shared');
        return;
      } catch {
        // fallback to clipboard
      }
    }

    await navigator.clipboard?.writeText(pollText);
    showToast('Poll copied');
  };

  return (
    <div className="rounded-[20px] border border-[#E8DED7] bg-[#FFFFFF] p-3 flex flex-col gap-2.5 shadow-[0_8px_18px_rgba(25,18,29,0.08)]">
      {toast && (
        <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-[#2CB67D] text-[#0A1610] py-2 px-4 rounded-pill text-xs font-semibold z-50 pointer-events-none">
          {toast}
        </div>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#7D768A]">Social Mode</p>
        <p className="text-xs text-[#6C6677]">Decide with friends in under a minute.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            trackEvent('group_mode_start_click', { source: 'landing' });
            onTrackMetric?.('flow_started', { source: 'group_mode' });
            onStartGroupMode?.();
          }}
          className="rounded-pill border border-[#1F1B2E] bg-[#1F1B2E] text-white text-xs font-semibold px-3 py-2"
        >
          Group Mode
        </button>
        <button
          onClick={() => {
            void handleSharePoll();
          }}
          className="rounded-pill border border-[#F4C9A3] bg-[#FFE4CF] text-[#402110] text-xs font-semibold px-3 py-2"
        >
          Share Friend Poll
        </button>
      </div>

      <div className="rounded-[14px] border border-[#E8DED7] bg-[#F4EFEB] p-2.5">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[#7D768A] mb-1">
          Trending This Week
        </p>
        {trending.length ? (
          <div className="flex flex-wrap gap-1.5">
            {trending.slice(0, 5).map((item) => (
              <span
                key={`${item.name}|${item.area}`}
                className="px-2.5 py-1 rounded-pill bg-[#1F1B2E] text-white text-[11px]"
              >
                {item.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6C6677]">
            No trend signal yet. Invite friends and start the first poll.
          </p>
        )}
      </div>
    </div>
  );
}
