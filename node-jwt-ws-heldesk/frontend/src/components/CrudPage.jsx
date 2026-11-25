import { useMemo, useState } from 'react';
import { getChartGroups } from '../chartData.js';
import ChartView from './ChartView.jsx';
import DataTable from './DataTable.jsx';
import EntityFormDialog from './EntityFormDialog.jsx';
import PersonTicketsDialog from './PersonTicketsDialog.jsx';
import ViewToggle from './ViewToggle.jsx';

export default function CrudPage({
  title,
  description,
  resource,
  rows,
  fields,
  columns,
  idField,
  relatedAgents,
  relatedTickets = [],
  canManage,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] = useState(null);
  const [viewingPerson, setViewingPerson] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');
  const isCreating = editing === 'new';
  const record = isCreating ? null : editing;

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(row => columns.some(column => {
      const value = column.render
        ? `${row[column.key] ?? ''}`
        : `${row[column.key] ?? ''}`;
      return value.toLowerCase().includes(query);
    }));
  }, [columns, rows, search]);
  const chartGroups = useMemo(
    () => getChartGroups(resource, visibleRows, relatedAgents),
    [relatedAgents, resource, visibleRows],
  );
  const hasTicketHistory = canManage && ['agents', 'customers'].includes(resource);
  const personType = resource === 'agents' ? 'agent' : 'customer';
  const tableColumns = hasTicketHistory
    ? columns.map(column => column.key === 'full_name'
      ? {
        ...column,
        render: (value, row) => (
          <button
            type="button"
            className="ticket-history-link"
            onClick={() => setViewingPerson({ person: row, personType })}
            aria-label={`View tickets ${personType === 'agent' ? 'assigned to' : 'created by'} ${value}`}
          >
            {value}
          </button>
        ),
      }
      : column)
    : columns;

  const submit = async values => {
    await onSave(resource, record?.[idField], values);
    setEditing(null);
  };

  const remove = async row => {
    if (!window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, '')}?`)) return;
    await onDelete(resource, row[idField]);
  };

  const emptyOptions = fields.some(field =>
    field.type === 'select' && field.required && field.options?.length === 0
  );

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">HELPDESK MANAGEMENT</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        {canManage && (
          <button
            type="button"
            className="button-primary create-button"
            onClick={() => setEditing('new')}
            disabled={emptyOptions}
            title={emptyOptions ? 'Add the required related records first.' : undefined}
          >
            <span>+</span> Add {title.slice(0, -1).toLowerCase()}
          </button>
        )}
      </section>

      <section className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>All {title.toLowerCase()}</h2>
            <p>{rows.length} {rows.length === 1 ? 'record' : 'records'}</p>
          </div>
          <div className="table-toolbar-tools">
            <label className="search-box">
              <span className="search-icon">⌕</span>
              <input
                type="search"
                placeholder={`Search ${title.toLowerCase()}`}
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </label>
            <ViewToggle view={view} onChange={setView} label={title} />
          </div>
        </div>
        {view === 'table' ? (
          <DataTable
            columns={tableColumns}
            rows={visibleRows}
            idField={idField}
            canManage={canManage}
            onEdit={setEditing}
            onDelete={remove}
          />
        ) : (
          <ChartView groups={chartGroups} emptyMessage={`No ${title.toLowerCase()} to chart yet.`} />
        )}
      </section>

      {editing && (
        <EntityFormDialog
          title={`${isCreating ? 'Add' : 'Edit'} ${title.slice(0, -1).toLowerCase()}`}
          fields={fields}
          record={record}
          onClose={() => setEditing(null)}
          onSubmit={submit}
        />
      )}

      {viewingPerson && (
        <PersonTicketsDialog
          person={viewingPerson.person}
          personType={viewingPerson.personType}
          tickets={relatedTickets}
          onClose={() => setViewingPerson(null)}
        />
      )}
    </>
  );
}
