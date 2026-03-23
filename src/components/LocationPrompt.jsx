export default function LocationPrompt({ status, onRequest }) {
  if (status === 'idle') {
    return (
      <button
        onClick={onRequest}
        className="w-full max-w-[320px] inline-flex items-center justify-center gap-1.5 py-3 px-6 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        Enable location for nearby picks
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <p className="text-center text-xs text-muted">
        Getting your location...
      </p>
    );
  }

  if (status === 'granted') {
    return (
      <p className="text-center text-xs text-green font-semibold">
        Location enabled — we'll sort by distance
      </p>
    );
  }

  return (
    <p className="text-center text-xs text-muted">
      No worries — you'll get random picks
    </p>
  );
}
