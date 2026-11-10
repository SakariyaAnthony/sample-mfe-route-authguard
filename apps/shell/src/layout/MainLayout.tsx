import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary, Toaster, toggleSidebar, useSidebarCollapsed } from '@bank/shared';
import { useAuth, useCurrentUser } from '../auth/AuthContext';
import { Constants, LocaleSwitcher, useI18n } from '../i18n';
import { NAV_ITEMS } from '../navigation';

export function MainLayout() {
  const user = useCurrentUser();
  const { hasPermission, logout } = useAuth();
  const sidebarCollapsed = useSidebarCollapsed();
  const { pathname } = useLocation();
  const { t } = useI18n();
  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-dark bg-primary px-3">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            aria-label={
              sidebarCollapsed
                ? t(Constants.showMenuKey, Constants.showMenu)
                : t(Constants.hideMenuKey, Constants.hideMenu)
            }
            aria-expanded={!sidebarCollapsed}
            onClick={toggleSidebar}
          >
            &#9776;
          </button>
          <span className="navbar-brand fw-semibold">
            {t(Constants.brandTitleKey, Constants.brandTitle)}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3 text-white">
          <LocaleSwitcher variant="dark" />
          <span className="small">
            {user.name} <span className="badge bg-light text-primary ms-1">{user.username}</span>
          </span>
          <button type="button" className="btn btn-sm btn-outline-light" onClick={logout}>
            {t(Constants.logoutKey, Constants.logout)}
          </button>
        </div>
      </nav>

      <div className="container-fluid flex-grow-1 d-flex flex-column">
        <div className="row flex-grow-1">
          {!sidebarCollapsed && (
            <aside className="col-md-3 col-lg-2 bg-white border-end py-3">
              <div className="nav nav-pills flex-column gap-1">
                {visibleItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className="nav-link">
                    {t(item.labelKey, item.label)}
                  </NavLink>
                ))}
              </div>
            </aside>
          )}
          <main className={`${sidebarCollapsed ? 'col-12' : 'col-md-9 col-lg-10'} py-4 px-4`}>
            <ErrorBoundary resetKey={pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
