import type {
  AppSettings,
  AuditEvent,
  ChatMessage,
  EnterpriseClient,
  OperatorProfile,
  SupportTicket,
  VolumePoint,
} from '../types/support';

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: '#TKT-8921',
    title: 'Cluster pod failure in us-east-1 under high memory spike',
    category: 'Infrastructure & Cloud (K8s/Edge)',
    environment: 'Production Cluster (AWS us-east-1)',
    priority: 'High',
    operator: 'Marcus Vance',
    status: 'In Progress',
    stageIndex: 2,
    customerName: 'Alex Chen',
    sentiment: 'Urgent',
    logs: 'Node crash observed on k8s-worker-east-09 with exit code 137 (OOMKilled). Container memory exceeded 5GiB allocation limit during peak automated indexing at 14:22:04 UTC.',
    attachments: ['crash-log-2026.log', 'k8s-metrics.png'],
    aiConfidence: 98,
    triageLatency: '1.2s',
    estResolve: '14m',
    suggestedReply:
      "Hi Alex — I've inspected worker-alpha-09 telemetry. The OOMKilled (exit 137) is caused by an unbounded buffer in telemetry-indexer-v2. I recommend bumping the memory limit to 8GiB and enabling stream chunking. Shall I apply the hotfix rollout now?",
    createdAt: '14:22 UTC',
    thread: [
      {
        id: 'm-1',
        sender: 'Alex Chen',
        role: 'user',
        timestamp: '14:22 UTC',
        content:
          'We experienced sudden pod evictions on worker-alpha-09. Telemetry shows container memory hitting the 5GiB ceiling before OOMKilled.',
      },
      {
        id: 'm-2',
        sender: 'Sylvie AI Copilot',
        role: 'ai',
        timestamp: '14:22 UTC',
        latency: '1.2s',
        confidence: '98.4%',
        content:
          'Root cause identified in telemetry-indexer-v2: unbounded memory leak during UTF-8 JSON payload unmarshaling. Suggested fix: apply heap cap patch & scale horizontal autoscaler.',
      },
      {
        id: 'm-3',
        sender: 'Marcus Vance (Staff SRE)',
        role: 'staff',
        timestamp: '14:25 UTC',
        content:
          'Confirmed. Staging the patched container image now and attaching live telemetry probes.',
      },
    ],
  },
  {
    id: '#TKT-8918',
    title: 'API Gateway 502 spike after TLS rotation on edge PoP',
    category: 'API & Webhook Telemetry',
    environment: 'Production Cluster (AWS us-east-1)',
    priority: 'Urgent',
    operator: 'Elena Rostova',
    status: 'Open',
    stageIndex: 1,
    customerName: 'Sophia Chen-Reyes',
    sentiment: 'High',
    logs: 'HTTP 502 Bad Gateway observed on /v4/neural/stream following intermediate certificate rollover across edge-pop-04.',
    attachments: ['tls-handshake-trace.txt'],
    aiConfidence: 95,
    triageLatency: '0.9s',
    estResolve: '8m',
    suggestedReply:
      "Hi Sophia — The edge proxy cache held an expired intermediate cert. I've queued an edge PoP cache purge; latency is projected to return to 14ms within 60 seconds.",
    createdAt: '14:10 UTC',
    thread: [
      {
        id: 'm-4',
        sender: 'Sophia Chen-Reyes',
        role: 'user',
        timestamp: '14:10 UTC',
        content:
          'Seeing intermittent 502 Bad Gateway responses on /v4/neural/stream after certificate rollover.',
      },
      {
        id: 'm-5',
        sender: 'Sylvie AI Copilot',
        role: 'ai',
        timestamp: '14:10 UTC',
        latency: '0.9s',
        confidence: '95.1%',
        content:
          'Detected stale intermediate TLS chain in edge-pop-04 cache. Auto-purge playbook prepared for staff verification.',
      },
    ],
  },
  {
    id: '#TKT-8914',
    title: 'FIDO2 passkey hardware token rejected on SSO edge',
    category: 'Identity & Zero-Trust Auth',
    environment: 'Staging Mesh (eu-central-1)',
    priority: 'Medium',
    operator: 'Sylvie AI',
    status: 'Open',
    stageIndex: 1,
    customerName: 'David Thorne',
    sentiment: 'Medium',
    logs: 'WebAuthn challenge mismatch for group SRE-Leads; SAML group claim defaulted to Tier 1.',
    attachments: ['saml-assertion.xml'],
    aiConfidence: 97,
    triageLatency: '1.1s',
    estResolve: '11m',
    suggestedReply:
      'Hi David — Updated your SAML attribute mapping for role=sre_lead to route directly to Tier-2 Staff Copilot.',
    createdAt: '13:45 UTC',
    thread: [
      {
        id: 'm-6',
        sender: 'David Thorne',
        role: 'user',
        timestamp: '13:45 UTC',
        content:
          'Users in group SRE-Leads are landing in Customer Tier 1 instead of Staff Copilot after FIDO2 check.',
      },
    ],
  },
  {
    id: '#TKT-8906',
    title: 'Webhook payload signing secret desync in eu-west',
    category: 'API & Webhook Telemetry',
    environment: 'Production Cluster (AWS us-east-1)',
    priority: 'High',
    operator: 'Elena Rostova',
    status: 'In Progress',
    stageIndex: 2,
    customerName: 'Mia Lin',
    sentiment: 'Medium',
    logs: 'HMAC-SHA256 verification failed on 14% of billing.invoice.paid webhooks in eu-west-1.',
    attachments: ['webhook-retry-log.json'],
    aiConfidence: 94,
    triageLatency: '1.4s',
    estResolve: '16m',
    suggestedReply:
      "Hi Mia — I've rotated and synced the dual-active webhook signing secret and adjusted retry backoff to 2s-60s.",
    createdAt: '12:58 UTC',
    thread: [
      {
        id: 'm-7',
        sender: 'Mia Lin',
        role: 'user',
        timestamp: '12:58 UTC',
        content: 'Need HMAC signing secret synchronized and exponential backoff tuned to 60s max.',
      },
    ],
  },
  {
    id: '#TKT-8899',
    title: 'Billing seat allocation expansion (Tier-4 Enterprise)',
    category: 'Billing & Seat Licensing',
    environment: 'Production Cluster (AWS us-east-1)',
    priority: 'Low',
    operator: 'Sylvie AI',
    status: 'Resolved',
    stageIndex: 4,
    customerName: 'Alex Chen',
    sentiment: 'Nominal',
    logs: 'Enterprise quota expanded from 120 to 250 seats; license token signed and propagated.',
    attachments: [],
    aiConfidence: 99,
    triageLatency: '0.6s',
    estResolve: '0m',
    suggestedReply:
      'Seat allocation expanded to 250 active seats and zero-trust billing ledger updated.',
    createdAt: '11:20 UTC',
    thread: [
      {
        id: 'm-8',
        sender: 'Sylvie AI Copilot',
        role: 'ai',
        timestamp: '11:21 UTC',
        latency: '0.6s',
        confidence: '99.6%',
        content: 'Enterprise seat cap increased to 250 seats automatically. No downtime incurred.',
      },
    ],
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'c-1',
    role: 'ai',
    author: 'Sylvie AI',
    timestamp: '14:20 UTC',
    confidence: '99.4%',
    content:
      "Hello! I'm Sylvie, your autonomous 3D support companion. I've automatically ingested your cluster telemetry, active tickets, and cloud logs. How can I assist you today?",
  },
  {
    id: 'c-2',
    role: 'user',
    author: 'Alex Chen',
    timestamp: '14:21 UTC',
    content:
      "Hey Sylvie! We're observing recurring memory spikes on cluster worker-alpha-09 causing 504 gateway timeouts. Can you inspect the memory dump and recommend a hotfix?",
  },
  {
    id: 'c-3',
    role: 'ai',
    author: 'Sylvie AI',
    timestamp: '14:21 UTC',
    confidence: '99.4%',
    telemetryCallout: 'worker-alpha-09 · Heap OOM Eviction: 7.42 GiB / 8.00 GiB',
    content:
      "I've dissected the 4.2MB heap profile. The root cause is an unbounded memory leak in telemetry-indexer-v2 while unmarshaling nested UTF-8 JSON payloads. Applying the stream-chunking patch reduces peak RSS by 64%.",
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'a-1',
    timestamp: '2m ago',
    channel: 'sylvie',
    message: 'Sylvie auto-resolved API rate limit #TKT-8924',
  },
  {
    id: 'a-2',
    timestamp: '18m ago',
    channel: 'security',
    message: 'Passkey rotation validated for Alex Chen',
  },
  {
    id: 'a-3',
    timestamp: '1h ago',
    channel: 'cluster',
    message: 'Knowledge base synced 14 vector embeddings',
  },
];

