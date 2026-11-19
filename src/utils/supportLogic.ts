import type {
  SupportTicket,
  TicketPriority,
  TicketStageIndex,
  TicketStatus,
  UserRole,
} from '../types/support';

export interface TicketFilterOptions {
  filter: 'all' | 'High' | 'Resolved' | 'Open';
  searchQuery?: string;
}

export interface DiagnosticResult {
  riskIndex: number;
  triageEta: string;
  matchedKnowledge: string[];
  autoRepairReady: boolean;
}

export function filterTickets(
  tickets: SupportTicket[],
  options: TicketFilterOptions
): SupportTicket[] {
  const q = (options.searchQuery ?? '').trim().toLowerCase();

  return tickets.filter((t) => {
    const matchesFilter =
      options.filter === 'all' ||
      (options.filter === 'High' && (t.priority === 'High' || t.priority === 'Urgent')) ||
      (options.filter === 'Resolved' && (t.status === 'Resolved' || t.status === 'Closed')) ||
      (options.filter === 'Open' && (t.status === 'Open' || t.status === 'In Progress'));

    if (!matchesFilter) return false;
    if (!q) return true;

    return (
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.operator.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });
}

export function computeTicketDiagnostic(
  subject: string,
  logs: string,
  priority: TicketPriority
): DiagnosticResult {
  const combined = `${subject} ${logs}`.toLowerCase();
  const baseByPriority: Record<TicketPriority, number> = {
    Low: 28,
    Medium: 54,
    High: 78,
    Urgent: 92,
  };

  let risk = baseByPriority[priority];
  const matched: string[] = [];

  if (/oom|137|memory|heap|pod|k8s|cluster/.test(combined)) {
    risk = Math.min(99, risk + 11);
    matched.push('Resolving OOMKilled container crashes');
    matched.push('Tuning dynamic container memory caps');
  }
  if (/passkey|fido2|sso|saml|auth|token/.test(combined)) {
    risk = Math.min(99, risk + 6);
    matched.push('Re-synchronizing FIDO2 WebAuthn edge assertions');
    matched.push('SAML group-to-tier claim mapping');
  }
  if (/502|504|tls|gateway|webhook|hmac/.test(combined)) {
    risk = Math.min(99, risk + 9);
    matched.push('Purging stale edge PoP TLS chains');
    matched.push('HMAC webhook secret rotation runbook');
  }
  if (/billing|seat|license|quota/.test(combined)) {
    risk = Math.max(18, risk - 8);
    matched.push('Zero-downtime enterprise seat provisioning');
  }

  if (matched.length === 0) {
    matched.push('General neural incident triage protocol');
    matched.push('Automated diagnostic log correlation');
  }

  const etaSeconds = Math.max(8, Math.round(42 - risk * 0.22));
  return {
    riskIndex: risk,
    triageEta: `${etaSeconds}s`,
    matchedKnowledge: matched.slice(0, 3),
    autoRepairReady: risk >= 65,
  };
}

export function generateNextTicketId(existing: SupportTicket[]): string {
  const nums = existing
    .map((t) => Number.parseInt(t.id.replace(/[^0-9]/g, ''), 10))
    .filter((n) => Number.isFinite(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 8921;
  return `#TKT-${maxNum + 1}`;
}

export interface CreateTicketInput {
  subject: string;
  category: string;
  environment: string;
  priority: TicketPriority;
  logs: string;
  customerName: string;
  attachments?: string[];
}

export function buildNewTicket(
  input: CreateTicketInput,
  existing: SupportTicket[]
): SupportTicket {
  const diag = computeTicketDiagnostic(input.subject, input.logs, input.priority);
  const id = generateNextTicketId(existing);
  const nowLabel = 'Just now';

  return {
    id,
    title: input.subject.trim(),
    category: input.category,
    environment: input.environment,
    priority: input.priority,
    operator: 'Sylvie AI',
    status: 'In Progress',
    stageIndex: 1,
    customerName: input.customerName,
    sentiment: input.priority === 'Urgent' ? 'Urgent' : input.priority === 'High' ? 'High' : 'Nominal',
    logs: input.logs.trim(),
    attachments: input.attachments ?? ['diag-bundle.log'],
    aiConfidence: Math.min(99, Math.max(88, diag.riskIndex + 6)),
    triageLatency: '1.1s',
    estResolve: input.priority === 'Urgent' ? '6m' : input.priority === 'High' ? '14m' : '22m',
    suggestedReply: `Hi ${input.customerName.split(' ')[0]} — Sylvie has indexed your ${input.category} diagnostics (${diag.matchedKnowledge[0]}). Automated remediation probes are attached.`,
    createdAt: nowLabel,
    thread: [
      {
        id: `m-${Date.now()}-u`,
        sender: input.customerName,
        role: 'user',
        timestamp: nowLabel,
        content: input.logs.trim() || input.subject.trim(),
      },
      {
        id: `m-${Date.now()}-ai`,
        sender: 'Sylvie AI Copilot',
        role: 'ai',
        timestamp: nowLabel,
        latency: '1.1s',
        confidence: `${Math.min(99, Math.max(88, diag.riskIndex + 6))}%`,
        content: `Pre-triage complete (Risk Index ${diag.riskIndex}/100). Matched runbook: "${diag.matchedKnowledge[0]}". Ready for fast-path remediation.`,
      },
    ],
  };
}

export function advanceTicketStage(
  ticket: SupportTicket,
  targetStage?: TicketStageIndex
): SupportTicket {
  const nextStage = (
    targetStage !== undefined
      ? targetStage
      : Math.min(4, ticket.stageIndex + 1)
  ) as TicketStageIndex;

  let nextStatus: TicketStatus = ticket.status;
  if (nextStage === 0) nextStatus = 'Open';
  else if (nextStage === 1 || nextStage === 2) nextStatus = 'In Progress';
  else if (nextStage === 3) nextStatus = 'Resolved';
  else if (nextStage === 4) nextStatus = 'Closed';

  return {
    ...ticket,
    stageIndex: nextStage,
    status: nextStatus,
    estResolve: nextStage >= 3 ? '0m' : ticket.estResolve,
  };
}

export function generateSylvieReply(
  prompt: string,
  tickets: SupportTicket[]
): { content: string; telemetryCallout?: string; confidence: string } {
  const q = prompt.trim().toLowerCase();
  const openHigh = tickets.filter(
    (t) => (t.priority === 'High' || t.priority === 'Urgent') && t.status !== 'Resolved' && t.status !== 'Closed'
  );

  if (q.includes('137') || q.includes('oom') || q.includes('worker-alpha')) {
    return {
      confidence: '99.2%',
      telemetryCallout: 'worker-alpha-09 · Heap RSS 7.42 GiB -> Projected 2.68 GiB post-patch',
      content:
        'Exit code 137 on worker-alpha-09 indicates Linux cgroup OOMKiller termination. The telemetry-indexer-v2 buffer allocates unbounded slices during batch JSON parsing. Recommended fix: set stream chunk size to 64KB and raise Pod memory limit to 8GiB.',
    };
  }

  if (q.includes('rollback') || q.includes('ingress')) {
    return {
      confidence: '97.8%',
      telemetryCallout: 'ingress-nginx · Canary v1.9.4 -> Stable v1.8.2 staged',
      content:
        'Prepared automated rollback manifest for ingress-nginx (v1.9.4 to v1.8.2). Zero dropped connections expected via graceful drain over 30s. Click "Analyze Incidents" or trigger from Live Ticket Tracking to apply.',
    };
  }

  if (q.includes('summarize') || q.includes('sla') || q.includes('incidents') || q.includes('analyze')) {
    const summaryIds = openHigh.map((t) => `${t.id} (${t.priority})`).join(', ') || 'None pending';
    return {
      confidence: '98.9%',
      telemetryCallout: `Active High/Urgent Queue: ${openHigh.length} ticket(s)`,
      content: `Currently tracking ${tickets.length} total tickets with ${openHigh.length} High/Urgent priority escalations (${summaryIds}). Average AI triage latency holds at 1.1s with 98.8% SLA compliance.`,
    };
  }

  if (q.includes('sandbox') || q.includes('sim')) {
    return {
      confidence: '96.5%',
      telemetryCallout: 'Sandbox Mesh eu-central-1 · 64/64 virtual pods healthy',
      content:
        'Sandbox stress simulation completed at 12,000 req/s. Stream-chunking hotfix prevented memory leaks across all 16 simulated worker pods with p99 latency at 18.4ms.',
    };
  }

  return {
    confidence: '97.4%',
    telemetryCallout: 'Cluster Sync: 64/64 nodes nominal',
    content: `Analyzed "${prompt.trim()}". All 64 edge nodes are reporting nominal telemetry. Matched ${tickets.length} workspace tickets and staged diagnostic verification probes for immediate dispatch.`,
  };
}

export function computePasskeyStrength(passkey: string): {
  percent: number;
  label: string;
} {
  if (!passkey) return { percent: 0, label: 'EMPTY' };
  let score = Math.min(60, passkey.length * 5);
  if (/[A-Z]/.test(passkey)) score += 10;
  if (/[0-9]/.test(passkey)) score += 12;
  if (/[^A-Za-z0-9]/.test(passkey)) score += 18;
  const clamped = Math.min(99, Math.max(18, score));
  const label =
    clamped >= 90 ? 'IMPERVIOUS' : clamped >= 70 ? 'STRONG' : clamped >= 45 ? 'MODERATE' : 'WEAK';
  return { percent: clamped, label };
}

export function maskApiKey(key: string, revealed: boolean): string {
  if (revealed) return key;
  if (key.length <= 12) return '••••••••••••';
  return `${key.slice(0, 10)}${'•'.repeat(key.length - 14)}${key.slice(-4)}`;
}

export function rotateApiKey(seed?: number): string {
  const alphabet = 'abcdef0123456789';
  let state = seed ?? Date.now();
  let suffix = '';
  for (let i = 0; i < 20; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    suffix += alphabet[state % alphabet.length];
  }
  return `ssai_live_${suffix}`;
}

export function getRoleUserIdentity(role: UserRole, customCustomerName?: string): {
  name: string;
  badgeLabel: string;
  initials: string;
  email: string;
} {
  if (role === 'staff') {
    return {
      name: 'Elena Rostova',
      badgeLabel: 'Staff · Tier-3 SRE',
      initials: 'ER',
      email: 'elena.rostova@smartsupport.ai',
    };
  }
  if (role === 'admin') {
    return {
      name: 'Root Command',
      badgeLabel: 'Admin · Nexus',
      initials: 'RC',
      email: 'root.ops@smartsupport.ai',
    };
  }
  const customerName = customCustomerName?.trim() || 'Alex Chen';
  const parts = customerName.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : customerName.slice(0, 2).toUpperCase();
  return {
    name: customerName,
    badgeLabel: 'Customer · Tier 1',
    initials,
    email: 'alex.chen@quantumreach.io',
  };
}
