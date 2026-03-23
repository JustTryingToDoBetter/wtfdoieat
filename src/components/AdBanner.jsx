export default function AdBanner({ size = 'banner' }) {
  return (
    <div
      className={`bg-gradient-to-br from-surface to-surface2 border border-dashed border-border rounded-sm text-center opacity-70 my-2 ${
        size === 'large' ? 'py-7 px-4' : 'py-3.5 px-4'
      }`}
    >
      <div className="text-[10px] uppercase tracking-[2px] text-muted/60 mb-1">
        sponsored
      </div>
      <div className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-muted/80 font-medium`}>
        {size === 'large'
          ? 'Your ad here — reach hungry Cape Town locals'
          : 'Ad placement'}
      </div>
    </div>
  );
}
