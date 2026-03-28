import { serializeCookie } from '../_lib/cookies.js';
import { createAnonClient, SESSION_COOKIE_NAMES } from '../_lib/supabase.js';

const EIGHT_HOURS = 60 * 60 * 8;

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: EIGHT_HOURS,
  };
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { accessToken = '', refreshToken = '' } = req.body || {};
    if (!accessToken || !refreshToken) {
      return res.status(400).json({ error: 'accessToken and refreshToken are required' });
    }

    const anonClient = createAnonClient();
    const { data, error } = await anonClient.auth.getUser(accessToken);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    const options = buildCookieOptions();
    res.setHeader('Set-Cookie', [
      serializeCookie(SESSION_COOKIE_NAMES.access, accessToken, options),
      serializeCookie(SESSION_COOKIE_NAMES.refresh, refreshToken, options),
    ]);

    return res.status(200).json({ ok: true, user: data.user });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', [
      serializeCookie(SESSION_COOKIE_NAMES.access, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
      }),
      serializeCookie(SESSION_COOKIE_NAMES.refresh, '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
      }),
    ]);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'POST, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
