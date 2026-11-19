import { useState, type FormEvent } from 'react';
import { Copy, Eye, EyeOff, KeyRound, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import type { AppSettings, OperatorProfile } from '../types/support';
import { maskApiKey } from '../utils/supportLogic';

interface ProfileSettingsViewProps {
  profile: OperatorProfile;
  settings: AppSettings;
  onSaveProfile: (nextProfile: OperatorProfile) => void;
  onUpdateSettings: (nextSettings: AppSettings) => void;
  onRotateKey: () => void;
  onResetDemo: () => void;
  onNotify: (msg: string) => void;
}

export function ProfileSettingsView({
  profile,
  settings,
  onSaveProfile,
  onUpdateSettings,
  onRotateKey,
  onResetDemo,
  onNotify,
}: ProfileSettingsViewProps) {
  const [draft, setDraft] = useState<OperatorProfile>(profile);
  const [revealKey, setRevealKey] = useState(false);

  const initials =
    draft.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('') || 'ER';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveProfile(draft);
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(settings.apiKey);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
    onNotify('API key copied to clipboard.');
  };

  const toggleSetting = (key: keyof Omit<AppSettings, 'apiKey'>) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Header Banner */}
      <section className="spatial-surface rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center font-display font-extrabold text-slate-950 text-lg shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl font-extrabold text-white">{draft.fullName}</h1>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Quantum Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {draft.designation} · Zero-Trust Hardware Key Enforced
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onResetDemo}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:border-slate-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Demo Data</span>
          </button>
          <button
            type="button"
            onClick={onRotateKey}
            className="px-3.5 py-2 rounded-xl border border-cyan-400/25 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
            <span>Rotate Keys</span>
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save Changes</span>
          </button>
        </div>
      </section>

      {/* Profile + Keys */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-display font-bold text-base text-white">Neural Operator Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Full Operator Name
              </label>
              <input
                id="profile-name"
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="profile-role"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Role / Designation
              </label>
              <input
                id="profile-role"
                value={draft.designation}
                onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
                className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Operator Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="profile-tz"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Operational Timezone
              </label>
              <input
                id="profile-tz"
                value={draft.timezone}
                onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-bio"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Operator Bio / Neural Context
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-white">
              Security &amp; Entropy Keys
            </h2>
            <span className="font-mono text-xs text-cyan-300">AES-256-GCM</span>
          </div>

          <div>
            <label
              htmlFor="active-api-key"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Active Neural API Key
            </label>
            <div className="flex gap-2">
              <input
                id="active-api-key"
                readOnly
                value={maskApiKey(settings.apiKey, revealKey)}
                className="flex-1 rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2 font-mono text-xs text-cyan-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setRevealKey((r) => !r)}
                className="px-3 py-2 rounded-xl border border-cyan-400/20 bg-slate-900 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-1.5"
              >
                {revealKey ? (
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{revealKey ? 'Hide' : 'Reveal'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3 py-2 rounded-xl border border-cyan-400/20 bg-slate-900 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-white">FIDO2 Passkey #1</div>
              <div className="text-xs text-slate-400">
                MacBook Pro TouchID · Last used 4m ago
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-semibold">Active</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-white">YubiKey 5C Quantum Node</div>
              <div className="text-xs text-slate-400">Hardware backup · Enforced</div>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-semibold">Bound</span>
          </div>
        </div>
      </section>

      {/* Matrix Toggles */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-display font-bold text-base text-white">
            Sylvie AI &amp; Spatial HUD Matrix
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm text-white">
                Spatial Voice &amp; Hologram HUD
              </div>
              <div className="text-xs text-slate-400">
                Enable real-time 3D avatar cues during triage
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.spatialHudEnabled}
              aria-label="Toggle Spatial Voice & Hologram HUD"
              onClick={() => toggleSetting('spatialHudEnabled')}
              className={`w-11 h-6 rounded-full border transition-colors relative shrink-0 ${
                settings.spatialHudEnabled
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  settings.spatialHudEnabled
                    ? 'translate-x-5 bg-cyan-300'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm text-white">Auto-Draft Neural Replies</div>
              <div className="text-xs text-slate-400">
                Pre-compose responses for Tier-2 &amp; Tier-3 tickets
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoDraftReplies}
              aria-label="Toggle Auto-Draft Neural Replies"
              onClick={() => toggleSetting('autoDraftReplies')}
              className={`w-11 h-6 rounded-full border transition-colors relative shrink-0 ${
                settings.autoDraftReplies
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  settings.autoDraftReplies
                    ? 'translate-x-5 bg-cyan-300'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-display font-bold text-base text-white">
            Event Beacons &amp; Zero-Trust PII Shield
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm text-white">
                OOMKilled &amp; SLA Breach Alerts
              </div>
              <div className="text-xs text-slate-400">
                Instant telemetry ping on high-severity spikes
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.slaBreachAlerts}
              aria-label="Toggle OOMKilled & SLA Breach Alerts"
              onClick={() => toggleSetting('slaBreachAlerts')}
              className={`w-11 h-6 rounded-full border transition-colors relative shrink-0 ${
                settings.slaBreachAlerts
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  settings.slaBreachAlerts
                    ? 'translate-x-5 bg-cyan-300'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm text-white">Auto-Redact PII &amp; Tokens</div>
              <div className="text-xs text-slate-400">
                Scrub secrets before LLM prompt embedding
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoRedactPii}
              aria-label="Toggle Auto-Redact PII & Tokens"
              onClick={() => toggleSetting('autoRedactPii')}
              className={`w-11 h-6 rounded-full border transition-colors relative shrink-0 ${
                settings.autoRedactPii
                  ? 'bg-cyan-400/30 border-cyan-400'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  settings.autoRedactPii
                    ? 'translate-x-5 bg-cyan-300'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
