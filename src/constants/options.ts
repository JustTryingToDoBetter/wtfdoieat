import type { BudgetOption, BudgetValue, MoodOption, MoodValue } from '../types/domain';

export const PRICE_TIERS: BudgetValue[] = ['local', 'budget', 'mid', 'splurge', 'baller'];

export const MOODS: MoodOption[] = [
  {
    emoji: '\u{1F624}',
    label: 'Hangry',
    value: 'hangry',
    color: '#FF4D4D',
    gradient: 'linear-gradient(135deg, #FF4D4D, #FF8F5E)',
  },
  {
    emoji: '\u{1F634}',
    label: 'Lazy',
    value: 'lazy',
    color: '#A78BFA',
    gradient: 'linear-gradient(135deg, #A78BFA, #7F5AF0)',
  },
  {
    emoji: '\u{1F973}',
    label: 'Treat Me',
    value: 'treat',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #F97316)',
  },
  {
    emoji: '\u{1F957}',
    label: 'Healthy',
    value: 'healthy',
    color: '#34D399',
    gradient: 'linear-gradient(135deg, #34D399, #059669)',
  },
  {
    emoji: '\u{1F9F8}',
    label: 'Comfort',
    value: 'comfort',
    color: '#FB923C',
    gradient: 'linear-gradient(135deg, #FB923C, #F59E0B)',
  },
  {
    emoji: '\u{1F9D1}\u200D\u{1F373}',
    label: 'Foodie',
    value: 'foodie',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899, #E53170)',
  },
  {
    emoji: '\u{1F30D}',
    label: 'Adventure',
    value: 'adventurous',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
  },
  {
    emoji: '\u{1F389}',
    label: 'Social',
    value: 'social',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  },
];

export const BUDGETS: BudgetOption[] = [
  {
    emoji: '\u{1F3E0}',
    label: 'Local Takeaway',
    value: 'local',
    desc: 'Gatsby, fish & chips, koeksisters',
  },
  {
    emoji: '\u{1FA99}',
    label: 'Under R100',
    value: 'budget',
    desc: 'Solid meals, no stress',
  },
  {
    emoji: '\u{1F4B5}',
    label: 'R100-250',
    value: 'mid',
    desc: 'Proper sit-down vibes',
  },
  {
    emoji: '\u{1F4B8}',
    label: 'R250-500',
    value: 'splurge',
    desc: 'Treat yourself',
  },
  {
    emoji: '\u{1F48E}',
    label: 'R500+',
    value: 'baller',
    desc: 'Full experience, no limits',
  },
];

export const MOOD_VALUES: MoodValue[] = MOODS.map((m) => m.value);
export const BUDGET_VALUES: BudgetValue[] = BUDGETS.map((b) => b.value);
