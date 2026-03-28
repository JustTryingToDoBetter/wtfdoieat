import { useCallback, useEffect, useState } from 'react';
import { markInstall } from '../lib/metrics';

const VISITS_KEY = 'wtf-visit-count';

function getVisitCount() {
  try {
    return Number(localStorage.getItem(VISITS_KEY) || '0');
  } catch {
    return 0;
  }
}

function setVisitCount(count) {
  try {
    localStorage.setItem(VISITS_KEY, String(count));
  } catch {
    // ignore storage errors in private mode or locked contexts
  }
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const visits = getVisitCount() + 1;
    setVisitCount(visits);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(visits >= 2);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === 'accepted') {
      markInstall({ source: 'install_prompt', platform: choice.platform || 'unknown' });
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  return { canInstall, promptInstall };
}
