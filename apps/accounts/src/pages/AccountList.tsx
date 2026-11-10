import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accountsQuery, Constants, Loader, ErrorAlert, formatCurrency, useI18n } from '@bank/shared';

export default function AccountList() {
  const { t, tFormat, td } = useI18n();
  const { data: accounts, isPending: loading, error, refetch } = useQuery(accountsQuery());

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{t(Constants.myAccountsKey, Constants.myAccounts)}</h3>
        <span className="badge text-bg-secondary">
          {t(Constants.accountsMfeBadgeKey, Constants.accountsMfeBadge)}
        </span>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      {loading && <Loader text={t(Constants.fetchingAccountsKey, Constants.fetchingAccounts)} />}

      {accounts && !loading && (
        <div className="row g-3">
          {accounts.map((account) => (
            <div key={account.id} className="col-md-6 col-xl-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">{td(account.type)}</h5>
                    <span className="text-secondary small">{td(account.currency)}</span>
                  </div>
                  <p className="text-secondary mb-1 small">
                    {tFormat(Constants.accountNumberPrefixKey, Constants.accountNumberPrefix, {
                      number: account.number,
                    })}
                  </p>
                  <p className="text-secondary small">{td(account.branch)}</p>
                  <h4>{formatCurrency(account.balance)}</h4>
                  <Link to={String(account.id)} className="btn btn-outline-primary btn-sm mt-2">
                    {t(Constants.viewStatementKey, Constants.viewStatement)}
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
