import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Download, Send, Trash2, Zap } from 'lucide-react';
import type { SupportTicket, TicketStageIndex } from '../types/support';

interface TicketTrackingViewProps {
  ticket: SupportTicket;
  allTickets: SupportTicket[];
  onSelectTicket: (ticketId: string) => void;
  onSendMessage: (ticketId: string, content: string) => void;
  onAdvanceStage: (ticketId: string, targetStage?: TicketStageIndex) => void;
  onRunSreTrigger: (ticketId: string, actionName: string) => void;
  onDownloadBundle: (ticket: SupportTicket) => void;
}

const STAGES: Array<{ index: TicketStageIndex; label: string; detail: string }> = [
  { index: 0, label: '1. OPEN', detail: 'Ingested' },
  { index: 1, label: '2. ASSIGNED', detail: 'Triaged' },
  { index: 2, label: '3. IN PROGRESS', detail: 'SRE + Sylvie' },
  { index: 3, label: '4. RESOLVED', detail: 'Patched' },
  { index: 4, label: '5. CLOSED', detail: 'Verified' },
];

export function TicketTrackingView({
  ticket,
  allTickets,
  onSelectTicket,
  onSendMessage,
  onAdvanceStage,
  onRunSreTrigger,
  onDownloadBundle,
}: TicketTrackingViewProps) {
  const [messageInput, setMessageInput] = useState('');
  const threadScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [ticket.thread.length, ticket.id]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    onSendMessage(ticket.id, trimmed);
    setMessageInput('');
  };

  const priorityColor =
    ticket.priority === 'Urgent' || ticket.priority === 'High'
      ? 'text-rose-400'
      : ticket.priority === 'Medium'
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className="flex flex-col gap-5">
      {/* Ticket Header */}
      <section className="spatial-surface rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={`font-semibold ${priorityColor}`}>{ticket.priority} Priority</span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-cyan-300 font-semibold">{ticket.id}</span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-400">{ticket.status}</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-1.5">
            {ticket.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <label htmlFor="tracking-ticket-select" className="sr-only">
            Switch tracked ticket
          </label>
          <select
            id="tracking-ticket-select"
            value={ticket.id}
            onChange={(e) => onSelectTicket(e.target.value)}
            className="rounded-xl bg-[#060a14] border border-cyan-400/20 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {allTickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onDownloadBundle(ticket)}
            className="px-3.5 py-2 rounded-xl border border-cyan-400/25 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download Bundle</span>
          </button>
        </div>
      </section>

      {/* Lifecycle Milestone Bar */}
      <section className="spatial-surface rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <h2 className="font-display font-bold text-base text-white">
            Lifecycle Milestone Progression
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-emerald-400 tabular-nums">
              {ticket.aiConfidence}% AI Confidence
            </span>
            {ticket.stageIndex < 4 && (
              <button
                type="button"
                onClick={() => onAdvanceStage(ticket.id)}
                className="px-3 py-1 rounded-lg bg-cyan-400/15 border border-cyan-400/35 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/25 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Advance Stage</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {STAGES.map((stage) => {
            const isDone = stage.index < ticket.stageIndex;
            const isCurrent = stage.index === ticket.stageIndex;
            return (
              <button
                key={stage.index}
                type="button"
                onClick={() => onAdvanceStage(ticket.id, stage.index)}
                className={`text-left rounded-xl p-3 border transition-all ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_14px_rgba(34,211,238,0.14)]'
                    : isDone
                    ? 'border-emerald-400/35 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/65 hover:border-slate-700'
                }`}
              >
                <div
                  className={`font-mono text-[10px] ${
                    isCurrent ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {stage.index === 1 ? ticket.operator : stage.detail}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Thread + SRE Triggers */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 spatial-surface rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-bold text-base text-white">
                Incident Dialogue &amp; Execution Stream
              </h2>
              <span className="font-mono text-xs text-cyan-300">
                {ticket.thread.length} Entries
              </span>
            </div>

            <div ref={threadScrollRef} className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
              {ticket.thread.map((msg) => {
                const containerClass =
                  msg.role === 'user'
                    ? 'border-purple-400/35 bg-purple-500/10 ml-6'
                    : msg.role === 'ai'
                    ? 'border-cyan-400/30 bg-[#0c182a]/90'
                    : 'border-slate-800 bg-slate-900/75';

                return (
                  <div key={msg.id} className={`rounded-xl border p-3.5 ${containerClass}`}>
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <strong
                        className={
                          msg.role === 'ai'
                            ? 'text-cyan-300'
                            : msg.role === 'staff'
                            ? 'text-purple-300'
                            : 'text-white'
                        }
                      >
                        {msg.sender}
                      </strong>
                      <span className="font-mono text-[11px] text-slate-400">
                        {msg.timestamp}
                        {msg.latency ? ` · ${msg.latency}` : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{msg.content}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSend} className="flex gap-2.5 pt-2 border-t border-slate-800">
            <label htmlFor="tracking-reply-input" className="sr-only">
              Dispatch message to ticket thread
            </label>
            <input
              id="tracking-reply-input"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a response, inject diagnostic logs, or @sylvie..."
              className="flex-1 rounded-xl bg-[#060a14] border border-slate-700/70 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Send Dispatch</span>
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>

        <aside className="xl:col-span-4 flex flex-col gap-5">
          <div className="spatial-surface rounded-2xl p-5 flex flex-col gap-3">
            <h2 className="font-display font-bold text-base text-white">Fast-Path SRE Triggers</h2>
            <button
              type="button"
              onClick={() => onRunSreTrigger(ticket.id, 'Clear Node Memory Buffer')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl border border-cyan-400/20 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
              <span>Clear Node Memory Buffer</span>
            </button>
            <button
              type="button"
              onClick={() => onRunSreTrigger(ticket.id, 'Archive Pod Memory Dump')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl border border-cyan-400/20 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Archive Pod Memory Dump</span>
            </button>
            <button
              type="button"
              onClick={() => onRunSreTrigger(ticket.id, 'Scale Horizontal Autoscaler (6 Replicas)')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl border border-cyan-400/20 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Scale Horizontal Autoscaler</span>
            </button>
          </div>

          <div className="spatial-surface rounded-2xl p-5">
            <h2 className="font-display font-bold text-base text-white mb-3">
              Neural Resolution Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
                <div className="font-mono text-[10px] text-slate-400">AI TRIAGE</div>
                <div className="font-mono text-2xl font-extrabold text-cyan-300 mt-1 tabular-nums">
                  {ticket.triageLatency}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
                <div className="font-mono text-[10px] text-slate-400">EST. RESOLVE</div>
                <div className="font-mono text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">
                  {ticket.estResolve}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
