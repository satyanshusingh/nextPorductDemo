import assert from 'node:assert/strict';
import test from 'node:test';
import { getChartGroups, getPieSlices } from '../src/chartData.js';
import { getTicketsForAgent, getTicketsForCustomer } from '../src/ticketStatus.js';

test('pie slices skip empty values and span the complete chart', () => {
  const slices = getPieSlices([
    { label: 'Open', value: 3 },
    { label: 'In progress', value: 1 },
    { label: 'Resolved', value: 0 },
  ]);

  assert.deepEqual(slices.map(({ label, start, end }) => ({ label, start, end })), [
    { label: 'Open', start: 0, end: 75 },
    { label: 'In progress', start: 75, end: 100 },
  ]);
  assert.equal(slices.reduce((total, item) => total + item.percentage, 0), 100);
});

test('ticket charts count statuses and priorities from the supplied rows', () => {
  const rows = [
    { status: 'Open', priority: 'High' },
    { status: 'Completed', priority: 'High' },
    { status: 'Open', priority: 'Low' },
  ];

  const [statuses, priorities] = getChartGroups('tickets', rows);

  assert.equal(statuses.title, 'Tickets by status');
  assert.deepEqual(
    statuses.items.filter(item => item.value > 0),
    [
      { label: 'Open', value: 2 },
      { label: 'Needs Approval', value: 1 },
    ],
  );
  assert.deepEqual(
    priorities.items.filter(item => item.value > 0),
    [
      { label: 'Low', value: 1 },
      { label: 'High', value: 2 },
    ],
  );
});

test('ticket chart output changes when its input rows change', () => {
  const before = getChartGroups('tickets', [{ status: 'Open', priority: 'Low' }]);
  const after = getChartGroups('tickets', [
    { status: 'Resolved', priority: 'Critical' },
    { status: 'Resolved', priority: 'Critical' },
  ]);

  assert.equal(before[0].items.find(item => item.label === 'Open').value, 1);
  assert.equal(after[0].items.find(item => item.label === 'Open').value, 0);
  assert.equal(after[0].items.find(item => item.label === 'Complete').value, 2);
  assert.equal(after[1].items.find(item => item.label === 'Critical').value, 2);
});

test('customer chart groups accounts by month and keeps undated rows', () => {
  const groups = getChartGroups('customers', [
    { created_at: '2026-03-12' },
    { created_at: '2026-02-01' },
    { created_at: 'not-a-date' },
    {},
    { created_at: '2026-03-28' },
  ]);

  assert.deepEqual(groups[0].items.map(item => item.value), [1, 2, 2]);
  assert.equal(groups[0].items[2].label, 'Unknown date');
});

test('agent charts handle numeric activity flags and group by role and department', () => {
  const groups = getChartGroups('agents', [
    { is_active: 1, role: 'Agent', department_name: 'Support' },
    { is_active: 0, role: 'Agent', department_name: 'Support' },
    { is_active: true, role: 'Manager', department_name: 'Operations' },
  ]);

  assert.deepEqual(groups[0].items, [
    { label: 'Active', value: 2 },
    { label: 'Inactive', value: 1 },
  ]);
  assert.deepEqual(groups[1].items, [
    { label: 'Agent', value: 2 },
    { label: 'Manager', value: 1 },
  ]);
  assert.deepEqual(groups[2].items, [
    { label: 'Operations', value: 1 },
    { label: 'Support', value: 2 },
  ]);
});

test('department chart includes departments without assigned team members', () => {
  const groups = getChartGroups(
    'departments',
    [
      { department_id: 1, department_name: 'Support' },
      { department_id: 2, department_name: 'Operations' },
    ],
    [{ department_id: 1 }, { department_id: 1 }],
  );

  assert.deepEqual(groups[0].items, [
    { label: 'Support', value: 2 },
    { label: 'Operations', value: 0 },
  ]);
});

test('agent ticket details include only tickets assigned to that agent', () => {
  const tickets = [
    { ticket_id: 1, assigned_agent_id: 4 },
    { ticket_id: 2, assigned_agent_id: 7 },
    { ticket_id: 3, assigned_agent_id: null },
    { ticket_id: 4, assigned_agent_id: '4' },
  ];

  assert.deepEqual(
    getTicketsForAgent(tickets, 4).map(ticket => ticket.ticket_id),
    [1, 4],
  );
  assert.deepEqual(getTicketsForAgent(tickets, null), []);
});

test('customer ticket history includes only tickets created by that customer', () => {
  const tickets = [
    { ticket_id: 1, customer_id: 3 },
    { ticket_id: 2, customer_id: 9 },
    { ticket_id: 3, customer_id: null },
    { ticket_id: 4, customer_id: '3' },
  ];

  assert.deepEqual(
    getTicketsForCustomer(tickets, 3).map(ticket => ticket.ticket_id),
    [1, 4],
  );
  assert.deepEqual(getTicketsForCustomer(tickets, null), []);
});
