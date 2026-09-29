import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { inputCls, primaryBtn } from './adminUi';

export const AdminLogin: React.FC = () => {
  const { user, signIn, resetPassword, logout, authReady } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (!authReady) {
    return <p className="py-20 text-center text-xs text-stone-500">Checking your session…</p>;
  }

  // Signed in, but this account is not listed in the `admins` collection.
  if (user) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-5 text-center">
        <ShieldCheck className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-serif text-2xl text-[#1C1815]">Not an admin account</h3>
        <p className="text-xs text-stone-600">
          You are signed in as <strong>{user.email}</strong>, but this account does not have admin access.
          Sign out and sign in with the owner account.
        </p>
        <p className="text-[11px] text-stone-400">
          Owner: add this account's UID to the <code>admins</code> collection in Firebase to give it access (see SETUP.md).
        </p>
        <button onClick={logout} className={`${primaryBtn} w-full`}>Sign out</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Type your admin email above first, then press "Forgot password".');
      return;
    }
    try {
      await resetPassword(email);
      setInfo(`Password reset link sent to ${email}. Check your inbox (and spam folder).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[#FAF6ED] border border-[#C9A25D]/40 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-[#C9A25D]" />
        </div>
        <h3 className="font-serif text-2xl text-[#1C1815]">Admin Sign In</h3>
        <p className="text-xs font-sans text-[#8C7662]">Only the shop owner's account can open this panel.</p>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>}
      {info && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">{info}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-[#EAE3D8] shadow-sm">
        <label className="block">
          <span className="block text-xs font-medium text-stone-700 mb-1">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-stone-700 mb-1">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputCls}
          />
        </label>
        <button type="submit" disabled={busy} className={`${primaryBtn} w-full py-3.5`}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
        <button type="button" onClick={handleReset} className="w-full text-xs text-[#8C7662] hover:text-[#1C1815] underline cursor-pointer">
          Forgot password?
        </button>
      </form>
    </div>
  );
};
