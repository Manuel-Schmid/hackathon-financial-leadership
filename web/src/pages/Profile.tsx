import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { PageTitle } from '@/components/ui/atoms';
import type { InvestorProfile } from '@/data/types';
import { PROFILE_IDS } from '@/lib/config';
import { profileLabel } from '@/lib/weighting';

export function Profile() {
  const { user, loading, profile, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(profile.displayName);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setName(profile.displayName), [profile.displayName]);

  if (!user && !loading) return <Navigate to="/login" replace />;

  const save = (patch: { displayName?: string; investorProfile?: InvestorProfile }) =>
    updateProfile(patch)
      .then(() => setMessage('Gespeichert.'))
      .catch((err: Error) => setMessage(err.message));

  return (
    <main className="mx-auto w-full max-w-[520px] space-y-4 p-4 lg:p-7">
      <PageTitle title="Profil" sub={user?.email} />
      <div className="card space-y-3 p-6">
        <label className="block text-[13px] font-semibold">
          Anzeigename
          <input className="input mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && name !== profile.displayName && save({ displayName: name.trim() })} />
        </label>
        <label className="block text-[13px] font-semibold">
          Standard-Anlegerprofil
          <select className="input mt-1 w-full cursor-pointer" value={profile.investorProfile} onChange={(e) => save({ investorProfile: e.target.value as InvestorProfile })}>
            {PROFILE_IDS.map((id) => <option key={id} value={id}>{id} ({profileLabel(id)})</option>)}
          </select>
        </label>
        {message && <p className="text-[13px] text-muted">{message}</p>}
        <button type="button" className="btn w-full" onClick={() => signOut()}>Abmelden</button>
      </div>
    </main>
  );
}
