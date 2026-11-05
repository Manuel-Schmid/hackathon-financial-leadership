import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { ProfileGallery } from '@/components/profiles/ProfileGallery';
import { PageTitle } from '@/components/ui/atoms';
import { useProfiles } from '@/profiles/ProfileProvider';

function Account() {
  const { profile, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(profile.displayName);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setName(profile.displayName), [profile.displayName]);

  const saveName = () => {
    if (!name.trim() || name === profile.displayName) return;
    updateProfile({ displayName: name.trim() })
      .then(() => setMessage('Gespeichert.'))
      .catch((err: Error) => setMessage(err.message));
  };

  return (
    <section className="card flex flex-wrap items-end gap-3 p-5">
      <label className="min-w-[220px] flex-1 text-[13px] font-semibold">
        Anzeigename
        <input className="input mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} />
      </label>
      <button type="button" className="btn" onClick={() => signOut()}>Abmelden</button>
      {message && <p className="w-full text-[13px] text-muted">{message}</p>}
    </section>
  );
}

export function Profile() {
  const { user } = useAuth();
  const { error } = useProfiles();

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-4 p-4 lg:p-7">
      <PageTitle
        title="Profil"
        sub={user ? user.email : <>Gastmodus: Eigene Profile bleiben nur in diesem Browser. <Link className="underline" to="/login">Anmelden</Link></>}
      />
      {error && <p className="rounded-[10px] bg-[#FDECEA] px-4 py-2 text-[13px] text-bad">Eigene Profile konnten nicht geladen werden: {error}</p>}
      <ProfileGallery />
      {user && <Account />}
    </main>
  );
}
