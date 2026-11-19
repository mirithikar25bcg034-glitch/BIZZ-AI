import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, Trash2, Volume2, VolumeX } from 'lucide-react';
import type { ChatMessage } from '../types/support';
import { SylvieHologram3D, type SylvieMood } from './SylvieHologram3D';

interface SylvieChatbotViewProps {
  messages: ChatMessage[];
  spatialAudioEnabled: boolean;
  onToggleAudio: () => void;
  onSendQuery: (prompt: string) => void;
  onClearThread: () => void;
}

const SUGGESTED_QUERIES = [
  'Why did k8s pod worker-alpha-09 exit with 137 OOMKilled?',
  'Generate an automated rollback PR for ingress-nginx v1.9',
  "Summarize today's urgent enterprise SLA escalations",
];

function playSubtleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(792, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.23);
    window.setTimeout(() => ctx.close(), 300);
  } catch {
    // Ignore audio context block in automated headless environments
  }
}

export function SylvieChatbotView({
  messages,
  spatialAudioEnabled,
  onToggleAudio,
  onSendQuery,
  onClearThread,
}: SylvieChatbotViewProps) {
  const [input, setInput] = useState('');
  const [mood, setMood] = useState<SylvieMood>('speaking');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  const submitPrompt = (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;
    setMood('thinking');
    if (spatialAudioEnabled) playSubtleChime();
    onSendQuery(trimmed);
    window.setTimeout(() => setMood('speaking'), 450);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    submitPrompt(text);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="spatial-surface rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-lg text-white">
            Sylvie AI Assistant · Neural Stream Omni
          </h1>
          <p className="text-xs text-slate-400">
            Empathy calibration 98% · Real-time cluster diagnostics &amp; autonomous remediation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAudio}
            aria-pressed={spatialAudioEnabled}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              spatialAudioEnabled
                ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                : 'border-cyan-400/20 bg-slate-900/90 text-slate-300 hover:border-cyan-400/45'
            }`}
          >
            {spatialAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Spatial Audio {spatialAudioEnabled ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={onClearThread}
            className="px-3.5 py-2 rounded-xl border border-cyan-400/20 bg-slate-900/90 text-xs font-semibold text-slate-300 hover:border-cyan-400/45 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear Thread</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: 3D Hologram + Suggested Queries */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="spatial-holo-bg rounded-2xl p-5 flex flex-col items-center gap-3">
            <SylvieHologram3D mood={mood} height={225} label="Sylvie AI Assistant 3D Hologram" />
            <div className="text-center">
              <div className="font-display font-extrabold text-lg text-white">Sylvie AI</div>
              <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                State: <span className="text-cyan-300 capitalize">{mood}</span> · 98% Empathy
              </div>
            </div>
          </div>

          <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-2.5">
            <h2 className="font-display font-bold text-sm text-white mb-1">
              Suggested Neural Queries
            </h2>
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => submitPrompt(q)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-cyan-400/20 bg-slate-900/90 text-xs text-slate-200 hover:border-cyan-400/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </aside>

        {/* Right: Chat Stream */}
        <div className="lg:col-span-8 spatial-surface rounded-2xl p-5 flex flex-col justify-between min-h-[520px] gap-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <h2 className="font-display font-bold text-base text-white">
                Active Thread: Pod Triage &amp; Remediation
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => submitPrompt('Analyze Active Incidents')}
                  className="px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-slate-900 text-xs font-semibold text-slate-200 hover:border-cyan-400/45 transition-colors whitespace-nowrap"
                >
                  Analyze Incidents
                </button>
                <button
                  type="button"
                  onClick={() => submitPrompt('Run Sandbox Simulation')}
                  className="px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-slate-900 text-xs font-semibold text-slate-200 hover:border-cyan-400/45 transition-colors whitespace-nowrap"
                >
                  Sandbox Sim
                </button>
              </div>
            </div>

            <div ref={chatScrollRef} className="flex flex-col gap-3 max-h-[390px] overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-4 ${
                    msg.role === 'user'
                      ? 'border-purple-400/35 bg-purple-500/10 ml-8'
                      : 'border-cyan-400/30 bg-[#0c182a]/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px] mb-1.5">
                    <span className={msg.role === 'ai' ? 'text-cyan-300 font-semibold' : 'text-purple-300 font-semibold'}>
                      {msg.author}
                    </span>
                    <span className="text-slate-400">
                      {msg.timestamp}
                      {msg.confidence ? ` · ${msg.confidence} Confidence` : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{msg.content}</p>
                  {msg.telemetryCallout && (
                    <div className="mt-2.5 rounded-lg border border-cyan-400/20 bg-[#060913] px-3 py-2 font-mono text-[11px] text-amber-300">
                      {msg.telemetryCallout}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2.5 pt-2 border-t border-slate-800">
            <label htmlFor="sylvie-chat-input" className="sr-only">
              Message Sylvie AI Assistant
            </label>
            <input
              id="sylvie-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sylvie anything, paste error logs, or type '/' for commands..."
              className="flex-1 rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
