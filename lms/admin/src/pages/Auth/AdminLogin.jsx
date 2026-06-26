import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuArrowRight, LuChartNoAxesCombined, LuEye, LuEyeOff, LuGraduationCap, LuLoaderCircle, LuLockKeyhole, LuMail, LuMoon, LuShieldCheck, LuSun, LuUsers } from 'react-icons/lu';
import logo from '../../assets/logo.webp';
import { useTheme } from '../../context/ThemeProvider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const LEARNER_URL = import.meta.env.VITE_LEARNER_URL || 'http://localhost:3000';

const capabilities = [
  [LuUsers, 'Manage people', 'Approve and support learners and instructors.'],
  [LuGraduationCap, 'Operate learning', 'Publish courses, assessments, and credentials.'],
  [LuChartNoAxesCombined, 'Trust the data', 'Review live persisted analytics and audit history.'],
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter the administrator email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Login failed.');
      if (payload.user?.role !== 'admin') throw new Error('This account does not have administrator access.');
      localStorage.setItem('role', 'admin');
      localStorage.setItem('lms_token', payload.token);
      localStorage.setItem('lms_user', JSON.stringify(payload.user));
      navigate('/dashboard/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'We could not sign you in. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--admin-shell-bg)] text-[var(--admin-text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.16),transparent_38%),radial-gradient(circle_at_90%_90%,rgba(139,92,246,0.14),transparent_40%)]" aria-hidden />
      <div className="absolute right-5 top-5 z-20 flex gap-2">
        <button type="button" onClick={toggleTheme} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-primary)] shadow-sm" aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}>{resolvedTheme === 'dark' ? <LuSun size={17} /> : <LuMoon size={17} />}</button>
        <a href={LEARNER_URL} className="inline-flex h-10 items-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-xs font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]">Learner portal</a>
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1fr_480px] lg:px-10">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 shadow-[var(--admin-shadow-card)]"><img src={logo} alt="UptoSkills" className="h-9 w-auto" /><span className="text-sm font-semibold">Administration workspace</span></div>
          <p className="mt-12 text-sm font-semibold uppercase tracking-[0.18em] text-blue-500">Secure platform operations</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight">Run the LMS with clarity, control, and accountable data.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--admin-text-secondary)]">Manage learning operations from one protected workspace backed by live database records and persisted audit events.</p>
          <div className="mt-10 grid max-w-3xl gap-4 xl:grid-cols-3">{capabilities.map(([Icon, title, description]) => <article key={title} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[var(--admin-shadow-card)]"><div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/12 text-blue-500"><Icon size={19} /></div><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--admin-text-secondary)]">{description}</p></article>)}</div>
        </section>

        <section className="w-full rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-page-panel)] p-6 shadow-[var(--admin-shadow-lg)] sm:p-9">
          <div className="mb-8"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500"><LuShieldCheck size={15} />Administrator authentication</div><h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2><p className="mt-2 text-sm leading-6 text-[var(--admin-text-secondary)]">Use your approved administrator account to continue.</p></div>
          {error && <div role="alert" aria-live="polite" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-500">{error}</div>}
          <form onSubmit={login} className="space-y-5" noValidate>
            <label htmlFor="admin-email" className="block text-sm font-semibold">Email address<div className="relative mt-2"><LuMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={17} /><input id="admin-email" type="email" required autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="admin@example.com" className="h-12 w-full rounded-xl border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] pl-10 pr-4 text-sm text-[var(--admin-text-primary)] outline-none placeholder:text-[var(--admin-text-muted)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div></label>
            <label htmlFor="admin-password" className="block text-sm font-semibold"><span className="flex items-center justify-between">Password<a href={`${LEARNER_URL}/forgot-password`} className="text-xs font-semibold text-blue-500 hover:underline">Forgot password?</a></span><div className="relative mt-2"><LuLockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={17} /><input id="admin-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] pl-10 pr-12 text-sm text-[var(--admin-text-primary)] outline-none placeholder:text-[var(--admin-text-muted)] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text-primary)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <LuEyeOff size={17} /> : <LuEye size={17} />}</button></div></label>
            <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <><LuLoaderCircle className="animate-spin" size={17} />Signing in…</> : <>Sign in to admin<LuArrowRight size={17} /></>}</button>
          </form>
          <div className="mt-7 border-t border-[var(--admin-border)] pt-5"><p className="text-center text-xs leading-5 text-[var(--admin-text-muted)]">Access is restricted to approved administrators. Authentication and administrative actions are recorded for security.</p></div>
        </section>
      </div>
    </main>
  );
}
