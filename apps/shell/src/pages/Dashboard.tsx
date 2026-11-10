import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accountsQuery, authStore, Loader, ErrorAlert, formatCurrency, formatDate, maskAccount } from '@bank/shared';
import { useCurrentUser } from '../auth/AuthContext';
import { Constants, useI18n } from '../i18n';
import { recentTransactionsQuery } from '../services/dashboardService';
import { ThemeMenu } from '../theme';

export default function Dashboard() {
  const user = useCurrentUser();
  const { t, tFormat, td } = useI18n();
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
          <h3 className="mb-0">
            {tFormat(Constants.welcomeUserKey, Constants.welcomeUser, { name: user.name })}
          </h3>
          <small className="text-secondary">
            {tFormat(Constants.permissionsLabelKey, Constants.permissionsLabel, {
              permissions: user.permissions.map((p) => td(p)).join(', '),
            })}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <ThemeMenu />
          <button type="button" className="btn btn-outline-warning btn-sm" onClick={simulateExpiredSession}>
            {t(Constants.simulateExpiryKey, Constants.simulateExpiry)}
          </button>
        </div>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      {loading && <Loader text={t(Constants.loadingSummaryKey, Constants.loadingSummary)} />}

      {data && !loading && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-secondary">{t(Constants.totalBalanceKey, Constants.totalBalance)}</h6>
                <h2 className="mb-3">{formatCurrency(total)}</h2>
                <ul className="list-group list-group-flush">
                  {data.accounts.map((a) => (
                    <li key={a.id} className="list-group-item d-flex justify-content-between px-0">
                      <span>{td(a.type)} {maskAccount(a.number)}</span>
                      <span>{formatCurrency(a.balance)}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/accounts" className="btn btn-sm btn-primary mt-3">
                  {t(Constants.viewAccountsKey, Constants.viewAccounts)}
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-secondary">
                  {t(Constants.recentTransactionsKey, Constants.recentTransactions)}
                </h6>
                <table className="table table-sm mb-0">
                  <tbody>
                    {data.recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="text-secondary">{formatDate(tx.date)}</td>
                        <td>{td(tx.description)}</td>
                        <td className={`text-end ${tx.type === 'CR' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'CR' ? '+' : '-'}{formatCurrency(tx.amount)}
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
