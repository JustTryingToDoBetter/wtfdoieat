export default function LocationPrompt({ status, onRequest }) {
  if (status === 'idle') {
    return <p className="text-center text-xs text-muted">Checking your location...</p>;
  }

  if (status === 'loading') {
    return <p className="text-center text-xs text-muted">Getting your location...</p>;
  }

  if (status === 'granted') {
    return (
      <p className="text-center text-xs text-green font-semibold">
        Location enabled. Showing nearby options first.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-center text-xs text-muted">Location is off. Picks may be less nearby.</p>
      <button
        onClick={onRequest}
        className="w-full max-w-[320px] inline-flex items-center justify-center gap-1.5 py-2.5 px-5 border border-border rounded-pill bg-surface text-muted font-body text-xs cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        Try location again
      </button>
    </div>
  );
}
