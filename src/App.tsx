import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPortal } from './components/AuthPortal';
import { CreateTicketView } from './components/CreateTicketView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { StaffDashboard } from './components/StaffDashboard';
import { SylvieChatbotView } from './components/SylvieChatbotView';
import { TicketTrackingView } from './components/TicketTrackingView';
import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_TICKETS,
} from './data/seedData';
import type {
  AppSettings,
  AuditEvent,
  AuthScreenMode,
  ChatMessage,
  OperatorProfile,
  SupportTicket,
  TicketStageIndex,
  UserRole,
  WorkspaceView,
} from './types/support';
import {
  advanceTicketStage,
  buildNewTicket,
  type CreateTicketInput,
  generateSylvieReply,
  getRoleUserIdentity,
  rotateApiKey,
} from './utils/supportLogic';

const STORAGE_KEY = 'smartsupport_ai_state_v1';

interface PersistedState {
  isAuthenticated: boolean;
  authMode: AuthScreenMode;
  role: UserRole;
  view: WorkspaceView;
  selectedTicketId: string;
  customerName: string;
  tickets: SupportTicket[];
  chatMessages: ChatMessage[];
  auditEvents: AuditEvent[];
  profile: OperatorProfile;
  settings: AppSettings;
}

function loadInitialState(): PersistedState {
  const params = new URLSearchParams(window.location.search);
  const autostart = params.get('autostart') === '1';
  const paramTier = params.get('tier') as UserRole | null;
  const paramView = params.get('view') as WorkspaceView | null;

  let saved: Partial<PersistedState> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    saved = {};
  }

  const validRoles: UserRole[] = ['customer', 'staff', 'admin'];
  const validViews: WorkspaceView[] = [
    'dashboard',
    'tracking',
    'create-ticket',
    'chatbot',
    'settings',
  ];

  const role: UserRole =
    paramTier && validRoles.includes(paramTier)
      ? paramTier
      : saved.role && validRoles.includes(saved.role)
      ? saved.role
      : 'customer';

  const view: WorkspaceView =
    paramView && validViews.includes(paramView)
      ? paramView
      : saved.view && validViews.includes(saved.view)
      ? saved.view
      : 'dashboard';

  return {
    isAuthenticated: autostart ? true : Boolean(saved.isAuthenticated),
    authMode: saved.authMode === 'signup' ? 'signup' : 'login',
    role,
    view,
    selectedTicketId: saved.selectedTicketId || INITIAL_TICKETS[0].id,
    customerName: saved.customerName || 'Alex Chen',
    tickets: Array.isArray(saved.tickets) && saved.tickets.length > 0 ? saved.tickets : INITIAL_TICKETS,
    chatMessages:
      Array.isArray(saved.chatMessages) && saved.chatMessages.length > 0
        ? saved.chatMessages
        : INITIAL_CHAT_MESSAGES,
    auditEvents:
      Array.isArray(saved.auditEvents) && saved.auditEvents.length > 0
        ? saved.auditEvents
        : INITIAL_AUDIT_EVENTS,
    profile: saved.profile ? { ...DEFAULT_PROFILE, ...saved.profile } : DEFAULT_PROFILE,
    settings: saved.settings ? { ...DEFAULT_SETTINGS, ...saved.settings } : DEFAULT_SETTINGS,
  };
}

