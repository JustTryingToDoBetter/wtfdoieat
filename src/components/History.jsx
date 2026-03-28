import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';
import AuthPanel from './AuthPanel';
import { usePremium } from '../hooks/usePremium';
import { trackEvent } from '../lib/analytics';

export default function History({
  history,
  onClear,
  user,
  authLoading,
  onSignIn,
  onSignUp,
  onSignOut,
}) {
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  return (
    <div className="min-h-dvh flex flex-col p-5 pb-[max(20px,env(safe-area-inset-bottom))] gap-4 animate-fadeUp">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">📜 Past Picks</h2>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none"
        >
          ✕
        </button>
      </div>

      {!user ? (
        <div className="flex flex-col gap-3 rounded-card border border-border bg-surface/70 p-4">
          <p className="text-sm text-muted">Sign in to sync your picks across devices.</p>
          <AuthPanel onSignIn={onSignIn} onSignUp={onSignUp} loading={authLoading} />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 text-muted rounded-card border border-border bg-surface/70">
          <div className="text-4xl mb-3">🍽️</div>
          <p>No picks yet!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {history.map((h, i) => (
            <div
              key={h.ts || i}
              className="flex items-center gap-3 py-3.5 px-4 bg-surface border border-border rounded-[14px]"
            >
              <div className="text-[1.4rem] shrink-0">{h.pers?.emoji || '🍽️'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{h.name}</div>
                <div className="text-xs text-muted">
                  {h.area} · {h.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <div className="flex items-center justify-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 py-3 px-6 border border-red-500/20 rounded-pill bg-surface text-red-400 font-body text-sm cursor-pointer select-none"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 py-3 px-6 border border-white/20 rounded-pill bg-surface text-white/85 font-body text-sm cursor-pointer select-none"
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="rounded-card border border-white/20 bg-white/5 p-4 flex flex-col gap-2">
        <h3 className="font-display text-sm font-bold text-white">Ad-Free Premium</h3>
        <p className="text-xs text-white/70">
          {isPremium
            ? 'Premium is active on this account. Ads are hidden.'
            : 'Upgrade to premium for ad-free mode and smarter picks.'}
        </p>
        <button
          onClick={() => {
            trackEvent('premium_open_screen_click', { source: 'history' });
            navigate('/premium');
          }}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 border border-white/20 rounded-pill bg-white/10 text-white font-body text-sm font-semibold cursor-pointer select-none"
        >
          {isPremium ? 'Manage Premium' : 'View Premium'}
        </button>
      </div>

      <AdBanner placement="history" />
    </div>
  );
}
