import { FoodCategoryIcons, IconSparkles } from './AppIcons';

const SPRITES = [
  { Icon: FoodCategoryIcons.burger, top: '8%', left: '6%', delay: '0s' },
  { Icon: FoodCategoryIcons.pizza, top: '18%', right: '8%', delay: '0.6s' },
  { Icon: FoodCategoryIcons.healthy, top: '56%', left: '4%', delay: '1.2s' },
  { Icon: FoodCategoryIcons.comfort, top: '70%', right: '5%', delay: '1.8s' },
  { Icon: IconSparkles, top: '38%', right: '16%', delay: '2.2s' },
];

export default function FoodSprites() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SPRITES.map(({ Icon, top, left, right, delay }, idx) => (
        <div
          key={idx}
          className="absolute sprite-bubble"
          style={{ top, left, right, animationDelay: delay }}
        >
          <Icon className="w-5 h-5" />
        </div>
      ))}
    </div>
  );
}
