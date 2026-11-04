import { Link, useParams } from 'react-router-dom';
import { useApi, Loader, ErrorAlert, formatCurrency, formatDate } from '@bank/shared';
import { accountService } from '../services/accountService';

export default function AccountDetail() {
  const { accountId } = useParams();
  const account = useApi((signal) => accountService.getAccount(accountId, { signal }), [accountId]);
  const transactions = useApi((signal) => accountService.getTransactions(accountId, { signal }), [accountId]);

  return (
    <>
      <Link to=".." relative="path" className="btn btn-link px-0 mb-2">&larr; Back to accounts</Link>

      <ErrorAlert error={account.error} onRetry={account.refetch} />
      {account.loading && <Loader text="Fetching account..." />}
      {account.data && !account.loading && (
        <div className="card mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">{account.data.type} account</h4>
              <small className="text-secondary">A/c {account.data.number} - {account.data.branch}</small>
            </div>
            <div className="text-end">
              <small className="text-secondary">Available balance</small>
              <h3 className="mb-0">{formatCurrency(account.data.balance)}</h3>
            </div>
          </div>
        </div>
      )}

      <h5>Transactions</h5>
      <ErrorAlert error={transactions.error} onRetry={transactions.refetch} />
      {transactions.loading && <Loader text="Fetching transactions..." />}
      {transactions.data && !transactions.loading && (
        transactions.data.length === 0 ? (
          <p className="text-secondary">No transactions yet.</p>
        ) : (
          <table className="table table-hover bg-white">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.description}</td>
                  <td className={`text-end ${t.type === 'CR' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'CR' ? '+' : '-'}{formatCurrency(t.amount)}
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
