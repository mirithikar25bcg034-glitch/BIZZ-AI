import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, UserPlus } from 'lucide-react';
import type { AuthScreenMode, UserRole } from '../types/support';
import { computePasskeyStrength } from '../utils/supportLogic';
import { SylvieHologram3D } from './SylvieHologram3D';

interface AuthPortalProps {
  mode: AuthScreenMode;
  selectedTier: UserRole;
  onModeChange: (mode: AuthScreenMode) => void;
  onSelectTier: (tier: UserRole) => void;
  onAuthenticate: (tier: UserRole, email: string, fullName?: string) => void;
  onNotify: (msg: string) => void;
}

const TIER_CARDS: Array<{
  id: UserRole;
  tierLabel: string;
  telemetry: string;
  title: string;
  description: string;
  statusNote: string;
  defaultEmail: string;
}> = [
  {
    id: 'customer',
    tierLabel: 'Tier 1 · Self-Service',
    telemetry: 'PING: 12ms',
    title: 'Customer Portal',
    description:
      'Resolve issues instantly, converse with 3D voice copilot Sylvie, and browse self-healing neural docs.',
    statusNote: 'Sylvie Copilot Active',
    defaultEmail: 'alex.chen@quantumreach.io',
  },
  {
    id: 'staff',
    tierLabel: 'Tier 2 · Operative Desk',
    telemetry: 'QUEUE: 12 TICKETS',
    title: 'Staff Copilot',
    description:
      'Live sentiment HUD, auto-drafted neural replies, spatial ticket triage, and 1-click escalations.',
    statusNote: 'Omni-Channel Stream',
    defaultEmail: 'elena.rostova@smartsupport.ai',
  },
  {
    id: 'admin',
    tierLabel: 'Tier 3 · Root Command',
    telemetry: 'NODES: 64/64 ONLINE',
    title: 'Admin Command',
    description:
      'Cluster orchestration, LLM guardrail enforcement, hallucination heatmaps, and audit telemetry.',
    statusNote: 'Root Key Vault',
    defaultEmail: 'root.ops@smartsupport.ai',
  },
];

