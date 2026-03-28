import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Landing from './components/Landing';
import Flow from './components/Flow';
import Results from './components/Results';
import Detail from './components/Detail';
import History from './components/History';
import Favourites from './components/Favourites';
import Premium from './components/Premium';
import MetricsDashboard from './components/MetricsDashboard';
import BottomNav from './components/BottomNav';
import { useGeolocation } from './hooks/useGeolocation';
import { useHistory } from './hooks/useHistory';
import { useFavourites } from './hooks/useFavourites';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useAuth } from './hooks/useAuth';
import { getMatches } from './lib/matching';
import { getPersonality } from './lib/personality';
import { BUDGET_VALUES, MOOD_VALUES } from './constants/options';
import { trackEvent } from './lib/analytics';
import {
  ensureSessionStarted,
  markDecisionStart,
  readDecisionDurationMs,
  trackMetricEvent,
} from './lib/metrics';
import { isPlacesEnabled, searchNearby } from './lib/placesApi';
import { isSerpApiEnabled, searchNearbyWithSerpApi } from './lib/serpApi';
import { recordBehavior } from './lib/behavior';
import {
  getLastSelection,
  getUserPrefs,
  markDailyVisit,
  saveLastSelection,
  saveUserPrefs,
} from './lib/storage';
import type {
  BudgetValue,
  DailyLoopState,
  LastSelection,
  LiveState,
  MoodValue,
  Personality,
  Restaurant,
  UserPreferences,
} from './types/domain';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function preferOpenNow(places: Restaurant[]): Restaurant[] {
  const openNow = places.filter((p) => p._openStatus !== 'closed');
  return openNow.length >= 3 ? openNow : places;
}

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    location,
    status: locationStatus,
    requestLocation,
  } = useGeolocation() as {
    location: { lat: number; lng: number } | null;
    status: string;
    requestLocation: () => void;
  };
  const { history, addEntry, clearHistory, loadHistory } = useHistory() as {
    history: Array<Record<string, unknown>>;
    addEntry: (entry: Record<string, unknown>) => void;
    clearHistory: () => void;
    loadHistory: () => Promise<Array<Record<string, unknown>>>;
  };
  const {
    favourites,
    toggle: toggleFavourite,
    isFav,
  } = useFavourites() as {
    favourites: Restaurant[];
    toggle: (restaurant: Restaurant) => boolean;
    isFav: (restaurant: Restaurant) => boolean;
  };
  const { canInstall, promptInstall } = useInstallPrompt() as {
    canInstall: boolean;
    promptInstall: () => void;
  };
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();

  const [mood, setMood] = useState<MoodValue | null>(null);
  const [budget, setBudget] = useState<BudgetValue | null>(null);
  const [results, setResults] = useState<Restaurant[]>([]);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [dailyState, setDailyState] = useState<DailyLoopState>({
    lastVisitDay: null,
    streak: 0,
    totalDays: 0,
  });
  const [prefs, setPrefs] = useState<UserPreferences>(() => getUserPrefs());
  const [lastSelection, setLastSelection] = useState<LastSelection | null>(() =>
    getLastSelection()
  );
  const [liveState, setLiveState] = useState<LiveState>({
    status: 'idle',
    count: 0,
    mode: 'static',
  });
  const [trendingPicks, setTrendingPicks] = useState<
    Array<{ name: string; area: string; picks: number }>
  >([]);
  const requestSequence = useRef(0);
  const showBottomNav = !['/detail', '/flow', '/premium', '/metrics'].includes(pathname);

  useEffect(() => {
    ensureSessionStarted();
  }, []);

  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch('/api/trending');
        if (!res.ok) return;
        const data = await res.json();
        setTrendingPicks(Array.isArray(data?.trending) ? data.trending : []);
      } catch {
        setTrendingPicks([]);
      }
    }

    void loadTrending();
  }, []);

  useEffect(() => {
    if (locationStatus === 'idle') {
      requestLocation();
    }
  }, [locationStatus, requestLocation]);

  useEffect(() => {
    const next = markDailyVisit();
    setDailyState(next);
    trackEvent('daily_visit', {
      streak: next.streak,
      totalDays: next.totalDays,
    });
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      void loadHistory();
    }
  }, [authLoading, loadHistory, user]);

  const generateForSelection = useCallback(
    (nextMood: MoodValue, nextBudget: BudgetValue) => {
      const searchLocation = location;
      const nextResults = getMatches(nextMood, nextBudget, searchLocation);
      const nextSeq = requestSequence.current + 1;
      requestSequence.current = nextSeq;

      setMood(nextMood);
      setBudget(nextBudget);
      setResults(nextResults);
      setPersonality(getPersonality(nextMood, nextBudget));
      setSelectedRestaurant(null);

      const canFetchLive = (isPlacesEnabled() || isSerpApiEnabled()) && !!searchLocation;
      setLiveState({
        status: canFetchLive ? 'loading' : 'idle',
        count: 0,
        mode: canFetchLive ? 'live' : 'static',
      });

      if (canFetchLive && searchLocation) {
        const providerPromise = isPlacesEnabled()
          ? searchNearby(searchLocation, { radiusMeters: 6500, maxResults: 24 })
          : searchNearbyWithSerpApi(searchLocation, { maxResults: 24, query: 'restaurants' });

        providerPromise
          .then((livePlaces: Restaurant[]) => {
            if (requestSequence.current !== nextSeq) return;

            if (!livePlaces.length) {
              if (isPlacesEnabled() && isSerpApiEnabled()) {
                return searchNearbyWithSerpApi(searchLocation, {
                  maxResults: 24,
                  query: 'restaurants',
                }).then((fallbackPlaces: Restaurant[]) => {
                  if (requestSequence.current !== nextSeq) return;
                  if (!fallbackPlaces.length) {
                    setLiveState({ status: 'idle', count: 0, mode: 'static' });
                    return;
                  }

                  const availableFallback = preferOpenNow(fallbackPlaces);
                  const mergedFallback = getMatches(
                    nextMood,
                    nextBudget,
                    searchLocation,
                    availableFallback
                  );

                  setResults(mergedFallback);
                  setLiveState({ status: 'ready', count: availableFallback.length, mode: 'live' });
                });
              }

              setLiveState({ status: 'idle', count: 0, mode: 'static' });
              return;
            }

            const availablePlaces = preferOpenNow(livePlaces);
            const mergedResults = getMatches(nextMood, nextBudget, searchLocation, availablePlaces);
            setResults(mergedResults);
            setLiveState({ status: 'ready', count: availablePlaces.length, mode: 'live' });
          })
          .catch(() => {
            if (requestSequence.current !== nextSeq) return;
            setLiveState({ status: 'error', count: 0, mode: 'static' });
          });
      }

      return nextResults;
    },
    [location]
  );

  useEffect(() => {
    if (!mood || !budget || !location) return;
    generateForSelection(mood, budget);
  }, [budget, generateForSelection, location, mood]);

  const handleFlowComplete = useCallback(
    (nextMood: MoodValue, nextBudget: BudgetValue) => {
      trackEvent('flow_complete', { mood: nextMood, budget: nextBudget });
      markDecisionStart({ mood: nextMood, budget: nextBudget, source: 'flow' });
      const nextSelection = { mood: nextMood, budget: nextBudget, at: Date.now() };
      saveLastSelection(nextSelection);
      setLastSelection(nextSelection);
      generateForSelection(nextMood, nextBudget);
    },
    [generateForSelection]
  );

  const handleRepeatLastSelection = useCallback(() => {
    if (!lastSelection?.mood || !lastSelection?.budget) return;
    trackEvent('repeat_last_selection_click', {
      mood: lastSelection.mood,
      budget: lastSelection.budget,
    });
    generateForSelection(lastSelection.mood, lastSelection.budget);
    navigate('/results');
  }, [generateForSelection, lastSelection, navigate]);

  const handlePrefsChange = useCallback(
    (partial: Partial<UserPreferences>) => {
      const next = saveUserPrefs({ ...prefs, ...partial });
      setPrefs(next);
    },
    [prefs]
  );

  const handleSurpriseMe = useCallback(() => {
    const randomMood = pickRandom(MOOD_VALUES);
    const randomBudget = pickRandom(BUDGET_VALUES);
    trackEvent('surprise_me_click', { mood: randomMood, budget: randomBudget });
    void trackMetricEvent('flow_started', {
      mood: randomMood,
      budget: randomBudget,
      source: 'surprise_me',
    });
    generateForSelection(randomMood, randomBudget);
    navigate('/results');
  }, [generateForSelection, navigate]);

  const handleStartGroupMode = useCallback(() => {
    const groupMood: MoodValue = 'social';
    const groupBudget: BudgetValue = 'mid';
    trackEvent('group_mode_started', { mood: groupMood, budget: groupBudget });
    void trackMetricEvent('flow_started', {
      mood: groupMood,
      budget: groupBudget,
      source: 'group_mode',
    });
    markDecisionStart({ mood: groupMood, budget: groupBudget, source: 'group_mode' });
    generateForSelection(groupMood, groupBudget);
    navigate('/results');
  }, [generateForSelection, navigate]);

  const handlePick = useCallback(
    (restaurant: Restaurant) => {
      setSelectedRestaurant(restaurant);
      trackEvent('result_selected', {
        name: restaurant.name,
        area: restaurant.area,
        mood,
        budget,
      });
      recordBehavior('tap', { mood, budget, restaurant });
      const decisionDurationMs = readDecisionDurationMs();
      void trackMetricEvent('recommendation_accepted', {
        restaurant: restaurant.name,
        area: restaurant.area,
        mood,
        budget,
        decisionDurationMs,
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
    recordBehavior('reroll', { mood, budget });
    void trackMetricEvent('reroll', { mood, budget, source: 'results' });
    generateForSelection(mood, budget);
  }, [budget, generateForSelection, mood]);

  const handleOpenDestination = useCallback(
    (restaurant: Restaurant) => {
      const decisionToDestinationMs = readDecisionDurationMs();
      void trackMetricEvent('destination_opened', {
        restaurant: restaurant.name,
        area: restaurant.area,
        mood,
        budget,
        decisionToDestinationMs,
      });
    },
    [budget, mood]
  );

  const handleRerollFromDetail = useCallback(() => {
    trackEvent('results_reroll', { mood, budget, source: 'detail' });
    void trackMetricEvent('reroll', { mood, budget, source: 'detail' });
    handleReroll();
    navigate('/results');
  }, [budget, handleReroll, mood, navigate]);

  return (
    <div className="min-h-dvh bg-bg text-text font-body">
      <div className="mx-auto max-w-[480px] min-h-dvh relative overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(255,136,84,0.45),_transparent_42%),radial-gradient(circle_at_90%_100%,_rgba(80,44,140,0.45),_transparent_40%),linear-gradient(160deg,_#301735_0%,_#1E153A_45%,_#151228_100%)] pt-[env(safe-area-inset-top)]">
        <div className={showBottomNav ? 'pb-[94px]' : ''}>
          <Routes>
            <Route
              path="/"
              element={
                <Landing
                  locationStatus={locationStatus}
                  onRequestLocation={requestLocation}
                  historyCount={history.length}
                  favouritesCount={favourites.length}
                  canInstall={canInstall}
                  onInstall={promptInstall}
                  onSurpriseMe={handleSurpriseMe}
                  onStartGroupMode={handleStartGroupMode}
                  isPlacesReady={isPlacesEnabled() || isSerpApiEnabled()}
                  trendingPicks={trendingPicks}
                  onTrackMetric={trackMetricEvent}
                  dailyState={dailyState}
                  lastSelection={lastSelection}
                  onRepeatLastSelection={handleRepeatLastSelection}
                  prefs={prefs}
                  onPrefsChange={handlePrefsChange}
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
                  isFav={isFav}
                  onToggleFav={toggleFavourite}
                  liveState={liveState}
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
                  onOpenDestination={handleOpenDestination}
                  isFav={selectedRestaurant ? isFav(selectedRestaurant) : false}
                  onToggleFav={toggleFavourite}
                />
              }
            />
            <Route
              path="/history"
              element={
                <History
                  history={history}
                  onClear={clearHistory}
                  user={user}
                  authLoading={authLoading}
                  onSignIn={signIn}
                  onSignUp={signUp}
                  onSignOut={signOut}
                />
              }
            />
            <Route
              path="/favourites"
              element={<Favourites favourites={favourites} onToggleFav={toggleFavourite} />}
            />
            <Route path="/premium" element={<Premium user={user} />} />
            <Route path="/metrics" element={<MetricsDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
