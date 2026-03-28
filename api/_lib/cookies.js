export function parseCookies(cookieHeader = '') {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (!rawKey) return acc;
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rest.join('=') || '');
    acc[key] = value;
    return acc;
  }, {});
}

export function serializeCookie(name, value, options = {}) {
  const attrs = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge != null) attrs.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) attrs.push('HttpOnly');
  if (options.secure) attrs.push('Secure');
  if (options.sameSite) attrs.push(`SameSite=${options.sameSite}`);
  attrs.push(`Path=${options.path || '/'}`);

  return attrs.join('; ');
}
