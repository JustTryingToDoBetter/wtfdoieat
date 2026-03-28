import { requireUserFromCookie } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user, error } = await requireUserFromCookie(req);
    if (error || !user) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({ authenticated: true, user });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unable to resolve session user' });
  }
}
