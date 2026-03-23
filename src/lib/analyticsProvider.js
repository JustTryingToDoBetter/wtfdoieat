import posthog from 'posthog-js';

function initPlausible() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain || typeof window === 'undefined') return;

  if (window.plausible) return;

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

function initPosthog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key || typeof window === 'undefined') return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
  });

  window.posthog = posthog;
}

export function initAnalyticsProviders() {
  initPlausible();
  initPosthog();
}
