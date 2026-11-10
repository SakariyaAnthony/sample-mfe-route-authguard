import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { Permission } from '@bank/shared';
import { MainLayout } from './layout/MainLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PermissionRoute } from './routes/PermissionRoute';
import { GuestRoute } from './routes/GuestRoute';
import { RemoteBoundary } from './components/RemoteBoundary';
import { Constants, useI18n } from './i18n';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Each remote is fetched from its own server only when its route is first visited.
const AccountsApp = lazy(() => import('accounts/App'));
const CardsApp = lazy(() => import('cards/App'));
const UtilityApp = lazy(() => import('utility/App'));
const TransferApp = lazy(() => import('transfer/App'));
const BeneficiaryApp = lazy(() => import('beneficiary/App'));

interface RemoteRoute {
  path: string;
  nameKey: string;
  name: string;
  permission: Permission;
  Component: LazyExoticComponent<ComponentType>;
}

const remoteRoutes: RemoteRoute[] = [
  {
    path: 'accounts',
    nameKey: Constants.menuAccountsKey,
    name: Constants.menuAccounts,
    permission: 'accounts',
    Component: AccountsApp,
  },
  {
    path: 'cards',
    nameKey: Constants.menuCardsKey,
    name: Constants.menuCards,
    permission: 'cards',
    Component: CardsApp,
  },
  {
    path: 'utility',
    nameKey: Constants.menuUtilityKey,
    name: Constants.menuUtility,
    permission: 'utility',
    Component: UtilityApp,
  },
  {
    path: 'transfer',
    nameKey: Constants.menuTransferKey,
    name: Constants.menuTransfer,
    permission: 'transfer',
    Component: TransferApp,
  },
  {
    path: 'beneficiary',
    nameKey: Constants.menuBeneficiaryKey,
    name: Constants.menuBeneficiary,
    permission: 'beneficiary',
    Component: BeneficiaryApp,
  },
];

export default function App() {
  const { t } = useI18n();

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {remoteRoutes.map(({ path, nameKey, name, permission, Component }) => (
            <Route key={path} element={<PermissionRoute permission={permission} />}>
              <Route
                path={`${path}/*`}
                element={
                  <RemoteBoundary key={path} name={t(nameKey, name)}>
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
