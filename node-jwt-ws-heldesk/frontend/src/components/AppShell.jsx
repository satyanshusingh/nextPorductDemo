import { useEffect, useRef, useState } from 'react';

const navigation = [
  { id: 'overview', label: 'Overview', symbol: 'OV' },
  { id: 'tickets', label: 'Tickets', symbol: 'TK' },
  { id: 'customers', label: 'Customers', symbol: 'CU' },
  { id: 'agents', label: 'Agents', symbol: 'AG' },
  { id: 'departments', label: 'Departments', symbol: 'DP' },
];

function formatNotificationDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '';
}

export default function AppShell({
  activePage,
  onNavigate,
  onLogout,
  user,
  notifications = [],
  onReadNotification,
  agents = [],
  children,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [onlineAgentsOpen, setOnlineAgentsOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const onlineAgentsMenuRef = useRef(null);
  const onlineAgents = agents.filter(agent =>
    agent.role === 'Agent' && Boolean(agent.is_active) && Boolean(agent.is_online)
  );
  const visibleNavigation = navigation.filter(item =>
    user.role === 'manager' || ['overview', 'tickets'].includes(item.id)
  );

  useEffect(() => {
    if (!notificationsOpen && !onlineAgentsOpen) return undefined;

    const closeOnOutsideClick = event => {
      if (
        !notificationMenuRef.current?.contains(event.target) &&
        !onlineAgentsMenuRef.current?.contains(event.target)
      ) {
        setNotificationsOpen(false);
        setOnlineAgentsOpen(false);
      }
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setOnlineAgentsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationsOpen, onlineAgentsOpen]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand sidebar-brand" href="/" aria-label="Helpdesk home">
          <span className="brand-mark">H</span>
          <span>helpdesk<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {visibleNavigation.map(item => (
            <button
              type="button"
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'is-selected' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-symbol">{item.symbol}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-dot" />
            <div><strong>All systems ready</strong><small>Workspace is up to date</small></div>
          </div>
          <button type="button" className="nav-item nav-logout" onClick={onLogout}>
            <span className="nav-symbol">↗</span>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Helpdesk</span><span className="breadcrumb-divider">/</span>
            <strong>{visibleNavigation.find(item => item.id === activePage)?.label || 'Overview'}</strong>
          </div>
          <div className="topbar-actions">
            {user.role === 'manager' && activePage === 'overview' && (
              <div className="notification-menu" ref={onlineAgentsMenuRef}>
                <button
                  type="button"
                  className="notification-button"
                  onClick={() => {
                    setOnlineAgentsOpen(open => !open);
                    setNotificationsOpen(false);
                  }}
                  aria-label={`Online agents${onlineAgents.length ? `, ${onlineAgents.length} online` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={onlineAgentsOpen}
                  aria-controls="online-agents-panel"
                  title="View online agents"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {onlineAgents.length > 0 && (
                    <span className="notification-count" aria-hidden="true">
                      {onlineAgents.length > 9 ? '9+' : onlineAgents.length}
                    </span>
                  )}
                </button>
                {onlineAgentsOpen && (
                  <section
                    className="notification-panel"
                    id="online-agents-panel"
                    role="dialog"
                    aria-labelledby="online-agents-panel-title"
                  >
                    <header className="notification-panel-header">
                      <div>
                        <p className="eyebrow">TEAM PRESENCE</p>
                        <h2 id="online-agents-panel-title">Online agents</h2>
                        <p>{onlineAgents.length} {onlineAgents.length === 1 ? 'agent' : 'agents'} online</p>
                      </div>
                      <button
                        type="button"
                        className="notification-close"
                        onClick={() => setOnlineAgentsOpen(false)}
                        aria-label="Close online agents"
                      >
                        ×
                      </button>
                    </header>
                    {onlineAgents.length ? (
                      <ul className="notification-panel-list online-agent-list">
                        {onlineAgents.map(agent => (
                          <li key={agent.agent_id}>
                            <span className="online-agent-dot" aria-hidden="true" />
                            <div className="notification-copy">
                              <strong>{agent.full_name}</strong>
                              <small>{agent.department_name}</small>
                            </div>
                            <span className="online-agent-status">Online</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="notification-panel-empty">No agents are online right now.</p>
                    )}
                  </section>
                )}
              </div>
            )}
            {['manager', 'customer'].includes(user.role) && (
              <div className="notification-menu" ref={notificationMenuRef}>
                <button
                  type="button"
                  className="notification-button"
                  onClick={() => {
                    setNotificationsOpen(open => !open);
                    setOnlineAgentsOpen(false);
                  }}
                  aria-label={`Notifications${notifications.length ? `, ${notifications.length} unread` : ''}`}
                  aria-haspopup="dialog"
                  aria-expanded={notificationsOpen}
                  aria-controls="notification-panel"
                  title="View notifications"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="notification-count" aria-hidden="true">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <section
                    className="notification-panel"
                    id="notification-panel"
                    role="dialog"
                    aria-labelledby="notification-panel-title"
                  >
                    <header className="notification-panel-header">
                      <div>
                        <p className="eyebrow">INBOX</p>
                        <h2 id="notification-panel-title">
                          {user.role === 'manager' ? 'Team notifications' : 'Ticket updates'}
                        </h2>
                        <p>{notifications.length} unread {notifications.length === 1 ? 'notification' : 'notifications'}</p>
                      </div>
                      <button
                        type="button"
                        className="notification-close"
                        onClick={() => setNotificationsOpen(false)}
                        aria-label="Close notifications"
                      >
                        ×
                      </button>
                    </header>
                    {notifications.length ? (
                      <ul className="notification-panel-list">
                        {notifications.map(notification => {
                          const createdAt = formatNotificationDate(notification.created_at);
                          return (
                            <li key={notification.notification_id}>
                              <div className="notification-copy">
                                {notification.ticket_id ? (
                                  <button
                                    type="button"
                                    className="notification-ticket"
                                    onClick={() => {
                                      onNavigate('tickets');
                                      setNotificationsOpen(false);
                                    }}
                                  >
                                    {notification.message}
                                  </button>
                                ) : (
                                  <p>{notification.message}</p>
                                )}
                                {createdAt && <time dateTime={new Date(notification.created_at).toISOString()}>{createdAt}</time>}
                              </div>
                              <button
                                type="button"
                                className="notification-dismiss"
                                onClick={() => onReadNotification(notification.notification_id)}
                                aria-label={`Dismiss notification: ${notification.message}`}
                              >
                                Dismiss
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="notification-panel-empty">You’re all caught up. New updates will appear here.</p>
                    )}
                  </section>
                )}
              </div>
            )}
            <div className="profile-chip">
              <span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span>
              <span className="profile-copy">
                <strong>{user.username}</strong>
                <small>{user.role}</small>
              </span>
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
