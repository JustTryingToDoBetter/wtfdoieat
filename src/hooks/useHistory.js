import { useState, useCallback } from 'react';

export function useHistory() {
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history', { credentials: 'include' });
      if (!res.ok) {
        setHistory([]);
        return [];
      }
      const data = await res.json();
      const list = (data?.history || []).map((h) => ({
        name: h.restaurant_name,
        area: h.restaurant_area,
        mood: h.mood,
        budget: h.budget,
        pers: {
          title: h.personality_title,
          emoji: h.personality_emoji,
        },
        date: h.picked_at ? new Date(h.picked_at).toLocaleDateString('en-ZA') : '',
        ts: h.created_at ? new Date(h.created_at).getTime() : Date.now(),
      }));
      setHistory(list);
      return list;
    } catch {
      setHistory([]);
      return [];
    }
  }, []);

  const addEntry = useCallback(
    async (entry) => {
      try {
        const res = await fetch('/api/history', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantName: entry.name,
            restaurantArea: entry.area,
            mood: entry.mood,
            budget: entry.budget,
            personalityTitle: entry?.pers?.title || null,
            personalityEmoji: entry?.pers?.emoji || null,
            pickedAt: new Date().toISOString(),
          }),
        });

        if (!res.ok) return;
        await loadHistory();
      } catch {
        // no-op when unauthenticated or offline
      }
    },
    [loadHistory]
  );

  const clearHistory = useCallback(async () => {
    try {
      await fetch('/api/history', {
        method: 'DELETE',
        credentials: 'include',
      });
    } finally {
      setHistory([]);
    }
  }, []);

  return { history, addEntry, clearHistory, loadHistory };
}
