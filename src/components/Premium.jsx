import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';
import { usePremium } from '../hooks/usePremium';
import { trackEvent } from '../lib/analytics';

function BillingNotice() {
  const { search } = useLocation();
  const notice = useMemo(() => new URLSearchParams(search).get('billing'), [search]);

  if (!notice) return null;

  const content =
    notice === 'success'
      ? {
          title: 'Payment Successful',
          body: 'Your premium access is being synced. Pull to refresh if this state does not update immediately.',
          classes: 'border-emerald-300/30 bg-emerald-500/15 text-emerald-50',
        }
      : {
          title: 'Checkout Canceled',
          body: 'No charge was made. You can upgrade again anytime.',
          classes: 'border-amber-300/30 bg-amber-500/15 text-amber-50',
        };

  return (
    <div className={`rounded-[16px] border p-3 ${content.classes}`}>
      <p className="font-semibold text-sm">{content.title}</p>
      <p className="text-xs opacity-90 mt-1">{content.body}</p>
    </div>
  );
}

export default function Premium({ user }) {
  const navigate = useNavigate();
  const [syncMessage, setSyncMessage] = useState('');
  const { search } = useLocation();
  const billingState = useMemo(() => new URLSearchParams(search).get('billing'), [search]);
  const {
    isPremium,
    canManageBilling,
    loading,
    lastError,
    startCheckout,
    openBillingPortal,
    pollForActivation,
  } = usePremium();

  useEffect(() => {
    if (billingState !== 'success' || isPremium) {
      setSyncMessage('');
      return;
    }

    let cancelled = false;
    setSyncMessage('Syncing your premium access...');

    void pollForActivation({ attempts: 7, delayMs: 1800 }).then((activated) => {
      if (cancelled) return;
      setSyncMessage(
        activated
          ? 'Premium activated. You are good to go.'
          : 'Payment went through, but sync is taking longer than expected. Refresh in a moment.'
      );
    });

    return () => {
      cancelled = true;
    };
  }, [billingState, isPremium, pollForActivation]);

  return (
    <div className="min-h-dvh flex flex-col p-4 pb-[max(20px,env(safe-area-inset-bottom))] gap-3 animate-fadeUp">
      <button
        onClick={() => navigate('/history')}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 rounded-pill bg-white/10 border border-white/20 text-white font-body text-sm"
      >
        back
      </button>

      <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">Premium</p>
        <h2 className="font-display text-2xl font-extrabold text-white">
          Go Ad-Free + Smart Picks
        </h2>
        <p className="text-sm text-white/80">
          Premium removes ads and unlocks stronger personalization tuning over time.
        </p>

        {!user ? (
          <p className="text-xs text-amber-100 border border-amber-300/30 bg-amber-500/10 rounded-[14px] p-3">
            Sign in first to manage premium billing for your account.
          </p>
        ) : (
          <>
            <BillingNotice />

            {syncMessage && (
              <p className="text-xs text-[#FFF3DB] border border-[#FFD7A8]/40 bg-[#FFAA3C]/10 rounded-[14px] p-3">
                {syncMessage}
              </p>
            )}

            {lastError && (
              <p className="text-xs text-red-100 border border-red-300/30 bg-red-500/10 rounded-[14px] p-3">
                {lastError}
              </p>
            )}

            {!isPremium ? (
              <button
                onClick={() => {
                  trackEvent('premium_upgrade_cta_click', { source: 'premium_screen' });
                  void startCheckout('premium_screen');
                }}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] px-5 py-3 font-display font-bold disabled:opacity-50"
              >
                {loading ? 'Opening Checkout...' : 'Upgrade Now'}
              </button>
            ) : (
              <button
                onClick={() => {
                  void openBillingPortal('premium_screen');
                }}
                disabled={loading || !canManageBilling}
                className="inline-flex items-center justify-center rounded-pill border border-white/25 bg-white/10 text-white px-5 py-3 font-semibold disabled:opacity-50"
              >
                {loading ? 'Opening Portal...' : 'Manage Billing'}
              </button>
            )}
          </>
        )}
      </div>

      <AdBanner placement="premium" />
    </div>
  );
}
