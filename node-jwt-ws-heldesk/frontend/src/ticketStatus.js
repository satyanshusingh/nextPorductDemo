export function ticketStatusLabel(status) {
  if (status === 'Completed') return 'Needs Approval'
  if (status === 'Resolved') return 'Complete'
  return status
}

export function getTicketsForAgent(tickets, agentId) {
  const id = Number(agentId);
  if (!Number.isSafeInteger(id) || id < 1) return [];
  return tickets.filter(ticket => Number(ticket.assigned_agent_id) === id);
}

export function getTicketsForCustomer(tickets, customerId) {
  const id = Number(customerId);
  if (!Number.isSafeInteger(id) || id < 1) return [];
  return tickets.filter(ticket => Number(ticket.customer_id) === id);
}
