import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accountsQuery, authStore, Loader, ErrorAlert, formatCurrency, formatDate, maskAccount } from '@bank/shared';
import { useCurrentUser } from '../auth/AuthContext';
import { recentTransactionsQuery } from '../services/dashboardService';

export default function Dashboard() {
  const user = useCurrentUser();
  const accounts = useQuery(accountsQuery());
  const recent = useQuery(recentTransactionsQuery());

  const loading = accounts.isPending || recent.isPending;
  const error = accounts.error ?? recent.error;
  const refetch = () => Promise.all([accounts.refetch(), recent.refetch()]);
  const data =
    accounts.data && recent.data ? { accounts: accounts.data, recentTransactions: recent.data } : undefined;

  const simulateExpiredSession = () => {
    authStore.setSession({ token: 'expired-token', user });
    accounts.refetch();
  };

  const total = data?.accounts.reduce((sum, a) => sum + a.balance, 0) ?? 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Welcome, {user.name}</h3>
          <small className="text-secondary">Permissions: {user.permissions.join(', ')}</small>
        </div>
        <button type="button" className="btn btn-outline-warning btn-sm" onClick={simulateExpiredSession}>
          Simulate session expiry (401)
        </button>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      {loading && <Loader text="Loading summary (2 parallel API calls)..." />}

      {data && !loading && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-secondary">Total balance</h6>
                <h2 className="mb-3">{formatCurrency(total)}</h2>
                <ul className="list-group list-group-flush">
                  {data.accounts.map((a) => (
                    <li key={a.id} className="list-group-item d-flex justify-content-between px-0">
                      <span>{a.type} {maskAccount(a.number)}</span>
                      <span>{formatCurrency(a.balance)}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/accounts" className="btn btn-sm btn-primary mt-3">View accounts</Link>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-secondary">Recent transactions</h6>
                <table className="table table-sm mb-0">
                  <tbody>
                    {data.recentTransactions.map((t) => (
                      <tr key={t.id}>
                        <td className="text-secondary">{formatDate(t.date)}</td>
                        <td>{t.description}</td>
                        <td className={`text-end ${t.type === 'CR' ? 'text-success' : 'text-danger'}`}>
                          {t.type === 'CR' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
