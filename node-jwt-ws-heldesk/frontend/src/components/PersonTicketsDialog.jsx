import { useState } from 'react';
import { getChartGroups } from '../chartData.js';
import {
  getTicketsForAgent,
  getTicketsForCustomer,
  ticketStatusLabel,
} from '../ticketStatus.js';
import ChartView from './ChartView.jsx';
import ViewToggle from './ViewToggle.jsx';

const ticketStatuses = ['Open', 'In Progress', 'On Hold', 'Completed', 'Resolved', 'Reopened'];

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function PersonTicketsDialog({ person, personType, tickets, onClose }) {
  const [view, setView] = useState('table');
  const isAgent = personType === 'agent';
  const personTickets = isAgent
    ? getTicketsForAgent(tickets, person.agent_id)
    : getTicketsForCustomer(tickets, person.customer_id);
  const chartGroups = getChartGroups('tickets', personTickets);
  const statusCounts = new Map(
    chartGroups[0].items.map(item => [item.label, item.value]),
  );
  const ownerLabel = isAgent ? 'Agent workload' : 'Customer ticket history';
  const ticketListLabel = isAgent ? 'Assigned tickets' : 'Created tickets';
  const relatedPersonColumn = isAgent ? 'Customer' : 'Assigned agent';

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="person-ticket-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-ticket-dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{ownerLabel}</p>
            <h2 id="person-ticket-dialog-title">{person.full_name}</h2>
            <p className="person-detail-subtitle">
              {person.email}
              {(isAgent ? person.department_name : person.phone) && (
                <> · {isAgent ? person.department_name : person.phone}</>
              )}
            </p>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label={`Close ${personType} ticket details`}
          >
            ×
          </button>
        </div>

        <section className="person-ticket-summary" aria-label="Ticket totals by status">
          {ticketStatuses.map(status => (
            <article key={status}>
              <span>{ticketStatusLabel(status)}</span>
              <strong>{statusCounts.get(ticketStatusLabel(status)) || 0}</strong>
            </article>
          ))}
        </section>

        <div className="person-ticket-toolbar">
          <div>
            <h3>{ticketListLabel}</h3>
            <p>{personTickets.length} {personTickets.length === 1 ? 'ticket' : 'tickets'}</p>
          </div>
          <ViewToggle
            view={view}
            onChange={setView}
            label={`${person.full_name} tickets`}
          />
        </div>

        {view === 'table' ? (
          <div className="person-ticket-table-wrap">
            <div className="table-scroll">
              <table className="data-table person-ticket-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>{relatedPersonColumn}</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {personTickets.length ? personTickets.map(ticket => (
                    <tr key={ticket.ticket_id}>
                      <td>
                        <strong>#{ticket.ticket_id} {ticket.title}</strong>
                        {ticket.description && (
                          <span className="table-subtitle">{ticket.description}</span>
                        )}
                      </td>
                      <td>{isAgent ? ticket.customer_name || '—' : ticket.assigned_agent_name || 'Unassigned'}</td>
                      <td>
                        <span className={`priority-pill priority-${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${ticket.status.toLowerCase().replaceAll(' ', '-')}`}>
                          {ticketStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td>{formatDate(ticket.created_at)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="empty-table" colSpan={5}>
                        {isAgent
                          ? 'No tickets are assigned to this agent yet.'
                          : 'This customer has not created any tickets yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <ChartView
            groups={chartGroups}
            emptyMessage={`No ${isAgent ? 'assigned' : 'created'} tickets to chart yet.`}
          />
        )}
      </section>
    </div>
  );
}
