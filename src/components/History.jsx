import { useNavigate } from 'react-router-dom';
import AdBanner from './AdBanner';

export default function History({ history, onClear }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col p-5 pb-[max(20px,env(safe-area-inset-bottom))] gap-4 animate-fadeUp">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold">📜 Past Picks</h2>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 border border-border rounded-pill bg-transparent text-muted font-body text-sm cursor-pointer select-none"
        >
          ✕
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-3">🍽️</div>
          <p>No picks yet!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {history.map((h, i) => (
            <div
              key={h.ts || i}
              className="flex items-center gap-3 py-3.5 px-4 bg-surface border border-border rounded-[14px]"
            >
              <div className="text-[1.4rem] shrink-0">{h.pers?.emoji || '🍽️'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{h.name}</div>
                <div className="text-xs text-muted">
                  {h.area} · {h.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <button
          onClick={onClear}
          className="self-center inline-flex items-center gap-1.5 py-3 px-6 border border-red-500/15 rounded-pill bg-transparent text-red-400 font-body text-sm cursor-pointer select-none"
        >
          Clear All
        </button>
      )}

      <AdBanner />
    </div>
  );
}
