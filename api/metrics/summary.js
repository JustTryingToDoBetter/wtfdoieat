import { createServiceClient } from '../_lib/supabase.js';

const DAY_MS = 86400000;

function uniqueCount(rows, key) {
  return new Set(rows.map((r) => r?.[key]).filter(Boolean)).size;
}

function dateOnly(isoLike) {
  return String(isoLike || '').slice(0, 10);
}

function parseWindow(rows, startTs) {
  return rows.filter((r) => new Date(r.occurred_at).getTime() >= startTs);
}

function summarizeRetention(sessionRows) {
  const daysByUser = new Map();

  for (const row of sessionRows) {
    if (!row.user_id) continue;
    const day = dateOnly(row.occurred_at);
    if (!day) continue;
    const set = daysByUser.get(row.user_id) || new Set();
    set.add(day);
    daysByUser.set(row.user_id, set);
  }

  let d1 = 0;
  let d7 = 0;
  let d30 = 0;

  for (const [, daySet] of daysByUser) {
    const days = Array.from(daySet).sort();
    if (!days.length) continue;
    const first = new Date(`${days[0]}T00:00:00Z`).getTime();

    if (days.some((d) => new Date(`${d}T00:00:00Z`).getTime() - first >= 1 * DAY_MS)) d1 += 1;
    if (days.some((d) => new Date(`${d}T00:00:00Z`).getTime() - first >= 7 * DAY_MS)) d7 += 1;
    if (days.some((d) => new Date(`${d}T00:00:00Z`).getTime() - first >= 30 * DAY_MS)) d30 += 1;
  }

  const base = Math.max(1, daysByUser.size);
  return {
    cohortUsers: daysByUser.size,
    d1: Number(((d1 / base) * 100).toFixed(1)),
    d7: Number(((d7 / base) * 100).toFixed(1)),
    d30: Number(((d30 / base) * 100).toFixed(1)),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminHeader = req.headers['x-metrics-admin-secret'];
  const adminExpected = process.env.METRICS_ADMIN_SECRET;
  if (!adminExpected || adminHeader !== adminExpected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = Date.now();
  const since30d = new Date(now - 30 * DAY_MS).toISOString();

  const supabase = createServiceClient();
  const { data: rows, error } = await supabase
    .from('app_metric_events')
    .select('user_id, session_id, event_name, event_props, occurred_at')
    .gte('occurred_at', since30d)
    .order('occurred_at', { ascending: false })
    .limit(10000);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const allRows = rows || [];
  const rows7d = parseWindow(allRows, now - 7 * DAY_MS);

  const accepted = rows7d.filter((r) => r.event_name === 'recommendation_accepted').length;
  const submitted = rows7d.filter((r) => r.event_name === 'flow_submitted').length;
  const rerolls = rows7d.filter((r) => r.event_name === 'reroll').length;
  const shares = rows7d.filter((r) => r.event_name === 'share').length;
  const installs = rows7d.filter((r) => r.event_name === 'install').length;

  const destinationRows = rows7d.filter((r) => r.event_name === 'destination_opened');
  const destinationDelays = destinationRows
    .map((r) => Number(r?.event_props?.decisionToDestinationMs || 0))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

  const medianDecisionToDestinationMs = destinationDelays.length
    ? destinationDelays[Math.floor(destinationDelays.length / 2)]
    : null;

  const sessionCount = Math.max(1, uniqueCount(rows7d, 'session_id'));

  const retention = summarizeRetention(allRows.filter((r) => r.event_name === 'session_start'));

  return res.status(200).json({
    window: '7d',
    retention,
    recommendationAcceptanceRate: Number(((accepted / Math.max(1, submitted)) * 100).toFixed(1)),
    rerollPerSession: Number((rerolls / sessionCount).toFixed(2)),
    shareToInstallConversion: Number(((installs / Math.max(1, shares)) * 100).toFixed(1)),
    decisionToDestinationMsMedian: medianDecisionToDestinationMs,
  });
}
