import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  accountQuery,
  Constants,
  Loader,
  ErrorAlert,
  formatCurrency,
  formatDate,
  useI18n,
} from '@bank/shared';
import { transactionsQuery } from '../services/accountService';

export default function AccountDetail() {
  const { accountId = '' } = useParams<{ accountId: string }>();
  const { t, tFormat, td } = useI18n();
  const account = useQuery(accountQuery(accountId));
  const transactions = useQuery(transactionsQuery(accountId));

  return (
    <>
      <Link to=".." relative="path" className="btn btn-link px-0 mb-2">
        {t(Constants.backToAccountsKey, Constants.backToAccounts)}
      </Link>

      <ErrorAlert error={account.error} onRetry={account.refetch} />
      {account.isPending && <Loader text={t(Constants.fetchingAccountKey, Constants.fetchingAccount)} />}
      {account.data && !account.isPending && (
        <div className="card mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">
                {tFormat(Constants.accountTypeLabelKey, Constants.accountTypeLabel, {
                  type: td(account.data.type),
                })}
              </h4>
              <small className="text-secondary">
                {tFormat(Constants.accountNumberPrefixKey, Constants.accountNumberPrefix, {
                  number: account.data.number,
                })}{' '}
                - {td(account.data.branch)}
              </small>
            </div>
            <div className="text-end">
              <small className="text-secondary">
                {t(Constants.availableBalanceKey, Constants.availableBalance)}
              </small>
              <h3 className="mb-0">{formatCurrency(account.data.balance)}</h3>
            </div>
          </div>
        </div>
      )}

      <h5>{t(Constants.transactionsKey, Constants.transactions)}</h5>
      <ErrorAlert error={transactions.error} onRetry={transactions.refetch} />
      {transactions.isPending && (
        <Loader text={t(Constants.fetchingTransactionsKey, Constants.fetchingTransactions)} />
      )}
      {transactions.data && !transactions.isPending && (
        transactions.data.length === 0 ? (
          <p className="text-secondary">{t(Constants.noTransactionsKey, Constants.noTransactions)}</p>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>{t(Constants.colDateKey, Constants.colDate)}</th>
                <th>{t(Constants.colDescriptionKey, Constants.colDescription)}</th>
                <th className="text-end">{t(Constants.colAmountKey, Constants.colAmount)}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.date)}</td>
                  <td>{td(tx.description)}</td>
                  <td className={`text-end ${tx.type === 'CR' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'CR' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </>
  );
}
