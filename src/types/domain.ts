export type MoodValue =
  | 'hangry'
  | 'lazy'
  | 'treat'
  | 'healthy'
  | 'comfort'
  | 'foodie'
  | 'adventurous'
  | 'social';

export type BudgetValue = 'local' | 'budget' | 'mid' | 'splurge' | 'baller';

export interface MoodOption {
  emoji: string;
  label: string;
  value: MoodValue;
  color: string;
  gradient: string;
}

export interface BudgetOption {
  emoji: string;
  label: string;
  value: BudgetValue;
  desc: string;
}

export interface Restaurant {
  name: string;
  area: string;
  vibe: string;
  rating: number;
  knownFor: string;
  price: BudgetValue;
  moods: MoodValue[];
  lat: number;
  lng: number;
  placeId: string;
  _dist?: number;
  _fromApi?: boolean;
  _provider?: string;
  _openStatus?: 'open' | 'closed' | 'unknown';
  _hoursText?: string | null;
}

export interface Personality {
  title: string;
  emoji: string;
  desc: string;
}

export interface LiveState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  count: number;
  mode: 'static' | 'live';
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface UserPreferences {
  onlyOpenNow: boolean;
  maxDistanceKm: number;
  dietary: 'any' | 'halaal' | 'vegan' | 'vegetarian';
}

export interface LastSelection {
  mood: MoodValue | null;
  budget: BudgetValue | null;
  at: number;
}

export interface DailyLoopState {
  lastVisitDay: string | null;
  streak: number;
  totalDays: number;
}
