import { ticketStatusLabel } from './ticketStatus.js';

const ticketStatuses = ['Open', 'In Progress', 'On Hold', 'Completed', 'Resolved', 'Reopened'];
const ticketPriorities = ['Low', 'Medium', 'High', 'Critical'];

export function getPieSlices(items) {
  const positiveItems = items.filter(item => Number.isFinite(item.value) && item.value > 0);
  const total = positiveItems.reduce((sum, item) => sum + item.value, 0);
  let start = 0;

  return positiveItems.map((item, index) => {
    const end = index === positiveItems.length - 1
      ? 100
      : start + (item.value / total) * 100;
    const slice = {
      ...item,
      start,
      end,
      percentage: (item.value / total) * 100,
    };
    start = end;
    return slice;
  });
}

function countValues(rows, getLabel, labels) {
  const counts = new Map();
  for (const row of rows) {
    const label = getLabel(row) || 'Unknown';
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return (labels || [...counts.keys()].sort((first, second) => first.localeCompare(second)))
    .map(label => ({ label, value: counts.get(label) || 0 }));
}

function ticketGroups(rows) {
  return [
    {
      title: 'Tickets by status',
      items: countValues(rows, ticket => ticket.status, ticketStatuses)
        .map(item => ({ ...item, label: ticketStatusLabel(item.label) })),
    },
    {
      title: 'Tickets by priority',
      items: countValues(rows, ticket => ticket.priority, ticketPriorities),
    },
  ];
}

function customersByMonth(rows) {
  const months = new Map();
  for (const customer of rows) {
    const date = customer.created_at ? new Date(customer.created_at) : null;
    const validDate = date && !Number.isNaN(date.getTime());
    const key = validDate
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : 'unknown';
    const label = validDate
      ? date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : 'Unknown date';
    const entry = months.get(key) || { label, value: 0 };
    entry.value += 1;
    months.set(key, entry);
  }
  return [...months.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, item]) => item);
}

export function getChartGroups(resource, rows, agents = []) {
  if (resource === 'tickets') return ticketGroups(rows);

  if (resource === 'customers') {
    return [{ title: 'Customers added by month', items: customersByMonth(rows) }];
  }

  if (resource === 'agents') {
    return [
      {
        title: 'Agents by activity',
        items: countValues(rows, agent => agent.is_active ? 'Active' : 'Inactive', ['Active', 'Inactive']),
      },
      {
        title: 'Team profiles by role',
        items: countValues(rows, agent => agent.role, ['Agent', 'Manager']),
      },
      {
        title: 'Agents by department',
        items: countValues(rows, agent => agent.department_name),
      },
    ];
  }

  if (resource === 'departments') {
    const agentsByDepartment = new Map();
    for (const agent of agents) {
      agentsByDepartment.set(
        agent.department_id,
        (agentsByDepartment.get(agent.department_id) || 0) + 1,
      );
    }
    return [{
      title: 'Team members by department',
      items: rows.map(department => ({
        label: department.department_name,
        value: agentsByDepartment.get(department.department_id) || 0,
      })),
    }];
  }

  return [];
}