function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const notify = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 3200);
  };

  const pushAudit = (channel: AuditEvent['channel'], message: string): AuditEvent => ({
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: 'Just now',
    channel,
    message,
  });

  const handleAuthenticate = (tier: UserRole, email: string, fullName?: string) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      role: tier,
      view: 'dashboard',
      customerName: fullName?.trim() || prev.customerName,
      auditEvents: [
        pushAudit('security', `Quantum link authenticated for ${email} (${tier})`),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify('Biometric quantum link established.');
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      authMode: 'login',
    }));
    notify('Session locked & signed out.');
  };

  const handleNavigate = (nextView: WorkspaceView) => {
    setMobileMenuOpen(false);
    setState((prev) => ({ ...prev, view: nextView }));
  };

  const handleSwitchRole = (nextRole: UserRole) => {
    setMobileMenuOpen(false);
    setState((prev) => ({
      ...prev,
      role: nextRole,
      view: 'dashboard',
    }));
  };

  const handleSelectTicket = (ticketId: string) => {
    setMobileMenuOpen(false);
    setState((prev) => ({
      ...prev,
      selectedTicketId: ticketId,
      view: 'tracking',
    }));
  };

  const handleCreateTicket = (input: CreateTicketInput) => {
    const newTicket = buildNewTicket(input, state.tickets);
    setState((prev) => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets],
      selectedTicketId: newTicket.id,
      view: 'tracking',
      auditEvents: [
        pushAudit('sylvie', `Sylvie pre-triaged ${newTicket.id}: ${newTicket.title}`),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify(`Ticket ${newTicket.id} dispatched to Neural Mesh.`);
  };

  const handleSendTrackingMessage = (ticketId: string, content: string) => {
    const identity = getRoleUserIdentity(state.role, state.customerName);
    const userMsgId = `m-${Date.now()}-u`;
    const aiReply = generateSylvieReply(content, state.tickets);

    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          thread: [
            ...t.thread,
            {
              id: userMsgId,
              sender:
                prev.role === 'staff'
                  ? prev.profile.fullName
                  : identity.name,
              role: prev.role === 'staff' ? 'staff' : 'user',
              timestamp: 'Just now',
              content,
            },
            {
              id: `m-${Date.now()}-ai`,
              sender: 'Sylvie AI Copilot',
              role: 'ai',
              timestamp: 'Just now',
              latency: '0.8s',
              confidence: aiReply.confidence,
              content: aiReply.content,
            },
          ],
        };
      }),
    }));
  };

  const handleAdvanceStage = (ticketId: string, targetStage?: TicketStageIndex) => {
    let updatedStatus = '';
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        const next = advanceTicketStage(t, targetStage);
        updatedStatus = next.status;
        return next;
      }),
      auditEvents: [
        pushAudit('cluster', `Lifecycle milestone updated for ${ticketId}`),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify(`Ticket ${ticketId} milestone updated (${updatedStatus || 'Progressed'}).`);
  };

  const handleRunSreTrigger = (ticketId: string, actionName: string) => {
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          thread: [
            ...t.thread,
            {
              id: `m-${Date.now()}-sys`,
              sender: 'Sylvie SRE Automation',
              role: 'ai',
              timestamp: 'Just now',
              latency: '0.4s',
              content: `Executed fast-path trigger "${actionName}". Telemetry verification probes report nominal state.`,
            },
          ],
        };
      }),
      auditEvents: [
        pushAudit('cluster', `${actionName} executed on ${ticketId}`),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify(`${actionName} executed on ${ticketId}.`);
  };

  const handleApproveStaffReply = (ticketId: string, replyText: string) => {
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Resolved',
          stageIndex: 3,
          estResolve: '0m',
          operator: prev.profile.fullName,
          thread: [
            ...t.thread,
            {
              id: `m-${Date.now()}-staff`,
              sender: `${prev.profile.fullName} (Staff SRE)`,
              role: 'staff',
              timestamp: 'Just now',
              content: replyText,
            },
          ],
        };
      }),
      auditEvents: [
        pushAudit('sylvie', `Staff reply approved & dispatched for ${ticketId}`),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify(`Neural reply dispatched for ${ticketId} and marked Resolved.`);
  };

  const handleBatchApprove = () => {
    setState((prev) => {
      const openIds = prev.tickets
        .filter((t) => t.status === 'Open' && (t.priority === 'Low' || t.priority === 'Medium'))
        .map((t) => t.id);

      if (openIds.length === 0) {
        return prev;
      }

      return {
        ...prev,
        tickets: prev.tickets.map((t) =>
          openIds.includes(t.id)
            ? {
                ...t,
                status: 'Resolved',
                stageIndex: 3,
                estResolve: '0m',
                thread: [
                  ...t.thread,
                  {
                    id: `m-${Date.now()}-${t.id}`,
                    sender: `${prev.profile.fullName} (Batch Approve)`,
                    role: 'staff',
                    timestamp: 'Just now',
                    content: t.suggestedReply,
                  },
                ],
              }
            : t
        ),
        auditEvents: [
          pushAudit('sylvie', `Batch approved ${openIds.length} low-risk drafts`),
          ...prev.auditEvents,
        ].slice(0, 8),
      };
    });
    notify('All queued low-risk drafts approved and dispatched.');
  };

  const handleChatQuery = (prompt: string) => {
    const identity = getRoleUserIdentity(state.role, state.customerName);
    const reply = generateSylvieReply(prompt, state.tickets);

    setState((prev) => ({
      ...prev,
      chatMessages: [
        ...prev.chatMessages,
        {
          id: `c-${Date.now()}-u`,
          role: 'user',
          author: prev.role === 'staff' ? prev.profile.fullName : identity.name,
          timestamp: 'Just now',
          content: prompt,
        },
        {
          id: `c-${Date.now()}-ai`,
          role: 'ai',
          author: 'Sylvie AI',
          timestamp: 'Just now',
          confidence: reply.confidence,
          telemetryCallout: reply.telemetryCallout,
          content: reply.content,
        },
      ],
    }));
  };

  const handleClearChat = () => {
    setState((prev) => ({
      ...prev,
      chatMessages: [
        {
          id: `c-${Date.now()}`,
          role: 'ai',
          author: 'Sylvie AI',
          timestamp: 'Just now',
          confidence: '99.5%',
          content: 'Neural context cleared. Ready for new diagnostic commands.',
        },
      ],
    }));
  };

  const handleSaveProfile = (nextProfile: OperatorProfile) => {
    setState((prev) => ({
      ...prev,
      profile: nextProfile,
      auditEvents: [
        pushAudit('security', `Operator profile updated for ${nextProfile.fullName}`),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify('Profile & spatial HUD settings saved.');
  };

  const handleRotateKey = () => {
    const nextKey = rotateApiKey();
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, apiKey: nextKey },
      auditEvents: [
        pushAudit('security', 'Neural API entropy key rotated'),
        ...prev.auditEvents,
      ].slice(0, 8),
    }));
    notify('Entropy keys rotated successfully.');
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isAuthenticated: true,
      authMode: 'login',
      role: state.role,
      view: 'settings',
      selectedTicketId: INITIAL_TICKETS[0].id,
      customerName: 'Alex Chen',
      tickets: INITIAL_TICKETS,
      chatMessages: INITIAL_CHAT_MESSAGES,
      auditEvents: INITIAL_AUDIT_EVENTS,
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
    });
    notify('Workspace reset to deterministic demo state.');
  };

  if (!state.isAuthenticated) {
    return (
      <>
        <AuthPortal
          mode={state.authMode}
          selectedTier={state.role}
          onModeChange={(mode) => setState((prev) => ({ ...prev, authMode: mode }))}
          onSelectTier={(tier) => setState((prev) => ({ ...prev, role: tier }))}
          onAuthenticate={handleAuthenticate}
          onNotify={notify}
        />
        {toastMsg && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 rounded-xl border border-cyan-400 bg-slate-900 px-4 py-3 text-xs font-medium text-slate-100 shadow-2xl"
          >
            {toastMsg}
          </div>
        )}
      </>
    );
  }

  const activeTicket =
    state.tickets.find((t) => t.id === state.selectedTicketId) ?? state.tickets[0];
  const userIdentity =
    state.role === 'staff'
      ? {
          name: state.profile.fullName,
          badgeLabel: 'Staff · Tier-3 SRE',
          initials:
            state.profile.fullName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0].toUpperCase())
              .join('') || 'ER',
        }
      : getRoleUserIdentity(state.role, state.customerName);

  const navItems: Array<{
    id: WorkspaceView;
    label: string;
    icon: typeof LayoutDashboard;
    meta?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard / Overview', icon: LayoutDashboard },
    {
      id: 'tracking',
      label: 'Live Ticket Tracking',
      icon: Activity,
      meta: activeTicket?.id.replace('#TKT-', '#'),
    },
    { id: 'create-ticket', label: 'Create Support Ticket', icon: Plus },
    { id: 'chatbot', label: 'Sylvie AI Assistant', icon: Bot },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-3 px-2 pb-4 mb-4 border-b border-cyan-400/15">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center font-display font-extrabold text-slate-950">
            S
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-white">SmartSupport</div>
            <div className="font-mono text-[10px] text-cyan-300">Spatial Support Suite</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Workspace Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = state.view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-cyan-400/20 to-cyan-400/5 text-cyan-300 border border-cyan-400/30 font-semibold'
                    : 'text-slate-400 hover:bg-cyan-400/5 hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.meta && (
                  <span className="font-mono text-[10px] text-cyan-300 shrink-0">{item.meta}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-5 rounded-xl border border-cyan-400/15 bg-slate-900/80 p-3">
          <div className="font-mono text-[10px] text-slate-400 mb-2">WORKSPACE PERSPECTIVE</div>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['customer', 'staff', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleSwitchRole(r)}
                className={`py-1.5 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                  state.role === r
                    ? 'bg-cyan-400/20 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-400/15 bg-slate-900/80 p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 grid place-items-center font-display font-bold text-xs text-slate-950 shrink-0">
            {userIdentity.initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{userIdentity.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{userIdentity.badgeLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out and switch tier"
          title="Switch Account / Logout"
          className="p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-400/45 hover:text-white transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#060913] text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[248px] shrink-0 bg-[#080c18] border-r border-cyan-400/15 p-4 sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 max-w-[85vw] bg-[#080c18] border-r border-cyan-400/20 p-4 h-full">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-cyan-400/15 bg-[#080c18]/95 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg border border-cyan-400/20 bg-slate-900 text-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="global-search" className="sr-only">
                Search tickets and knowledge
              </label>
              <input
                id="global-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    notify(`Filtered workspace for "${searchQuery.trim()}"`);
                  }
                }}
                placeholder="Query neural knowledge, tickets, or commands..."
                className="w-full rounded-full bg-slate-900/90 border border-slate-700/70 pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:inline-flex bg-slate-900 border border-cyan-400/15 rounded-lg p-1 gap-0.5">
              {(['customer', 'staff', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    handleSwitchRole(r);
                    handleNavigate('dashboard');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors whitespace-nowrap ${
                    state.role === r
                      ? 'bg-cyan-400/20 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('create-ticket')}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-bold text-xs hover:brightness-105 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>New Ticket</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6">
          {state.view === 'dashboard' && state.role === 'customer' && (
            <CustomerDashboard
              customerName={userIdentity.name}
              tickets={state.tickets}
              auditEvents={state.auditEvents}
              searchQuery={searchQuery}
              onNavigate={handleNavigate}
              onSelectTicket={handleSelectTicket}
            />
          )}

          {state.view === 'dashboard' && state.role === 'staff' && (
            <StaffDashboard
              tickets={state.tickets}
              searchQuery={searchQuery}
              onApproveReply={handleApproveStaffReply}
              onBatchApprove={handleBatchApprove}
              onInspectTicket={handleSelectTicket}
            />
          )}

          {state.view === 'dashboard' && state.role === 'admin' && (
            <AdminDashboard
              tickets={state.tickets}
              onExportAudit={() => {
                downloadJsonFile('smartsupport-audit-telemetry.json', {
                  exportedAt: new Date().toISOString(),
                  ticketsCount: state.tickets.length,
                  auditEvents: state.auditEvents,
                });
                notify('Zero-trust audit telemetry exported.');
              }}
            />
          )}

          {state.view === 'create-ticket' && (
            <CreateTicketView
              customerName={state.customerName}
              onSubmitTicket={handleCreateTicket}
              onCancel={() => handleNavigate('dashboard')}
            />
          )}

          {state.view === 'tracking' && activeTicket && (
            <TicketTrackingView
              ticket={activeTicket}
              allTickets={state.tickets}
              onSelectTicket={(id) =>
                setState((prev) => ({ ...prev, selectedTicketId: id }))
              }
              onSendMessage={handleSendTrackingMessage}
              onAdvanceStage={handleAdvanceStage}
              onRunSreTrigger={handleRunSreTrigger}
              onDownloadBundle={(ticket) => {
                downloadJsonFile(`${ticket.id.replace('#', '')}-diagnostics.json`, ticket);
                notify(`Diagnostic bundle downloaded for ${ticket.id}.`);
              }}
            />
          )}

          {state.view === 'chatbot' && (
            <SylvieChatbotView
              messages={state.chatMessages}
              spatialAudioEnabled={state.settings.spatialAudioEnabled}
              onToggleAudio={() =>
                setState((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    spatialAudioEnabled: !prev.settings.spatialAudioEnabled,
                  },
                }))
              }
              onSendQuery={handleChatQuery}
              onClearThread={handleClearChat}
            />
          )}

          {state.view === 'settings' && (
            <ProfileSettingsView
              profile={state.profile}
              settings={state.settings}
              onSaveProfile={handleSaveProfile}
              onUpdateSettings={(nextSettings) =>
                setState((prev) => ({ ...prev, settings: nextSettings }))
              }
              onRotateKey={handleRotateKey}
              onResetDemo={handleResetDemo}
              onNotify={notify}
            />
          )}
        </main>
      </div>

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-5 z-50 rounded-xl border border-cyan-400/60 bg-[#0b1120] px-4 py-2.5 text-xs font-medium text-slate-100 shadow-2xl flex items-center gap-3 max-w-sm"
        >
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
