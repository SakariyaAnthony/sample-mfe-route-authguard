import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  accountsQuery,
  beneficiariesQuery,
  queryKeys,
  notify,
  Loader,
  ErrorAlert,
  formatCurrency,
  maskAccount,
  type Account,
} from '@bank/shared';
import { transferService } from '../services/transferService';
import type { ReceiptLocationState } from './TransferReceipt';

const PER_TRANSACTION_LIMIT = 200000;

interface TransferFormValues {
  fromAccountId: string;
  beneficiaryId: string;
  amount: string;
  remarks: string;
}

type FormErrors = Partial<Record<keyof TransferFormValues, string>>;

const validate = (form: TransferFormValues, accounts: Account[]): FormErrors => {
  const errors: FormErrors = {};
  const amount = Number(form.amount);
  const account = accounts.find((a) => a.id === Number(form.fromAccountId));

  if (!form.fromAccountId) errors.fromAccountId = 'Select the account to debit';
  if (!form.beneficiaryId) errors.beneficiaryId = 'Select a beneficiary';
  if (!(amount > 0)) errors.amount = 'Enter an amount greater than zero';
  else if (amount > PER_TRANSACTION_LIMIT) errors.amount = `Maximum ${formatCurrency(PER_TRANSACTION_LIMIT)} per transaction`;
  else if (account && amount > account.balance) errors.amount = 'Amount exceeds the available balance';
  return errors;
};

export default function TransferForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  // Two independent queries run in parallel; both are cached and shared with other modules.
  const accountsList = useQuery(accountsQuery());
  const beneficiaryList = useQuery(beneficiariesQuery());

  const transfer = useMutation({
    mutationFn: transferService.createTransfer,
    onSuccess: (result) => {
      notify(`Transferred ${formatCurrency(result.amount)} to ${result.beneficiaryName}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      const state: ReceiptLocationState = { transfer: result };
      navigate('receipt', { state });
    },
  });

  const [form, setForm] = useState<TransferFormValues>({
    fromAccountId: '',
    beneficiaryId: searchParams.get('beneficiaryId') ?? '',
    amount: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  if (accountsList.isPending || beneficiaryList.isPending) {
    return <Loader text="Loading accounts and beneficiaries (parallel calls)..." />;
  }
  if (accountsList.isError || beneficiaryList.isError) {
    const failed = accountsList.isError ? accountsList : beneficiaryList;
    return <ErrorAlert error={failed.error} onRetry={failed.refetch} />;
  }

  const accounts = accountsList.data;
  const beneficiaries = beneficiaryList.data;
  const fieldClass = (name: keyof TransferFormValues, base = 'form-control') =>
    `${base} ${errors[name] ? 'is-invalid' : ''}`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(form, accounts);
    setErrors(found);
    if (Object.keys(found).length) return;

    transfer.mutate({
      fromAccountId: Number(form.fromAccountId),
      beneficiaryId: Number(form.beneficiaryId),
      amount: Number(form.amount),
      remarks: form.remarks.trim(),
    });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Fund Transfer</h3>
        <span className="badge text-bg-secondary">transfer MFE</span>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <ErrorAlert error={transfer.error} />
          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="fromAccountId">From account</label>
              <select id="fromAccountId" name="fromAccountId" className={fieldClass('fromAccountId', 'form-select')} value={form.fromAccountId} onChange={onChange}>
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.type} {maskAccount(a.number)} - {formatCurrency(a.balance)}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{errors.fromAccountId}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="beneficiaryId">To beneficiary</label>
              <select id="beneficiaryId" name="beneficiaryId" className={fieldClass('beneficiaryId', 'form-select')} value={form.beneficiaryId} onChange={onChange}>
                <option value="">Select beneficiary</option>
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} - {b.bank} {maskAccount(b.accountNumber)}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{errors.beneficiaryId}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="amount">Amount (INR)</label>
              <input id="amount" name="amount" type="number" min="1" step="0.01" className={fieldClass('amount')} value={form.amount} onChange={onChange} />
              <div className="invalid-feedback">{errors.amount}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="remarks">Remarks (optional)</label>
              <input id="remarks" name="remarks" maxLength={50} className="form-control" value={form.remarks} onChange={onChange} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={transfer.isPending}>
              {transfer.isPending ? 'Transferring...' : 'Transfer'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
