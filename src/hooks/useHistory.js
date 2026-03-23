import { useState, useCallback } from 'react';
import { getHistory, addToHistory, clearHistory as clearStore } from '../lib/storage';

export function useHistory() {
  const [history, setHistory] = useState(() => getHistory());

  const addEntry = useCallback((entry) => {
    const updated = addToHistory(entry);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    clearStore();
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
