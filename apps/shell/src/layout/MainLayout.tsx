import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, useCurrentUser } from '../auth/AuthContext';
import { NAV_ITEMS } from '../navigation';

export function MainLayout() {
  const user = useCurrentUser();
  const { hasPermission, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-dark bg-primary px-3">
        <span className="navbar-brand fw-semibold">Retail Internet Banking</span>
        <div className="d-flex align-items-center gap-3 text-white">
          <span className="small">
            {user.name} <span className="badge bg-light text-primary ms-1">{user.username}</span>
          </span>
          <button type="button" className="btn btn-sm btn-outline-light" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid flex-grow-1 d-flex flex-column">
        <div className="row flex-grow-1">
          <aside className="col-md-3 col-lg-2 bg-white border-end py-3">
            <div className="nav nav-pills flex-column gap-1">
              {visibleItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="nav-link">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </aside>
          <main className="col-md-9 col-lg-10 py-4 px-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