export function AuthPortal({
  mode,
  selectedTier,
  onModeChange,
  onSelectTier,
  onAuthenticate,
  onNotify,
}: AuthPortalProps) {
  const [loginEmail, setLoginEmail] = useState('alex.chen@quantumreach.io');
  const [loginKey, setLoginKey] = useState('Quantum#2026!Secure');
  const [rememberSeed, setRememberSeed] = useState(true);

  const [signupName, setSignupName] = useState('Alex Chen');
  const [signupEmail, setSignupEmail] = useState('alex.chen@quantumreach.io');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('(555) 019-2834');
  const [signupKey, setSignupKey] = useState('Quantum#2026!Secure');
  const [signupConfirm, setSignupConfirm] = useState('Quantum#2026!Secure');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [formError, setFormError] = useState('');

  const passkeyStats = computePasskeyStrength(signupKey);

  const handleTierPick = (tier: UserRole) => {
    onSelectTier(tier);
    const found = TIER_CARDS.find((t) => t.id === tier);
    if (found) setLoginEmail(found.defaultEmail);
    setFormError('');
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setFormError('Please enter a valid corporate or operative email.');
      return;
    }
    if (loginKey.trim().length < 6) {
      setFormError('Quantum security key must be at least 6 characters.');
      return;
    }
    setFormError('');
    onAuthenticate(selectedTier, loginEmail.trim());
  };

  const handleSignupSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setFormError('Full legal name is required.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setFormError('Valid corporate or personal email is required.');
      return;
    }
    if (signupKey.length < 8) {
      setFormError('Biometric passkey must be at least 8 characters.');
      return;
    }
    if (signupKey !== signupConfirm) {
      setFormError('Passkey confirmation does not match.');
      return;
    }
    if (!agreedTerms) {
      setFormError('Please accept the Autonomous AI Protocols to continue.');
      return;
    }
    setFormError('');
    onNotify('Workspace provisioned! Sylvie AI calibrated for your organization.');
    onAuthenticate('customer', signupEmail.trim(), signupName.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 pb-14">
      <header className="w-full max-w-5xl flex items-center justify-between gap-8 px-5 py-3 rounded-2xl spatial-surface mb-8">
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center font-display font-extrabold text-slate-950 text-sm">
            S
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white">
            SmartSupport AI
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              mode === 'login' ? 'text-cyan-300 underline underline-offset-4' : ''
            }`}
          >
            Select Access Tier
          </button>
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              mode === 'signup' ? 'text-cyan-300 underline underline-offset-4' : ''
            }`}
          >
            Initiate Workspace
          </button>
        </nav>

        <div className="shrink-0">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                onModeChange('signup');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-cyan-400/25 bg-slate-900/90 text-slate-200 hover:border-cyan-400/50 transition-colors whitespace-nowrap shrink-0"
            >
              New Workspace
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                onModeChange('login');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 hover:brightness-105 transition-all whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {mode === 'login' ? (
        <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Access Tier Selection */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            <div className="mb-1">
              <p className="text-xs font-mono text-cyan-300 tracking-wide">
                Neural Gateway · 256-Bit Quantum Link
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5">
                Select Access Tier
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                Synchronize with Sylvie AI to initialize your personalized spatial support workspace.
              </p>
            </div>

            <div className="grid gap-3" role="radiogroup" aria-label="Workspace Access Tier">
              {TIER_CARDS.map((tier) => {
                const active = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleTierPick(tier.id)}
                    className={`w-full text-left rounded-xl p-4 border transition-all ${
                      active
                        ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                        : 'border-cyan-400/15 bg-slate-900/75 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-cyan-300">{tier.tierLabel}</span>
                      <span className="font-mono text-emerald-400 tabular-nums">
                        {tier.telemetry}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white mt-1.5 flex items-center justify-between">
                      <span>{tier.title}</span>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tier.description}</p>
                    <div className="text-[11px] font-mono text-slate-500 mt-2.5">
                      {tier.statusNote}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right Column: Biometric Credential Hub */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div className="spatial-holo-bg rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium text-cyan-300">Sylvie 3D Copilot</span>
                <span className="font-mono text-emerald-400">Standing By</span>
              </div>
              <SylvieHologram3D mood="idle" height={150} label="Sylvie AI Login Hologram" />
            </div>

            <form
              onSubmit={handleLoginSubmit}
              className="spatial-surface rounded-2xl p-5 flex flex-col gap-4"
              noValidate
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base text-white">
                  Biometric Credential Hub
                </h2>
                <span className="text-xs font-mono text-cyan-300 capitalize">{selectedTier}</span>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
                >
                  {formError}
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <label htmlFor="login-email">Authenticated User Email</label>
                  <span className="text-emerald-400">Verified</span>
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <label htmlFor="login-key">Quantum Security Key</label>
                  <button
                    type="button"
                    onClick={() => onNotify('Passkey hardware challenge ready.')}
                    className="text-cyan-300 hover:underline"
                  >
                    Passkey Login
                  </button>
                </div>
                <input
                  id="login-key"
                  type="password"
                  value={loginKey}
                  onChange={(e) => setLoginKey(e.target.value)}
                  className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
                <div className="flex justify-between font-mono text-[11px] text-cyan-300 mt-1.5">
                  <span>Entropy Gauge</span>
                  <span className="tabular-nums">99.8% · Hardened</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSeed}
                    onChange={(e) => setRememberSeed(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  Store Biometric Seed
                </label>
                <button
                  type="button"
                  onClick={() => onNotify('Recovery passkey beacon dispatched to verified device.')}
                  className="text-cyan-300 hover:underline"
                >
                  Forgot Key?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.28)] hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>Authenticate &amp; Enter Workspace</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="grid grid-cols-3 gap-2">
                {['Google', 'Okta SSO', 'GitHub'].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => onAuthenticate(selectedTier, loginEmail)}
                    className="py-2 px-3 rounded-lg border border-cyan-400/20 bg-slate-900/90 text-xs font-medium text-slate-300 hover:border-cyan-400/45 transition-colors whitespace-nowrap"
                  >
                    {provider}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-slate-400">
                Need an autonomous enterprise instance?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('signup')}
                  className="text-cyan-300 font-semibold hover:underline"
                >
                  Deploy New AI Workspace
                </button>
              </p>
            </form>
          </section>
        </main>
      ) : (
        /* Screen 9: Signup / Initiate Your AI Workspace */
        <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-cyan-300 tracking-wide">
                Neural Onboarding · Sylvie 3D Copilot Ready
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5">
                Initiate Your AI Workspace
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Join over 10,000+ forward-thinking teams using autonomous 3D spatial customer
                intelligence.
              </p>
            </div>

            <div className="spatial-holo-bg rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-cyan-300 font-medium">Realtime Voice</span>
                <span className="text-purple-300 font-medium">Sub-second Fixes</span>
              </div>

              <SylvieHologram3D mood="speaking" height={210} label="Sylvie Onboarding Hologram" />

              <div className="flex items-center justify-between text-xs pt-2 border-t border-cyan-400/15">
                <span className="font-mono text-slate-400">SOC-2 Type II</span>
                <span className="font-mono text-emerald-400">Sylvie Copilot Standing By</span>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Instant 14-day quantum trial · No credit card required
              </p>
            </div>
          </section>

          <section className="lg:col-span-7">
            <form
              onSubmit={handleSignupSubmit}
              className="spatial-surface rounded-2xl p-6 flex flex-col gap-4"
              noValidate
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Biometric Key Creation
                  </h2>
                  <p className="text-xs text-slate-400">Configure neural agent access token</p>
                </div>
                <span className="text-xs font-mono text-cyan-300">Level 1</span>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                    <label htmlFor="signup-name">Full Legal Name</label>
                    <span className="text-cyan-300">Required</span>
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                    <label htmlFor="signup-email">Corporate Email</label>
                    <span className="text-emerald-400">SSO Linked</span>
                  </div>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <label htmlFor="signup-phone">Verified Mobile Signal</label>
                  <span>2FA Node</span>
                </div>
                <div className="flex gap-2">
                  <input
                    aria-label="Country code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-20 rounded-xl bg-[#060a14] border border-slate-700/70 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    id="signup-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                    <label htmlFor="signup-key">Biometric Passkey</label>
                    <span>AES-256</span>
                  </div>
                  <input
                    id="signup-key"
                    type="password"
                    value={signupKey}
                    onChange={(e) => setSignupKey(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                    <label htmlFor="signup-confirm">Confirm Passkey</label>
                    <span
                      className={
                        signupKey === signupConfirm && signupKey.length > 0
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      {signupKey === signupConfirm && signupKey.length > 0
                        ? 'Matched'
                        : 'Pending Match'}
                    </span>
                  </div>
                  <input
                    id="signup-confirm"
                    type="password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[11px] text-cyan-300 mb-1.5">
                  <span>Entropy Shielding</span>
                  <span className="tabular-nums">
                    {passkeyStats.percent}% · {passkeyStats.label}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
                    style={{ width: `${passkeyStats.percent}%` }}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onNotify('Autonomous AI Protocols: SOC-2 Type II & SLA 99.95%')}
                    className="text-cyan-300 hover:underline"
                  >
                    Autonomous AI Protocols
                  </button>
                  , Neural Privacy Policy, and SLA guarantees.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.28)] hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>Create Account &amp; Activate Sylvie</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                {['Google', 'Okta ID', 'GitHub'].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() =>
                      onAuthenticate('customer', signupEmail.trim(), signupName.trim())
                    }
                    className="py-2 px-3 rounded-lg border border-cyan-400/20 bg-slate-900/90 text-xs font-medium text-slate-300 hover:border-cyan-400/45 transition-colors whitespace-nowrap"
                  >
                    {provider}
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Already holding an operative key?</span>
                <button
                  type="button"
                  onClick={() => onModeChange('login')}
                  className="text-cyan-300 font-semibold hover:underline"
                >
                  Sign In / Login
                </button>
              </p>
            </form>
          </section>
        </main>
      )}
    </div>
  );
}
