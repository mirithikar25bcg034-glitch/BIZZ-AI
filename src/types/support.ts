export type UserRole = 'customer' | 'staff' | 'admin';

export type WorkspaceView =
  | 'dashboard'
  | 'tracking'
  | 'create-ticket'
  | 'chatbot'
  | 'settings';

export type AuthScreenMode = 'login' | 'signup';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type TicketStageIndex = 0 | 1 | 2 | 3 | 4;

export interface ThreadMessage {
  id: string;
  sender: string;
  role: 'user' | 'ai' | 'staff' | 'system';
  timestamp: string;
  confidence?: string;
  latency?: string;
  content: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  category: string;
  environment: string;
  priority: TicketPriority;
  operator: string;
  status: TicketStatus;
  stageIndex: TicketStageIndex;
  customerName: string;
  sentiment: string;
  logs: string;
  attachments: string[];
  aiConfidence: number;
  triageLatency: string;
  estResolve: string;
  suggestedReply: string;
  createdAt: string;
  thread: ThreadMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  author: string;
  timestamp: string;
  confidence?: string;
  telemetryCallout?: string;
  content: string;
}

export interface OperatorProfile {
  fullName: string;
  designation: string;
  email: string;
  timezone: string;
  bio: string;
}

export interface AppSettings {
  apiKey: string;
  spatialHudEnabled: boolean;
  autoDraftReplies: boolean;
  slaBreachAlerts: boolean;
  autoRedactPii: boolean;
  spatialAudioEnabled: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  channel: 'sylvie' | 'security' | 'cluster';
  message: string;
}

export interface EnterpriseClient {
  id: string;
  name: string;
  arr: string;
  health: number;
  sla: string;
  status: 'Nominal' | 'Watch';
}

export interface VolumePoint {
  label: string;
  totalVolume: number;
  aiOffloaded: number;
}
