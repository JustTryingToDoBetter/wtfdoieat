import { createServiceClient, requireUserFromCookie } from '../_lib/supabase.js';

const ALLOWED_EVENTS = new Set([
  'session_start',
  'flow_started',
  'flow_submitted',
  'recommendation_accepted',
  'reroll',
  'share',
  'install',
  'destination_opened',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventName, sessionId, props, occurredAt } = req.body || {};
  if (!eventName || !sessionId) {
    return res.status(400).json({ error: 'eventName and sessionId are required' });
  }

  if (!ALLOWED_EVENTS.has(eventName)) {
    return res.status(400).json({ error: 'Unsupported eventName' });
  }

  const auth = await requireUserFromCookie(req);
  const userId = auth.user?.id || null;

  const supabase = createServiceClient();
  const { error } = await supabase.from('app_metric_events').insert({
    user_id: userId,
    session_id: String(sessionId).slice(0, 120),
    event_name: eventName,
    event_props: props && typeof props === 'object' ? props : {},
    occurred_at: occurredAt || new Date().toISOString(),
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
