import React, { useState } from 'react';
import { LogOut, Save, ShieldCheck, UserCircle } from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateAdminProfile, logout } = useLaundry();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const [firstName, ...lastNameParts] = currentUser.name.split(' ');
  const lastName = lastNameParts.join(' ');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = updateAdminProfile({
      firstName: String(form.get('firstName') || ''),
      lastName: String(form.get('lastName') || ''),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      role: String(form.get('role') || 'ADMIN') as 'ADMIN' | 'GERANT'
    });

    if (!result.success) {
      setSaved(false);
      setError(result.error || 'Impossible de modifier le profil.');
      return;
    }

    setError('');
    setSaved(true);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-600">Compte administrateur</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">Mon profil</h1>
        <p className="mt-1 text-sm text-slate-600">Gérez vos informations de connexion et votre rôle.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <UserCircle className="h-16 w-16 text-sky-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-sm text-slate-500">{currentUser.email}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {currentUser.role === 'ADMIN' ? 'Administrateur' : 'Gérant'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Prénom
            <input name="firstName" defaultValue={firstName} required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Nom
            <input name="lastName" defaultValue={lastName} required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Email de connexion
            <input name="email" type="email" defaultValue={currentUser.email} required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Nouveau mot de passe
            <input name="password" type="password" minLength={6} placeholder="Laisser vide pour conserver" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Rôle
            <select name="role" defaultValue={currentUser.role} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
              <option value="ADMIN">Administrateur</option>
              <option value="GERANT">Gérant</option>
            </select>
          </label>

          {error && <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>}
          {saved && <p className="sm:col-span-2 text-sm font-semibold text-emerald-600">Profil mis à jour avec succès.</p>}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
              <Save className="h-4 w-4" />
              Enregistrer
            </button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50">
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
