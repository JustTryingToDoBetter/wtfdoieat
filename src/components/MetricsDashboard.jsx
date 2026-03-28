import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECRET_KEY = 'wtf-metrics-admin-secret';

function readStoredSecret() {
  try {
    return sessionStorage.getItem(SECRET_KEY) || '';
  } catch {
    return '';
  }
}

function storeSecret(value) {
  try {
    if (!value) {
      sessionStorage.removeItem(SECRET_KEY);
      return;
    }
    sessionStorage.setItem(SECRET_KEY, value);
  } catch {
    // ignore storage failures
  }
}

function formatMs(ms) {
  if (!ms || !Number.isFinite(ms)) return 'N/A';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

function KpiCard({ label, value, hint }) {
  return (
    <div className="rounded-[16px] border border-white/15 bg-white/10 p-3">
      <p className="text-[11px] uppercase tracking-[0.1em] text-white/60">{label}</p>
      <p className="font-display text-2xl font-extrabold text-white mt-1">{value}</p>
      <p className="text-xs text-white/70 mt-1">{hint}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[96px] rounded-[16px] border border-white/10 bg-white/10" />
      ))}
    </div>
  );
}

export default function MetricsDashboard() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState(readStoredSecret);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const loadSummary = useCallback(async (value) => {
    if (!value) {
      setError('Enter METRICS_ADMIN_SECRET to load KPIs.');
      setSummary(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/metrics/summary', {
        headers: { 'x-metrics-admin-secret': value },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Unable to load metrics summary');
      }

      const data = await res.json();
      setSummary(data);
    } catch (e) {
      setSummary(null);
      setError(e instanceof Error ? e.message : 'Unable to load metrics summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = readStoredSecret();
    if (initial) {
      void loadSummary(initial);
    }
  }, [loadSummary]);

  const retention = useMemo(() => summary?.retention || null, [summary]);

  return (
    <div className="min-h-dvh flex flex-col p-4 pb-[max(20px,env(safe-area-inset-bottom))] gap-3 animate-fadeUp">
      <button
        onClick={() => navigate('/')}
        className="self-start inline-flex items-center gap-1.5 py-2 px-2.5 rounded-pill bg-white/10 border border-white/20 text-white font-body text-sm"
      >
        back
      </button>

      <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 flex flex-col gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/70">
            Internal Dashboard
          </p>
          <h2 className="font-display text-2xl font-extrabold text-white">Retention Metrics</h2>
          <p className="text-xs text-white/75 mt-1">
            7-day operational KPIs and retention cohort snapshot.
          </p>
        </div>

        <div className="rounded-[14px] border border-white/15 bg-black/20 p-3 flex flex-col gap-2">
          <label htmlFor="metrics-secret" className="text-xs text-white/80 font-semibold">
            Admin secret
          </label>
          <input
            id="metrics-secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="METRICS_ADMIN_SECRET"
            className="rounded-[12px] border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                storeSecret(secret.trim());
                void loadSummary(secret.trim());
              }}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] px-4 py-2 font-semibold text-sm disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Load Metrics'}
            </button>
            <button
              onClick={() => {
                setSecret('');
                setSummary(null);
                setError('');
                storeSecret('');
              }}
              className="inline-flex items-center justify-center rounded-pill border border-white/25 bg-white/10 text-white px-4 py-2 font-semibold text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {loading && <SkeletonGrid />}

        {!loading && error && (
          <div className="rounded-[14px] border border-red-300/30 bg-red-500/10 p-3 text-xs text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && summary && (
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              label="D1 Retention"
              value={`${retention?.d1 ?? 0}%`}
              hint={`Cohort size: ${retention?.cohortUsers ?? 0}`}
            />
            <KpiCard
              label="D7 Retention"
              value={`${retention?.d7 ?? 0}%`}
              hint="Returning after one week"
            />
            <KpiCard
              label="D30 Retention"
              value={`${retention?.d30 ?? 0}%`}
              hint="Long-tail usage"
            />
            <KpiCard
              label="Acceptance Rate"
              value={`${summary?.recommendationAcceptanceRate ?? 0}%`}
              hint="Pick accepted after flow"
            />
            <KpiCard
              label="Reroll/Session"
              value={`${summary?.rerollPerSession ?? 0}`}
              hint="Lower usually means better fit"
            />
            <KpiCard
              label="Share to Install"
              value={`${summary?.shareToInstallConversion ?? 0}%`}
              hint="Viral conversion"
            />
            <div className="col-span-2">
              <KpiCard
                label="Decision to Destination"
                value={formatMs(summary?.decisionToDestinationMsMedian)}
                hint="Median time from pick flow to maps open"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
