const views = [
  {
    id: 'table',
    label: 'Table',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2.5" y="3" width="15" height="14" rx="2" />
        <path d="M2.5 8h15M7.5 8v9M12.5 8v9" />
      </svg>
    ),
  },
  {
    id: 'chart',
    label: 'Chart',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 17V9h3v8M8.5 17V4h3v13M14 17v-6h3v6M2 17.5h16" />
      </svg>
    ),
  },
];

export default function ViewToggle({ view, onChange, label = 'Data' }) {
  return (
    <div className="view-toggle" role="group" aria-label={`${label} view`}>
      {views.map(item => (
        <button
          type="button"
          key={item.id}
          className={`view-toggle-button ${view === item.id ? 'is-selected' : ''}`}
          aria-pressed={view === item.id}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
