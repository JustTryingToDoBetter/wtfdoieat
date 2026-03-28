import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: DiscoverIcon, exact: true },
  { to: '/flow', label: 'Pick', icon: PickIcon, exact: false },
  { to: '/favourites', label: 'Saved', icon: HeartIcon, exact: false },
  { to: '/history', label: 'History', icon: HistoryIcon, exact: false },
];

/** Routes where the bottom nav should NOT render */
const HIDDEN_ON = ['/detail', '/flow'];

export default function BottomNav() {
  const { pathname } = useLocation();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="mx-auto max-w-[480px] pointer-events-auto px-4"
        style={{
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="rounded-[28px] border border-white/25 bg-[#F7F3EF]/95 backdrop-blur px-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-stretch justify-around">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
              <NavLink key={to} to={to} end={exact} className="flex-1 select-none">
                {({ isActive }) => (
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isActive
                          ? 'linear-gradient(145deg, #FF7A3E, #FFB066)'
                          : 'transparent',
                        color: isActive ? '#2A0D05' : '#7D768A',
                      }}
                    >
                      <Icon
                        active={isActive}
                        className="w-[21px] h-[21px] transition-all duration-200"
                      />
                    </div>
                    <span
                      className="text-[0.6rem] font-bold uppercase tracking-wider transition-colors duration-200"
                      style={{ color: isActive ? '#E7652D' : '#7D768A' }}
                    >
                      {label}
                    </span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── SVG icon components ────────────────────────────────────────────────────────

function DiscoverIcon({ active, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M9 22V12h6v10"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PickIcon({ active, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.1 : 0}
      />
      <path
        d="M12 8v4l3 3"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ active, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} {...props}>
      <path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke="currentColor"
        strokeWidth={active ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon({ active, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
