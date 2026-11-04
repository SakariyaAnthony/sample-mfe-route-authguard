import { Link } from 'react-router-dom';
import { useApi, Loader, ErrorAlert, formatCurrency } from '@bank/shared';
import { accountService } from '../services/accountService';

export default function AccountList() {
  const { data: accounts, loading, error, refetch } = useApi((signal) => accountService.getAccounts({ signal }));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">My Accounts</h3>
        <span className="badge text-bg-secondary">accounts MFE</span>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      {loading && <Loader text="Fetching accounts..." />}

      {accounts && !loading && (
        <div className="row g-3">
          {accounts.map((account) => (
            <div key={account.id} className="col-md-6 col-xl-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">{account.type}</h5>
                    <span className="text-secondary small">{account.currency}</span>
                  </div>
                  <p className="text-secondary mb-1 small">A/c {account.number}</p>
                  <p className="text-secondary small">{account.branch}</p>
                  <h4>{formatCurrency(account.balance)}</h4>
                  <Link to={String(account.id)} className="btn btn-outline-primary btn-sm mt-2">
                    View statement
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
