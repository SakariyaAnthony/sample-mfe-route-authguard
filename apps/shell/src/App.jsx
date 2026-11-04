import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PermissionRoute } from './routes/PermissionRoute';
import { GuestRoute } from './routes/GuestRoute';
import { RemoteBoundary } from './components/RemoteBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Each remote is fetched from its own server only when its route is first visited.
const AccountsApp = lazy(() => import('accounts/App'));
const CardsApp = lazy(() => import('cards/App'));
const UtilityApp = lazy(() => import('utility/App'));
const TransferApp = lazy(() => import('transfer/App'));
const BeneficiaryApp = lazy(() => import('beneficiary/App'));

const remoteRoutes = [
  { path: 'accounts', name: 'Accounts', permission: 'accounts', Component: AccountsApp },
  { path: 'cards', name: 'Cards', permission: 'cards', Component: CardsApp },
  { path: 'utility', name: 'Bill Payments', permission: 'utility', Component: UtilityApp },
  { path: 'transfer', name: 'Fund Transfer', permission: 'transfer', Component: TransferApp },
  { path: 'beneficiary', name: 'Beneficiaries', permission: 'beneficiary', Component: BeneficiaryApp },
];

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {remoteRoutes.map(({ path, name, permission, Component }) => (
            <Route key={path} element={<PermissionRoute permission={permission} />}>
              <Route
                path={`${path}/*`}
                element={
                  <RemoteBoundary key={path} name={name}>
                    <Component />
                  </RemoteBoundary>
                }
              />
            </Route>
          ))}
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
