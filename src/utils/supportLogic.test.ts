import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_TICKETS } from '../data/seedData';
import {
  advanceTicketStage,
  buildNewTicket,
  computePasskeyStrength,
  computeTicketDiagnostic,
  filterTickets,
  generateNextTicketId,
  generateSylvieReply,
  maskApiKey,
  rotateApiKey,
} from './supportLogic';

test('filterTickets handles status/priority tabs and search queries', () => {
  const all = filterTickets(INITIAL_TICKETS, { filter: 'all' });
  assert.equal(all.length, INITIAL_TICKETS.length);

  const highOnly = filterTickets(INITIAL_TICKETS, { filter: 'High' });
  assert.ok(highOnly.every((t) => t.priority === 'High' || t.priority === 'Urgent'));
  assert.ok(highOnly.length >= 2);

  const resolvedOnly = filterTickets(INITIAL_TICKETS, { filter: 'Resolved' });
  assert.equal(resolvedOnly.length, 1);
  assert.equal(resolvedOnly[0].id, '#TKT-8899');

  const searchResult = filterTickets(INITIAL_TICKETS, {
    filter: 'all',
    searchQuery: 'FIDO2',
  });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, '#TKT-8914');
});

test('computeTicketDiagnostic scores OOMKilled higher and suggests K8s runbooks', () => {
  const diag = computeTicketDiagnostic(
    'K8s worker pod OOMKilled exit 137',
    'Container memory exceeded 5GiB',
    'High'
  );
  assert.equal(diag.riskIndex, 89);
  assert.equal(diag.autoRepairReady, true);
  assert.ok(diag.matchedKnowledge.some((k) => k.includes('OOMKilled')));

  const lowDiag = computeTicketDiagnostic('Seat count bump', 'Adding 5 seats', 'Low');
  assert.ok(lowDiag.riskIndex < 30);
  assert.equal(lowDiag.autoRepairReady, false);
});

test('generateNextTicketId and buildNewTicket produce valid sequential tickets', () => {
  const nextId = generateNextTicketId(INITIAL_TICKETS);
  assert.equal(nextId, '#TKT-8922');

  const created = buildNewTicket(
    {
      subject: 'Ingress TLS handshake timeout',
      category: 'API & Webhook Telemetry',
      environment: 'Production Cluster (AWS us-east-1)',
      priority: 'Urgent',
      logs: 'HTTP 502 spike on edge gateway',
      customerName: 'Alex Chen',
    },
    INITIAL_TICKETS
  );
  assert.equal(created.id, '#TKT-8922');
  assert.equal(created.status, 'In Progress');
  assert.equal(created.thread.length, 2);
});

test('advanceTicketStage progresses lifecycle and updates status accurately', () => {
  const t0 = INITIAL_TICKETS[0]; // stageIndex 2, In Progress
  const t3 = advanceTicketStage(t0);
  assert.equal(t3.stageIndex, 3);
  assert.equal(t3.status, 'Resolved');
  assert.equal(t3.estResolve, '0m');

  const t4 = advanceTicketStage(t3);
  assert.equal(t4.stageIndex, 4);
  assert.equal(t4.status, 'Closed');
});

test('generateSylvieReply tailors output to OOM and SLA queries', () => {
  const oom = generateSylvieReply('Why did worker-alpha-09 exit 137?', INITIAL_TICKETS);
  assert.ok(oom.content.includes('OOMKiller'));
  assert.ok(oom.telemetryCallout?.includes('worker-alpha-09'));

  const sla = generateSylvieReply('Summarize active incidents', INITIAL_TICKETS);
  assert.ok(sla.content.includes('#TKT-8921'));
});

test('security helpers mask, rotate keys, and evaluate passkey strength', () => {
  const key = 'ssai_live_98f2a4c1d9e044b71a22';
  assert.equal(maskApiKey(key, true), key);
  assert.ok(maskApiKey(key, false).startsWith('ssai_live_'));
  assert.ok(maskApiKey(key, false).includes('•'));

  const rotated = rotateApiKey(12345);
  assert.ok(rotated.startsWith('ssai_live_'));
  assert.notEqual(rotated, key);

  const strong = computePasskeyStrength('Quantum#2026!Secure');
  assert.ok(strong.percent >= 90);
  assert.equal(strong.label, 'IMPERVIOUS');
});
