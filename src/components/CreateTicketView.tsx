import { useState, type FormEvent } from 'react';
import { ArrowRight, Paperclip, Sparkles } from 'lucide-react';
import { TICKET_PRESETS } from '../data/seedData';
import type { TicketPriority } from '../types/support';
import type { CreateTicketInput } from '../utils/supportLogic';
import { computeTicketDiagnostic } from '../utils/supportLogic';
import { SylvieHologram3D } from './SylvieHologram3D';

interface CreateTicketViewProps {
  customerName: string;
  onSubmitTicket: (input: CreateTicketInput) => void;
  onCancel: () => void;
}

const SEVERITY_OPTIONS: Array<{ value: TicketPriority; label: string }> = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High (15m)' },
  { value: 'Urgent', label: 'Urgent (5m)' },
];

export function CreateTicketView({
  customerName,
  onSubmitTicket,
  onCancel,
}: CreateTicketViewProps) {
  const [subject, setSubject] = useState(
    'Cluster pod failure in us-east-1 under high memory spike'
  );
  const [category, setCategory] = useState('Infrastructure & Cloud (K8s/Edge)');
  const [environment, setEnvironment] = useState('Production Cluster (AWS us-east-1)');
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [logs, setLogs] = useState(
    'Node crash observed on k8s-worker-east-09 with exit code 137 (OOMKilled). Container memory exceeded 5GiB allocation limit during peak automated indexing at 14:22:04 UTC.'
  );
  const [attachments, setAttachments] = useState<string[]>([
    'crash-log-2026.log',
    'k8s-metrics.png',
  ]);
  const [error, setError] = useState('');

  const diagnostic = computeTicketDiagnostic(subject, logs, priority);

  const applyPreset = (preset: (typeof TICKET_PRESETS)[number]) => {
    setSubject(preset.subject);
    setCategory(preset.category);
    setPriority(preset.priority);
    setLogs(preset.logs);
    setError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 5) {
      setError('Please enter a descriptive incident summary (at least 5 characters).');
      return;
    }
    setError('');
    onSubmitTicket({
      subject: subject.trim(),
      category,
      environment,
      priority,
      logs: logs.trim(),
      customerName,
      attachments,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-mono text-cyan-300">Neural Triage Protocol</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Submit a Neural Support Request
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-8 spatial-surface rounded-2xl p-6 flex flex-col gap-4"
          noValidate
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-display font-bold text-base text-white">
              Ticket Diagnostics &amp; Parameters
            </h2>
            <span className="font-mono text-[11px] text-slate-400">Auto-Embedding Active</span>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
            >
              {error}
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
              <label htmlFor="new-ticket-subject">Incident Summary / Subject</label>
              <span>Presets available</span>
            </div>
            <input
              id="new-ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              required
            />
            <div className="flex flex-wrap gap-2 mt-2.5">
              {TICKET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-slate-900/90 text-xs font-medium text-slate-300 hover:border-cyan-400/45 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-ticket-category"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Incident Category
              </label>
              <select
                id="new-ticket-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option>Infrastructure &amp; Cloud (K8s/Edge)</option>
                <option>Identity &amp; Zero-Trust Auth</option>
                <option>API &amp; Webhook Telemetry</option>
                <option>Billing &amp; Seat Licensing</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="new-ticket-env"
                className="block text-xs font-medium text-slate-400 mb-1.5"
              >
                Target Environment
              </label>
              <select
                id="new-ticket-env"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option>Production Cluster (AWS us-east-1)</option>
                <option>Staging Mesh (eu-central-1)</option>
                <option>Sandbox Node</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
              <span>Severity &amp; Target SLA Level</span>
              <span className="text-cyan-300">Pre-calibrated by Sylvie</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Ticket Severity">
              {SEVERITY_OPTIONS.map((opt) => {
                const active = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPriority(opt.value)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-cyan-400/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
              <label htmlFor="new-ticket-logs">Incident Diagnostics &amp; Logs</label>
              <span>Syntax Aware</span>
            </div>
            <textarea
              id="new-ticket-logs"
              rows={5}
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 p-3.5 font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <Paperclip className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
              {attachments.map((file) => (
                <span key={file} className="text-slate-300">
                  {file}
                </span>
              ))}
              <button
                type="button"
                onClick={() =>
                  setAttachments((prev) =>
                    prev.includes('heap-trace.json') ? prev : [...prev, 'heap-trace.json']
                  )
                }
                className="text-cyan-300 hover:underline ml-1"
              >
                + Attach Trace
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:border-slate-500 transition-colors"
              >
                Discard Draft
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <span>Submit Ticket to Neural Mesh</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>

        {/* Right Diagnostic Column */}
        <aside className="xl:col-span-4 flex flex-col gap-5">
          <div className="spatial-holo-bg rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Sylvie Pre-Triage
              </span>
              <span className="font-mono text-emerald-400">
                {diagnostic.autoRepairReady ? 'Auto-Repair Ready' : 'Standard Triage'}
              </span>
            </div>
            <SylvieHologram3D
              mood={diagnostic.riskIndex >= 80 ? 'alert' : 'thinking'}
              height={165}
              label="Sylvie Pre-Triage Hologram"
            />
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzed your diagnostic payload. Recommended playbook:{' '}
              <strong className="text-white">{diagnostic.matchedKnowledge[0]}</strong>.
            </p>
          </div>

          <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-white">
                Live Neural Diagnostic
              </h2>
              <span
                className={`font-mono text-xs font-bold tabular-nums ${
                  diagnostic.riskIndex >= 80 ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                Risk: {diagnostic.riskIndex}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
                <div className="font-mono text-[10px] text-slate-400">RISK INDEX</div>
                <div className="font-mono text-2xl font-extrabold text-amber-400 mt-1 tabular-nums">
                  {diagnostic.riskIndex}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
                <div className="font-mono text-[10px] text-slate-400">TRIAGE ETA</div>
                <div className="font-mono text-2xl font-extrabold text-cyan-300 mt-1 tabular-nums">
                  {diagnostic.triageEta}
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] text-slate-400 mb-2">
                MATCHED NEURAL KNOWLEDGE
              </div>
              <div className="flex flex-col gap-2">
                {diagnostic.matchedKnowledge.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-xs text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
