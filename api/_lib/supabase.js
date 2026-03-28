import { createClient } from '@supabase/supabase-js';
import { parseCookies } from './cookies.js';

const ACCESS_COOKIE = 'wtf-access-token';
const REFRESH_COOKIE = 'wtf-refresh-token';

export function getCookieTokens(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return {
    accessToken: cookies[ACCESS_COOKIE] || '',
    refreshToken: cookies[REFRESH_COOKIE] || '',
  };
}

export function createAnonClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireUserFromCookie(req) {
  const { accessToken } = getCookieTokens(req);
  if (!accessToken) return { user: null, error: 'Not authenticated' };

  const anonClient = createAnonClient();
  const { data, error } = await anonClient.auth.getUser(accessToken);
  if (error || !data?.user) {
    return { user: null, error: 'Invalid session' };
  }

  return { user: data.user, error: null };
}

export const SESSION_COOKIE_NAMES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE,
};
