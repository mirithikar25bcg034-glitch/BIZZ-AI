import { useState } from 'react';
import { Download } from 'lucide-react';
import { ENTERPRISE_CLIENTS, VOLUME_SERIES } from '../data/seedData';
import type { SupportTicket } from '../types/support';

interface AdminDashboardProps {
  tickets: SupportTicket[];
  onExportAudit: () => void;
}

export function AdminDashboard({ tickets, onExportAudit }: AdminDashboardProps) {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = VOLUME_SERIES[range];
  const maxVal = Math.max(...points.map((p) => p.totalVolume), 1);

  const svgWidth = 600;
  const svgHeight = 190;
  const padX = 26;
  const padY = 20;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const coords = points.map((p, i) => {
    const x = padX + (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW);
    const yTotal = padY + chartH - (p.totalVolume / maxVal) * chartH;
    const yAi = padY + chartH - (p.aiOffloaded / maxVal) * chartH;
    return { ...p, x, yTotal, yAi };
  });

  const totalLinePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.yTotal}`).join(' ');
  const totalAreaPath = `${totalLinePath} L${coords[coords.length - 1].x},${padY + chartH} L${coords[0].x},${padY + chartH} Z`;
  const aiLinePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.yAi}`).join(' ');

  const totalOffloadPct = (
    (points.reduce((acc, p) => acc + p.aiOffloaded, 0) /
      points.reduce((acc, p) => acc + p.totalVolume, 0)) *
    100
  ).toFixed(1);

  const hoveredPoint = hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  const escalations = tickets.filter((t) => t.priority === 'High' || t.priority === 'Urgent').length + 3367;

  return (
    <div className="flex flex-col gap-5">
      {/* Admin Header Banner */}
      <section className="rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-cyan-400/10 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-amber-300">Root Command · Cluster Orchestration</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Admin Nexus | Autonomous Ops Control
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Global LLM guardrails, autonomous offload telemetry, and enterprise client ARR health.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportAudit}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export Audit Telemetry</span>
        </button>
      </section>

      {/* 5 KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" aria-label="Admin Metrics">
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[10px] font-mono text-slate-400">TOTAL TICKETS</div>
          <div className="font-mono text-2xl font-extrabold text-white mt-1.5 tabular-nums">
            {(14815 + tickets.length).toLocaleString()}
          </div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[10px] font-mono text-slate-400">ACTIVE NODES</div>
          <div className="font-mono text-2xl font-extrabold text-emerald-400 mt-1.5 tabular-nums">
            64
          </div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[10px] font-mono text-slate-400">AI AUTO-RESOLVED</div>
          <div className="font-mono text-2xl font-extrabold text-cyan-300 mt-1.5 tabular-nums">
            84,210
          </div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[10px] font-mono text-slate-400">ACTIVE STAFF</div>
          <div className="font-mono text-2xl font-extrabold text-purple-400 mt-1.5 tabular-nums">
            42
          </div>
        </div>
        <div className="spatial-surface rounded-xl p-4">
          <div className="text-[10px] font-mono text-slate-400">ESCALATIONS</div>
          <div className="font-mono text-2xl font-extrabold text-amber-400 mt-1.5 tabular-nums">
            {escalations.toLocaleString()}
          </div>
        </div>
      </section>

      {/* Chart + Staff Matrix */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 spatial-surface rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-white">
                Neural Ticket Volume &amp; Autonomous Offload
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
                {hoveredPoint.label}: {hoveredPoint.totalVolume.toLocaleString()} total ·{' '}
                {hoveredPoint.aiOffloaded.toLocaleString()} AI offloaded ({totalOffloadPct}% avg)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" aria-hidden="true" />
                  Total
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-purple-400 inline-block" aria-hidden="true" />
                  AI Offloaded
                </span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-cyan-400/15">
                {(['7D', '30D', '90D'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRange(r);
                      setHoveredIdx(null);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                      range === r ? 'bg-cyan-400/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48"
            role="img"
            aria-label="Neural Ticket Volume and AI Offload Chart"
          >
            <defs>
              <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((step) => {
              const y = padY + chartH * (1 - step);
              return (
                <line
                  key={step}
                  x1={padX}
                  x2={svgWidth - padX}
                  y1={y}
                  y2={y}
                  stroke="rgba(148,163,184,0.12)"
                  strokeDasharray="3,3"
                />
              );
            })}

            <path d={totalAreaPath} fill="url(#adminAreaGrad)" />
            <path d={totalLinePath} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
            <path
              d={aiLinePath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="5,4"
            />

            {coords.map((c, idx) => (
              <g key={c.label}>
                <circle
                  cx={c.x}
                  cy={c.yTotal}
                  r={hoveredIdx === idx ? 5 : 3.5}
                  fill="#22d3ee"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />
                <circle
                  cx={c.x}
                  cy={c.yAi}
                  r={hoveredIdx === idx ? 4.5 : 3}
                  fill="#a855f7"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />
                <text
                  x={c.x}
                  y={svgHeight - 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {c.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="xl:col-span-4 spatial-surface rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-white">Staff Matrix &amp; SLA</h2>
            <span className="text-xs font-mono text-emerald-400">Optimal</span>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Global CSAT</span>
              <strong className="font-mono text-emerald-400 tabular-nums">98.8%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Avg First Response</span>
              <strong className="font-mono text-cyan-300 tabular-nums">3.6m</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Reopen Rate</span>
              <strong className="font-mono text-purple-400 tabular-nums">2.1%</strong>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <div className="text-[11px] font-mono text-slate-400 mb-2">STAFF LOAD</div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-200">Elena Rostova (Tier-3)</span>
                <span className="font-mono text-cyan-300 tabular-nums">74%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-200">Marcus Vance (SRE)</span>
                <span className="font-mono text-cyan-300 tabular-nums">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-200">Liam K. (Auth Ops)</span>
                <span className="font-mono text-cyan-300 tabular-nums">52%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise ARR + Guardrails */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="spatial-surface rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-white mb-3">
            Enterprise Client Health &amp; ARR
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-400/15 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-2 pr-3">Enterprise</th>
                  <th className="py-2 px-3">ARR</th>
                  <th className="py-2 px-3">Health</th>
                  <th className="py-2 pl-3 text-right">SLA</th>
                </tr>
              </thead>
              <tbody>
                {ENTERPRISE_CLIENTS.map((client) => (
                  <tr key={client.id} className="border-b border-slate-800/70 text-sm">
                    <td className="py-2.5 pr-3 text-slate-200 font-medium">{client.name}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300 tabular-nums">
                      {client.arr}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-mono text-xs font-semibold tabular-nums ${
                        client.status === 'Nominal' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {client.health}% · {client.status}
                    </td>
                    <td className="py-2.5 pl-3 font-mono text-xs text-slate-400 text-right tabular-nums">
                      {client.sla}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="spatial-surface rounded-2xl p-5">
          <h2 className="font-display font-bold text-base text-white mb-3">
            System Neural Audit &amp; Guardrails
          </h2>
          <div className="flex flex-col gap-2.5 font-mono text-xs text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
              [GUARDRAIL] Hallucination score: 0.02% across 14k completions
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
              [PII-SHIELD] 192 API keys automatically redacted in logs
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/75 p-3">
              [CLUSTER] us-east-1 autoscaler armed for worker-alpha pool
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
