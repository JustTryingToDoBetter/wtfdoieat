import { createServiceClient, requireUserFromCookie } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireUserFromCookie(req);
  if (!auth.user) {
    return res.status(401).json({ error: auth.error || 'Not authenticated' });
  }

  const { rating, restaurantName, restaurantArea, mood, budget } = req.body || {};
  if (!rating || !restaurantName) {
    return res.status(400).json({ error: 'rating and restaurantName are required' });
  }

  if (!['up', 'down'].includes(rating)) {
    return res.status(400).json({ error: 'rating must be up or down' });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('recommendation_feedback').insert({
    user_id: auth.user.id,
    rating,
    restaurant_name: restaurantName,
    restaurant_area: restaurantArea || null,
    mood: mood || null,
    budget: budget || null,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
