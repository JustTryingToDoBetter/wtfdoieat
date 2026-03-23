import { useState, useCallback, useEffect, useRef } from 'react';
import { getLocationPref, setLocationPref } from '../lib/storage';

export function useGeolocation() {
  const savedPref = useRef(getLocationPref());
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState(() => {
    const pref = savedPref.current;
    return pref === 'granted' ? 'loading' : pref === 'denied' ? 'denied' : 'idle';
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('denied');
      setLocationPref('denied');
      return;
    }

    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
        setLocationPref('granted');
      },
      () => {
        setStatus('denied');
        setLocationPref('denied');
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (savedPref.current === 'granted') {
      requestLocation();
    }
  }, [requestLocation]);

  return { location, status, requestLocation };
}
