const SESSION_KEY = 'wtf-session-id';
const SESSION_START_KEY = 'wtf-session-started';
const DECISION_TIMER_KEY = 'wtf-decision-start-at';
const LAST_SHARE_KEY = 'wtf-last-share-at';

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId() {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = randomId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return randomId();
  }
}

export async function trackMetricEvent(eventName, props = {}) {
  try {
    await fetch('/api/metrics/event', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        sessionId: getSessionId(),
        props,
        occurredAt: new Date().toISOString(),
      }),
    });
  } catch {
    // Best-effort; analytics should never block UX.
  }
}

export function ensureSessionStarted() {
  try {
    if (sessionStorage.getItem(SESSION_START_KEY) === 'true') return;
    sessionStorage.setItem(SESSION_START_KEY, 'true');
    void trackMetricEvent('session_start', {});
  } catch {
    // ignore
  }
}

export function markDecisionStart(context = {}) {
  try {
    sessionStorage.setItem(DECISION_TIMER_KEY, String(Date.now()));
  } catch {
    // ignore
  }
  void trackMetricEvent('flow_submitted', context);
}

export function readDecisionDurationMs() {
  try {
    const startedAt = Number(sessionStorage.getItem(DECISION_TIMER_KEY) || 0);
    if (!Number.isFinite(startedAt) || startedAt <= 0) return null;
    return Math.max(0, Date.now() - startedAt);
  } catch {
    return null;
  }
}

export function markShared(context = {}) {
  try {
    sessionStorage.setItem(LAST_SHARE_KEY, String(Date.now()));
  } catch {
    // ignore
  }
  void trackMetricEvent('share', context);
}

export function hadRecentShare(windowMs = 30 * 60 * 1000) {
  try {
    const ts = Number(sessionStorage.getItem(LAST_SHARE_KEY) || 0);
    if (!Number.isFinite(ts) || ts <= 0) return false;
    return Date.now() - ts <= windowMs;
  } catch {
    return false;
  }
}

export function markInstall(context = {}) {
  void trackMetricEvent('install', {
    ...context,
    hadRecentShare: hadRecentShare(),
  });
}
