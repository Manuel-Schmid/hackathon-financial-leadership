import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { EmptyState } from '@/components/ui/atoms';

export function Login() {
  const { available, user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  if (!available) {
    return (
      <EmptyState title="Gastmodus">
        Login ist nicht verfügbar, weil keine Supabase-Verbindung eingerichtet ist. Watchlists werden in diesem Browser gespeichert.
      </EmptyState>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await signIn(email, password);
      else await signUp(email, password, name.trim() || email.split('@')[0]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[420px] p-4 lg:p-7">
      <form onSubmit={submit} className="card space-y-3 p-6">
        <h1 className="font-title text-xl font-semibold">{mode === 'login' ? 'Anmelden' : 'Registrieren'}</h1>
        {mode === 'register' && (
          <label className="block text-[13px] font-semibold">
            Name
            <input className="input mt-1 w-full" value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label className="block text-[13px] font-semibold">
          E-Mail
          <input type="email" required className="input mt-1 w-full" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-[13px] font-semibold">
          Passwort
          <input
            type="password"
            required
            minLength={6}
            className="input mt-1 w-full"
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-[13px] text-bad">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        </button>
        <button type="button" className="w-full text-[13px] font-semibold text-muted hover:text-text" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
        </button>
      </form>
    </main>
  );
}
