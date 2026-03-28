import { useCallback, useEffect, useState } from 'react';
import { getPremiumEnabled, setPremiumEnabled } from '../lib/storage';
import { trackEvent } from '../lib/analytics';

let entitlementCache = {
  loadedAt: 0,
  value: null,
  canManageBilling: false,
};

const CACHE_TTL_MS = 60000;

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [canManageBilling, setCanManageBilling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState('');

  const refreshEntitlement = useCallback(async ({ force = false } = {}) => {
    const now = Date.now();
    if (
      !force &&
      entitlementCache.value != null &&
      now - entitlementCache.loadedAt < CACHE_TTL_MS
    ) {
      setIsPremium(Boolean(entitlementCache.value));
      setCanManageBilling(Boolean(entitlementCache.canManageBilling));
      return {
        isPremium: Boolean(entitlementCache.value),
        canManageBilling: Boolean(entitlementCache.canManageBilling),
      };
    }

    const res = await fetch('/api/subscription', { credentials: 'include' });
    if (!res.ok) {
      throw new Error('Unable to refresh premium status');
    }

    const data = await res.json();
    const enabled = Boolean(data?.isPremium);
    const nextCanManageBilling = Boolean(data?.stripeCustomerId);
    entitlementCache = {
      loadedAt: Date.now(),
      value: enabled,
      canManageBilling: nextCanManageBilling,
    };

    setPremiumEnabled(enabled);
    setIsPremium(enabled);
    setCanManageBilling(nextCanManageBilling);
    return { isPremium: enabled, canManageBilling: nextCanManageBilling };
  }, []);

  useEffect(() => {
    setIsPremium(getPremiumEnabled());
    void refreshEntitlement().catch(() => {
      // silent fallback to local storage value
    });
  }, [refreshEntitlement]);

  const setPreviewPremium = useCallback(async (enabled, source = 'unknown') => {
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        const data = await res.json();
        enabled = Boolean(data?.isPremium);
      }
    } catch {
      // fall back to local-only toggle
    }

    setPremiumEnabled(enabled);
    setIsPremium(enabled);
    entitlementCache = {
      loadedAt: Date.now(),
      value: enabled,
      canManageBilling: entitlementCache.canManageBilling,
    };
    trackEvent('premium_status_changed', {
      enabled,
      source,
    });
  }, []);

  const startCheckout = useCallback(
    async (source = 'unknown') => {
      setLoading(true);
      setLastError('');
      try {
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 503) {
            // Non-production fallback while Stripe env is absent.
            await setPreviewPremium(true, `${source}:preview-fallback`);
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Unable to start checkout');
        }

        const data = await res.json();
        trackEvent('premium_checkout_started', { source });
        if (data?.url) {
          window.location.assign(data.url);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unable to start checkout';
        setLastError(message);
        trackEvent('premium_checkout_failed', { source, message });
      } finally {
        setLoading(false);
      }
    },
    [setPreviewPremium]
  );

  const openBillingPortal = useCallback(async (source = 'unknown') => {
    setLoading(true);
    setLastError('');
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Unable to open billing portal');
      }

      const data = await res.json();
      trackEvent('premium_billing_portal_opened', { source });
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to open billing portal';
      setLastError(message);
      trackEvent('premium_billing_portal_failed', { source, message });
    } finally {
      setLoading(false);
    }
  }, []);

  const pollForActivation = useCallback(
    async ({ attempts = 6, delayMs = 2000 } = {}) => {
      for (let i = 0; i < attempts; i += 1) {
        try {
          const state = await refreshEntitlement({ force: true });
          if (state.isPremium) {
            return true;
          }
        } catch {
          // keep polling through transient failures
        }

        if (i < attempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      return false;
    },
    [refreshEntitlement]
  );

  return {
    isPremium,
    canManageBilling,
    loading,
    lastError,
    refreshEntitlement,
    pollForActivation,
    startCheckout,
    openBillingPortal,
    enablePremium: (source) => setPreviewPremium(true, source),
    disablePremium: (source) => setPreviewPremium(false, source),
  };
}
