import { useState } from 'react';

interface AuthPanelProps {
  onSignIn: (email: string, password: string) => Promise<unknown>;
  onSignUp: (email: string, password: string) => Promise<unknown>;
  loading?: boolean;
}

export default function AuthPanel({ onSignIn, onSignUp, loading }: AuthPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (mode: 'signin' | 'signup') => {
    setError('');
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    }
  };

  return (
    <div className="rounded-[16px] border border-white/20 bg-white/10 p-4 flex flex-col gap-3">
      <h3 className="font-display text-sm font-bold text-white">Sign In To Save History</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-[12px] bg-surface2 border border-border px-3 py-2 text-sm text-text"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-[12px] bg-surface2 border border-border px-3 py-2 text-sm text-text"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => submit('signin')}
          disabled={loading}
          className="flex-1 rounded-pill bg-gradient-to-r from-[#FF7A3E] to-[#FFB066] text-[#2A0D05] py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          Sign In
        </button>
        <button
          onClick={() => submit('signup')}
          disabled={loading}
          className="flex-1 rounded-pill border border-white/25 bg-white/10 text-white py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