export const ENTERPRISE_CLIENTS: EnterpriseClient[] = [
  {
    id: 'ent-1',
    name: 'QuantumReach Labs',
    arr: '$420k',
    health: 99.4,
    sla: '15m',
    status: 'Nominal',
  },
  {
    id: 'ent-2',
    name: 'AetherCloud Corp',
    arr: '$310k',
    health: 91.2,
    sla: '30m',
    status: 'Watch',
  },
  {
    id: 'ent-3',
    name: 'NovaFin Systems',
    arr: '$580k',
    health: 99.9,
    sla: '10m',
    status: 'Nominal',
  },
  {
    id: 'ent-4',
    name: 'Helios Robotics',
    arr: '$275k',
    health: 97.8,
    sla: '15m',
    status: 'Nominal',
  },
];

export const VOLUME_SERIES: Record<'7D' | '30D' | '90D', VolumePoint[]> = {
  '7D': [
    { label: 'Mon', totalVolume: 1840, aiOffloaded: 1510 },
    { label: 'Tue', totalVolume: 2120, aiOffloaded: 1790 },
    { label: 'Wed', totalVolume: 1960, aiOffloaded: 1650 },
    { label: 'Thu', totalVolume: 2480, aiOffloaded: 2110 },
    { label: 'Fri', totalVolume: 2310, aiOffloaded: 1980 },
    { label: 'Sat', totalVolume: 1640, aiOffloaded: 1410 },
    { label: 'Sun', totalVolume: 2470, aiOffloaded: 2140 },
  ],
  '30D': [
    { label: 'W1', totalVolume: 11200, aiOffloaded: 9180 },
    { label: 'W2', totalVolume: 12850, aiOffloaded: 10660 },
    { label: 'W3', totalVolume: 13900, aiOffloaded: 11815 },
    { label: 'W4', totalVolume: 14820, aiOffloaded: 12480 },
  ],
  '90D': [
    { label: 'Sep', totalVolume: 34200, aiOffloaded: 27360 },
    { label: 'Oct', totalVolume: 39800, aiOffloaded: 33030 },
    { label: 'Nov', totalVolume: 44620, aiOffloaded: 37570 },
  ],
};

