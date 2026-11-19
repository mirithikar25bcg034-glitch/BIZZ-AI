import { useEffect, useState } from 'react';
import { Check, ExternalLink, Send } from 'lucide-react';
import type { SupportTicket } from '../types/support';
import { filterTickets } from '../utils/supportLogic';

interface StaffDashboardProps {
  tickets: SupportTicket[];
  searchQuery: string;
  onApproveReply: (ticketId: string, replyText: string) => void;
  onBatchApprove: () => void;
  onInspectTicket: (ticketId: string) => void;
}

export function StaffDashboard({
  tickets,
  searchQuery,
  onApproveReply,
  onBatchApprove,
  onInspectTicket,
}: StaffDashboardProps) {
  const queueTickets = filterTickets(tickets, { filter: 'all', searchQuery });
  const [selectedId, setSelectedId] = useState<string>(queueTickets[0]?.id ?? '#TKT-8921');

  const selectedTicket =
    queueTickets.find((t) => t.id === selectedId) ?? queueTickets[0] ?? tickets[0];

  const [draftReply, setDraftReply] = useState(selectedTicket?.suggestedReply ?? '');

  useEffect(() => {
    if (selectedTicket) {
      setDraftReply(selectedTicket.suggestedReply);
    }
  }, [selectedTicket?.id, selectedTicket?.suggestedReply]);

  const pendingCount = tickets.filter((t) => t.status === 'Open').length + 4;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length + 6;
  const resolvedTodayCount = 41 + tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="flex flex-col gap-5">
      {/* Staff Banner */}
      <section className="rounded-2xl border border-purple-400/25 bg-gradient-to-r from-purple-500/15 via-slate-900/90 to-cyan-400/10 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-purple-300">Operative Desk · Tier-3 SRE</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, Elena Rostova
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Live sentiment HUD active. {pendingCount} escalations awaiting operative review with
            pre-drafted Sylvie remediations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => selectedTicket && onInspectTicket(selectedTicket.id)}
            className="px-4 py-2.5 rounded-xl border border-cyan-400/25 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors whitespace-nowrap"
          >
            Inspect Active Thread
          </button>
          <button
            type="button"
            onClick={onBatchApprove}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Batch Approve Safe Drafts</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" aria-label="Staff Metrics">
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">ASSIGNED TICKETS</div>
          <div className="font-mono text-3xl font-extrabold text-white mt-1.5 tabular-nums">
            {13 + tickets.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Active load: 72%</div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">PENDING TICKETS</div>
          <div className="font-mono text-3xl font-extrabold text-amber-400 mt-1.5 tabular-nums">
            {String(pendingCount).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Avg wait 2.1m</div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">IN PROGRESS</div>
          <div className="font-mono text-3xl font-extrabold text-cyan-300 mt-1.5 tabular-nums">
            {String(inProgressCount).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-400 mt-1">3 SLA priority</div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">RESOLVED TODAY</div>
          <div className="font-mono text-3xl font-extrabold text-emerald-400 mt-1.5 tabular-nums">
            {resolvedTodayCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">98.8% CSAT</div>
        </div>
      </section>

      {/* Queue + Draft Inspector */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 spatial-surface rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-white">
              Customer Complaints &amp; Live Queue
            </h2>
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {queueTickets.length} Active
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {queueTickets.map((item) => {
              const isSelected = selectedTicket?.id === item.id;
              const sentimentColor =
                item.priority === 'Urgent'
                  ? 'text-rose-400'
                  : item.priority === 'High'
                  ? 'text-amber-400'
                  : 'text-cyan-300';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left rounded-xl p-3.5 border transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-slate-800 bg-slate-900/70 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-white">
                      {item.customerName}{' '}
                      <span className="font-mono text-xs text-cyan-300 ml-1">{item.id}</span>
                    </span>
                    <span className={`text-xs font-semibold ${sentimentColor}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.title}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
                    <span>{item.status}</span>
                    <span>Confidence {item.aiConfidence}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 spatial-surface rounded-2xl p-5 flex flex-col gap-4">
          {selectedTicket ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    {selectedTicket.customerName} — {selectedTicket.id}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sentiment: {selectedTicket.sentiment} · {selectedTicket.category} ·{' '}
                    {selectedTicket.status}
                  </p>
                </div>
                <span className="text-xs font-semibold font-mono text-rose-400">
                  {selectedTicket.priority} Priority
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="font-mono text-[11px] text-slate-400 mb-1.5">
                  CUSTOMER DIAGNOSTIC PAYLOAD
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{selectedTicket.logs}</p>
              </div>

              <div className="rounded-xl border border-cyan-400/25 bg-[#0c182a]/90 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-300">
                    Sylvie Suggested Neural Reply
                  </span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {selectedTicket.aiConfidence}.4% Confidence
                  </span>
                </div>

                <label htmlFor="staff-reply-draft" className="sr-only">
                  Suggested reply draft
                </label>
                <textarea
                  id="staff-reply-draft"
                  rows={4}
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  className="w-full rounded-xl bg-[#060a14] border border-slate-700/70 p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onApproveReply(selectedTicket.id, draftReply)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Approve &amp; Send Reply</span>
                </button>
                <button
                  type="button"
                  onClick={() => onInspectTicket(selectedTicket.id)}
                  className="px-4 py-2.5 rounded-xl border border-cyan-400/25 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2"
                >
                  <span>Open Full 3D Thread</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Select a ticket from the queue to review.</p>
          )}
        </div>
      </section>
    </div>
  );
}
