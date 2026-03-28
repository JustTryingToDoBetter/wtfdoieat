export function trackEvent(name, props = {}) {
  if (!name) return;

  let sent = false;

  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(name, { props });
    sent = true;
  }

  if (
    typeof window !== 'undefined' &&
    window.posthog &&
    typeof window.posthog.capture === 'function'
  ) {
    window.posthog.capture(name, props);
    sent = true;
  }

  if (!sent && import.meta.env.DEV) {
    // Helpful during local development without an analytics provider configured.
    console.debug('[analytics]', name, props);
  }
}
