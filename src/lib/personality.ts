import type { BudgetValue, MoodValue, Personality } from '../types/domain';

const personalities: Record<string, Personality> = {
  'hangry-local': {
    title: 'The Gatsby Goblin',
    emoji: '\u{1F47A}',
    desc: "You inhale a full house steak masala before anyone's even ordered. The Golden Dish fears you.",
  },
  'comfort-local': {
    title: 'The Cape Flats Kid',
    emoji: '\u{1FAF6}',
    desc: "Koeksisters, gatsbys, and a cream soda. That's not dinner, that's therapy.",
  },
  'lazy-local': {
    title: 'The Corner Store Regular',
    emoji: '\u{1F6CB}\uFE0F',
    desc: 'You and the takeaway auntie are on a first-name basis. Maximum flavour, zero walking.',
  },
  'hangry-budget': {
    title: 'The Feral Goblin',
    emoji: '\u{1F479}',
    desc: 'Eastern Food Bazaar bunny chow at speed. No plate, no plan, no regrets.',
  },
  'lazy-budget': {
    title: 'The Horizontal Snacker',
    emoji: '\u{1F6CB}\uFE0F',
    desc: 'Penny Lane breakfasts and NY Slice at midnight. Horizontal eating champion.',
  },
  'treat-mid': {
    title: 'The Weekend Warrior',
    emoji: '\u{1F389}',
    desc: "Every meal is a celebration. Wednesday lunch? That's an EVENT.",
  },
  'comfort-budget': {
    title: 'The Emotional Eater',
    emoji: '\u{1F9F8}',
    desc: 'That bunny chow understands you better than therapy ever could.',
  },
  'foodie-splurge': {
    title: 'The Flavour Chaser',
    emoji: '\u{1F525}',
    desc: 'Your phone eats first. Every Bree Street spot knows your face.',
  },
  'healthy-mid': {
    title: 'The Conscious One',
    emoji: '\u{1F96C}',
    desc: "Kloof St health spots are your office. You meal prep and you're proud.",
  },
  'adventurous-baller': {
    title: 'The Explorer',
    emoji: '\u{1F5FA}\uFE0F',
    desc: 'No-menu tasting? Dinner with strangers? Already booking.',
  },
  'social-mid': {
    title: 'The Connector',
    emoji: '\u{1F91D}',
    desc: 'You curate group experiences. The group chat respects you.',
  },
  'treat-baller': {
    title: 'The Main Character',
    emoji: '\u{1F451}',
    desc: 'Sunset at Utopia, tasting at Belly of the Beast. Your life is a movie.',
  },
  'hangry-mid': {
    title: 'The Apex Predator',
    emoji: '\u{1F988}',
    desc: "When hunger hits, smash burgers don't stand a chance.",
  },
  'foodie-baller': {
    title: 'The Connoisseur',
    emoji: '\u{1F377}',
    desc: "Wine pairings, trust-the-chef menus. You don't eat, you experience.",
  },
  'lazy-mid': {
    title: 'The Luxury Sloth',
    emoji: '\u{1F9A5}',
    desc: 'JARRYDS brunch then nap. Peak performance achieved.',
  },
  'comfort-mid': {
    title: 'The Cozy Soul',
    emoji: '\u{1FAD6}',
    desc: 'Ramen on a cold day, warm bread, dim lights. You get it.',
  },
  'social-splurge': {
    title: 'The Host',
    emoji: '\u{1F942}',
    desc: 'Your friends trust you with the reservation. You always deliver.',
  },
  'adventurous-mid': {
    title: 'The Culture Vulture',
    emoji: '\u{1F985}',
    desc: 'Mama Africa, Bo-Kaap, Langa eats - your palate has no borders.',
  },
  'adventurous-local': {
    title: 'The Heritage Hunter',
    emoji: '\u{1F3DB}\uFE0F',
    desc: "Cape Malay curry at Faeeza's, gatsby at Super Fisheries. You eat history.",
  },
  'treat-splurge': {
    title: 'The Self-Care CEO',
    emoji: '\u2728',
    desc: 'Victorian gardens and cocktail menus. You deserve it.',
  },
  default: {
    title: 'The Chaotic Eater',
    emoji: '\u{1F3B2}',
    desc: "Your eating habits confuse algorithms. Cape Town can't predict you.",
  },
};

export function getPersonality(mood: MoodValue, budget: BudgetValue): Personality {
  return personalities[`${mood}-${budget}`] || personalities.default;
}