export const DEFAULT_PROFILE: OperatorProfile = {
  fullName: 'Elena Rostova',
  designation: 'Tier-3 Ops Lead & SRE Architect',
  email: 'elena.rostova@smartsupport.ai',
  timezone: 'UTC-08:00 (US-West)',
  bio: 'Lead architect for high-availability Kubernetes clusters and autonomous Sylvie LLM triage workflows across distributed edge regions.',
};

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: 'ssai_live_98f2a4c1d9e044b71a22',
  spatialHudEnabled: true,
  autoDraftReplies: true,
  slaBreachAlerts: true,
  autoRedactPii: true,
  spatialAudioEnabled: false,
};

export const TICKET_PRESETS = [
  {
    label: 'K8s OOMKilled',
    subject: 'K8s worker pod OOMKilled exit 137',
    category: 'Infrastructure & Cloud (K8s/Edge)',
    priority: 'High' as const,
    logs: 'Node crash observed on k8s-worker-east-09 with exit code 137 (OOMKilled). Container memory exceeded 5GiB allocation limit during peak automated indexing.',
  },
  {
    label: 'Passkey Desync',
    subject: 'FIDO2 passkey hardware token rejected on SSO edge',
    category: 'Identity & Zero-Trust Auth',
    priority: 'Medium' as const,
    logs: 'WebAuthn assertion rejected with ERR_PASSKEY_DESYNC on edge-auth-node-02 after YubiKey firmware update.',
  },
  {
    label: 'Billing Expansion',
    subject: 'Billing seat allocation expansion (Tier-4)',
    category: 'Billing & Seat Licensing',
    priority: 'Low' as const,
    logs: 'Requesting automated seat allocation bump from 120 to 300 active enterprise seats for Q4 onboarding.',
  },
];
