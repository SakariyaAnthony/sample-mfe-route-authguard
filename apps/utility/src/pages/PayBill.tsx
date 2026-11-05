import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  accountsQuery,
  queryKeys,
  notify,
  Loader,
  ErrorAlert,
  formatCurrency,
  maskAccount,
  type Payment,
} from '@bank/shared';
import { billerQuery, utilityService } from '../services/utilityService';

interface PayBillForm {
  accountId: string;
  consumerNumber: string;
  amount: string;
}

export default function PayBill() {
  const { billerId = '' } = useParams<{ billerId: string }>();
  const queryClient = useQueryClient();
  const biller = useQuery(billerQuery(billerId));
  const accounts = useQuery(accountsQuery());

  const [form, setForm] = useState<PayBillForm>({ accountId: '', consumerNumber: '', amount: '' });
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const payment = useMutation({
    mutationFn: utilityService.payBill,
    onSuccess: (result) => {
      setReceipt(result);
      notify(`Paid ${formatCurrency(result.amount)} to ${result.billerName}`);
      // Balances shown by the dashboard, accounts and transfer modules are now out of date.
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    payment.mutate({
      billerId: Number(billerId),
      accountId: Number(form.accountId),
      consumerNumber: form.consumerNumber,
      amount: Number(form.amount),
    });
  };

  if (biller.isPending || accounts.isPending) return <Loader />;
  if (biller.error || accounts.error || !biller.data || !accounts.data) {
    return <ErrorAlert error={biller.error ?? accounts.error} onRetry={biller.error ? biller.refetch : accounts.refetch} />;
  }

  return (
    <>
      <Link to="../.." relative="path" className="btn btn-link px-0 mb-2">&larr; All billers</Link>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card-body">
          <h4>Pay {biller.data.name}</h4>
          <p className="text-secondary small">{biller.data.category}</p>

          {receipt ? (
            <div className="alert alert-success mb-0">
              Payment of <strong>{formatCurrency(receipt.amount)}</strong> successful.
              <br />
              Reference: <code>{receipt.reference}</code>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <ErrorAlert error={payment.error} />
              <div className="mb-3">
                <label className="form-label" htmlFor="accountId">Pay from</label>
                <select id="accountId" name="accountId" className="form-select" value={form.accountId} onChange={onChange} required>
                  <option value="">Select account</option>
                  {accounts.data.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.type} {maskAccount(a.number)} - {formatCurrency(a.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="consumerNumber">{biller.data.consumerLabel}</label>
                <input id="consumerNumber" name="consumerNumber" className="form-control" value={form.consumerNumber} onChange={onChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="amount">Amount (INR)</label>
                <input id="amount" name="amount" type="number" min="1" step="0.01" className="form-control" value={form.amount} onChange={onChange} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={payment.isPending}>
                {payment.isPending ? 'Processing...' : 'Pay now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
