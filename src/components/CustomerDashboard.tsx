import { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import type { AuditEvent, SupportTicket, WorkspaceView } from '../types/support';
import { filterTickets } from '../utils/supportLogic';
import { SylvieHologram3D } from './SylvieHologram3D';

interface CustomerDashboardProps {
  customerName: string;
  tickets: SupportTicket[];
  auditEvents: AuditEvent[];
  searchQuery: string;
  onNavigate: (view: WorkspaceView) => void;
  onSelectTicket: (ticketId: string) => void;
}

export function CustomerDashboard({
  customerName,
  tickets,
  auditEvents,
  searchQuery,
  onNavigate,
  onSelectTicket,
}: CustomerDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'High' | 'Resolved'>('all');

  const visibleTickets = filterTickets(tickets, { filter, searchQuery });

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = 119 + tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  const totalCount = 123 + tickets.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero Banner */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 via-slate-900/90 to-purple-500/10 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-cyan-300">Live Autonomous Mode · Tier 1 Portal</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {customerName}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Your autonomous 3D spatial support hub is operating at peak efficiency. Sylvie AI has
            pre-resolved 4 pending inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('chatbot')}
            className="px-4 py-2.5 rounded-xl border border-cyan-400/25 bg-slate-900/90 text-xs font-semibold text-slate-200 hover:border-cyan-400/50 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
            <span>Neural Routing</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('create-ticket')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 text-xs font-bold hover:brightness-105 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Create New Ticket</span>
          </button>
        </div>
      </section>

      {/* 4-Column KPI Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" aria-label="Customer Metrics">
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">TOTAL TICKETS</div>
          <div className="font-mono text-3xl font-extrabold text-white mt-1.5 tabular-nums">
            {totalCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">+14% this cycle</div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">OPEN INQUIRIES</div>
          <div className="font-mono text-3xl font-extrabold text-cyan-300 mt-1.5 tabular-nums">
            {String(openCount).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-400 mt-1">SLA Active</div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">IN PROGRESS</div>
          <div className="font-mono text-3xl font-extrabold text-purple-400 mt-1.5 tabular-nums">
            {String(inProgressCount).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Copilot Assisted</div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[11px] font-mono text-slate-400">RESOLVED</div>
          <div className="font-mono text-3xl font-extrabold text-emerald-400 mt-1.5 tabular-nums">
            {resolvedCount}
          </div>
          <div className="text-xs text-slate-400 mt-1">99.2% CSAT</div>
        </div>
      </section>

      {/* 2:1 Workspace Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Resolution Funnel */}
          <div className="spatial-surface rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-display font-bold text-base text-white">
                Neural Resolution Funnel
              </h2>
              <span className="font-mono text-[11px] text-slate-400">Live Stage Telemetry</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-3">
                <div className="font-mono text-[10px] text-slate-400">1. SUBMITTED</div>
                <div className="font-bold text-sm text-white mt-1 tabular-nums">
                  {totalCount} Total
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Ingested</div>
              </div>
              <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-3">
                <div className="font-mono text-[10px] text-slate-400">2. NEURAL TRIAGE</div>
                <div className="font-bold text-sm text-white mt-1 tabular-nums">
                  124 Auto-Routed
                </div>
                <div className="text-xs text-slate-400 mt-0.5">1.2s avg</div>
              </div>
              <div className="rounded-xl border border-cyan-400 bg-cyan-400/10 p-3 shadow-[0_0_16px_rgba(34,211,238,0.12)]">
                <div className="font-mono text-[10px] text-cyan-300">3. COPILOT &amp; TIER-2</div>
                <div className="font-bold text-sm text-white mt-1 tabular-nums">
                  {String(openCount + inProgressCount).padStart(2, '0')} Active
                </div>
                <div className="text-xs text-slate-300 mt-0.5">In remediation</div>
              </div>
              <div className="rounded-xl border border-cyan-400/15 bg-slate-900/70 p-3">
                <div className="font-mono text-[10px] text-slate-400">4. VERIFIED</div>
                <div className="font-bold text-sm text-white mt-1 tabular-nums">
                  {resolvedCount} Closed
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Zero-trust signed</div>
              </div>
            </div>
          </div>

          {/* Active Inquiries Table */}
          <div className="spatial-surface rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-bold text-base text-white">
                Active Inquiries &amp; Operations
              </h2>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-cyan-400/15">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'High', label: 'Needs Action' },
                  { id: 'Resolved', label: 'Sylvie Resolved' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id as 'all' | 'High' | 'Resolved')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      filter === tab.id
                        ? 'bg-cyan-400/20 text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleTickets.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-800 rounded-xl">
                <p>No tickets match the current filter or search query.</p>
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-cyan-300 hover:bg-slate-700"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cyan-400/15 text-[11px] font-mono uppercase text-slate-400">
                      <th className="py-2.5 pr-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Issue Summary</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Operator</th>
                      <th className="py-2.5 pl-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTickets.map((ticket) => {
                      const priorityColor =
                        ticket.priority === 'Urgent' || ticket.priority === 'High'
                          ? 'text-rose-400'
                          : ticket.priority === 'Medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400';

                      const statusColor =
                        ticket.status === 'Resolved' || ticket.status === 'Closed'
                          ? 'text-emerald-400'
                          : ticket.status === 'In Progress'
                          ? 'text-cyan-300'
                          : 'text-purple-300';

                      return (
                        <tr
                          key={ticket.id}
                          className="border-b border-slate-800/70 hover:bg-cyan-400/5 transition-colors"
                        >
                          <td className="py-3 pr-3 font-mono text-xs font-semibold text-cyan-300 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onSelectTicket(ticket.id)}
                              className="hover:underline text-left"
                            >
                              {ticket.id}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-sm text-slate-200">
                            <button
                              type="button"
                              onClick={() => onSelectTicket(ticket.id)}
                              className="text-left hover:text-cyan-200 transition-colors"
                            >
                              {ticket.title}
                            </button>
                          </td>
                          <td className={`py-3 px-3 text-xs font-semibold ${priorityColor}`}>
                            {ticket.priority}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">
                            {ticket.operator}
                          </td>
                          <td className={`py-3 pl-3 text-xs font-semibold text-right whitespace-nowrap ${statusColor}`}>
                            {ticket.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Sylvie 3D Hologram + Audit Stream */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          <div className="spatial-holo-bg rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300">3D Node Active</span>
              <span className="font-mono text-emerald-400 tabular-nums">99.9% Sync</span>
            </div>

            <SylvieHologram3D mood="idle" height={175} label="Sylvie Customer Copilot 3D" />

            <div className="text-center">
              <h2 className="font-display font-bold text-lg text-white">Sylvie AI Copilot</h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitoring your Kubernetes clusters and API rate limits in real time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('chatbot')}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all"
            >
              Talk to Sylvie (Voice / 3D)
            </button>
          </div>

          <div className="spatial-surface rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-base text-white">Neural Audit Stream</h2>
              <span className="text-xs font-mono text-emerald-400">Streaming</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {auditEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/75 px-3.5 py-2.5 text-xs font-mono text-slate-300 flex items-start justify-between gap-3"
                >
                  <span>{ev.message}</span>
                  <span className="text-slate-500 shrink-0">{ev.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
