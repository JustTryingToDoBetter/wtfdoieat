import { createServiceClient } from '../_lib/supabase.js';

const DAY_MS = 86400000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const since = new Date(Date.now() - 7 * DAY_MS).toISOString();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('user_history')
    .select('restaurant_name, restaurant_area, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1200);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const counter = new Map();
  for (const row of data || []) {
    const name = String(row.restaurant_name || '').trim();
    const area = String(row.restaurant_area || '').trim();
    if (!name) continue;
    const key = `${name}|${area}`;
    const current = counter.get(key) || { name, area, picks: 0 };
    current.picks += 1;
    counter.set(key, current);
  }

  const trending = Array.from(counter.values())
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 8);

  return res.status(200).json({ trending });
}
