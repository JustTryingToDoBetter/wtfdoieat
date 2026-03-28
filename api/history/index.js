import { createServiceClient, requireUserFromCookie } from '../_lib/supabase.js';

const MAX_HISTORY = 30;

export default async function handler(req, res) {
  const auth = await requireUserFromCookie(req);
  if (!auth.user) {
    return res.status(401).json({ error: auth.error || 'Not authenticated' });
  }

  const userId = auth.user.id;
  const supabase = createServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ history: data || [] });
  }

  if (req.method === 'POST') {
    const {
      restaurantName,
      restaurantArea,
      mood,
      budget,
      personalityTitle,
      personalityEmoji,
      pickedAt,
    } = req.body || {};

    if (!restaurantName || !restaurantArea || !mood || !budget) {
      return res.status(400).json({ error: 'Missing required history payload' });
    }

    const { error } = await supabase.from('user_history').insert({
      user_id: userId,
      restaurant_name: restaurantName,
      restaurant_area: restaurantArea,
      mood,
      budget,
      personality_title: personalityTitle || null,
      personality_emoji: personalityEmoji || null,
      picked_at: pickedAt || new Date().toISOString(),
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: listData, error: listError } = await supabase
      .from('user_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY);

    if (listError) {
      return res.status(500).json({ error: listError.message });
    }

    return res.status(200).json({ history: listData || [] });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('user_history').delete().eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
