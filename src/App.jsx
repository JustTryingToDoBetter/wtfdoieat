import { useCallback, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Landing from './components/Landing';
import Flow from './components/Flow';
import Results from './components/Results';
import Detail from './components/Detail';
import History from './components/History';
import { useGeolocation } from './hooks/useGeolocation';
import { useHistory } from './hooks/useHistory';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { getMatches } from './lib/matching';
import { getPersonality } from './lib/personality';
import { trackEvent } from './lib/analytics';

export default function App() {
  const navigate = useNavigate();
  const { location, status: locationStatus, requestLocation } = useGeolocation();
  const { history, addEntry, clearHistory } = useHistory();
  const { canInstall, promptInstall } = useInstallPrompt();

  const [mood, setMood] = useState(null);
  const [budget, setBudget] = useState(null);
  const [results, setResults] = useState([]);
  const [personality, setPersonality] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const generateForSelection = useCallback(
    (nextMood, nextBudget) => {
      const nextResults = getMatches(nextMood, nextBudget, location);
      setMood(nextMood);
      setBudget(nextBudget);
      setResults(nextResults);
      setPersonality(getPersonality(nextMood, nextBudget));
      setSelectedRestaurant(null);
      return nextResults;
    },
    [location]
  );

  const handleFlowComplete = useCallback(
    (nextMood, nextBudget) => {
      trackEvent('flow_complete', { mood: nextMood, budget: nextBudget });
      generateForSelection(nextMood, nextBudget);
    },
    [generateForSelection]
  );

  const handlePick = useCallback(
    (restaurant) => {
      setSelectedRestaurant(restaurant);
      trackEvent('result_selected', {
        name: restaurant.name,
        area: restaurant.area,
        mood,
        budget,
      });
      addEntry({
        name: restaurant.name,
        area: restaurant.area,
        mood,
        budget,
        pers: personality,
        date: new Date().toLocaleDateString('en-ZA'),
        ts: Date.now(),
      });
      navigate('/detail');
    },
    [addEntry, budget, mood, navigate, personality]
  );

  const handleReroll = useCallback(() => {
    if (!mood || !budget) return;
    trackEvent('results_reroll', { mood, budget, source: 'results' });
    const nextResults = getMatches(mood, budget, location);
    setResults(nextResults);
    setSelectedRestaurant(null);
  }, [budget, location, mood]);

  const handleRerollFromDetail = useCallback(() => {
    trackEvent('results_reroll', { mood, budget, source: 'detail' });
    handleReroll();
    navigate('/results');
  }, [budget, handleReroll, mood, navigate]);

  return (
    <div className="min-h-dvh bg-bg text-text font-body">
      <div className="mx-auto max-w-[480px] min-h-dvh relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(127,90,240,0.08),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,107,53,0.08),_transparent_42%)]">
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                locationStatus={locationStatus}
                onRequestLocation={requestLocation}
                historyCount={history.length}
                canInstall={canInstall}
                onInstall={promptInstall}
              />
            }
          />
          <Route path="/flow" element={<Flow onComplete={handleFlowComplete} />} />
          <Route
            path="/results"
            element={
              <Results
                results={results}
                personality={personality}
                mood={mood}
                onPick={handlePick}
                onReroll={handleReroll}
              />
            }
          />
          <Route
            path="/detail"
            element={
              <Detail
                restaurant={selectedRestaurant}
                personality={personality}
                mood={mood}
                budget={budget}
                onReroll={handleRerollFromDetail}
              />
            }
          />
          <Route
            path="/history"
            element={<History history={history} onClear={clearHistory} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
